import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";
import { formatJaDate } from "@/lib/format";

type WorkRow = {
  id: string;
  title: string;
  description: string | null;
  image_path: string;
  created_at: string;
};

export default async function WorkDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("works")
    .select("id, title, description, image_path, created_at")
    .eq("id", params.id)
    .maybeSingle();

  const work = data as WorkRow | null;
  if (!work) {
    notFound();
  }

  return (
    <div className="relative flex min-h-screen flex-col pb-28">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={publicImageUrl(work.image_path)}
          alt=""
          className="h-80 w-full object-cover"
        />
        <Link
          href="/"
          aria-label="戻る"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg font-semibold shadow"
        >
          ←
        </Link>
      </div>

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

      <Link
        href={`/works/${work.id}/share`}
        className="fixed inset-x-4 bottom-6 mx-auto flex min-h-touch-target max-w-md items-center justify-center gap-2 rounded-lg bg-brand py-4 text-lg font-bold text-brand-foreground shadow-lg"
      >
        <span aria-hidden>↗</span>
        共有する
      </Link>
    </div>
  );
}
