import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SheryMemory",
  description: "Your personal internet memory organizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
