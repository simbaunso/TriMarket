import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRIMARKET — Prediction Market Analytics",
  description: "Real-time prediction market analytics aggregating Polymarket, Kalshi, and Opinion data. Live probability tracking and volume analysis.",
  keywords: ["prediction market", "polymarket", "kalshi", "opinion", "analytics", "real-time"],
  icons: {
    icon: "/ssss.png",
    apple: "/ssss.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
