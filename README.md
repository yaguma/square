# Square - 落ちものパズルゲーム

TypeScriptとViteで開発された落ちものパズルゲームです。

## 🎮 ゲーム紹介

**Square（スクエア）** は、色付きブロックを落として2×2の正方形を作る落ちものパズルゲームです。同じ色のブロックで正方形を作ると消去され、連鎖を狙って高得点を目指します。

### 主な特徴

- 🎨 4色のカラフルなブロック
- 🔄 ブロックの回転・移動
- ⚡ 連鎖システム
- 🎯 スコアアタック
- 🏆 ランキング機能（上位10件をローカルストレージに保存）
- ⏸️ 一時停止・リスタート機能
- 📱 モバイル対応（タッチ操作サポート）

## 🎬 デモ

このゲームはGitHub Pagesで公開されています：

**🔗 [今すぐプレイ！](https://yaguma.github.io/square/)**

## 📚 ドキュメント

- **[ユーザーガイド](docs/user-guide.md)** - ゲームの遊び方、操作方法、攻略のヒント
- **[開発者ガイド](docs/developer-guide.md)** - アーキテクチャ、開発環境、テスト
- **[APIドキュメント](docs/api/index.html)** - コードのAPI仕様（TypeDoc）

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
# テストを実行（watch mode）
npm run test

# テストを1回実行
npm run test -- --run

# カバレッジ付きでテストを実行
npm run test:coverage
```

### APIドキュメント生成

```bash
# APIドキュメントを生成（docs/api/に出力）
npm run docs
```

## GitHub Pagesへのデプロイ

このプロジェクトは、mainブランチにプッシュすると自動的にGitHub Pagesにデプロイされます。

### 初回設定

1. GitHubリポジトリの Settings > Pages に移動
2. Source を「GitHub Actions」に設定
3. mainブランチにマージすると自動的にデプロイされます

## 🧪 テスト

テストは充実しており、高いカバレッジを維持しています：

- **テスト数**: 332テスト
- **テスト成功率**: 100%
- **カバレッジ**: 97.99%

詳細は [開発者ガイド](docs/developer-guide.md#テスト) を参照してください。

## 🛠️ 技術スタック

- **言語**: TypeScript 5.x
- **ビルドツール**: Vite 5.x
- **テストフレームワーク**: Vitest 1.x
- **ドキュメント**: TypeDoc 0.28.x
- **アーキテクチャ**: Domain-Driven Design (DDD)

## 📁 プロジェクト構造

このプロジェクトは、DDDの4層アーキテクチャで構成されています：

```
src/
├── domain/          # ドメイン層（エンティティ、値オブジェクト、ドメインサービス）
├── application/     # アプリケーション層（ユースケース）
├── infrastructure/  # インフラ層（リポジトリ実装、外部依存）
└── presentation/    # プレゼンテーション層（UI、レンダラー）
```

詳細な設計資料は `/docs` ディレクトリを参照してください。

## 🤝 コントリビューション

プルリクエストを歓迎します！開発に参加する際は [開発者ガイド](docs/developer-guide.md) を参照してください。

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT

## 🙋 質問・バグレポート

質問やバグレポートは [GitHub Issues](https://github.com/yaguma/square/issues) までお願いします。
