"use client";

import { useEffect, useRef } from "react";

type Props = {
  kind: "PRODUCT_CLICK" | "FLAVOR_CLICK" | "CTA_CLICK" | "STORE_SEARCH" | "SEARCH" | "VIDEO_PLAY";
  productId?: string;
  athleteId?: string;
  value?: string;
  /** When `on` is "mount", fire immediately. Default "click" wraps the child. */
  on?: "mount" | "click";
  children?: React.ReactNode;
  className?: string;
};

async function send(body: object) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // analytics never breaks the app
  }
}

export function Track({ kind, productId, athleteId, value, on = "click", children, className }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (on !== "mount" || fired.current) return;
    fired.current = true;
    send({ kind, productId, athleteId, value });
  }, [on, kind, productId, athleteId, value]);

  if (on === "mount") return null;

  return (
    <span
      className={className}
      onClick={() => {
        if (!fired.current) {
          fired.current = true;
          send({ kind, productId, athleteId, value });
          // allow re-fires after small debounce
          setTimeout(() => { fired.current = false; }, 300);
        }
      }}
    >
      {children}
    </span>
  );
}
