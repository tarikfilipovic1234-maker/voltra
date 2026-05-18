import type { Metadata } from "next";
import { Anton, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VOLTRA — Run The Voltage",
  description:
    "Crack a can of the loudest energy drink on the planet. 160mg of caffeine, zero compromise. Sponsoring motocross, F1, esports, UFC and the riders who don't sleep.",
  metadataBase: new URL("https://voltra.example"),
  openGraph: {
    title: "VOLTRA — Run The Voltage",
    description:
      "160mg caffeine. Zero compromise. The drink that fuels the world's loudest sports.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${anton.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text selection:bg-voltra selection:text-black">
        {children}
      </body>
    </html>
  );
}
