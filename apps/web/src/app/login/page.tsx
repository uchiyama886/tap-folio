"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (signInError) throw signInError;
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "送信に失敗しました。もう一度お試しください。",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">ポートフォリオ共有</h1>
        <p className="text-center text-sm text-gray-600">
          メールアドレスだけでログインできます。
          <br />
          パスワードの入力は不要です。
        </p>

        {sent ? (
          <div
            role="status"
            className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-center text-sm text-gray-700"
          >
            <p className="font-semibold text-gray-900">メールを送信しました</p>
            <p className="mt-1">
              {email} 宛のリンクをタップするとログインできます。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-semibold text-gray-600">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-h-touch-target rounded-lg border border-gray-200 bg-white px-4 text-base outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-touch-target rounded-lg bg-brand py-4 text-lg font-bold text-brand-foreground disabled:opacity-60"
            >
              {loading ? "送信中…" : "ログインリンクを送る"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-500">
          届いたメール内のリンクをタップするだけでログインできます。
        </p>
      </div>
    </main>
  );
}
