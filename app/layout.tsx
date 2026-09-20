import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Shell } from "@/components/layout/shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Manufacturing OS",
  description:
    "A global manufacturing intelligence and execution interface for custom hardware — from CAD and drawing to a routed, inspected, accountable delivery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable} h-full`}
      data-theme="light"
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
