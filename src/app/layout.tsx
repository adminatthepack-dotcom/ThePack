import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THE PACK — the working-dog community",
  description:
    "Profiles, directory, and messaging for K9 handlers, breeders, trainers, vets, and customers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-pack-cream text-pack-mask">
        <Nav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          {children}
        </main>
        <footer className="border-t border-pack-tan/30 bg-pack-mask text-pack-cream">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm">
            <div>
              <span className="font-semibold tracking-wider">THE PACK</span>
              <span className="ml-2 text-pack-tan">
                — connecting the working-dog community.
              </span>
            </div>
            <div className="flex gap-4 text-pack-sand">
              <a href="/about" className="hover:text-pack-cream">About</a>
              <a href="/faq" className="hover:text-pack-cream">FAQ</a>
              <a href="/directory" className="hover:text-pack-cream">Directory</a>
              <a href="/marketplace" className="hover:text-pack-cream">Marketplace</a>
              <a href="/gear" className="hover:text-pack-cream">Equipment</a>
              <a href="/donate" className="hover:text-pack-cream">Donate</a>
              <a href="/terms" className="hover:text-pack-cream">Terms</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
