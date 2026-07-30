<!-- このファイルは本領域の設計意図と決定事項を維持するためのMemoryファイルです。コード修正時は必ず読み込み、重要な決定や変更があれば末尾のLogに追記して最新状態を保ってください。 -->

# Domain: apps/web（第1フェーズ Webアプリ）

## Overview (概要)
車椅子当事者を主なターゲットとし、スマホブラウザから作品を記録・指一本で共有できるポートフォリオWebアプリの本体。第1フェーズはこのWebアプリのみを実装対象とする。

## Architecture & Rules (設計とルール)
- Next.js 14 (App Router) + React 18 + TypeScript strict。
- ルーティング/画面は `src/app`、機能単位のロジック・コンポーネントは `src/features/<domain>`、外部ライブラリ設定や汎用処理は `src/lib` に配置する（ルートclaude.mdのDirectory Structure規約に準拠）。
- バックエンド機能（認証・DB・画像ストレージ）は独自API Routesを極力持たず、`@portfolio-share/core` 経由でSupabaseに直接アクセスする方針（BFFが必要になった場合のみ `src/app/api` にRoute Handlerを追加する）。
- 状態管理はZustand。グローバルストアは各featureディレクトリ内に閉じ込め、featureをまたぐ共有が必要な場合のみ `src/lib` に昇格する。
- UIコンポーネントは `@portfolio-share/ui` を優先利用し、Web固有のレイアウトのみこのアプリ内に置く。

## Unresolved Issues (未解決の課題・技術的負債)
- Supabase Authによるマジックリンク認証フローは未実装（現状はUIの雛形のみ）。
- 画像アップロード（Supabase Storage）は未実装。
- `.env.example` のSupabase接続情報は未設定のため、実際のSupabaseプロジェクト作成後に `.env.local` を用意する必要がある。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: 初期環境構築
  - **Why (なぜそうしたか):** map.md記載のモノレポ構成に沿って第1フェーズ（Web）を先行実装するため。
  - **What/How (何をしたか/どう実装したか):** Next.js 14 App Router雛形、Tailwind CSS（`@portfolio-share/ui` のpreset継承）、Zustandストアの雛形、Supabaseクライアントラッパーを設置。
