import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "OceanGuard AI — Conservation Intelligence Platform",
  description: "Making invisible ocean activity visible. SDG 14 platform combining SAR vessel detection, AIS matching, and MPA overlay for human-reviewed conservation intelligence.",
  keywords: ["ocean conservation", "vessel detection", "SAR", "AIS", "MPA", "SDG 14", "dark fishing"],
  openGraph: {
    title: "OceanGuard AI",
    description: "Making invisible ocean activity visible.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="bg-abyss text-ocean-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
