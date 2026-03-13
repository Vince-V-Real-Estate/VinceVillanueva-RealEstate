import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { uploadRouter } from "@/app/api/uploadthing/core";
import { NavigationBar } from "@/components/layout/NavigationBar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Vince Villanueva | Real Estate",
  description:
    "Search over 500,000 listings including apartments, condos, and houses.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(geist.variable, "font-sans", inter.variable)}>
      <body className="flex min-h-screen flex-col">
        <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
        <NavigationBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
