/ (Project Root)
├── claude.md                   <--  全体ルール、ペルソナ、全体地図の司令塔
├── memory-template.md          <--  memory.mdのテンプレートファイル
├── map.md                      <--  全体の階層構造を記したマップファイル（このファイル）
├── package.json / pnpm-workspace.yaml / turbo.json  <-- モノレポ(Turborepo + pnpm)のルート設定
├── .github/
│   ├── workflows/               <-- ci.yml (lint/typecheck/build)。CDはVercelのgit連携に一本化のためworkflow化していない
│   └── memory.md                <-- CIの設計・Vercel連携方針の記憶
│
├── supabase/                    <-- DBスキーマ・Storageのマイグレーション(SQL)。Supabaseに適用が必要
│   └── migrations/              <-- 0001_init.sql(works/share_links/RLS/get_shared_work RPC), 0002_storage.sql(work-imagesバケット+ポリシー)
│
├── apps/                       <-- プラットフォームごとのアプリケーション
│   ├── web/                    <-- 【第1フェーズ・実装済】Webアプリ (Next.js 14 App Router)
│   │   ├── src/
│   │   │   ├── app/             ルーティング・画面
│   │   │   │    ├── page.tsx(一覧) / login / auth/callback(route)
│   │   │   │    ├── works/new(記録+AI提案) / works/[id](詳細) / works/[id]/share(共有)
│   │   │   │    ├── s/[token](公開閲覧) / api/analyze-photo(route: Claude解析)
│   │   │   │    └── globals.css, layout.tsx
│   │   │   ├── middleware.ts    <-- 毎リクエストでSupabaseセッション更新(@supabase/ssr)
│   │   │   ├── features/portfolio/  <-- useNewWorkStore(Zustand), analyze/photo ヘルパー
│   │   │   ├── lib/             <-- supabase/{client,server}, storage, siteUrl, format
│   │   │   └── components/      <-- SignOutButton, ShareActions（Web固有UI）
│   │   └── memory.md           <-- Web版の仕様・ルーティングなどの記憶
│   │
│   └── mobile/                 <-- 【第2フェーズ・骨格のみ】モバイルアプリ (Expo/React Native予定)
│       ├── src/
│       │   ├── app/            
│       │   └── features/       <-- Mobile固有の機能 (iOSのSplit View対応など)
│       └── memory.md           <-- モバイル特有の仕様・ネイティブ連携の記憶（未着手の理由も記載）
│
└── packages/                   <-- Web/Mobile間で共有するパッケージ群
    ├── ui/                     <-- 共通UIコンポーネント・Figmaデザイントークン (Tailwind preset)
    │   ├── src/components/
    │   └── memory.md           <-- デザインシステム・Figma連携ルールの記憶
    │
    ├── core/                   <-- 共通ビジネスロジック・APIクライアント・型定義
    │   ├── src/types/          <-- portfolio.ts (PortfolioItem, ShareLink, PhotoSuggestion等)
    │   ├── src/ai/             <-- analyzePhoto.ts (Claude vision解析・サーバー専用)
    │   ├── src/supabaseClient.ts
    │   └── memory.md           <-- コアドメインの仕様・データ構造の記憶
    │
    └── config/                 <-- 共通設定 (ESLint preset, tsconfig.base.json)。ドメイン判断を持たないためmemory.mdなし