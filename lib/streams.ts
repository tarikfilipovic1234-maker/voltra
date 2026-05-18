import "server-only";
import { prisma } from "@/lib/prisma";

// 60-second polling cache. Each refresh only hits the upstream APIs
// for streams whose `lastChecked` is older than this.
const POLL_INTERVAL_MS = 60 * 1000;

export type LivePlatform = "TWITCH" | "YOUTUBE" | "KICK";

export type LiveStreamView = {
  id: string;
  platform: LivePlatform;
  channel: string;
  displayName: string;
  live: boolean;
  title: string | null;
  game: string | null;
  viewerCount: number;
  thumbnail: string | null;
  startedAt: Date | null;
  embedUrl: string;
  channelUrl: string;
  featured: boolean;
};

/**
 * Refresh + return all active tracked streams. Cached for ~60s per channel.
 */
export async function getTrackedStreams(opts: { onlyLive?: boolean; featured?: boolean } = {}): Promise<LiveStreamView[]> {
  const streams = await prisma.stream.findMany({
    where: {
      active: true,
      ...(opts.featured !== undefined ? { featured: opts.featured } : {}),
    },
    orderBy: [{ featured: "desc" }, { live: "desc" }],
  });

  // Refresh stale entries in parallel (best-effort; errors are swallowed and the
  // last-known DB value is used as fallback).
  const now = Date.now();
  await Promise.all(
    streams.map(async (s) => {
      if (s.lastChecked && now - s.lastChecked.getTime() < POLL_INTERVAL_MS) return;
      try {
        const fresh = await pollOne(s.platform as LivePlatform, s.channel);
        await prisma.stream.update({
          where: { id: s.id },
          data: {
            live: fresh.live,
            title: fresh.title,
            game: fresh.game,
            viewerCount: fresh.viewerCount,
            thumbnail: fresh.thumbnail,
            startedAt: fresh.startedAt,
            lastChecked: new Date(),
          },
        });
        s.live = fresh.live;
        s.title = fresh.title;
        s.game = fresh.game;
        s.viewerCount = fresh.viewerCount;
        s.thumbnail = fresh.thumbnail;
        s.startedAt = fresh.startedAt;
      } catch (e) {
        // network or auth error — leave the last-known values intact
        await prisma.stream.update({
          where: { id: s.id },
          data: { lastChecked: new Date() },
        });
      }
    })
  );

  const fresh = await prisma.stream.findMany({
    where: {
      active: true,
      ...(opts.featured !== undefined ? { featured: opts.featured } : {}),
      ...(opts.onlyLive ? { live: true } : {}),
    },
    orderBy: [{ live: "desc" }, { featured: "desc" }, { viewerCount: "desc" }],
  });

  return fresh.map((s) => ({
    id: s.id,
    platform: s.platform as LivePlatform,
    channel: s.channel,
    displayName: s.displayName,
    live: s.live,
    title: s.title,
    game: s.game,
    viewerCount: s.viewerCount,
    thumbnail: s.thumbnail,
    startedAt: s.startedAt,
    embedUrl: embedUrlFor(s.platform as LivePlatform, s.channel),
    channelUrl: channelUrlFor(s.platform as LivePlatform, s.channel),
    featured: s.featured,
  }));
}

export function embedUrlFor(platform: LivePlatform, channel: string): string {
  const parent =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ??
    "localhost";
  switch (platform) {
    case "TWITCH":
      return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${parent}&muted=true`;
    case "YOUTUBE":
      return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(channel)}&autoplay=0`;
    case "KICK":
      return `https://player.kick.com/${encodeURIComponent(channel)}`;
  }
}

export function channelUrlFor(platform: LivePlatform, channel: string): string {
  switch (platform) {
    case "TWITCH":
      return `https://twitch.tv/${channel}`;
    case "YOUTUBE":
      return `https://youtube.com/${channel.startsWith("@") ? channel : `@${channel}`}`;
    case "KICK":
      return `https://kick.com/${channel}`;
  }
}

// ─── Per-platform polling ───────────────────────────────────────────────

type PollResult = {
  live: boolean;
  title: string | null;
  game: string | null;
  viewerCount: number;
  thumbnail: string | null;
  startedAt: Date | null;
};

const OFFLINE: PollResult = {
  live: false,
  title: null,
  game: null,
  viewerCount: 0,
  thumbnail: null,
  startedAt: null,
};

async function pollOne(platform: LivePlatform, channel: string): Promise<PollResult> {
  try {
    if (platform === "TWITCH") return await pollTwitch(channel);
    if (platform === "YOUTUBE") return await pollYouTube(channel);
    if (platform === "KICK") return await pollKick(channel);
  } catch {
    /* fallthrough */
  }
  return OFFLINE;
}

// Twitch — Helix `GET /streams?user_login=...`
let twitchAppToken: { token: string; expiresAt: number } | null = null;
async function getTwitchToken(): Promise<string | null> {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (twitchAppToken && twitchAppToken.expiresAt > Date.now() + 60_000) {
    return twitchAppToken.token;
  }
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
    { method: "POST", cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string; expires_in: number };
  twitchAppToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function pollTwitch(channel: string): Promise<PollResult> {
  const token = await getTwitchToken();
  const id = process.env.TWITCH_CLIENT_ID;
  if (!token || !id) return OFFLINE;
  const res = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channel)}`,
    {
      headers: {
        "Client-ID": id,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  if (!res.ok) return OFFLINE;
  const data = (await res.json()) as {
    data: Array<{
      title: string;
      game_name: string;
      viewer_count: number;
      started_at: string;
      thumbnail_url: string;
    }>;
  };
  const stream = data.data?.[0];
  if (!stream) return OFFLINE;
  return {
    live: true,
    title: stream.title,
    game: stream.game_name,
    viewerCount: stream.viewer_count,
    thumbnail: stream.thumbnail_url.replace("{width}", "640").replace("{height}", "360"),
    startedAt: new Date(stream.started_at),
  };
}

// YouTube — Data API v3 `GET /search?eventType=live&channelId=...`
async function pollYouTube(channel: string): Promise<PollResult> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return OFFLINE;
  // `channel` may be a channelId (UC...) or a handle. Search supports both via query.
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&q=${encodeURIComponent(channel)}&key=${key}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return OFFLINE;
  const data = (await res.json()) as {
    items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string; thumbnails?: { high?: { url?: string } }; publishedAt?: string } }>;
  };
  const item = data.items?.[0];
  if (!item) return OFFLINE;
  return {
    live: true,
    title: item.snippet?.title ?? null,
    game: null,
    viewerCount: 0,
    thumbnail: item.snippet?.thumbnails?.high?.url ?? null,
    startedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
  };
}

// Kick — public API, no auth needed
async function pollKick(channel: string): Promise<PollResult> {
  const res = await fetch(
    `https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`,
    {
      headers: { Accept: "application/json", "User-Agent": "MonsterEnergyBot/1.0" },
      cache: "no-store",
    }
  );
  if (!res.ok) return OFFLINE;
  const data = (await res.json()) as {
    livestream?: {
      session_title?: string;
      categories?: { name?: string }[];
      viewer_count?: number;
      thumbnail?: { url?: string };
      created_at?: string;
    } | null;
  };
  const live = data.livestream;
  if (!live) return OFFLINE;
  return {
    live: true,
    title: live.session_title ?? null,
    game: live.categories?.[0]?.name ?? null,
    viewerCount: live.viewer_count ?? 0,
    thumbnail: live.thumbnail?.url ?? null,
    startedAt: live.created_at ? new Date(live.created_at) : null,
  };
}
