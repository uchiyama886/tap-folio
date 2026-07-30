import type { ImageMediaType } from "@portfolio-share/core";

const MIME_MAP: Record<string, ImageMediaType> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
};

export function normalizeMediaType(fileType: string): ImageMediaType {
  const normalized = MIME_MAP[fileType.toLowerCase()];
  if (!normalized) {
    throw new Error("対応していない画像形式です（JPEG/PNG/WebP/GIF）。");
  }
  return normalized;
}

/** 画像拡張子（Storageパス用）。mediaTypeから決定する。 */
export function extensionFor(mediaType: ImageMediaType): string {
  switch (mediaType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
  }
}

/** Fileをbase64（データURLプレフィックスなし）とmediaTypeへ変換する。 */
export async function fileToBase64(
  file: File,
): Promise<{ base64: string; mediaType: ImageMediaType }> {
  const mediaType = normalizeMediaType(file.type);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });
  const commaIndex = dataUrl.indexOf(",");
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  return { base64, mediaType };
}
