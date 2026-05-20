import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Neon 10 — Amazon Seller Intelligence Platform",
  description: "The most powerful suite of tools for Amazon sellers. Product research, keyword research, listing optimization, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
