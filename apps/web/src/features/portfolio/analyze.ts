import type { ImageMediaType, PhotoSuggestion } from "@portfolio-share/core";

/**
 * サーバーの /api/analyze-photo を呼び出して、写真からタイトル・説明の提案を取得する。
 * 実際のClaude呼び出しはサーバー側で行われる（APIキーはクライアントに存在しない）。
 */
export async function requestPhotoSuggestion(params: {
  imageBase64: string;
  mediaType: ImageMediaType;
}): Promise<PhotoSuggestion> {
  const response = await fetch("/api/analyze-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = (await response.json()) as PhotoSuggestion & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "AI提案の取得に失敗しました。");
  }
  return { title: data.title, description: data.description };
}
