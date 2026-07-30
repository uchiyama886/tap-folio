import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * デプロイ診断用。環境変数の「有無」だけを返す（値は返さない）。
 * デプロイ設定が固まったら削除してよい。
 */
export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
