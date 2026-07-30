<!-- このファイルは本領域の設計意図と決定事項を維持するためのMemoryファイルです。コード修正時は必ず読み込み、重要な決定や変更があれば末尾のLogに追記して最新状態を保ってください。 -->

# Domain: packages/core（共通ビジネスロジック・APIクライアント・型定義）

## Overview (概要)
Web版（apps/web）と将来のモバイル版（apps/mobile）から共通で利用する、Supabaseクライアントの初期化ロジック、ポートフォリオ／共有リンクのドメイン型定義、汎用ユーティリティを提供する。
- 目的（Loop 3）: 「指一本で共有できる」体験を支えるデータ層を一箇所に集約し、Web/Mobileで認証・DB・ストレージのアクセス方法がズレないようにする。

## Architecture & Rules (設計とルール)
- バックエンドはSupabase（PostgreSQL / Auth / Storage）を採用。独自サーバーやORM（Prisma等）は導入せず、`@supabase/supabase-js` を薄くラップして利用する。
- `createSupabaseClient(url, anonKey)` は環境変数の読み込みを持たない純粋な関数とし、環境変数の解決は呼び出し側（apps/web の src/lib 等）で行う。core自体はNext.js/Expoどちらにも依存しないプレーンなTypeScriptパッケージとする。
- ドメイン型（PortfolioItem, ShareLinkなど）はこのパッケージに集約し、DBスキーマ変更時はまずここを更新してからWeb/Mobile側を追従させる。

## Unresolved Issues (未解決の課題・技術的負債)
- Supabaseの実プロジェクト（URL/Anon Key）は未作成。`.env.example` にプレースホルダのみ用意している。
- Supabase CLIによる型生成（`supabase gen types typescript`）は未導入。現状は手書きの型定義のため、DBスキーマ確定後に自動生成へ移行を検討する。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: バックエンドをSupabaseに決定
  - **Why (なぜそうしたか):** マジックリンク認証によりパスワード入力を不要にでき、「指一本」操作という本質的なUX課題（Loop 3）に直接寄与する。またDB/Auth/Storageを1サービスに集約することで、第2フェーズのモバイル移行時もクライアントをそのまま共有でき、Prisma+個別Auth+個別Storageより構成がシンプルになる。
  - **What/How (何をしたか/どう実装したか):** `@supabase/supabase-js` を依存に追加し、`createSupabaseClient` でラップ。ドメイン型は `src/types/portfolio.ts` に定義。
