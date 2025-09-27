import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Synthesis - AI-Powered Insights",
  description: "Discover cutting-edge research, breakthrough innovations, and expert insights shaping the future of AI, machine learning, and intelligent systems.",
  keywords: ["AI", "artificial intelligence", "machine learning", "technology", "research", "innovation"],
  authors: [{ name: "The Synthesis Team" }],
  openGraph: {
    title: "The Synthesis - AI-Powered Insights",
    description: "Discover cutting-edge research, breakthrough innovations, and expert insights shaping the future of AI, machine learning, and intelligent systems.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Synthesis - AI-Powered Insights",
    description: "Discover cutting-edge research, breakthrough innovations, and expert insights shaping the future of AI, machine learning, and intelligent systems.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
