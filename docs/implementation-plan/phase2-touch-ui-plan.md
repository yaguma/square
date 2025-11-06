# Phase 2: タッチUI実装 - 実装計画書

**作成日**: 2025-11-06
**バージョン**: 1.0
**対象**: モバイル対応 Phase 2 - タッチUI実装
**前提**: Phase 1（基盤整備）完了

---

## 1. Phase 2 概要

### 1.1 目的

Phase 1で実装した値オブジェクトとApplication層サービスを基に、タッチ操作用のUIコンポーネントを実装し、モバイルデバイスでのゲームプレイを可能にするのだ。

### 1.2 実装スコープ

#### Phase 2で実装する内容

| # | タスク | 説明 | 見積もり |
|---|--------|------|---------|
| 2.1 | EventListenerRecord型定義 | イベントリスナー記録型 | 0.5時間 |
| 2.2 | TouchControlRenderer作成 | タッチコントロールUI | 4時間 |
| 2.3 | TouchControlRendererテスト | UIのテスト | 4時間 |
| 2.4 | タッチコントロールCSS作成 | スタイル定義 | 2時間 |
| 2.5 | CanvasRenderer変更 | 動的ブロックサイズ対応 | 2時間 |
| 2.6 | CanvasRendererテスト作成 | 変更部分のテスト | 3時間 |
| 2.7 | HTML構造更新 | タッチコントロール用コンテナ追加 | 0.5時間 |

**Phase 2 合計**: 16時間（約2日）

### 1.3 Phase 2の完了条件

- ✅ TouchControlRendererが実装され、DOM要素が正しく生成される
- ✅ タッチイベントが正しくInputCommandに変換される
- ✅ 視覚フィードバック（activeクラス）が動作する
- ✅ メモリリーク対策が実装されている
- ✅ CSSがレスポンシブ対応している
- ✅ CanvasRendererが動的サイズ変更に対応している
- ✅ 全てのユニットテストがパスする

---

## 2. 実装タスク詳細

### タスク 2.1: EventListenerRecord型定義

#### 2.1.1 ファイル情報

**作成ファイル**: `src/presentation/types/EventListenerRecord.ts`

#### 2.1.2 実装内容

```typescript
/**
 * EventListenerRecord - イベントリスナーの登録記録
 *
 * @remarks
 * メモリリーク対策としてイベントリスナーの登録情報を保持
 * destroy時に確実にリスナーを解除するために使用
 */
export interface EventListenerRecord {
  /** イベントリスナーが登録されている要素 */
  element: HTMLElement;

  /** イベント名（'click', 'touchstart'等） */
  event: string;

  /** イベントハンドラ関数 */
  handler: EventListener;
}
```

#### 2.1.3 完了条件

- ✅ 型定義ファイルが作成される
- ✅ JSDocコメントが適切に記述される
- ✅ TouchControlRendererから正しくimportできる

---

### タスク 2.2: TouchControlRenderer作成

#### 2.2.1 ファイル情報

**作成ファイル**: `src/presentation/renderers/TouchControlRenderer.ts`

#### 2.2.2 実装内容サマリー

- **責務**: タッチ操作用UIコントロールの描画とイベントハンドリング
- **依存関係**:
  - `InputHandlerService` (Application層)
  - `InputCommand` (Application層)
  - `EventListenerRecord` (Presentation層)

#### 2.2.3 クラス定義

```typescript
export class TouchControlRenderer {
  private container: HTMLElement;
  private buttons: Map<string, HTMLButtonElement>;
  private eventListeners: EventListenerRecord[];

  constructor(
    containerElement: HTMLElement | null,
    private inputHandlerService: InputHandlerService,
    private gameId: string
  ) {
    if (!containerElement) {
      throw new Error('TouchControlRenderer: containerElement is required');
    }
    this.container = containerElement;
    this.buttons = new Map<string, HTMLButtonElement>();
    this.eventListeners = [];
  }

  // 主要メソッド
  render(): void;
  show(): void;
  hide(): void;
  destroy(): void;

  // プライベートメソッド
  private createTouchControlsElement(): HTMLElement;
  private createRotationButtons(): HTMLElement;
  private createDirectionButtons(): HTMLElement;
  private createDropButton(): HTMLElement;
  private createButton(action: string, label: string, testId: string): HTMLButtonElement;
  private setupEventListeners(): void;
  private handleTouchInput(action: string): void;
  private convertToInputCommand(action: string): InputCommand;
  private addEventListener(element: HTMLElement, event: string, handler: EventListener): void;
}
```

#### 2.2.4 DOM構造

```html
<div class="touch-controls" data-testid="touch-controls">
  <!-- 回転ボタン -->
  <div class="rotation-buttons">
    <button class="touch-btn" data-action="rotate-ccw" data-testid="rotation-ccw-btn">↺</button>
    <button class="touch-btn" data-action="rotate-cw" data-testid="rotation-cw-btn">↻</button>
  </div>

  <!-- 方向ボタン -->
  <div class="direction-buttons">
    <button class="touch-btn" data-action="left" data-testid="direction-left-btn">←</button>
    <button class="touch-btn" data-action="down" data-testid="direction-down-btn">↓</button>
    <button class="touch-btn" data-action="right" data-testid="direction-right-btn">→</button>
  </div>

  <!-- 即落下ボタン -->
  <div class="drop-button">
    <button class="touch-btn" data-action="instant-drop" data-testid="drop-btn">▼ 即落下</button>
  </div>
</div>
```

#### 2.2.5 イベント処理

各ボタンには以下のイベントが設定される:

- `touchstart`: タッチ開始時 → 視覚フィードバック + 入力処理
- `touchend`: タッチ終了時 → 視覚フィードバック解除
- `touchcancel`: タッチキャンセル時 → 視覚フィードバック解除
- `mousedown`: マウスダウン（デバッグ用）
- `mouseup`: マウスアップ（デバッグ用）

#### 2.2.6 エラーハンドリング

| エラー発生箇所 | 処理 | 影響 |
|--------------|------|------|
| constructor() | throw | インスタンス化失敗 |
| render() | throw | UI生成失敗 |
| handleTouchInput() | catch & log | タッチ入力1回分を無視、ゲーム継続 |
| convertToInputCommand() | throw | handleTouchInput()でcatch |
| destroy() | catch & log | メモリリークの可能性、ログに記録 |

#### 2.2.7 実装参照

詳細な実装は以下を参照:
- `docs/design/mobile-responsive-detailed-design.md` セクション5.1
- `docs/design/mobile-responsive-ddd-specification.md` セクション6.1

#### 2.2.8 完了条件

- ✅ 全てのメソッドが実装される
- ✅ 6つのボタンが正しく生成される
- ✅ タッチイベントがInputCommandに変換される
- ✅ 視覚フィードバック（activeクラス）が機能する
- ✅ メモリリーク対策（addEventListener記録）が実装される
- ✅ エラーハンドリングが実装される

---

### タスク 2.3: TouchControlRendererテスト

#### 2.3.1 ファイル情報

**作成ファイル**: `tests/presentation/renderers/TouchControlRenderer.test.ts`

#### 2.3.2 テストケース一覧

##### コンストラクタ

- ✅ 正常に初期化できる
- ✅ containerElementがnullの場合エラーをスロー

##### render()

- ✅ タッチコントロールUIを生成する
- ✅ 全てのボタンが生成される
- ✅ ボタンにdata-testid属性が設定される
- ✅ ボタンにdata-action属性が設定される
- ✅ 適切なクラス名が設定される

##### イベント処理

- ✅ タッチイベントでInputHandlerService.handleInputが呼ばれる
- ✅ マウスイベントでInputHandlerService.handleInputが呼ばれる
- ✅ 各ボタンが正しいInputCommandに変換される
- ✅ activeクラスがtouchstart時に追加される
- ✅ activeクラスがtouchend時に削除される

##### show() / hide()

- ✅ show()でdisplay: flexになる
- ✅ hide()でdisplay: noneになる

##### destroy()

- ✅ 全イベントリスナーが解除される
- ✅ DOM要素が削除される
- ✅ ボタンマップがクリアされる

##### convertToInputCommand()

- ✅ 'left' → InputCommand.MOVE_LEFT
- ✅ 'right' → InputCommand.MOVE_RIGHT
- ✅ 'down' → InputCommand.MOVE_DOWN
- ✅ 'rotate-cw' → InputCommand.ROTATE_CLOCKWISE
- ✅ 'rotate-ccw' → InputCommand.ROTATE_COUNTER_CLOCKWISE
- ✅ 'instant-drop' → InputCommand.INSTANT_DROP
- ✅ 未知のアクションでエラーをスロー

#### 2.3.3 テスト実装参照

詳細なテスト実装は以下を参照:
- `docs/design/mobile-responsive-detailed-design.md` セクション5.1.8

#### 2.3.4 完了条件

- ✅ 全てのテストケースが実装される
- ✅ 全てのテストがパスする
- ✅ カバレッジが90%以上

---

### タスク 2.4: タッチコントロールCSS作成

#### 2.4.1 ファイル情報

**変更ファイル**: `public/styles.css`（既存ファイルに追加）

#### 2.4.2 追加するCSS

以下のスタイルを追加:

##### タッチコントロールの基本スタイル

```css
/* ========================================
   タッチコントロール
   ======================================== */

.touch-controls {
  display: none; /* デフォルトは非表示 */
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: #34495e;
  border-radius: 8px;
  margin-top: 16px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
```

##### ボタンコンテナ

```css
.rotation-buttons,
.direction-buttons,
.drop-button {
  display: flex;
  justify-content: center;
  gap: 12px;
}
```

##### ボタンスタイル

```css
.touch-btn {
  min-width: 60px;
  min-height: 60px;
  padding: 12px;
  font-size: 24px;
  font-weight: bold;
  background-color: #2c3e50;
  color: #ecf0f1;
  border: 2px solid #3498db;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
  -webkit-tap-highlight-color: transparent;
}

.touch-btn:hover {
  background-color: #34495e;
  border-color: #5dade2;
}

.touch-btn.active {
  background-color: #3498db;
  border-color: #2980b9;
  transform: scale(0.95);
}
```

##### レスポンシブ対応

```css
@media (max-width: 767px) {
  .touch-controls {
    max-width: 100%;
  }

  .touch-btn {
    min-width: 70px;
    min-height: 70px;
    font-size: 28px;
  }
}

@media (max-width: 374px) {
  .touch-btn {
    min-width: 60px;
    min-height: 60px;
    font-size: 24px;
  }
}
```

##### アクセシビリティ対応

```css
@media (prefers-reduced-motion: reduce) {
  .touch-btn {
    transition: none;
  }

  .touch-btn.active {
    transform: none;
  }
}
```

#### 2.4.3 実装参照

完全なCSS定義は以下を参照:
- `docs/design/mobile-responsive-detailed-design.md` セクション9.1

#### 2.4.4 完了条件

- ✅ 全てのスタイルが追加される
- ✅ レスポンシブ対応が実装される
- ✅ アクセシビリティ対応が実装される
- ✅ ダークモード対応が実装される
- ✅ ブラウザでスタイルが正しく適用される

---

### タスク 2.5: CanvasRenderer変更

#### 2.5.1 ファイル情報

**変更ファイル**: `src/presentation/renderers/CanvasRenderer.ts`

#### 2.5.2 変更内容サマリー

- ブロックサイズを外部から受け取るように変更
- 動的なサイズ変更をサポート

#### 2.5.3 変更箇所

##### コンストラクタの変更

**変更前**:
```typescript
constructor(
  private canvas: HTMLCanvasElement,
  private blockSize: number = 30  // 固定デフォルト値
) {
  // ...
  this.canvas.width = blockSize * 8;
  this.canvas.height = blockSize * 20;
}
```

**変更後**:
```typescript
constructor(
  private canvas: HTMLCanvasElement,
  blockSize: number = 30  // パラメータで受け取る
) {
  // ...
  this.blockSize = blockSize;
  // サイズ設定は外部から行う（GameControllerから）
}
```

##### 新規メソッド追加

```typescript
/**
 * ブロックサイズを更新してCanvasをリサイズ
 *
 * @param newBlockSize - 新しいブロックサイズ
 */
updateBlockSize(newBlockSize: number): void {
  if (newBlockSize <= 0) {
    console.warn('Invalid block size, ignoring update');
    return;
  }

  this.blockSize = newBlockSize;
  this.resizeCanvas();
}

/**
 * Canvasのサイズを現在のblockSizeで再計算
 */
private resizeCanvas(): void {
  this.canvas.width = this.blockSize * 8;
  this.canvas.height = this.blockSize * 20;
}
```

##### getBlockSize()メソッド追加

```typescript
/**
 * 現在のブロックサイズを取得
 *
 * @returns 現在のブロックサイズ
 */
getBlockSize(): number {
  return this.blockSize;
}
```

#### 2.5.4 後方互換性

- 既存のコンストラクタ呼び出しは全て動作する（デフォルト値30px）
- 既存のrender()メソッドは変更なし
- 既存のテストは全てパスする

#### 2.5.5 実装参照

詳細な変更内容は以下を参照:
- `docs/design/mobile-responsive-detailed-design.md` セクション5.2

#### 2.5.6 完了条件

- ✅ updateBlockSize()メソッドが実装される
- ✅ getBlockSize()メソッドが実装される
- ✅ resizeCanvas()メソッドが実装される
- ✅ 既存の機能が全て動作する
- ✅ 既存のテストが全てパスする

---

### タスク 2.6: CanvasRendererテスト作成

#### 2.6.1 ファイル情報

**変更ファイル**: `tests/presentation/renderers/CanvasRenderer.test.ts`

#### 2.6.2 追加するテストケース

##### updateBlockSize()

- ✅ 正常な値でブロックサイズを更新できる
- ✅ Canvasサイズが正しく再計算される
- ✅ 負の値で警告が出る
- ✅ 0で警告が出る

##### getBlockSize()

- ✅ 現在のブロックサイズを取得できる
- ✅ updateBlockSize()後の値を取得できる

##### 統合テスト

- ✅ サイズ変更後も正常に描画できる
- ✅ 複数回のサイズ変更に対応できる

#### 2.6.3 完了条件

- ✅ 全ての新規テストケースが実装される
- ✅ 全てのテストがパスする
- ✅ 既存のテストが全てパスする

---

### タスク 2.7: HTML構造更新

#### 2.7.1 ファイル情報

**変更ファイル**: `index.html`（またはHTMLを生成する箇所）

#### 2.7.2 追加する要素

```html
<!-- タッチコントロール用コンテナ -->
<div id="touch-controls-container"></div>
```

#### 2.7.3 配置場所

Canvasの下に配置:

```html
<div class="game-container">
  <canvas id="game-canvas"></canvas>
  <div id="touch-controls-container"></div>
</div>
```

#### 2.7.4 完了条件

- ✅ touch-controls-containerが追加される
- ✅ 適切な位置に配置される
- ✅ TouchControlRendererから正しくアクセスできる

---

## 3. 実装順序

### 3.1 推奨実装順序

```
Day 1 (8時間):
  1. [0.5h] タスク 2.1: EventListenerRecord型定義
  2. [0.5h] タスク 2.7: HTML構造更新
  3. [4h]   タスク 2.2: TouchControlRenderer作成
  4. [2h]   タスク 2.4: タッチコントロールCSS作成
  5. [1h]   手動テスト・デバッグ

Day 2 (8時間):
  1. [4h]   タスク 2.3: TouchControlRendererテスト
  2. [2h]   タスク 2.5: CanvasRenderer変更
  3. [2h]   タスク 2.6: CanvasRendererテスト作成
```

### 3.2 依存関係

```
2.1 EventListenerRecord
  ↓
2.2 TouchControlRenderer ← 2.7 HTML構造
  ↓
2.3 TouchControlRendererテスト
  ↓
2.4 CSS（並行可能）
  ↓
2.5 CanvasRenderer変更
  ↓
2.6 CanvasRendererテスト
```

---

## 4. テスト戦略

### 4.1 ユニットテスト

- **対象**: TouchControlRenderer, CanvasRenderer
- **ツール**: Vitest + jsdom/happy-dom
- **カバレッジ目標**: 90%以上

### 4.2 手動テスト

Phase 2完了後、以下を手動でテスト:

1. ✅ タッチボタンが画面に表示される
2. ✅ 各ボタンをタップするとブロックが動く
3. ✅ 視覚フィードバック（activeクラス）が機能する
4. ✅ 連続タップ時にクールダウンが効く
5. ✅ モバイル端末実機でテスト（Chrome DevTools）

---

## 5. Phase 2完了後の状態

### 5.1 実装されるファイル

#### 新規作成

- `src/presentation/types/EventListenerRecord.ts`
- `src/presentation/renderers/TouchControlRenderer.ts`
- `tests/presentation/renderers/TouchControlRenderer.test.ts`

#### 変更

- `src/presentation/renderers/CanvasRenderer.ts`
- `tests/presentation/renderers/CanvasRenderer.test.ts`
- `public/styles.css`
- `index.html`

### 5.2 Phase 3への準備

Phase 2完了後、以下がPhase 3で統合される:

- ✅ TouchControlRendererが完成
- ✅ CanvasRendererが動的サイズに対応
- ✅ CSSが完成
- ✅ 全てのテストがパス

Phase 3では:
- InputHandlerServiceの拡張（クールダウン統合）
- GameControllerへの統合（リサイズ処理、TouchControlRenderer統合）
- 統合テストの実装

---

## 6. リスクと対策

| リスク | 影響 | 対策 |
|-------|------|------|
| TouchControlRendererの実装が複雑 | スケジュール遅延 | 詳細設計書の実装例を忠実に実装する |
| メモリリークの発生 | パフォーマンス低下 | EventListenerRecord機構で確実に解放 |
| タッチイベントがうまく動かない | 機能不全 | マウスイベントも同時にサポート |
| CSSが適用されない | UI崩れ | ブラウザDevToolsで確認しながら実装 |
| テスト環境でタッチイベントをシミュレートできない | テスト困難 | TouchEventのモックを作成 |

---

## 7. 成功基準

### 7.1 機能要件

- ✅ タッチボタンが正しく表示される
- ✅ タッチ操作でゲームを操作できる
- ✅ 視覚フィードバックが機能する
- ✅ メモリリークが発生しない

### 7.2 品質要件

- ✅ ユニットテストカバレッジ90%以上
- ✅ 全てのテストがパスする
- ✅ エラーハンドリングが適切に実装される
- ✅ コードレビューをパスする

### 7.3 非機能要件

- ✅ タッチ応答時間が50ms以内
- ✅ レスポンシブデザインが機能する
- ✅ アクセシビリティに配慮している

---

## 8. 参照ドキュメント

- **DDD仕様書**: `docs/design/mobile-responsive-ddd-specification.md`
- **詳細設計書**: `docs/design/mobile-responsive-detailed-design.md`
- **Phase 1実装レポート**: git commit d97f2c7

---

**Phase 2実装計画書 完成なのだ！** ✨

この計画に従って実装すれば、タッチUI機能が確実に完成するのだ。
