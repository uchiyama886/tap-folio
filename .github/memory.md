<!-- このファイルは本領域の設計意図と決定事項を維持するためのMemoryファイルです。コード修正時は必ず読み込み、重要な決定や変更があれば末尾のLogに追記して最新状態を保ってください。 -->

# Domain: .github（CI）

## Overview (概要)
モノレポ全体のCI（lint/typecheck/build）を担う。本番デプロイ(CD)はVercelダッシュボードのgit連携（Vercel純正のGitHub App）が担当しており、このディレクトリの管轄外。

## Architecture & Rules (設計とルール)
- **CI** (`ci.yml`): `pull_request` 全般と `main` へのpushで発火。corepackでpnpmを有効化し、`pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm build`（いずれもturbo経由でワークスペース全体に対して実行）。
  - packages/config・packages/core・packages/ui は `lint`/`build` スクリプトを持たないため、turboの仕様によりそれらのタスクは自動的にスキップされる（エラーにはならない）。
- **CD（Vercel）**: GitHub Actions経由のCLIデプロイ(`deploy.yml`)は当初作成したが、Vercelダッシュボードでリポジトリをインポート済み（Vercel純正git連携で自動デプロイ）であることが判明したため削除した。二重デプロイを避けるため、CDはVercel側の仕組みに一本化する。
- 現状、Vercelの自動デプロイは本リポジトリのCI(`ci.yml`)の成否とは独立して動く（Vercelは自前でbuildを実行するため）。CIが落ちていてもVercelはデプロイを試みる点に注意。CIをデプロイの前提条件にしたい場合は、GitHubのBranch protection rulesで `ci.yml` のステータスチェックをmainへのマージ必須条件に設定する必要がある（未設定）。

## Unresolved Issues (未解決の課題・技術的負債)
- テストスイートが存在しないため、CIにはtestステップを含めていない。テスト導入時は `ci.yml` に `pnpm test` ステップを追加すること。
- CIの成否とVercelデプロイが連動していない（上記参照）。厳密にゲートしたい場合はBranch protection rulesの設定が必要。
- プレビュー環境（PRごとのデプロイプレビュー）はVercelのgit連携が標準機能として自動提供するため、GitHub Actions側での追加対応は不要。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: CD方式をVercel純正git連携に一本化（GitHub Actions経由のVercel CLIデプロイを削除）
  - **Why (なぜそうしたか):** ユーザーがVercelダッシュボードで本リポジトリを直接インポートしており、push時の自動デプロイは既にVercel側で完結している。`deploy.yml`（Vercel CLI + VERCEL_TOKEN等のシークレットが必要な方式）を併用すると同一コミットに対して二重にデプロイが走り、シークレット管理の手間も増えるだけで実質的な利益がない。
  - **What/How (何をしたか/どう実装したか):** `.github/workflows/deploy.yml` を削除。`ci.yml` のみ残し、CIはlint/typecheck/buildの検証用途に限定。
- **2026-07-30**: CI/CDの初期実装
  - **Why (なぜそうしたか):** apps/webはNext.jsでありVercelとの親和性が高く、Supabaseバックエンドとも相性が良い。
  - **What/How (何をしたか/どう実装したか):** `.github/workflows/ci.yml`（pnpm+turboでlint/typecheck/build）を作成。
