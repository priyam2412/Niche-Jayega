import type { Metadata, Viewport } from "next";
import { Manrope, Outfit } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Niche Jayega — Peer Pickup for Hostels & PGs",
  description:
    "Get your food delivered to your room. Someone nearby picks it up, you pay a small reward.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${outfit.variable}`}>
      <body className={`${manrope.className} bg-[#fff8f4] text-[#1e1b18] antialiased`}>
        {children}
      </body>
    </html>
  );
}
