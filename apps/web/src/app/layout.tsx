import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ポートフォリオ共有",
  description: "スマホに記録して、指一本で簡単に共有できるポートフォリオアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="mx-auto min-h-screen max-w-md bg-white">{children}</body>
    </html>
  );
}
