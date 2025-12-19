import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DramaBox API - Next.js 16",
  description: "Modern DramaBox API application built with Next.js 16. Real-time web scraping for drama streaming content with interactive documentation.",
  keywords: ["DramaBox", "Next.js 16", "API", "web scraping", "TypeScript", "Tailwind CSS", "drama streaming"],
  authors: [{ name: "DramaBox API Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "DramaBox API",
    description: "Interactive API documentation for DramaBox drama streaming service",
    url: "https://dramabox-api.vercel.app",
    siteName: "DramaBox API",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DramaBox API",
    description: "Interactive API documentation for DramaBox drama streaming service",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
