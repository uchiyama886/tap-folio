import Anthropic from "@anthropic-ai/sdk";
import type { ImageMediaType, PhotoSuggestion } from "../types/portfolio";

/**
 * このモジュールはサーバー専用（Next.js Route Handler等）から呼び出すこと。
 * Anthropic APIキーはサーバー環境変数のみに保持し、クライアントへ渡さない。
 */

export type AnalyzePhotoParams = {
  apiKey: string;
  /** データURLプレフィックスを含まない、純粋なbase64文字列 */
  imageBase64: string;
  mediaType: ImageMediaType;
};

const SYSTEM_PROMPT = [
  "あなたは、車椅子当事者が制作した作品のポートフォリオ作成を手伝うアシスタントです。",
  "送られてきた作品写真を見て、その作品の「タイトル」と「説明文」を日本語で提案してください。",
  "- タイトル: 20文字程度。作品が一目で伝わる自然な名前。",
  "- 説明文: 60〜120文字程度。何の作品か、素材や特徴を、温かく具体的に。断定しすぎず自然な表現で。",
  "写真から判断できない情報は無理に書かず、見てわかる範囲で記述してください。",
].join("\n");

const USER_PROMPT = [
  "この作品写真からタイトルと説明を提案してください。",
  "出力は必ず次のJSON1個のみとし、前後に説明文やコードフェンス(```)を付けないでください。",
  '{"title": "作品名", "description": "説明文"}',
].join("\n");

/**
 * 作品写真をClaudeで解析し、タイトル・説明の提案を返す。
 * 失敗時は例外を投げる（呼び出し側でtry-catchすること）。
 */
export async function analyzePhoto(
  params: AnalyzePhotoParams,
): Promise<PhotoSuggestion> {
  const client = new Anthropic({ apiKey: params.apiKey });

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: params.mediaType,
              data: params.imageBase64,
            },
          },
          { type: "text", text: USER_PROMPT },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const rawText =
    textBlock && "text" in textBlock ? textBlock.text : "";

  return parseSuggestion(rawText);
}

/** モデル出力からJSONを頑健に取り出す。コードフェンスや前後の余計な文字を許容する。 */
function parseSuggestion(rawText: string): PhotoSuggestion {
  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // 最初の { から最後の } までを抽出してからパースする
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const jsonText =
    start !== -1 && end !== -1 && end > start
      ? cleaned.slice(start, end + 1)
      : cleaned;

  try {
    const parsed = JSON.parse(jsonText) as Partial<PhotoSuggestion>;
    const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    const description =
      typeof parsed.description === "string" ? parsed.description.trim() : "";
    if (!title && !description) {
      throw new Error("empty suggestion");
    }
    return { title, description };
  } catch {
    throw new Error("AIの応答を解析できませんでした。もう一度お試しください。");
  }
}
