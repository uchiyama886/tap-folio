import { randomBytes } from "crypto";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/siteUrl";
import { ShareActions } from "@/components/ShareActions";

type WorkRow = { id: string; title: string };

export default async function SharePage({
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

  const { data: workData } = await supabase
    .from("works")
    .select("id, title")
    .eq("id", params.id)
    .maybeSingle();
  const work = workData as WorkRow | null;
  if (!work) {
    notFound();
  }

  // 既存の共有リンクを取得。なければ発行する。
  const { data: existing } = await supabase
    .from("share_links")
    .select("token")
    .eq("work_id", params.id)
    .limit(1)
    .maybeSingle();

  let token = existing?.token as string | undefined;
  if (!token) {
    const newToken = randomBytes(8).toString("hex");
    const { error: insertError } = await supabase
      .from("share_links")
      .insert({ token: newToken, work_id: params.id });
    if (insertError) {
      // 競合時などは既存を再取得
      const { data: retry } = await supabase
        .from("share_links")
        .select("token")
        .eq("work_id", params.id)
        .limit(1)
        .maybeSingle();
      token = (retry?.token as string | undefined) ?? newToken;
    } else {
      token = newToken;
    }
  }

  const shareUrl = `${getOrigin()}/s/${token}`;
  const qrSvg = await QRCode.toString(shareUrl, {
    type: "svg",
    margin: 1,
    width: 200,
  });

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-6 pb-10 pt-6">
      <header className="flex w-full items-center gap-4">
        <Link href={`/works/${work.id}`} aria-label="戻る" className="text-2xl">
          ←
        </Link>
        <h1 className="text-lg font-bold">この作品を共有</h1>
      </header>

      <div
        className="mt-4 h-[200px] w-[200px] overflow-hidden rounded-lg border border-gray-200 bg-white p-2"
        // qrcode が生成した安全なSVG文字列
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <p className="text-sm text-gray-500">QRコードを読み取ってもらう</p>

      <ShareActions url={shareUrl} title={work.title} />
    </main>
  );
}
