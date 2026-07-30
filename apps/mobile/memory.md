<!-- このファイルは本領域の設計意図と決定事項を維持するためのMemoryファイルです。コード修正時は必ず読み込み、重要な決定や変更があれば末尾のLogに追記して最新状態を保ってください。 -->

# Domain: apps/mobile（第2フェーズ モバイルアプリ・未着手）

## Overview (概要)
Web版（apps/web）の後続として計画しているモバイルアプリ。iOSのSplit View対応など、モバイル固有のネイティブ連携を担う想定。

## Architecture & Rules (設計とルール)
- 技術候補: Expo (React Native)。`@portfolio-share/core` のSupabaseクライアント・型定義、`@portfolio-share/ui` のデザイントークンをWeb版と共有する方針（UIコンポーネント自体はNativeWind等でのReact Native向け再実装が必要）。
- 現時点では時期尚早な依存関係の導入を避けるため、`src/app` と `src/features` のディレクトリ骨格のみ用意し、package.json・Expo初期化は行っていない。

## Unresolved Issues (未解決の課題・技術的負債)
- Expoプロジェクトの初期化（`create-expo-app`相当）は未実施。
- `@portfolio-share/ui` はWeb向け（Tailwind CSS + DOM要素）で実装されているため、React Native版コンポーネントの扱い（NativeWind導入 or 別途RN専用ui packageの要否）は未決定。着手時にpackages/uiのmemory.mdと合わせて再検討すること。

---
## Log (変更履歴と決定事項)
新しい決定事項や重要な気付きがあれば、上に追記（降順）していきます。

- **2026-07-30**: ディレクトリ骨格のみ作成
  - **Why (なぜそうしたか):** map.mdの構成に合わせて配置場所を確保しつつ、第2フェーズ着手前の不要な依存追加（YAGNI）を避けるため。
  - **What/How (何をしたか/どう実装したか):** `src/app`, `src/features` の空ディレクトリとこのmemory.mdのみ作成。package.json等は未作成。
