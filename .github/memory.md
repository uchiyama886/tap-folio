<!-- このファイルは本領域の設計意図と決定事項を維持するためのMemoryファイルです。コード修正時は必ず読み込み、重要な決定や変更があれば末尾のLogに追記して最新状態を保ってください。 -->

# Domain: .github（CI/CD）

## Overview (概要)
モノレポ全体のCI（lint/typecheck/build）と、apps/web（Next.js）のVercelへの自動デプロイ(CD)を担う。

## Architecture & Rules (設計とルール)
- **CI** (`ci.yml`): `pull_request` 全般と `main` へのpushで発火。corepackでpnpmを有効化し、`pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm build`（いずれもturbo経由でワークスペース全体に対して実行）。
  - packages/config・packages/core・packages/ui は `lint`/`build` スクリプトを持たないため、turboの仕様によりそれらのタスクは自動的にスキップされる（エラーにはならない）。
- **CD** (`deploy.yml`): `workflow_run` トリガーでCIワークフローが `main` 上で成功した場合のみ発火し、CIが通っていない変更が誤ってデプロイされないようにしている。
  - デプロイはVercel CLI（`vercel pull` → `vercel build` → `vercel deploy --prebuilt`）を使用し、モノレポ内の `apps/web` をワーキングディレクトリとして実行する。
  - 必要なリポジトリシークレット: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`（Vercel側で `apps/web` を Root Directory としたプロジェクトを事前に作成し、`vercel link` で取得したIDを設定する）。

## Unresolved Issues (未解決の課題・技術的負債)
- Vercelプロジェクト自体はまだ作成されていない。ユーザー側でGitHubリポジトリ作成・Vercelプロジェクト作成・シークレット登録が必要（本セッションでは未実施）。
- テストスイートが存在しないため、CIにはtestステップを含めていない。テスト導入時は `ci.yml` に `pnpm test` ステップを追加すること。
- プレビュー環境（PRごとのVercelプレビューデプロイ）は未設定。必要になれば `deploy.yml` とは別に `pull_request` トリガーのプレビュー用ワークフローを追加する。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: CI/CDの初期実装
  - **Why (なぜそうしたか):** apps/webはNext.jsでありVercelとの親和性が高く、Supabaseバックエンドとも相性が良い。CIをCDの前段ゲートにすることで、lint/typecheck/buildが通らない変更が本番に出ないようにするため。
  - **What/How (何をしたか/どう実装したか):** `.github/workflows/ci.yml`（pnpm+turboでlint/typecheck/build）と `.github/workflows/deploy.yml`（workflow_runでCI成功後にVercel CLIでプロダクションデプロイ）を作成。
