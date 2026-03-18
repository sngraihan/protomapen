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

import Link from "next/link";

export const metadata: Metadata = {
  title: "SISPAK Diabetes",
  description: "Sistem Pakar Diagnosis Diabetes menggunakan Certainty Factor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex justify-center items-center">
            <div className="flex gap-8 text-sm font-bold text-slate-700">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home Prediksi</Link>
              <Link href="/tentang" className="hover:text-blue-600 transition-colors">Info & Edukasi</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
