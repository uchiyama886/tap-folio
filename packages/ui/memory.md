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
- Figma側のVariables（`tokens` collection: color/brand, color/brand-foreground, color/bg, color/surface, color/text-primary, color/text-secondary, color/border, radius/md, spacing/*, size/touch-target）は `vj7z41MZqEwV2GEXx5JOEU` ファイルに作成したが、`tailwind.preset.js` にはまだ逆輸入していない。コード実装時にこれらをpresetへ反映するか要判断。
- 5画面とも現状は「見た目確認用のワイヤーフレーム」（プレーンなフレーム構成）であり、figma-generate-libraryが定める本番品質のコンポーネント/バリアント設計（Phase 0-4のフル運用）は行っていない。実装フェーズに入る前、必要なら本格的なコンポーネント化（variant、component properties等）を検討する。
- 5画面ともFigmaデザインのみで、`apps/web`側のコード実装（ルーティング・コンポーネント・Supabase Storage/Auth連携）はまだ行っていない。
- 旧ファイル `PdqCMga33klpY1boCWc9ok`（Button/Input/Textarea/PhotoPickerのバリアント付きコンポーネントを含む）は本セッション内で重複して作成されたものと判明。ユーザー判断により `vj7z41MZqEwV2GEXx5JOEU` を正式版とし、旧ファイルは非推奨（削除はユーザー側で手動対応）。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: MVP5画面をFigmaでワイヤーフレーム化（正式版ファイルを確定）
  - **Why (なぜそうしたか):** ユーザー方針により、実装前段階でデザインを目に見える形（Figma）にしてから実装に入ることにした。「指一本」操作の要件が特に強く出る主要フローを一通り可視化するため、ホーム(一覧)・作品記録・作品詳細・共有・ログイン(マジックリンク)の5画面を対象とした。なお本セッション前半で同じ目的の別ファイル(`PdqCMga33klpY1boCWc9ok`)が既に作成されていたことに後から気づいたが（会話要約で一時的に見失っていた）、ユーザーの判断で新ファイルを正式版として採用した。
  - **What/How (何をしたか/どう実装したか):** Figmaチーム「内山将太朗のスターターチーム」に新規デザインファイルを作成（file_key: `vj7z41MZqEwV2GEXx5JOEU`, https://www.figma.com/design/vj7z41MZqEwV2GEXx5JOEU）。`tailwind.preset.js` 相当の色・spacing・touch-targetをVariablesとして定義し、再利用する`Button/Primary`コンポーネントを1つ作成。375×812のモバイル幅で以下5フレームを構築: `01_Home`(作品一覧+FABメ+ボトムナビ), `02_AddWork`(タップ式写真選択エリア+タイトル/説明入力+保存ボタン), `03_Detail`(ヒーロー画像+説明+共有ボタン), `04_Share`(QRコード+リンクコピー+ネイティブ共有), `05_Login`(マジックリンク用メール入力のみ、パスワードフィールドなし)。各画面はスクリーンショットで目視確認済み。
- **2026-07-30**: Tailwind CSS + shadcn/ui(Radix)方針を決定
  - **Why (なぜそうしたか):** Radixのアクセシビリティ基盤（フォーカス管理・ARIA）が、車椅子当事者・運動機能に制約のあるユーザー向けの「指一本」操作要件と直接合致するため。
  - **What/How (何をしたか/どう実装したか):** `tailwind.preset.js` にtouch-target(48px)トークンを定義し、`Button` コンポーネントに適用。
