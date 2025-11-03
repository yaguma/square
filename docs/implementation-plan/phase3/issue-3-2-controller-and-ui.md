# [Phase 3-2] コントローラーとUIの実装

## 概要

ゲーム全体を制御するコントローラーと、HTML/CSSを実装します。

## 参照ドキュメント

- `docs/design/infrastructure-presentation-layers-detailed-design.md`
- `docs/design/integration-design.md`

## 実装対象

### 1. GameController

**ファイル**: `src/presentation/controllers/GameController.ts`

**メソッド**:
- `constructor(...)`
- `start(): void`
- `stop(): void`

**プライベートメソッド**:
- `setupEventListeners(): void`
- `gameLoop(): void`
- `render(gameDto: GameDto): void`

### 2. main.ts（エントリーポイント）

**ファイル**: `src/main.ts`

**実装**:
- 依存関係の組み立て
- GameControllerの作成
- ゲームの起動

### 3. HTML

**ファイル**: `public/index.html`

**構造**:
- ヘッダー
- ゲームコンテナ
  - スコアパネル
  - ネクストパネル
  - ゲームフィールド（Canvas）
  - コントロールボタン
- 操作説明

### 4. CSS

**ファイル**: `public/styles.css`

**スタイル**:
- レスポンシブデザイン
- ダークテーマ
- ボタンスタイル
- レイアウト

## テスト

**手動テスト**:
- ゲームが起動する
- キーボード操作が動作する
- ボタンが動作する
- 画面が正しく表示される

## 完了条件

- [ ] GameControllerが実装されている
- [ ] main.tsが実装されている
- [ ] index.htmlが実装されている
- [ ] styles.cssが実装されている
- [ ] ゲームが正常に動作する
- [ ] すべての操作が動作する

## 見積もり

**工数**: 2-3日

## 依存関係

**前提**:
- Issue 3.1（レンダラー）
- Issue 2.3（InputHandlerService, FrameTimer）

**後続**: Issue 4.1
