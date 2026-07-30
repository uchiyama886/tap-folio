import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";
import { formatJaDate } from "@/lib/format";
import { SignOutButton } from "@/components/SignOutButton";

type WorkRow = {
  id: string;
  title: string;
  description: string | null;
  image_path: string;
  created_at: string;
};

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("works")
    .select("id, title, description, image_path, created_at")
    .order("created_at", { ascending: false });

  const works = (data ?? []) as WorkRow[];

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 pb-4 pt-6">
        <h1 className="text-2xl font-bold">マイポートフォリオ</h1>
        <SignOutButton />
      </header>

      <main className="flex-1 px-6 pb-28">
        {error && (
          <p role="alert" className="text-sm text-red-600">
            作品の読み込みに失敗しました。
          </p>
        )}

        {works.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 text-center text-gray-500">
            <p className="text-base font-semibold text-gray-700">
              まだ作品がありません
            </p>
            <p className="text-sm">右下の＋から最初の作品を記録しましょう。</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {works.map((work) => (
              <li key={work.id}>
                <Link
                  href={`/works/${work.id}`}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 active:bg-gray-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={publicImageUrl(work.image_path)}
                    alt=""
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-gray-900">
                      {work.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatJaDate(work.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* フローティング追加ボタン */}
      <Link
        href="/works/new"
        aria-label="作品を追加する"
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-3xl font-bold text-brand-foreground shadow-lg"
      >
        <span aria-hidden>＋</span>
      </Link>

      <nav className="sticky bottom-0 flex items-center justify-around border-t border-gray-100 bg-white py-4 text-sm">
        <span className="font-semibold text-brand">ホーム</span>
      </nav>
    </div>
  );
}
