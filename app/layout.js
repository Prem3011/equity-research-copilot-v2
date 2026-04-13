import "./globals.css";
import { DM_Sans, JetBrains_Mono } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "AI Equity Research Copilot | By Prem Acharya",
  description:
    "Professional-grade AI equity research briefs for US and Indian stocks. Built with Next.js, Gemini AI, and real financial data from FMP.",
  keywords: ["equity research", "AI", "stock analysis", "financial data", "Next.js"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased">
        {children}
      </body>
    </html>
  );
}
