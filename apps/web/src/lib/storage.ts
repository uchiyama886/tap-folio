/** 作品画像を保存するStorageバケット名 */
export const WORK_IMAGES_BUCKET = "work-images";

/**
 * Storageのオブジェクトパスから公開URLを組み立てる。
 * `work-images` は public バケットのため、固定フォーマットで解決できる。
 */
export function publicImageUrl(imagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${WORK_IMAGES_BUCKET}/${imagePath}`;
}
