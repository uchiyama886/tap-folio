import { headers } from "next/headers";

/**
 * リクエストヘッダから現在のオリジン(例: https://example.com)を取得する。
 * 共有リンクやマジックリンクのリダイレクトURL組み立てに使う。
 */
export function getOrigin(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
