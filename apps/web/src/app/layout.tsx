import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ポートフォリオ共有",
  description: "スマホに記録して、指一本で簡単に共有できるポートフォリオアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
