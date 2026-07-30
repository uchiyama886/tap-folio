import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";
import { formatJaDate } from "@/lib/format";

type SharedWork = {
  id: string;
  title: string;
  description: string | null;
  image_path: string;
  created_at: string;
};

/**
 * 共有リンクからアクセスされる公開ページ（ログイン不要）。
 * get_shared_work RPC 経由で、有効なトークンに紐づく作品のみを表示する。
 */
export default async function SharedWorkPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createClient();
  const { data } = await supabase.rpc("get_shared_work", {
    share_token: params.token,
  });

  const rows = (data ?? []) as SharedWork[];
  const work = rows[0];
  if (!work) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col pb-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicImageUrl(work.image_path)}
        alt=""
        className="h-80 w-full object-cover"
      />

      <div className="flex flex-col gap-4 px-6 pt-6">
        <h1 className="text-2xl font-bold">{work.title}</h1>
        <p className="text-sm text-gray-500">
          {formatJaDate(work.created_at)}に記録
        </p>
        {work.description && (
          <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-900">
            {work.description}
          </p>
        )}
      </div>

      <footer className="mt-auto px-6 pt-10 text-center text-xs text-gray-400">
        ポートフォリオ共有アプリで作成
      </footer>
    </div>
  );
}
