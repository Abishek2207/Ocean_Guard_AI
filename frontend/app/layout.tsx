import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OceanGuard AI",
  description: "Human-in-the-loop SDG 14 platform detecting possible dark fishing risk near Marine Protected Areas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ocean-950 text-slate-100 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
