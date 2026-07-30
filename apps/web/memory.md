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

## 主要ルーティング (App Router)
- `/`（`app/page.tsx`）: 作品一覧。未ログインは `/login` へリダイレクト。FABから `/works/new`。
- `/login`: マジックリンク（`signInWithOtp`）。パスワード不要。
- `/auth/callback`（route.ts）: `exchangeCodeForSession` でセッション確立。
- `/works/new`: 作品記録。写真選択→「AIに提案してもらう」→保存(Storageアップロード+works insert)。状態はZustand（`features/portfolio/useNewWorkStore.ts`）。
- `/works/[id]`: 作品詳細（所有者のみ、RLSで保護）。
- `/works/[id]/share`: 共有リンクをget-or-createしQR(SVG)生成 + コピー/ネイティブ共有。
- `/s/[token]`: 公開閲覧（ログイン不要）。`get_shared_work` RPC経由でトークンに紐づく作品のみ表示。
- `/api/analyze-photo`（route.ts, nodejs runtime）: サーバー側でClaude(`@portfolio-share/core` の `analyzePhoto`)を呼ぶ。要ログイン、APIキーはサーバー環境変数のみ。

## Architecture メモ（実装済み）
- 認証は `@supabase/ssr`。`src/lib/supabase/{client,server}.ts` と `src/middleware.ts`（毎リクエストで `getUser()` によりトークン更新）。framework固有のためcoreではなくlibに置く（`@supabase/supabase-js` を直接newしない規約は維持）。
- 画像は public バケット `work-images`。パスは `${user.id}/${uuid}.${ext}`。表示URLは `src/lib/storage.ts` の `publicImageUrl`。
- DBスキーマ/RLS/Storageポリシー/共有RPCは `/supabase/migrations/0001_init.sql`, `0002_storage.sql`。

## Unresolved Issues (未解決の課題・技術的負債)
- `/supabase/migrations/*.sql` は未適用。Supabase SQL Editor またはCLIで適用が必要（works/share_links/get_shared_work/バケットが無いと一覧・詳細・共有・公開ページが機能しない）。
- マジックリンクのメール送信はSupabase Auth設定（Site URL / Redirect URLsに本番・localhostを登録）が前提。
- 画像アップロードはクライアントから元Fileをそのまま送信（リサイズ・EXIF除去なし）。将来的に前処理を検討。
- AI解析はClaudeへ画像base64を直接送信（Storage経由ではない）。大きな画像はpayloadが重い可能性。
- `next/image` ではなく `<img>` を使用（リモートドメイン設定回避のため。lint警告はinline disableで抑制）。

## Runtime検証済み (2026-07-30)
`next start` で `/login`=200、`/`=307→/login、`POST /api/analyze-photo`(未認証)=401、`/s/<不正token>`=404 を実Supabaseに対して確認。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: MVP全機能を実装（ログイン/一覧/記録/詳細/共有/公開 + AI画像解析）
  - **Why:** ユーザー要望「最後まで一気通貫でつくって」。Figmaで設計した5画面とAI提案機能を、実際に動くNext.js+Supabase+Claudeコードへ落とし込む。
  - **What/How:** 上記ルーティング・アーキテクチャの通り実装。認証は`@supabase/ssr`+middleware、データはRLS付きworks/share_links、共有は公開RPC、AI解析はサーバーRoute Handler経由でClaude(`claude-opus-4-8` vision)。`pnpm build`通過、実Supabaseへのランタイムスモークテスト済み。

- **2026-07-30**: 作品記録画面へのAI画像解析（タイトル・説明の提案）機能を設計
  - **Why (なぜそうしたか):** ユーザーから「アップロードした画像を解析してタイトルや説明を提案してほしい」との要望。文字入力の手間を減らすことは「指一本」操作の本質的なUX向上に直結する。API呼び出しコストとレイテンシをユーザーがコントロールできるよう、写真選択後に自動発火ではなく「AIに提案してもらう」ボタンの手動タップ方式を採用（ユーザー選択）。
  - **What/How (何をしたか/どう実装したか):** Figma（`vj7z41MZqEwV2GEXx5JOEU`）の `02_AddWork` フレームに、写真選択エリアの直下へ「✨ AIに提案してもらう」ボタンと補足キャプションを追加。ボタンタップ後の結果状態を可視化するため `02b_AddWork_Suggested` フレームを複製・作成し、作品名・説明欄にAI提案例が入った状態を表現。実装方針（未着手）: `apps/web/src/app/api/analyze-photo` にNext.js Route Handlerを新設し、サーバー側でAnthropic SDK（`claude-opus-4-8`, vision入力 + `output_config.format`のjson_schemaでタイトル/説明を構造化出力）を呼び出す。APIキーはサーバー環境変数のみに置き、クライアントには絶対に渡さない。
  - **Unresolved:** Supabase Storageへの画像アップロードが未実装のため、解析対象画像をRoute Handlerにどう渡すか（クライアントから直接base64送信 or Storageアップロード後にURL渡し）は実装時に決定する。
  - **Why (なぜそうしたか):** map.md記載のモノレポ構成に沿って第1フェーズ（Web）を先行実装するため。
  - **What/How (何をしたか/どう実装したか):** Next.js 14 App Router雛形、Tailwind CSS（`@portfolio-share/ui` のpreset継承）、Zustandストアの雛形、Supabaseクライアントラッパーを設置。
