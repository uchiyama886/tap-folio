"use client";

import { useState } from "react";

/**
 * 共有リンクのコピー & ネイティブ共有（Web Share API）。
 * 指一本操作を想定し、タップ領域を大きく確保する。
 */
export function ShareActions({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard非対応環境では何もしない
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // ユーザーがキャンセルした場合など。無視する。
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 pl-4">
        <span className="flex-1 truncate text-sm text-gray-600">{url}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="min-h-touch-target rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground"
        >
          {copied ? "コピー済" : "コピー"}
        </button>
      </div>

      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex min-h-touch-target items-center justify-center gap-2 rounded-lg bg-brand py-4 text-lg font-bold text-brand-foreground"
        >
          <span aria-hidden>↗</span>
          アプリで共有する
        </button>
      )}
    </div>
  );
}
