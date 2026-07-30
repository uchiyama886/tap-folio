import { NextResponse } from "next/server";
import { analyzePhoto, type ImageMediaType } from "@portfolio-share/core";
import { createClient } from "@/lib/supabase/server";

// Node.jsランタイムで実行（Anthropic SDKはEdge非対応）
export const runtime = "nodejs";

const ALLOWED_MEDIA_TYPES: ImageMediaType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type AnalyzeRequestBody = {
  imageBase64?: unknown;
  mediaType?: unknown;
};

/**
 * 作品写真を解析し、タイトル・説明の提案を返す。
 * - Claude呼び出しはサーバー側のみ。APIキー(ANTHROPIC_API_KEY)はクライアントに露出しない。
 * - ログイン済みユーザーのみ利用可能（不正利用・コスト濫用の抑止）。
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です。" },
        { status: 401 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "サーバー側でAI機能が未設定です（ANTHROPIC_API_KEY）。" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as AnalyzeRequestBody;
    const { imageBase64, mediaType } = body;

    if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
      return NextResponse.json(
        { error: "画像データがありません。" },
        { status: 400 },
      );
    }
    if (
      typeof mediaType !== "string" ||
      !ALLOWED_MEDIA_TYPES.includes(mediaType as ImageMediaType)
    ) {
      return NextResponse.json(
        { error: "対応していない画像形式です。" },
        { status: 400 },
      );
    }

    const suggestion = await analyzePhoto({
      apiKey,
      imageBase64,
      mediaType: mediaType as ImageMediaType,
    });

    return NextResponse.json(suggestion);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "画像の解析中にエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
