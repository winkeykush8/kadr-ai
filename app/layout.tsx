import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KADR AI",
  description: "AI cinematic shot analyzer and prompt builder",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
