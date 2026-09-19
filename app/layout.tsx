import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Shell } from "@/components/layout/shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manufacturing OS",
  description:
    "Operating system for discovering manufacturing demand, mapping supplier capability, and converting qualified demand into RFQs, quotes, production and outcomes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} data-theme="light">
      <body className="min-h-full bg-background text-foreground antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
