import Image from "next/image";

const ITEMS = [
  "Run The Voltage",
  "160MG Caffeine",
  "Zero Compromise",
  "Brewed Loud",
  "Tear Into A Can",
  "Fuel The Chaos",
  "Built For Riders",
  "Drop 016 / Live",
];

export function Marquee({
  reverse = false,
  speed = "normal",
}: {
  reverse?: boolean;
  speed?: "slow" | "normal" | "fast";
}) {
  const animClass = reverse
    ? "animate-marquee-reverse"
    : speed === "slow"
      ? "animate-marquee-slow"
      : "animate-marquee";

  return (
    <div className="relative isolate border-y border-border bg-bg py-5 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
        style={{
          background:
            "linear-gradient(90deg, #000 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
        style={{
          background:
            "linear-gradient(270deg, #000 0%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className={`flex w-max ${animClass}`}>
        {[0, 1].map((dupe) => (
          <ul
            key={dupe}
            aria-hidden={dupe === 1}
            className="flex shrink-0 items-center"
          >
            {ITEMS.map((item, i) => (
              <li
                key={`${dupe}-${i}`}
                className="flex items-center gap-8 px-8"
              >
                <span className="font-display text-4xl tracking-[-0.01em] text-text md:text-6xl">
                  {item}
                </span>
                <span className="relative h-7 w-7 shrink-0 md:h-10 md:w-10">
                  <Image
                    src="/logo.svg"
                    alt=""
                    fill
                    sizes="40px"
                    className="object-contain drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]"
                  />
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
