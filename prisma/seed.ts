import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seeding VOLTRA DB…");

  // Check what's already seeded so we can re-run safely.
  const [haveLocales, haveProducts, haveAthletes, havePromos, haveRewards, haveMerch, haveStreams] = await Promise.all([
    prisma.locale.count(),
    prisma.product.count(),
    prisma.athlete.count(),
    prisma.promoCode.count(),
    prisma.rewardItem.count(),
    prisma.merchProduct.count(),
    prisma.stream.count(),
  ]);

  if (haveLocales > 0) {
    console.log(`  (skip) Locales already seeded: ${haveLocales}`);
  }

  // ─── Locales ───────────────────────────────────────────────────────────
  if (haveLocales === 0) await prisma.locale.createMany({
    data: [
      { code: "en", name: "English", nativeName: "English" },
      { code: "es", name: "Spanish", nativeName: "Español" },
      { code: "de", name: "German", nativeName: "Deutsch" },
      { code: "fr", name: "French", nativeName: "Français" },
      { code: "ja", name: "Japanese", nativeName: "日本語" },
      { code: "pt", name: "Portuguese", nativeName: "Português" },
    ],
  });

  // ─── Regions ───────────────────────────────────────────────────────────
  if ((await prisma.region.count()) === 0) await prisma.region.createMany({
    data: [
      { code: "NA",    name: "North America",       currency: "USD", defaultLocale: "en", countries: "US,CA,MX" },
      { code: "EU",    name: "Europe",              currency: "EUR", defaultLocale: "en", countries: "GB,FR,DE,ES,IT,PT,NL,BE,IE,PL,SE,NO,DK,FI,CH,AT" },
      { code: "APAC",  name: "Asia Pacific",        currency: "JPY", defaultLocale: "ja", countries: "JP,KR,CN,TW,HK,SG,MY,TH,VN,PH,ID,AU,NZ,IN" },
      { code: "LATAM", name: "Latin America",       currency: "BRL", defaultLocale: "pt", countries: "BR,AR,CL,CO,PE" },
      { code: "MEA",   name: "Middle East & Africa", currency: "AED", defaultLocale: "en", countries: "AE,SA,IL,EG,ZA" },
    ],
  });

  // ─── Products ──────────────────────────────────────────────────────────
  const products = [
    {
      code: "V-001", slug: "voltra-original", name: "Original", flavor: "Green / Classic",
      description: "The one that started it all. A killer combo of citrus, caffeine and the big bad buzz.",
      caffeineMg: 160, sugarG: 54, calories: 230, juicePct: 0,
      accentColor: "#00ff41", badge: "Signature", regions: "NA,EU,APAC,LATAM,MEA",
    },
    {
      code: "V-002", slug: "voltra-ultra", name: "Ultra", flavor: "White / Zero",
      description: "Zero sugar, light + crisp citrus. Same VOLTRA charge, none of the calories.",
      caffeineMg: 150, sugarG: 0, calories: 10, juicePct: 0,
      accentColor: "#e8ffe8", badge: "Zero Sugar", regions: "NA,EU,APAC,MEA",
    },
    {
      code: "V-003", slug: "voltra-juiced", name: "Juiced", flavor: "Pipeline Punch",
      description: "A wave of passionfruit, orange, and guava juices mashed with the VOLTRA blend.",
      caffeineMg: 160, sugarG: 45, calories: 190, juicePct: 35,
      accentColor: "#ff8a3d", badge: "Real Juice", regions: "NA,LATAM",
    },
    {
      code: "V-004", slug: "voltra-recover", name: "Rehab", flavor: "Tea + Lemonade",
      description: "Non-carbonated. Brewed tea, lemonade, electrolytes. For the mornings after.",
      caffeineMg: 160, sugarG: 5, calories: 25, juicePct: 0,
      accentColor: "#ffd84a", badge: "Hydrating", regions: "NA",
    },
    {
      code: "V-005", slug: "voltra-reserve", name: "Reserve", flavor: "Watermelon",
      description: "A premium pour. Smooth, fruity, freshly cracked. Limited drop, loud finish.",
      caffeineMg: 160, sugarG: 50, calories: 210, juicePct: 0,
      accentColor: "#ff3d6a", badge: "Limited", regions: "NA,EU",
    },
    {
      code: "V-006", slug: "voltra-khaos", name: "Khaos", flavor: "Juiced / Tropical",
      description: "70% juice, 100% chaos. Orange, pineapple, peach, apple. Voltage uncut.",
      caffeineMg: 160, sugarG: 38, calories: 170, juicePct: 70,
      accentColor: "#ffae00", badge: "70% Juice", regions: "NA,EU,APAC",
    },
    {
      code: "V-007", slug: "voltra-mango", name: "Mango Loco", flavor: "Mango Tropical",
      description: "A festival of fruit. Mango, peach, citrus and VOLTRA's signature kick.",
      caffeineMg: 160, sugarG: 44, calories: 200, juicePct: 12,
      accentColor: "#ffb800", badge: "Tropical", regions: "LATAM,EU,APAC",
    },
    {
      code: "V-008", slug: "voltra-pacific", name: "Pacific Punch", flavor: "Fruit Punch",
      description: "Wave-rider punch — orange, passionfruit, guava, peach. Surf the kick.",
      caffeineMg: 160, sugarG: 47, calories: 210, juicePct: 14,
      accentColor: "#3da3ff", badge: "Tropical", regions: "APAC,MEA",
    },
  ];

  if (haveProducts === 0) {
    for (const p of products) {
      await prisma.product.create({ data: p });
    }
  }

  // ─── Athletes ──────────────────────────────────────────────────────────
  const athletes = [
    { slug: "ken-roczen",      name: "Ken Roczen",     sport: "Motocross", discipline: "450SX",     country: "DE", region: "EU",   bio: "German supercross legend. 3x AMA champion.", hero: true },
    { slug: "eli-tomac",       name: "Eli Tomac",       sport: "Motocross", discipline: "450SX",     country: "US", region: "NA",   bio: "AMA Supercross champion and pure speed.",                              },
    { slug: "lewis-hamilton",  name: "Lewis Hamilton",  sport: "Formula 1", discipline: "Driver",    country: "GB", region: "EU",   bio: "7x F1 World Champion. Brand ambassador.",     hero: true },
    { slug: "lando-norris",    name: "Lando Norris",    sport: "Formula 1", discipline: "Driver",    country: "GB", region: "EU",   bio: "McLaren driver, grid heartthrob, gamer.",                              },
    { slug: "zedd",            name: "Zedd",            sport: "Music",     discipline: "DJ",        country: "DE", region: "EU",   bio: "Grammy-winning electronic producer.",                                  },
    { slug: "shroud",          name: "Shroud",          sport: "Esports",   discipline: "FPS",       country: "CA", region: "NA",   bio: "Streamer, ex-CS pro, aim god.",                hero: true },
    { slug: "tfue",            name: "Tfue",            sport: "Esports",   discipline: "BR",        country: "US", region: "NA",   bio: "Battle royale OG, content creator.",                                    },
    { slug: "valentino-rossi", name: "Valentino Rossi", sport: "MotoGP",    discipline: "MotoGP",    country: "IT", region: "EU",   bio: "The Doctor. 9x world champion.",                                       },
    { slug: "tony-cairoli",    name: "Tony Cairoli",    sport: "MXGP",      discipline: "MX1",       country: "IT", region: "EU",   bio: "9x MXGP world champion.",                                              },
    { slug: "matheus-rebelo",  name: "Matheus Rebelo",  sport: "BMX",       discipline: "Park",      country: "BR", region: "LATAM", bio: "Brazil's most decorated park rider.",                                  },
    { slug: "hinata-ito",      name: "Hinata Ito",      sport: "Skate",     discipline: "Vert",      country: "JP", region: "APAC", bio: "Tokyo vert prodigy. Olympic medalist.",                                  },
    { slug: "khabib-jr",       name: "Khabib Jr.",      sport: "UFC",       discipline: "Lightweight", country: "AE", region: "MEA", bio: "Rising MMA contender out of Dagestan.",                              },
  ];
  if (haveAthletes === 0) {
    for (const a of athletes) {
      await prisma.athlete.create({ data: a });
    }
  }

  // ─── Videos ────────────────────────────────────────────────────────────
  const dbAthletes = await prisma.athlete.findMany();
  const findAth = (slug: string) => dbAthletes.find((a) => a.slug === slug)?.id;

  const videos = [
    { title: "Roczen at Anaheim — Pure Sound",  description: "On-board with Ken at A1.",             url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sport: "Motocross", region: "NA", featured: true,  athleteId: findAth("ken-roczen") },
    { title: "Hamilton's Lap of Spa",            description: "Lewis takes us around Spa.",          url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sport: "Formula 1", region: "EU", featured: true,  athleteId: findAth("lewis-hamilton") },
    { title: "Shroud's Aim Lab Routine",        description: "1 hour with Shroud.",                   url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sport: "Esports",   region: "NA",                  athleteId: findAth("shroud") },
    { title: "Zedd at Coachella — BTS",          description: "Backstage with Zedd.",                 url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sport: "Music",     region: "NA",                  athleteId: findAth("zedd") },
    { title: "Rebelo at Sao Paulo Park",         description: "BMX runs from Brazil.",                url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sport: "BMX",       region: "LATAM",               athleteId: findAth("matheus-rebelo") },
    { title: "Ito's Tokyo Lines",                description: "Hinata's vert sessions.",              url: "https://www.youtube.com/embed/dQw4w9WgXcQ", sport: "Skate",     region: "APAC",                athleteId: findAth("hinata-ito") },
  ];
  if ((await prisma.video.count()) === 0) {
    for (const v of videos) {
      await prisma.video.create({ data: v });
    }
  }

  // ─── Articles ──────────────────────────────────────────────────────────
  const articles = [
    { slug: "drop-016-recap",                    title: "Drop 016: Recap from the Lab",          excerpt: "Behind the new formula.",                    body: "# Drop 016\n\nWe spent six months in the brew lab dialing in the new formula. Here's what changed and why.", category: "News",      tags: "drop016,brewing,news",       locale: "en", published: true, publishedAt: new Date(), cover: "/logo.svg" },
    { slug: "roczen-comeback",                   title: "Ken Roczen's Comeback Story",            excerpt: "From injury to A1 podium.",                  body: "# Comeback\n\nThe long road back to racing for Ken.",                                  category: "Athletes",  tags: "motocross,supercross,roczen", locale: "en", published: true, publishedAt: new Date() },
    { slug: "hamilton-zandvoort",                title: "Hamilton at Zandvoort — Photo Diary",    excerpt: "A weekend with Lewis.",                      body: "# Zandvoort\n\nA photo diary from Lewis's Dutch GP weekend.",                          category: "Motorsport", tags: "f1,hamilton",                 locale: "en", published: true, publishedAt: new Date() },
    { slug: "esports-2026-recap",                title: "Esports 2026: A Year of Noise",          excerpt: "Top moments from the year.",                 body: "# Esports\n\nThe loudest moments of competitive gaming this year.",                    category: "Esports",   tags: "esports,gaming",              locale: "en", published: true, publishedAt: new Date() },
    { slug: "zedd-on-tour",                      title: "Zedd Talks Tour Life",                   excerpt: "An interview with Zedd.",                    body: "# On Tour\n\nWe caught up with Zedd between cities.",                                 category: "Music",     tags: "music,zedd,tour",             locale: "en", published: true, publishedAt: new Date() },
    { slug: "voltra-en-mexico",                 title: "VOLTRA llega a México con fuerza",      excerpt: "Nuevo lanzamiento en LATAM.",                body: "# Llega Mango Loco\n\nLanzamos Mango Loco oficialmente en México.",                  category: "News",      tags: "latam,mexico,mango",         locale: "es", region: "LATAM", published: true, publishedAt: new Date() },
    { slug: "tokyo-skate-takeover",              title: "Tokyo Skate Takeover",                   excerpt: "Hinata leads the Tokyo run.",                body: "# Tokyo\n\nHinata Ito takes us through the Tokyo skate scene.",                       category: "Athletes",  tags: "skate,tokyo,ito",            locale: "en", region: "APAC", published: true, publishedAt: new Date() },
    { slug: "mxgp-italy-2026",                   title: "MXGP Italy 2026 Preview",                excerpt: "What to expect from the Italian round.",     body: "# MXGP\n\nCairoli returns for one more dance.",                                       category: "Motorsport", tags: "mxgp,italy,cairoli",         locale: "en", region: "EU", published: true, publishedAt: new Date() },
    { slug: "the-brewery-tour",                  title: "Inside the Brewery — A Tour",            excerpt: "We open the doors.",                         body: "# Brewery\n\nA rare look inside the VOLTRA brewery.",                                category: "News",      tags: "brewing,behindthescenes",     locale: "en", published: true, publishedAt: new Date() },
    { slug: "draft-post",                        title: "Working draft — do not publish",         excerpt: "An unpublished draft for testing the admin.", body: "# Draft\n\nThis is a draft article used for testing the admin filtering.",            category: "News",      tags: "draft",                       locale: "en", published: false },
  ];
  if ((await prisma.article.count()) === 0) {
    for (const a of articles) {
      await prisma.article.create({ data: a });
    }
  }

  // ─── Events ────────────────────────────────────────────────────────────
  const events = [
    { title: "VOLTRA Supercross — Anaheim 1",   description: "Season opener at Angel Stadium.",      startsAt: new Date("2026-01-04T19:00:00Z"), location: "Anaheim, CA", country: "US", region: "NA",   sport: "Motocross", imageUrl: "/logo.svg" },
    { title: "Formula 1 — Monaco GP",            description: "Sponsor activations in the principality.", startsAt: new Date("2026-05-23T13:00:00Z"), location: "Monte Carlo", country: "MC", region: "EU",   sport: "Formula 1", imageUrl: "/logo.svg" },
    { title: "VOLTRA Music Fest",        description: "Three-day festival in Tokyo.",          startsAt: new Date("2026-07-15T16:00:00Z"), location: "Tokyo, Japan", country: "JP", region: "APAC", sport: "Music",     imageUrl: "/logo.svg" },
    { title: "VOLTRA Esports Cup",              description: "$1M prize pool, six titles.",          startsAt: new Date("2026-09-10T12:00:00Z"), location: "São Paulo",   country: "BR", region: "LATAM", sport: "Esports",   imageUrl: "/logo.svg" },
    { title: "MXGP — Mantova",                   description: "European round of MXGP.",              startsAt: new Date("2026-06-06T10:00:00Z"), location: "Mantova, Italy", country: "IT", region: "EU", sport: "MXGP",      imageUrl: "/logo.svg" },
  ];
  if ((await prisma.event.count()) === 0) {
    for (const e of events) {
      await prisma.event.create({ data: e });
    }
  }

  // ─── Admin user ────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@voltra.local";
  const adminPw = "VoltMode!2026";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "VOLTRA Admin",
      role: "ADMIN",
      tier: "APEX",
      rewardPoints: 9999,
      passwordHash: await bcrypt.hash(adminPw, 10),
      newsletter: true,
    },
  });

  // ─── Demo customer ────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "rider@voltra.local" },
    update: {},
    create: {
      email: "rider@voltra.local",
      name: "Demo Rider",
      role: "USER",
      tier: "SURGE",
      rewardPoints: 350,
      passwordHash: await bcrypt.hash("RiderVoltRider!", 10),
      newsletter: true,
      region: "EU",
      country: "DE",
      locale: "de",
    },
  });

  // ─── Promo codes (printed on cans) ────────────────────────────────────
  const promoCodes = [
    { code: "VOLT-2026",       points: 100, maxRedemptions: 999999, source: "CAN",     campaign: "Drop 016 cans" },
    { code: "RUN-IT",          points: 50,  maxRedemptions: 999999, source: "CAN",     campaign: "Original lineup" },
    { code: "ANAHEIM-A1",       points: 250, maxRedemptions: 10000,  source: "EVENT",   campaign: "Supercross Anaheim 1" },
    { code: "TOKYO-DRIFT",      points: 150, maxRedemptions: 5000,   source: "EVENT",   campaign: "Tokyo Drop" },
    { code: "ZEDD-VIP",         points: 500, maxRedemptions: 100,    source: "PARTNER", campaign: "Zedd Coachella VIP" },
    { code: "FRIENDS-100",      points: 100, maxRedemptions: 1,      source: "EMAIL",   campaign: "Welcome email" },
    { code: "ROCKER-FRESH",     points: 75,  maxRedemptions: 999999, source: "CAN",     campaign: "Reserve drop" },
    { code: "EXPIRED-2023",     points: 50,  maxRedemptions: 100,    source: "CAN",     campaign: "Old promo", active: false },
  ];
  if (havePromos === 0) {
    for (const p of promoCodes) {
      await prisma.promoCode.create({ data: p });
    }
  }

  // ─── Reward marketplace items ─────────────────────────────────────────
  const rewards = [
    { slug: "voltra-hoodie-bolt",     name: "Claw Hoodie",                description: "Heavy-weight black hoodie with the VOLTRA bolt on the chest.",  pointsCost: 2500, stock: 50,  category: "APPAREL",     imageUrl: "/logo.svg" },
    { slug: "voltra-cap-snapback",    name: "Snapback Cap — Acid Green",  description: "Flat-brim snapback with toxic-green bolt embroidery.",            pointsCost: 1200, stock: 120, category: "HEADWEAR",    imageUrl: "/logo.svg" },
    { slug: "voltra-tee-original",    name: "Original Tee",                description: "Classic bolt tee on midweight cotton.",                          pointsCost: 800,  stock: 200, category: "APPAREL",     imageUrl: "/logo.svg" },
    { slug: "voltra-beanie",          name: "Roczen Beanie",               description: "Ribbed beanie used by Ken Roczen on the SX podium.",            pointsCost: 900,  stock: 80,  category: "HEADWEAR",    imageUrl: "/logo.svg" },
    { slug: "gaming-mousepad-xl",      name: "Gaming Mousepad — XL",        description: "XL desk mat with stitched edge. Twitch loud, GG louder.",        pointsCost: 1500, stock: 60,  category: "GAMING",      imageUrl: "/logo.svg" },
    { slug: "controller-skin",         name: "Controller Skin Pack",        description: "Vinyl skin pack for the main consoles. Three claw variants.",   pointsCost: 600,  stock: 300, category: "GAMING",      imageUrl: "/logo.svg" },
    { slug: "voltra-sticker-pack",    name: "Sticker Pack",                description: "12 die-cut vinyl stickers. Stick the bolt on everything.",      pointsCost: 200,  stock: 999, category: "ACCESSORIES", imageUrl: "/logo.svg" },
    { slug: "legends-jersey",          name: "LEGEND Tier Jersey",          description: "Only LEGEND-tier members can claim this.",                       pointsCost: 5000, stock: 25,  category: "APPAREL",     tier: "APEX", imageUrl: "/logo.svg" },
    { slug: "discord-vip-month",       name: "Discord VIP — 1 Month",       description: "Digital. Unlocks the Pack channel for 30 days.",                pointsCost: 500,  stock: 999, category: "DIGITAL",     imageUrl: "/logo.svg" },
  ];
  if (haveRewards === 0) {
    for (const r of rewards) {
      await prisma.rewardItem.create({ data: r });
    }
  }

  // ─── Merch shop (cash) ───────────────────────────────────────────────
  const merch = [
    { slug: "drop-016-hoodie",        name: "Drop 016 Hoodie",          description: "Limited-run heavyweight hoodie. Drop 016 colorway.",                priceCents: 8900,  stock: 80,  category: "DROP",        featured: true,  imageUrl: "/logo.svg",  dropAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12) },
    { slug: "claw-tee-black",         name: "Claw Tee — Black",         description: "Heavyweight cotton tee with the claw front and center.",            priceCents: 3500,  stock: 240, category: "APPAREL",     imageUrl: "/logo.svg" },
    { slug: "claw-tee-white",         name: "Claw Tee — White",         description: "Same tee, inverted colorway. Acid-green print.",                    priceCents: 3500,  stock: 240, category: "APPAREL",     imageUrl: "/logo.svg" },
    { slug: "trucker-cap-mesh",       name: "Trucker Cap — Mesh",       description: "Curved-brim trucker with stitched claw and acid-green underbill.",  priceCents: 2900,  stock: 180, category: "HEADWEAR",    imageUrl: "/logo.svg" },
    { slug: "motocross-jersey",       name: "Motocross Jersey",         description: "Race-cut jersey based on the Roczen 2026 SX kit.",                  priceCents: 7500,  stock: 60,  category: "COLLAB",      featured: true,  imageUrl: "/logo.svg" },
    { slug: "racing-jacket",          name: "Pit-Crew Jacket",          description: "Lightweight bomber. Embroidered VOLTRA patch on sleeve.",          priceCents: 12500, stock: 35,  category: "COLLAB",      imageUrl: "/logo.svg" },
    { slug: "claw-socks",             name: "Claw Crew Socks",          description: "Pack of 3. High-cut. Black with acid-green stripes.",               priceCents: 1500,  stock: 500, category: "ACCESSORIES", imageUrl: "/logo.svg" },
    { slug: "tour-poster-set",        name: "Tour Poster Set",          description: "Six 18×24 posters. Letterpress, numbered.",                          priceCents: 4500,  stock: 100, category: "ACCESSORIES", imageUrl: "/logo.svg" },
    { slug: "esports-jersey-2026",    name: "Esports Jersey 2026",      description: "Performance fabric, pro-team cut. Custom pack patches included.",   priceCents: 6900,  stock: 90,  category: "COLLAB",      featured: true,  imageUrl: "/logo.svg" },
    { slug: "limited-anaheim-tee",    name: "Anaheim A1 Tee",           description: "Sold only the weekend of A1. We over-printed.",                      priceCents: 4000,  stock: 0,   category: "DROP",        imageUrl: "/logo.svg" },
  ];
  if (haveMerch === 0) {
    for (const m of merch) {
      await prisma.merchProduct.create({ data: m });
    }
  }

  // ─── Tracked streams ─────────────────────────────────────────────────
  const dbAthletes2 = await prisma.athlete.findMany();
  const findAth2 = (slug: string) => dbAthletes2.find((a) => a.slug === slug)?.id;
  const streams = [
    { platform: "TWITCH",  channel: "shroud",          displayName: "Shroud",         athleteId: findAth2("shroud"),       category: "Esports", region: "NA",   featured: true,  active: true },
    { platform: "TWITCH",  channel: "tfue",            displayName: "Tfue",           athleteId: findAth2("tfue"),         category: "Esports", region: "NA",   featured: true,  active: true },
    { platform: "TWITCH",  channel: "voltra",   displayName: "VOLTRA", category: "Brand", region: null, featured: true, active: true },
    { platform: "YOUTUBE", channel: "voltra",   displayName: "VOLTRA · YouTube", category: "Brand", region: null, featured: true, active: true },
    { platform: "KICK",    channel: "voltra",         displayName: "VOLTRA · Kick", category: "Brand", region: null, featured: true, active: true },
    { platform: "TWITCH",  channel: "kenroczen94",     displayName: "Ken Roczen",     athleteId: findAth2("ken-roczen"),   category: "Motocross", region: "EU", featured: false, active: true },
  ];
  if (haveStreams === 0) {
    for (const s of streams) {
      await prisma.stream.create({ data: s });
    }
  }

  console.log("✓ Seed complete.");
  console.log(`  Admin: ${adminEmail} / ${adminPw}`);
  console.log(`  Rider: rider@voltra.local / RiderVoltRider!`);
  console.log("  Try promo codes: VOLT-2026 (100pts), RUN-IT (50pts), ANAHEIM-A1 (250pts)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
