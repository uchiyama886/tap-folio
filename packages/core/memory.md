<!-- このファイルは本領域の設計意図と決定事項を維持するためのMemoryファイルです。コード修正時は必ず読み込み、重要な決定や変更があれば末尾のLogに追記して最新状態を保ってください。 -->

# Domain: packages/core（共通ビジネスロジック・APIクライアント・型定義）

## Overview (概要)
Web版（apps/web）と将来のモバイル版（apps/mobile）から共通で利用する、Supabaseクライアントの初期化ロジック、ポートフォリオ／共有リンクのドメイン型定義、汎用ユーティリティを提供する。
- 目的（Loop 3）: 「指一本で共有できる」体験を支えるデータ層を一箇所に集約し、Web/Mobileで認証・DB・ストレージのアクセス方法がズレないようにする。

## Architecture & Rules (設計とルール)
- バックエンドはSupabase（PostgreSQL / Auth / Storage）を採用。独自サーバーやORM（Prisma等）は導入せず、`@supabase/supabase-js` を薄くラップして利用する。
- `createSupabaseClient(url, anonKey)` は環境変数の読み込みを持たない純粋な関数とし、環境変数の解決は呼び出し側（apps/web の src/lib 等）で行う。core自体はNext.js/Expoどちらにも依存しないプレーンなTypeScriptパッケージとする。
- ドメイン型（PortfolioItem, ShareLinkなど）はこのパッケージに集約し、DBスキーマ変更時はまずここを更新してからWeb/Mobile側を追従させる。
- AI画像解析 `analyzePhoto`（`src/ai/analyzePhoto.ts`）は **サーバー専用**。`@anthropic-ai/sdk` を使い `claude-opus-4-8`（vision）でタイトル/説明を提案。APIキーは引数で受け取り、core内では環境変数を読まない（apps側Route Handlerが `ANTHROPIC_API_KEY` を渡す）。出力はプレーンテキストJSONを頑健にパース（コードフェンス/前後余剰を許容）。

## Unresolved Issues (未解決の課題・技術的負債)
- Supabase CLIによる型生成（`supabase gen types typescript`）は未導入。現状は手書きの型定義のため、`apps/web` 側はクエリ結果を手動で型キャストしている。DBスキーマ確定後に自動生成へ移行を検討。
- `analyzePhoto` は構造化出力(`output_config.format`)ではなくテキストJSON方式。SDKバージョン差異に強い一方、稀にパース失敗時は例外を投げる（呼び出し側でハンドリング済み）。将来的にstructured outputsへ移行検討。
- coreの `index.ts` は `analyzePhoto`（Anthropic SDK依存＝Node専用）も再エクスポートする。クライアント側は型のみimport（値importしない）前提。将来クライアントから値importする場合はサブパス分割を検討。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: AI画像解析ロジック `analyzePhoto` を追加
  - **Why:** 作品写真からタイトル・説明を自動提案し、文字入力の手間を減らす（「指一本」UXの本質的改善）。ロジックをcoreに置くことでWeb/Mobileから再利用可能にする。
  - **What/How:** `@anthropic-ai/sdk` を依存追加。`analyzePhoto({apiKey, imageBase64, mediaType})` を実装し、`PhotoSuggestion`/`ImageMediaType` 型を追加。プロンプトは車椅子当事者の作品文脈に配慮した日本語。

- **2026-07-30**: バックエンドをSupabaseに決定
  - **Why (なぜそうしたか):** マジックリンク認証によりパスワード入力を不要にでき、「指一本」操作という本質的なUX課題（Loop 3）に直接寄与する。またDB/Auth/Storageを1サービスに集約することで、第2フェーズのモバイル移行時もクライアントをそのまま共有でき、Prisma+個別Auth+個別Storageより構成がシンプルになる。
  - **What/How (何をしたか/どう実装したか):** `@supabase/supabase-js` を依存に追加し、`createSupabaseClient` でラップ。ドメイン型は `src/types/portfolio.ts` に定義。
