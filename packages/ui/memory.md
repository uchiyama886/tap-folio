<!-- このファイルは本領域の設計意図と決定事項を維持するためのMemoryファイルです。コード修正時は必ず読み込み、重要な決定や変更があれば末尾のLogに追記して最新状態を保ってください。 -->

# Domain: packages/ui（共通UIコンポーネント・Figmaデザイントークン）

## Overview (概要)
Web/Mobile間で共有するUIコンポーネントと、Tailwindのデザイントークン（色・spacing等）を管理する。
- 目的（Loop 3）: 車椅子当事者・指一本操作のユーザーが誤操作なく使えるよう、タップ領域やコントラストなどのアクセシビリティ基準をコンポーネントレベルで一元的に担保する。

## Architecture & Rules (設計とルール)
- スタイリングはTailwind CSSを採用し、`tailwind.preset.js` をapps/web（および将来のNativeWind経由でapps/mobile）から読み込んで利用する。
- コンポーネントはshadcn/ui（Radix UIベース）の思想を踏襲し、キーボード操作・フォーカスリング・十分なタップ領域（`touch-target` = 48px、WCAG 2.5.5 AAA相当）をデフォルトで満たすこと。
- Figmaのデザイントークンと同期する運用を想定（`tailwind.preset.js` の値をFigma Variablesと対応させる）。Figma連携作業を行う際はfigma-code-connect等のスキルと合わせてこのファイルを更新すること。

## Unresolved Issues (未解決の課題・技術的負債)
- shadcn/ui本体のコンポーネント（Button以外）はまだ移植していない。必要になった時点で `pnpm dlx shadcn@latest add <component>` 相当の手順で追加する。
- Figma側のデザイントークンはまだ存在しないため、`tailwind.preset.js` の値は暫定（brandカラー等）。Figmaファイル確定後にトークンを同期する。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: Tailwind CSS + shadcn/ui(Radix)方針を決定
  - **Why (なぜそうしたか):** Radixのアクセシビリティ基盤（フォーカス管理・ARIA）が、車椅子当事者・運動機能に制約のあるユーザー向けの「指一本」操作要件と直接合致するため。
  - **What/How (何をしたか/どう実装したか):** `tailwind.preset.js` にtouch-target(48px)トークンを定義し、`Button` コンポーネントに適用。
