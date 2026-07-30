import { Button } from "@portfolio-share/ui";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">ポートフォリオ共有アプリ</h1>
      <p className="text-center text-gray-600">
        スマホに記録して、指一本で簡単に共有できるポートフォリオアプリです。
      </p>
      <Button>作品を共有する</Button>
    </main>
  );
}
