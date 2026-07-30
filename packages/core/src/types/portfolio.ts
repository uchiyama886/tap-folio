/**
 * ドメイン型。DB(works / share_links)およびUI表示に共通で使う。
 * Web/Mobile間で共有するため、Supabaseスキーマ変更時はまずここを更新する。
 */

/** 画像の許可MIMEタイプ（Claude visionとStorageの両方で使用） */
export type ImageMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

/** DBの1レコードに対応する作品（image_pathはStorage上のパス） */
export type PortfolioItem = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  /** Supabase Storage `work-images` バケット内のオブジェクトパス */
  imagePath: string;
  createdAt: string;
};

/** UI表示用に公開URLを解決した作品ビュー */
export type PortfolioItemView = {
  id: string;
  title: string;
  description: string | null;
  /** ブラウザから直接表示できる公開URL */
  imageUrl: string;
  createdAt: string;
};

/** 共有リンク */
export type ShareLink = {
  token: string;
  workId: string;
  expiresAt: string | null;
};

/** Claude画像解析が返すタイトル・説明の提案 */
export type PhotoSuggestion = {
  title: string;
  description: string;
};
