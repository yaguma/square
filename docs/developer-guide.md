# Square - 開発者ガイド

## 📚 目次

- [プロジェクト概要](#プロジェクト概要)
- [アーキテクチャ](#アーキテクチャ)
- [ディレクトリ構造](#ディレクトリ構造)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [開発ワークフロー](#開発ワークフロー)
- [テスト](#テスト)
- [ビルドとデプロイ](#ビルドとデプロイ)
- [コーディング規約](#コーディング規約)
- [トラブルシューティング](#トラブルシューティング)

---

## プロジェクト概要

**Square** は、TypeScriptとViteで開発された落ちものパズルゲームです。Domain-Driven Design（DDD）アーキテクチャを採用し、保守性と拡張性を重視して設計されています。

### 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| TypeScript | 5.3.3 | プログラミング言語 |
| Vite | 5.0.8 | ビルドツール・開発サーバー |
| Vitest | 1.0.4 | テストフレームワーク |
| TypeDoc | 0.28.14 | APIドキュメント生成 |
| ESLint | 8.56.0 | コード品質チェック |
| Prettier | 3.1.1 | コードフォーマット |

### 開発方針

- **DDD**: ドメイン駆動設計による明確な責務分離
- **TDD**: テスト駆動開発による品質保証
- **型安全**: TypeScriptによる厳格な型チェック
- **保守性**: 単一責任の原則とクリーンアーキテクチャ

---

## アーキテクチャ

### Domain-Driven Design (DDD)

このプロジェクトは、DDDの原則に基づいて4層のアーキテクチャで構成されています。

```
┌─────────────────────────────────┐
│   Presentation Layer            │  UI、レンダリング、コントローラー
├─────────────────────────────────┤
│   Application Layer             │  ユースケース、アプリケーションサービス
├─────────────────────────────────┤
│   Domain Layer                  │  ビジネスロジック、エンティティ、値オブジェクト
├─────────────────────────────────┤
│   Infrastructure Layer          │  リポジトリ実装、外部依存
└─────────────────────────────────┘
```

### レイヤーの責務

#### 1. Domain Layer（ドメイン層）

**場所**: `src/domain/`

**責務**: ゲームのビジネスロジックとルールを定義

**コンポーネント**:
- **Value Objects** (`value-objects/`): 不変の値オブジェクト
  - `Position`: 座標（x, y）
  - `Color`: ブロックの色
  - `Block`: 単一ブロック
  - `BlockPattern`: 2×2ブロックパターン
  - `Score`: スコア
  - `GameState`: ゲーム状態（playing/paused/gameover）
  - `Rectangle`: 矩形（消去判定用）

- **Entities** (`entities/`): ライフサイクルを持つオブジェクト
  - `Field`: ゲームフィールド
  - `FallingBlock`: 落下中のブロック
  - `Game`: ゲーム全体の状態管理

- **Domain Services** (`services/`): ドメインロジック
  - `BlockPatternGeneratorService`: ブロックパターン生成
  - `CollisionDetectionService`: 衝突判定
  - `BlockFallService`: ブロック落下処理
  - `BlockMatchingService`: 2×2マッチング検出
  - `BlockRemovalService`: ブロック消去処理

#### 2. Application Layer（アプリケーション層）

**場所**: `src/application/`

**責務**: ユースケースの実装とドメイン層の調整

**コンポーネント**:
- **Services** (`services/`):
  - `GameApplicationService`: ゲームの主要なユースケース
    - 新規ゲーム開始
    - フレーム更新
    - ゲーム状態取得
    - 一時停止/再開
    - リスタート
  - `InputHandlerService`: ユーザー入力処理

- **DTOs** (`dto/`): データ転送オブジェクト
  - `GameDto`: ゲーム状態の外部表現

#### 3. Infrastructure Layer（インフラ層）

**場所**: `src/infrastructure/`

**責務**: 外部依存の実装と技術的な詳細

**コンポーネント**:
- **Repositories** (`repositories/`):
  - `InMemoryGameRepository`: ゲームのインメモリ保存

- **Random** (`random/`):
  - `RandomGenerator`: 乱数生成（テスト可能）

- **Timer** (`timer/`):
  - `FrameTimer`: フレーム更新タイマー

#### 4. Presentation Layer（プレゼンテーション層）

**場所**: `src/presentation/`

**責務**: UIの表示とユーザーとの対話

**コンポーネント**:
- **Controllers** (`controllers/`):
  - `GameController`: ゲーム全体の制御

- **Renderers** (`renderers/`):
  - `CanvasRenderer`: Canvas描画
  - `UIRenderer`: UI要素の更新

---

## ディレクトリ構造

```
square/
├── src/                          # ソースコード
│   ├── domain/                   # ドメイン層
│   │   ├── models/
│   │   │   ├── entities/         # エンティティ
│   │   │   └── value-objects/    # 値オブジェクト
│   │   ├── services/             # ドメインサービス
│   │   └── repositories/         # リポジトリインターフェース
│   ├── application/              # アプリケーション層
│   │   ├── services/             # アプリケーションサービス
│   │   └── dto/                  # データ転送オブジェクト
│   ├── infrastructure/           # インフラ層
│   │   ├── repositories/         # リポジトリ実装
│   │   ├── random/               # 乱数生成
│   │   └── timer/                # タイマー
│   ├── presentation/             # プレゼンテーション層
│   │   ├── controllers/          # コントローラー
│   │   └── renderers/            # レンダラー
│   └── main.ts                   # エントリーポイント
│
├── tests/                        # テストコード
│   ├── domain/                   # ドメイン層のテスト
│   ├── application/              # アプリケーション層のテスト
│   ├── infrastructure/           # インフラ層のテスト
│   ├── presentation/             # プレゼンテーション層のテスト
│   └── integration/              # 統合テスト
│
├── docs/                         # ドキュメント
│   ├── design/                   # 設計ドキュメント
│   ├── implementation-plan/      # 実装計画
│   ├── api/                      # APIドキュメント（自動生成）
│   ├── user-guide.md             # ユーザーガイド
│   └── developer-guide.md        # このドキュメント
│
├── dist/                         # ビルド成果物（gitignore）
├── coverage/                     # カバレッジレポート（gitignore）
│
├── index.html                    # HTMLエントリーポイント
├── package.json                  # プロジェクト設定
├── tsconfig.json                 # TypeScript設定
├── vite.config.ts                # Vite設定
├── typedoc.json                  # TypeDoc設定
└── README.md                     # プロジェクトREADME
```

---

## 開発環境のセットアップ

### 必要な環境

- **Node.js**: 20.x以上
- **npm**: 10.x以上
- **Git**: 最新版

### 初回セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yaguma/square.git
cd square

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` が自動的に開きます。

---

## 開発ワークフロー

### 1. 開発サーバー

```bash
# 開発サーバーを起動（ホットリロード有効）
npm run dev
```

- ファイル変更時に自動的に再ロード
- `localhost:3000` でアクセス可能

### 2. コーディング

```bash
# コードフォーマット
npm run format

# リンター実行
npm run lint
```

### 3. テスト

```bash
# 全テストを実行（watch mode）
npm run test

# 全テストを1回実行
npm run test -- --run

# カバレッジ付きテスト
npm run test:coverage
```

### 4. ビルド

```bash
# プロダクションビルド
npm run build

# ビルド成果物をプレビュー
npm run preview
```

### 5. ドキュメント生成

```bash
# APIドキュメントを生成
npm run docs

# APIドキュメントを監視モードで生成
npm run docs:watch
```

---

## テスト

### テスト戦略

このプロジェクトでは、3種類のテストを実施しています：

1. **単体テスト（Unit Tests）**: 各クラス・関数の個別テスト
2. **統合テスト（Integration Tests）**: 複数のコンポーネントの連携テスト
3. **E2Eテスト（End-to-End Tests）**: ※オプション

### テストの構成

```
tests/
├── domain/              # ドメイン層の単体テスト
│   ├── models/
│   │   ├── entities/
│   │   └── value-objects/
│   └── services/
├── application/         # アプリケーション層の単体テスト
├── infrastructure/      # インフラ層の単体テスト
├── presentation/        # プレゼンテーション層の単体テスト
└── integration/         # 統合テスト
    ├── game-flow.test.ts         # ゲームフロー
    ├── pause-restart.test.ts     # 一時停止・リスタート
    └── game-removal-chain.test.ts # ブロック消去・連鎖
```

### テストの実行

```bash
# 全テスト実行（watch mode）
npm run test

# 全テスト実行（1回のみ）
npm run test -- --run

# 特定のファイルのみテスト
npm run test -- game-flow.test.ts

# カバレッジレポート付きテスト
npm run test:coverage
```

### カバレッジ目標

- **全体**: 95%以上
- **ドメイン層**: 100%
- **アプリケーション層**: 95%以上
- **インフラ層**: 90%以上
- **プレゼンテーション層**: 85%以上

現在のカバレッジ: **97.99%** ✅

### テストの書き方

#### 単体テストの例

```typescript
import { describe, test, expect } from 'vitest';
import { Position } from '@domain/models/value-objects/Position';

describe('Position', () => {
  test('正しく座標を保持する', () => {
    const position = Position.create(3, 5);

    expect(position.x).toBe(3);
    expect(position.y).toBe(5);
  });
});
```

#### 統合テストの例

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';

describe('Game Integration', () => {
  let service: GameApplicationService;

  beforeEach(() => {
    const repository = new InMemoryGameRepository();
    service = new GameApplicationService(repository);
  });

  test('新しいゲームが開始される', () => {
    const gameDto = service.startNewGame();

    expect(gameDto.state).toBe('playing');
    expect(gameDto.score).toBe(0);
  });
});
```

---

## ビルドとデプロイ

### プロダクションビルド

```bash
# ビルド実行
npm run build

# ビルド成果物を確認
npm run preview
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### GitHub Pagesへのデプロイ

このプロジェクトは、GitHub Actionsを使用して自動的にデプロイされます。

#### デプロイフロー

1. `main` ブランチにプッシュ
2. GitHub Actionsが自動的にビルド
3. GitHub Pagesにデプロイ

#### 初回設定

1. GitHubリポジトリの `Settings` > `Pages` に移動
2. `Source` を「GitHub Actions」に設定
3. `main` ブランチにマージすると自動デプロイ

#### デプロイ設定ファイル

`.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

---

## コーディング規約

### TypeScript

- **厳格モード**: `strict: true` を使用
- **明示的な型**: 型推論に頼らず、明示的に型を記述
- **Null安全**: `strictNullChecks` を有効化

### 命名規則

- **クラス**: PascalCase（例: `GameController`）
- **関数・メソッド**: camelCase（例: `startNewGame`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_WIDTH`）
- **プライベートメンバー**: 接頭辞なし（アクセス修飾子で制御）

### コードスタイル

- **インデント**: 2スペース
- **引用符**: シングルクォート（`'`）
- **セミコロン**: 必須
- **行の長さ**: 最大80文字（推奨）

### 設計原則

1. **単一責任の原則（SRP）**: 1クラス1責務
2. **オープン・クローズドの原則（OCP）**: 拡張に開き、修正に閉じる
3. **依存性逆転の原則（DIP）**: 抽象に依存し、実装に依存しない
4. **不変性**: 値オブジェクトは不変
5. **純粋関数**: 副作用を最小限に

### コメント

- **JSDoc**: パブリックAPIには必ずJSDocを記述
- **インラインコメント**: 複雑なロジックには説明を追加
- **TODO**: `// TODO:` 形式で記述

例:

```typescript
/**
 * ゲームを開始する
 *
 * @returns 新しいゲームのDTO
 */
startNewGame(): GameDto {
  // ゲームを作成
  const game = Game.create(/* ... */);

  // TODO: 難易度設定を追加

  return this.toDto(game);
}
```

---

## トラブルシューティング

### よくある問題

#### 1. `npm install` が失敗する

**症状**: 依存関係のインストールに失敗

**解決策**:
```bash
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 2. 開発サーバーが起動しない

**症状**: `npm run dev` が失敗する

**解決策**:
```bash
# ポート3000が使用中かチェック
lsof -i :3000

# 別のポートを指定
npm run dev -- --port 3001
```

#### 3. テストが失敗する

**症状**: 特定のテストが失敗する

**解決策**:
```bash
# 単一のテストファイルを実行して詳細を確認
npm run test -- --run <test-file-name>

# テストキャッシュをクリア
npm run test -- --run --no-cache
```

#### 4. ビルドエラー

**症状**: `npm run build` が失敗する

**解決策**:
```bash
# TypeScriptの型エラーを確認
npx tsc --noEmit

# distディレクトリをクリア
rm -rf dist
npm run build
```

#### 5. TypeDocの生成に失敗する

**症状**: `npm run docs` が失敗する

**解決策**:
```bash
# docs/apiディレクトリをクリア
rm -rf docs/api

# TypeDocを再インストール
npm install --save-dev typedoc

# 再生成
npm run docs
```

### デバッグ

#### ブラウザ開発者ツール

1. Chrome DevToolsを開く（F12）
2. Consoleタブでエラーを確認
3. Sourcesタブでブレークポイントを設定

#### Vitestデバッグ

```bash
# デバッグモードでテスト実行
npm run test -- --inspect-brk
```

Chrome DevToolsで `chrome://inspect` にアクセスしてデバッグ。

---

## リソース

### 公式ドキュメント

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
- [TypeDoc](https://typedoc.org/)

### プロジェクト内ドキュメント

- [ユーザーガイド](./user-guide.md)
- [APIドキュメント](./api/index.html)
- [設計ドキュメント](./design/)
- [実装計画](./implementation-plan/)

### 関連リンク

- [GitHubリポジトリ](https://github.com/yaguma/square)
- [GitHub Pages（デモ）](https://yaguma.github.io/square/)
- [Issueトラッカー](https://github.com/yaguma/square/issues)

---

## コントリビューション

プルリクエストを歓迎します！以下の手順でコントリビュートしてください：

1. フォークしてブランチを作成
2. コードを変更
3. テストを追加・実行
4. コミットメッセージを記述
5. プルリクエストを作成

詳細は [CONTRIBUTING.md](../CONTRIBUTING.md)（作成予定）を参照してください。

---

**Happy Coding! 🚀**
