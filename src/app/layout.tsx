import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles } from "@/components/Sparkles";
import { BuyMeCoffee } from "@/components/BuyMeCoffee";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ludovica's Little Moments",
  description: "A gentle, playful album of Ludovica's life.",
  icons: {
    icon: '/favicon.svg',
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
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-[rgb(var(--primary-50))] via-[rgb(var(--primary-100))] to-white text-[rgb(var(--text-primary))]`}
      >
        <ThemeProvider attribute="class" defaultTheme="pastel-purple" enableSystem={false} themes={["light", "dark", "pastel-blue", "pastel-purple", "pastel-green", "pastel-peach", "pastel-yellow"]}>
          <Sparkles count={50} minSize={4} maxSize={12} />
          <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-3 rounded-3xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card-bg))] px-4 py-3 shadow-[0_6px_20px] shadow-[rgb(var(--card-shadow))] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--accent-from))] via-[rgb(var(--accent-via))] to-[rgb(var(--accent-to))] text-sm font-semibold text-white shadow-md shadow-[rgb(var(--primary-300)_/_0.7)]">
                L
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">
                  Ludovica
                </p>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                  Little Moments
                </p>
              </div>
            </Link>
            <nav className="flex items-center justify-between text-xs font-medium text-[rgb(var(--text-secondary))] sm:gap-4">
              <Link
                href="/"
                className="rounded-full px-3 py-1 hover:bg-[rgb(var(--primary-50)_/_0.8)]"
              >
                Home
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="rounded-full border border-[rgb(var(--primary-200))] bg-[rgb(var(--primary-50)_/_0.8)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[rgb(var(--text-secondary))] shadow-sm shadow-[rgb(var(--primary-100)_/_0.7)] hover:bg-[rgb(var(--primary-100)_/_0.9)]"
                >
                  Admin
                </Link>
                <ThemeToggle />
              </div>
            </nav>
          </header>

          <main className="mt-8 flex-1">{children}</main>

          <footer className="mt-10 flex flex-col items-center gap-3">
            <p className="text-center text-[11px] text-[rgb(var(--text-muted)_/_0.8)]">
              Made with love for Ludovica. © 2025
            </p>
            <BuyMeCoffee />
          </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
