import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import BalanceDisplay from "@/components/BalanceDisplay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BetMines - Gambling App",
  description: "A modern gambling application featuring the classic Mines game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}
      >
        <AuthProvider>
          <GameProvider>
            <div className="min-h-screen">
              <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                      <h1 className="text-2xl font-bold text-white">BetMines</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                      <BalanceDisplay />
                    </div>
                  </div>
                </div>
              </nav>
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </div>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
