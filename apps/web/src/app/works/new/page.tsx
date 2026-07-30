"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { WORK_IMAGES_BUCKET } from "@/lib/storage";
import { useNewWorkStore } from "@/features/portfolio/useNewWorkStore";
import { requestPhotoSuggestion } from "@/features/portfolio/analyze";
import {
  extensionFor,
  fileToBase64,
  normalizeMediaType,
} from "@/features/portfolio/photo";

export default function NewWorkPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    file,
    previewUrl,
    title,
    description,
    isSuggesting,
    isSaving,
    error,
    setFile,
    setTitle,
    setDescription,
    applySuggestion,
    setSuggesting,
    setSaving,
    setError,
    reset,
  } = useNewWorkStore();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    try {
      normalizeMediaType(selected.type); // 対応形式チェック
      const url = URL.createObjectURL(selected);
      setFile(selected, url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "画像を読み込めませんでした。");
    }
  }

  async function handleSuggest() {
    if (!file) {
      setError("先に写真を選んでください。");
      return;
    }
    setSuggesting(true);
    setError(null);
    try {
      const { base64, mediaType } = await fileToBase64(file);
      const suggestion = await requestPhotoSuggestion({
        imageBase64: base64,
        mediaType,
      });
      applySuggestion(suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI提案の取得に失敗しました。");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleSave() {
    setError(null);
    if (!file) {
      setError("写真を選んでください。");
      return;
    }
    if (!title.trim()) {
      setError("作品名を入力してください。");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const mediaType = normalizeMediaType(file.type);
      const path = `${user.id}/${crypto.randomUUID()}.${extensionFor(mediaType)}`;

      const { error: uploadError } = await supabase.storage
        .from(WORK_IMAGES_BUCKET)
        .upload(path, file, { contentType: mediaType, upsert: false });
      if (uploadError) throw uploadError;

      const { data: inserted, error: insertError } = await supabase
        .from("works")
        .insert({
          owner_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          image_path: path,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      reset();
      router.push(`/works/${inserted.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 px-6 pb-10 pt-6">
      <header className="flex items-center gap-4">
        <Link href="/" aria-label="戻る" className="text-2xl">
          ←
        </Link>
        <h1 className="text-lg font-bold">新しい作品を記録</h1>
      </header>

      {/* 写真選択エリア（大きなタップ領域） */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex h-56 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-white"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="選択した写真のプレビュー"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <span className="text-3xl" aria-hidden>
              📷
            </span>
            <span className="text-sm font-semibold text-gray-500">
              タップして写真を撮る／選ぶ
            </span>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* AIに提案してもらう（手動タップ） */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleSuggest}
          disabled={isSuggesting || !file}
          className="flex min-h-touch-target items-center justify-center gap-2 rounded-lg border border-brand bg-white text-base font-semibold text-brand disabled:opacity-50"
        >
          <span aria-hidden>✨</span>
          {isSuggesting ? "AIが考えています…" : "AIに提案してもらう"}
        </button>
        <p className="text-xs text-gray-500">
          写真から作品名と説明を自動提案します
        </p>
      </div>

      {/* 作品名 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-semibold text-gray-600">
          作品名
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：刺繍のポーチ"
          className="min-h-touch-target rounded-lg border border-gray-200 bg-white px-4 text-base outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </div>

      {/* 説明 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-semibold text-gray-600"
        >
          説明（任意）
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="作った時のことや工夫した点など"
          rows={3}
          className="rounded-lg border border-gray-200 bg-white p-4 text-base outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="mt-auto min-h-touch-target rounded-lg bg-brand py-4 text-lg font-bold text-brand-foreground disabled:opacity-60"
      >
        {isSaving ? "保存中…" : "保存する"}
      </button>
    </main>
  );
}
