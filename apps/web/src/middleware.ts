import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * 各リクエストでSupabaseセッションを更新（トークンリフレッシュ）し、
 * Cookieをレスポンスへ引き継ぐ。App Router + @supabase/ssr の推奨パターン。
 *
 * 環境変数が未設定の場合や更新失敗時でも 500 で全ルートを落とさず、
 * セッション更新をスキップして素通しする（堅牢化）。
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // getUser() を呼ぶことでセッションが検証・更新される
    await supabase.auth.getUser();
  } catch {
    // セッション更新に失敗しても素通しする
  }

  return response;
}

export const config = {
  // 静的アセットと画像最適化を除く全リクエストに適用
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
