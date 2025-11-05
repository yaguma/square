# Square - 落ちものパズルゲーム

TypeScriptとViteで開発された落ちものパズルゲームです。

## デモ

このゲームはGitHub Pagesで公開されています：
https://yaguma.github.io/square/

## 開発

### 必要な環境

- Node.js 20以上
- npm

### セットアップ

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 が自動的に開きます。

### ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

### テスト

```bash
npm run test
```

カバレッジ付きでテストを実行：

```bash
npm run test:coverage
```

## GitHub Pagesへのデプロイ

このプロジェクトは、mainブランチにプッシュすると自動的にGitHub Pagesにデプロイされます。

### 初回設定

1. GitHubリポジトリの Settings > Pages に移動
2. Source を「GitHub Actions」に設定
3. mainブランチにマージすると自動的にデプロイされます

## 技術スタック

- **言語**: TypeScript 5.x
- **ビルドツール**: Vite
- **テストフレームワーク**: Vitest
- **アーキテクチャ**: Domain-Driven Design (DDD)

## プロジェクト構造

詳細な設計資料は `/docs` ディレクトリを参照してください。

- `/src/domain` - ドメイン層（エンティティ、値オブジェクト、ドメインサービス）
- `/src/application` - アプリケーション層（ユースケース）
- `/src/infrastructure` - インフラ層（リポジトリ実装、外部依存）
- `/src/presentation` - プレゼンテーション層（UI、レンダラー）

## ライセンス

MIT
