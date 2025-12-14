import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { RealTimeProvider } from "@/context/RealTimeContext";
import BackgroundMesh from '@/components/layout/BackgroundMesh';
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: '--font-space' });

export const metadata: Metadata = {
  title: "DevPath | Master Your Developer Journey",
  description: "Join 50,000+ developers accelerating their coding skills through structured paths, real projects, and an active community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <GamificationProvider>
              <RealTimeProvider>
                <BackgroundMesh />
                <Navbar />
                <main style={{ position: 'relative', zIndex: 1 }}>
                  {children}
                </main>
                <Footer />
              </RealTimeProvider>
            </GamificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
