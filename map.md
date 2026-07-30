/ (Project Root)
├── claude.md                   <--  全体ルール、ペルソナ、全体地図の司令塔
├── memory-template.md          <--  memory.mdのテンプレートファイル
├── map.md                      <--  全体の階層構造を記したマップファイル（このファイル）
├── package.json / pnpm-workspace.yaml / turbo.json  <-- モノレポ(Turborepo + pnpm)のルート設定
├── .github/
│   ├── workflows/               <-- ci.yml (lint/typecheck/build), deploy.yml (Vercel CD)
│   └── memory.md                <-- CI/CDの設計・必要シークレットの記憶
│
├── apps/                       <-- プラットフォームごとのアプリケーション
│   ├── web/                    <-- 【第1フェーズ・実装済】Webアプリ (Next.js 14 App Router)
│   │   ├── src/
│   │   │   ├── app/             (ルーティング・画面, globals.css, layout.tsx, page.tsx)
│   │   │   ├── features/        <-- Web固有の機能 (例: features/portfolio)
│   │   │   ├── lib/             <-- Supabaseクライアント等の汎用処理
│   │   │   └── components/      <-- Web固有UI（横断的なものはpackages/ui側）
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
    ├── core/                   <-- 共通ビジネスロジック・APIクライアント・型定義 (Supabaseクライアント)
    │   ├── src/types/
    │   ├── src/utils/
    │   └── memory.md           <-- コアドメインの仕様・データ構造の記憶
    │
    └── config/                 <-- 共通設定 (ESLint preset, tsconfig.base.json)。ドメイン判断を持たないためmemory.mdなし