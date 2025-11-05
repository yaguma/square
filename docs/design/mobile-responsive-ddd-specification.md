# Square モバイル対応 - ドメイン駆動設計 仕様書

**作成日**: 2025-11-05
**更新日**: 2025-11-05
**バージョン**: 1.1
**対象**: モバイルレスポンシブUI機能追加
**基盤**: Clean Architecture + DDD

---

## 1. コンテキストと概要

### 1.1 目的

Squareゲームにモバイル端末対応（レスポンシブUI + タッチ操作）を追加する。既存のDDDアーキテクチャを維持し、Domain層のビジネスロジックに影響を与えずに、Presentation層とApplication層を拡張する。

### 1.2 設計原則

1. **ドメインの純粋性を維持**: Domain層は一切変更しない
2. **関心の分離**: UI表示ロジックと入力処理を明確に分離
3. **単一責任の原則**: 各コンポーネントは明確な責務を持つ
4. **開放閉鎖の原則**: 既存コードを変更せず、拡張により機能追加
5. **依存性逆転の原則**: 具象への依存ではなく抽象への依存

### 1.3 境界づけられたコンテキスト

モバイル対応機能は、既存の「ゲームコア」コンテキストに影響を与えず、新たに「**ユーザーインタラクション**」コンテキストを拡張する。

```
┌─────────────────────────────────────────┐
│  ゲームコアコンテキスト                   │
│  (既存: 変更なし)                         │
│  - Game                                  │
│  - Field                                 │
│  - FallingBlock                          │
│  - ドメインサービス                       │
└─────────────────────────────────────────┘
              ↑
              │ 使用
              │
┌─────────────────────────────────────────┐
│  ユーザーインタラクションコンテキスト      │
│  (拡張)                                  │
│  - InputHandlerService (拡張)           │
│  - LayoutCalculationService (新規)      │
│  - CooldownManager (新規)               │
│  - KeyboardInputAdapter (既存)          │
│  - TouchInputAdapter (新規)             │
└─────────────────────────────────────────┘
              ↑
              │ 使用
              │
┌─────────────────────────────────────────┐
│  ビューコンテキスト                       │
│  (拡張)                                  │
│  - CanvasRenderer (変更)                │
│  - TouchControlRenderer (新規)          │
└─────────────────────────────────────────┘
```

---

## 2. ユビキタス言語の拡張

既存のユビキタス言語に、モバイル対応関連の用語を追加します。

| 用語 | 説明 |
|------|------|
| **ビューポート** | ブラウザの表示領域のサイズ |
| **ブレークポイント** | レイアウトが切り替わる画面幅の閾値（768px） |
| **タッチコマンド** | タッチ操作から生成される操作指示 |
| **動的スケーリング** | 画面サイズに応じてCanvasとブロックサイズを調整する処理 |
| **タッチフィードバック** | ボタンタップ時の視覚的な応答 |
| **レスポンシブレイアウト** | 画面サイズに応じて最適化されたUI配置 |
| **デバイスタイプ** | デスクトップまたはモバイルの識別 |
| **ブロックサイズ** | 1ブロック分のピクセル数（動的に計算） |

---

## 3. レイヤー別の影響分析

### 3.1 Domain層（変更なし）

**影響**: なし

**理由**:
- ゲームのビジネスロジック（ブロックの移動、消去判定、スコア計算等）は入力デバイスに依存しない
- Domain層はUI表示方法や入力方法を知る必要がない
- 既存のテストが全てパスし続ける

**不変条件の維持**:
- すべてのドメイン不変条件は引き続き保証される
- エンティティ、値オブジェクト、ドメインサービスは無変更

### 3.2 Application層（拡張）

**影響**: あり（拡張）

**変更対象**:
- `InputHandlerService`: タッチ入力の受付を追加、クールダウン管理を統合

**新規追加**:
- `LayoutCalculationService`: レイアウト計算のビジネスルール（Presentation層から移動）
- `CooldownManager`: 入力のクールダウン制御（Presentation層から移動）

**追加インターフェース**:
```typescript
interface IInputAdapter {
  handleInput(command: InputCommand): void;
}
```

**設計方針**:
- キーボード入力とタッチ入力を統一的に扱う
- 入力源（キーボード/タッチ）の違いをアダプターパターンで吸収
- レイアウト計算ルールはビジネスロジックとしてApplication層で管理
- クールダウン制御は入力処理の一部としてApplication層で管理
- 既存のキーボード処理は影響を受けない

### 3.3 Presentation層（変更・追加）

**影響**: あり（主な変更箇所）

**新規追加**:
- `TouchControlRenderer`: タッチUIの描画とイベントハンドリング

**変更対象**:
- `CanvasRenderer`: 動的ブロックサイズ対応
- `GameController`: TouchControlRendererの統合、リサイズ処理

**設計方針**:
- UIコンポーネントは描画とイベント処理のみに専念
- ビジネスロジック（レイアウト計算、クールダウン制御）はApplication層に委譲
- 既存のCanvasRendererの責務は変更しない（サイズ受け取りのみ追加）

### 3.4 Infrastructure層（変更なし）

**影響**: なし

**理由**:
- リポジトリ、タイマー、乱数生成器は入力方法に依存しない

---

## 4. 新規追加の値オブジェクト

### 4.1 ViewportSize（ビューポートサイズ）

**責務**: ブラウザの表示領域サイズを表現する

**属性**:
- `width: number` - ビューポート幅（ピクセル）
- `height: number` - ビューポート高さ（ピクセル）

**振る舞い**:
- `isMobile(): boolean` - モバイルサイズか判定（width < 768px）
- `isDesktop(): boolean` - デスクトップサイズか判定（width >= 768px）
- `equals(other: ViewportSize): boolean` - サイズが等しいか

**制約**:
- width, heightは0以上の整数

### 4.2 BlockSize（ブロックサイズ）

**責務**: 1ブロック分のピクセル数を表現する

**属性**:
- `size: number` - ブロック1マスのピクセル数

**振る舞い**:
- `toCanvasSize(fieldWidth: number, fieldHeight: number): CanvasSize` - Canvas全体のサイズを計算
- `isValid(): boolean` - 有効な範囲内か（15px〜40px）
- `equals(other: BlockSize): boolean` - サイズが等しいか

**制約**:
- デスクトップ: 20px〜40px
- モバイル: 15px〜30px

### 4.3 CanvasSize（Canvasサイズ）

**責務**: Canvasの幅と高さを表現する

**属性**:
- `width: number` - Canvas幅（ピクセル）
- `height: number` - Canvas高さ（ピクセル）

**振る舞い**:
- `equals(other: CanvasSize): boolean` - サイズが等しいか

**制約**:
- 最小: 200x500px
- 最大: 400x1000px

### 4.4 InputCommand（入力コマンド）

**責務**: ユーザー入力を抽象化した操作指示を表現する

**説明**:
`InputCommand`は、入力デバイス（キーボード、タッチ、将来的にはゲームパッド等）に依存しない統一的なコマンドインターフェースです。

**列挙型 InputCommand**:
```typescript
enum InputCommand {
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  MOVE_DOWN = 'MOVE_DOWN',
  ROTATE_CLOCKWISE = 'ROTATE_CW',
  ROTATE_COUNTER_CLOCKWISE = 'ROTATE_CCW',
  INSTANT_DROP = 'INSTANT_DROP',
  PAUSE = 'PAUSE',
  RESET = 'RESET'
}
```

**TouchCommandからの変換**:
タッチイベントは`TouchControlRenderer`で受け取り、`InputCommand`に変換して`InputHandlerService`に送信します。

```typescript
// TouchControlRendererでの変換例
private convertToInputCommand(touchAction: string): InputCommand {
  switch (touchAction) {
    case 'left': return InputCommand.MOVE_LEFT;
    case 'right': return InputCommand.MOVE_RIGHT;
    case 'down': return InputCommand.MOVE_DOWN;
    case 'rotate-cw': return InputCommand.ROTATE_CLOCKWISE;
    case 'rotate-ccw': return InputCommand.ROTATE_COUNTER_CLOCKWISE;
    case 'instant-drop': return InputCommand.INSTANT_DROP;
    default: throw new Error(`Unknown touch action: ${touchAction}`);
  }
}
```

---

## 5. 新規追加のApplication層サービス

### 5.1 LayoutCalculationService（レイアウト計算サービス）

**配置**: Application層

**責務**: 画面サイズに応じた最適なレイアウト計算のビジネスルールを提供する

**配置理由**:
- ブロックサイズの計算ルール（15-30px、20-40px）はビジネスルール
- UIから独立してテスト可能
- ブレークポイントやサイズ制約はドメイン知識

**メソッド**:

#### `calculateBlockSize(viewport: ViewportSize): BlockSize`
ビューポートサイズからブロックサイズを計算する。

**アルゴリズム**:
```typescript
calculateBlockSize(viewport: ViewportSize): BlockSize {
  const isMobile = viewport.isMobile();
  const maxCanvasWidth = isMobile
    ? viewport.width * 0.9  // モバイルは画面幅の90%を使用
    : Math.min(400, viewport.width * 0.4);  // デスクトップは最大400pxまで

  const rawBlockSize = Math.floor(maxCanvasWidth / FIELD_WIDTH);

  const minSize = isMobile ? 15 : 20;
  const maxSize = isMobile ? 30 : 40;

  const constrainedSize = Math.max(minSize, Math.min(maxSize, rawBlockSize));

  return new BlockSize(constrainedSize);
}
```

#### `calculateCanvasSize(blockSize: BlockSize): CanvasSize`
ブロックサイズからCanvas全体のサイズを計算する。

**アルゴリズム**:
```typescript
calculateCanvasSize(blockSize: BlockSize): CanvasSize {
  const width = blockSize.size * FIELD_WIDTH;
  const height = blockSize.size * FIELD_HEIGHT;

  return new CanvasSize(width, height);
}
```

#### `shouldShowTouchControls(viewport: ViewportSize): boolean`
タッチコントロールを表示すべきか判定する。

**ルール**:
- モバイル（width < 768px）: true
- デスクトップ（width >= 768px）: false

```typescript
shouldShowTouchControls(viewport: ViewportSize): boolean {
  return viewport.isMobile();
}
```

---

### 5.2 CooldownManager（クールダウン管理サービス）

**配置**: Application層

**責務**: 入力のクールダウン制御（連続入力防止）のビジネスルールを提供する

**配置理由**:
- クールダウン時間はゲームバランスのビジネスルール
- 入力処理の一部としてInputHandlerServiceと密接に連携
- Presentation層がビジネスルールを持たない設計

**属性**:
- `cooldowns: Map<InputCommand, number>` - 各コマンドの最終実行時刻
- `cooldownDurations: Map<InputCommand, number>` - 各コマンドのクールダウン時間

**クールダウン設定**:
```typescript
const COOLDOWN_DURATIONS = {
  [InputCommand.MOVE_LEFT]: 133,   // 4フレーム（既存仕様に合わせる）
  [InputCommand.MOVE_RIGHT]: 133,  // 4フレーム
  [InputCommand.ROTATE_CLOCKWISE]: 200,
  [InputCommand.ROTATE_COUNTER_CLOCKWISE]: 200,
  [InputCommand.INSTANT_DROP]: 0,  // クールダウンなし
  [InputCommand.MOVE_DOWN]: 0,     // 押し続け対応
};
```

**メソッド**:

#### `canExecute(command: InputCommand, currentTime: number): boolean`
指定コマンドを実行可能か判定する。

**判定ロジック**:
```typescript
canExecute(command: InputCommand, currentTime: number): boolean {
  const lastExecutionTime = this.cooldowns.get(command) ?? 0;
  const cooldownDuration = this.cooldownDurations.get(command) ?? 0;

  return currentTime - lastExecutionTime >= cooldownDuration;
}
```

#### `markExecuted(command: InputCommand, currentTime: number): void`
コマンドの実行を記録する。

```typescript
markExecuted(command: InputCommand, currentTime: number): void {
  this.cooldowns.set(command, currentTime);
}
```

#### `reset(): void`
すべてのクールダウンをリセットする。

```typescript
reset(): void {
  this.cooldowns.clear();
}
```

---

## 6. 新規追加のプレゼンテーション層コンポーネント

### 6.1 TouchControlRenderer

**責務**: タッチ操作用UIコントロールの描画とイベントハンドリング

**属性**:
- `container: HTMLElement` - コントロールのコンテナ要素
- `buttons: Map<string, HTMLButtonElement>` - ボタン要素のマップ（キー: data-action値）
- `inputHandlerService: InputHandlerService` - 入力処理サービス（Application層）
- `eventListeners: EventListenerRecord[]` - イベントリスナー管理（メモリリーク対策）

**メソッド**:

#### `render(): void`
タッチコントロールUIを生成してDOMに追加する。

**UI構成**:
```html
<div class="touch-controls">
  <div class="rotation-buttons">
    <button data-action="rotate-ccw">↺</button>
    <button data-action="rotate-cw">↻</button>
  </div>
  <div class="direction-buttons">
    <button data-action="left">←</button>
    <button data-action="down">↓</button>
    <button data-action="right">→</button>
  </div>
  <div class="drop-button">
    <button data-action="instant-drop">▼ 即落下</button>
  </div>
</div>
```

#### `setupEventListeners(): void`
各ボタンにタッチイベントリスナーを設定する（メモリリーク対策付き）。

**イベント処理**:
```typescript
setupEventListeners(): void {
  this.buttons.forEach((button, action) => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // スクロール防止
      try {
        button.classList.add('active'); // 視覚フィードバック
        this.handleTouchInput(action);
      } catch (error) {
        console.error(`Touch start error for ${action}:`, error);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      button.classList.remove('active'); // 視覚フィードバック解除
    };

    const handleTouchCancel = (e: TouchEvent) => {
      button.classList.remove('active'); // キャンセル時も解除
    };

    // メモリリーク対策: リスナーを記録
    this.addEventListener(button, 'touchstart', handleTouchStart);
    this.addEventListener(button, 'touchend', handleTouchEnd);
    this.addEventListener(button, 'touchcancel', handleTouchCancel);
  });
}
```

#### `handleTouchInput(action: string): void`
タッチ操作をInputCommandに変換してInputHandlerServiceに送信する。

```typescript
private handleTouchInput(action: string): void {
  try {
    const command = this.convertToInputCommand(action);
    this.inputHandlerService.handleInput(command);
  } catch (error) {
    console.error(`Failed to handle touch input for ${action}:`, error);
    // エラーでもゲームを継続（入力だけ無視）
  }
}
```

**注**: クールダウン制御はInputHandlerService（Application層）が担当します。

#### `addEventListener(element: HTMLElement, event: string, handler: EventListener): void`
イベントリスナーを登録し、メモリリーク対策のために記録する。

```typescript
private addEventListener(
  element: HTMLElement,
  event: string,
  handler: EventListener
): void {
  element.addEventListener(event, handler);
  this.eventListeners.push({ element, event, handler });
}
```

#### `show(): void`
タッチコントロールを表示する。

```typescript
show(): void {
  this.container.style.display = 'flex';
}
```

#### `hide(): void`
タッチコントロールを非表示にする。

```typescript
hide(): void {
  this.container.style.display = 'none';
}
```

#### `destroy(): void`
イベントリスナーを全て解除し、DOM要素を削除する（メモリリーク対策）。

```typescript
destroy(): void {
  // 全イベントリスナーを自動解放
  this.eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  this.eventListeners = [];

  // DOM要素を削除
  this.container.remove();
}
```

---

## 7. 変更対象コンポーネント

### 7.1 CanvasRenderer（変更）

**変更内容**: ブロックサイズを外部から受け取るように変更

**変更前**:
```typescript
class CanvasRenderer {
  private readonly BLOCK_SIZE = 30; // 固定値
}
```

**変更後**:
```typescript
class CanvasRenderer {
  constructor(
    private canvas: HTMLCanvasElement,
    private blockSize: number // 動的に受け取る
  ) {}

  updateBlockSize(newBlockSize: number): void {
    this.blockSize = newBlockSize;
    this.resizeCanvas();
  }
}
```

**影響**:
- 既存の描画ロジックは変更なし
- ブロックサイズが動的になるのみ

---

### 7.2 InputHandlerService（変更）

**変更内容**: タッチ入力の受付とクールダウン管理を追加

**追加属性**:
- `cooldownManager: CooldownManager` - クールダウン管理サービス

**変更メソッド**:

#### `handleInput(command: InputCommand): void`
統一的な入力処理メソッド（キーボードとタッチ共通）。

**処理フロー**:
```typescript
handleInput(command: InputCommand): void {
  try {
    // 1. クールダウンチェック
    const currentTime = Date.now();
    if (!this.cooldownManager.canExecute(command, currentTime)) {
      return; // クールダウン中は無視
    }

    // 2. ゲーム操作を実行
    this.executeCommand(command);

    // 3. クールダウンを記録
    this.cooldownManager.markExecuted(command, currentTime);

  } catch (error) {
    console.error(`Failed to handle input command ${command}:`, error);
    // エラーでもゲームを継続
  }
}
```

#### `executeCommand(command: InputCommand): void`
InputCommandに応じたゲーム操作を実行する。

**処理例**:
```typescript
private executeCommand(command: InputCommand): void {
  switch (command) {
    case InputCommand.MOVE_LEFT:
      this.gameApplicationService.moveBlockLeft(this.gameId);
      break;
    case InputCommand.MOVE_RIGHT:
      this.gameApplicationService.moveBlockRight(this.gameId);
      break;
    case InputCommand.ROTATE_CLOCKWISE:
      this.gameApplicationService.rotateBlockClockwise(this.gameId);
      break;
    case InputCommand.INSTANT_DROP:
      this.gameApplicationService.dropInstantly(this.gameId);
      break;
    // ... 他のコマンド
    default:
      console.warn(`Unknown input command: ${command}`);
  }
}
```

**既存処理への影響**:
- 既存の`handleKeyDown`、`handleKeyUp`は、内部で`handleInput()`を呼び出すように変更
- キーボード入力もクールダウン制御の対象になる（統一的な動作）
- タッチ入力とキーボード入力で同じクールダウンを共有

---

### 7.3 GameController（変更）

**変更内容**:
1. TouchControlRendererの統合
2. リサイズイベントハンドリング
3. LayoutCalculationServiceとの連携

**追加属性**:
- `touchControlRenderer: TouchControlRenderer | null`
- `layoutCalculationService: LayoutCalculationService`（Application層）
- `currentViewportSize: ViewportSize`

**追加メソッド**:

#### `setupResponsiveLayout(): void`
レスポンシブレイアウトの初期設定を行う。

**処理内容**:
```typescript
setupResponsiveLayout(): void {
  try {
    // 1. 初期ビューポートサイズを取得
    const viewport = new ViewportSize(window.innerWidth, window.innerHeight);
    this.currentViewportSize = viewport;

    // 2. レイアウト計算（Application層のサービスを使用）
    const blockSize = this.layoutCalculationService.calculateBlockSize(viewport);
    const canvasSize = this.layoutCalculationService.calculateCanvasSize(blockSize);

    // 3. CanvasRendererを初期化
    this.canvasRenderer.updateBlockSize(blockSize.size);
    this.canvas.width = canvasSize.width;
    this.canvas.height = canvasSize.height;

    // 4. タッチコントロール表示判定
    const shouldShowTouch = this.layoutCalculationService.shouldShowTouchControls(viewport);
    if (shouldShowTouch && this.touchControlRenderer) {
      this.touchControlRenderer.show();
    } else if (this.touchControlRenderer) {
      this.touchControlRenderer.hide();
    }

  } catch (error) {
    console.error('Failed to setup responsive layout:', error);
    // フォールバック: デフォルトサイズを使用
    this.useDefaultLayout();
  }
}
```

#### `handleResize(): void`
ウィンドウリサイズ時の処理（エラーハンドリング付き）。

**処理内容**:
```typescript
handleResize(): void {
  try {
    // 1. 新しいビューポートサイズを取得
    const newViewport = new ViewportSize(window.innerWidth, window.innerHeight);

    // 2. サイズが変わらなければスキップ
    if (this.currentViewportSize.equals(newViewport)) {
      return;
    }

    this.currentViewportSize = newViewport;

    // 3. 再計算と更新
    const blockSize = this.layoutCalculationService.calculateBlockSize(newViewport);
    const canvasSize = this.layoutCalculationService.calculateCanvasSize(blockSize);

    this.canvasRenderer.updateBlockSize(blockSize.size);
    this.canvas.width = canvasSize.width;
    this.canvas.height = canvasSize.height;

    // 4. タッチコントロールの表示切り替え
    const shouldShowTouch = this.layoutCalculationService.shouldShowTouchControls(newViewport);
    if (this.touchControlRenderer) {
      shouldShowTouch ? this.touchControlRenderer.show() : this.touchControlRenderer.hide();
    }

    // 5. 再描画
    this.canvasRenderer.render();

  } catch (error) {
    console.error('Failed to handle resize:', error);
    // エラーでもゲームは継続
  }
}
```

**デバウンス処理**:
```typescript
let resizeTimeout: number | null = null;
window.addEventListener('resize', () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    this.handleResize();
  }, 250); // 250msデバウンス
});
```

#### `initializeTouchControls(): void`
タッチコントロールを初期化する。

**処理内容**:
```typescript
initializeTouchControls(): void {
  try {
    // 1. TouchControlRendererインスタンスを作成
    this.touchControlRenderer = new TouchControlRenderer(
      document.getElementById('touch-controls-container'),
      this.inputHandlerService
    );

    // 2. UIを描画
    this.touchControlRenderer.render();

    // 3. 初期表示/非表示を設定
    const shouldShow = this.layoutCalculationService.shouldShowTouchControls(
      this.currentViewportSize
    );
    shouldShow ? this.touchControlRenderer.show() : this.touchControlRenderer.hide();

  } catch (error) {
    console.error('Failed to initialize touch controls:', error);
    // タッチコントロールが失敗してもゲームは継続
    this.touchControlRenderer = null;
  }
}
```

---

## 8. ユースケースの追加

### 8.1 タッチ入力処理ユースケース

**アクター**: モバイルユーザー

**事前条件**:
- ゲームがプレイ中である
- タッチコントロールが表示されている

**正常フロー**:
1. ユーザーがタッチボタンをタップする
2. `TouchControlRenderer`が`touchstart`イベントを受信
3. 視覚フィードバックを表示（ボタンの色変化）
4. `TouchCommand`を生成
5. `CooldownManager`でクールダウンをチェック
6. クールダウンOKなら`InputHandlerService`に委譲
7. `InputCommand`に変換
8. `GameApplicationService`でゲーム操作を実行
9. ゲーム状態が更新される
10. `CanvasRenderer`が描画を更新
11. ユーザーが指を離す
12. `TouchControlRenderer`が`touchend`イベントを受信
13. 視覚フィードバックを解除

**代替フロー**:
- 3a. クールダウン中の場合
  - 3a1. 操作を無視
  - 3a2. 視覚フィードバックのみ表示

**事後条件**:
- ゲーム状態が適切に更新されている
- 視覚フィードバックが解除されている

---

### 8.2 画面リサイズ処理ユースケース

**アクター**: ユーザー（画面サイズ変更）

**事前条件**:
- ゲームが実行中である

**正常フロー**:
1. ユーザーがブラウザウィンドウをリサイズする
2. `GameController`が`resize`イベントを受信
3. デバウンス処理により、250ms待機
4. 新しい`ViewportSize`を取得
5. `LayoutCalculationService`（Application層）で新しい`BlockSize`を計算
6. 新しい`CanvasSize`を計算
7. `CanvasRenderer`に新しいサイズを適用
8. ブレークポイント判定（768px）
9. タッチコントロールの表示/非表示を切り替え
10. Canvasを再描画
11. ゲーム状態は維持される

**代替フロー**:
- 5a. サイズが変わらない場合
  - 5a1. 処理を中断
  - 5a2. 再描画をスキップ

**事後条件**:
- Canvas表示が新しいサイズに適応している
- タッチコントロールの表示が適切
- ゲーム状態は変更されていない

---

## 9. クラス図（更新版）

### 9.1 Presentation層

```
┌────────────────────────────────────────────────┐
│            GameController                      │
│            (Presentation Layer)                │
├────────────────────────────────────────────────┤
│ - gameApplicationService                       │
│ - inputHandlerService                          │
│ - layoutCalculationService                     │
│ - canvasRenderer                               │
│ - touchControlRenderer                         │
│ - currentViewportSize                          │
├────────────────────────────────────────────────┤
│ + initialize()                                 │
│ + setupResponsiveLayout()                      │
│ + handleResize()                               │
│ + initializeTouchControls()                    │
└────────────────────────────────────────────────┘
                    │
                    │ 使用
                    ↓
┌────────────────────────────────────────────────┐
│        TouchControlRenderer                    │
│        (Presentation Layer)                    │
├────────────────────────────────────────────────┤
│ - container: HTMLElement                       │
│ - buttons: Map<string, HTMLButtonElement>     │
│ - inputHandlerService: InputHandlerService    │
│ - eventListeners: EventListenerRecord[]       │
├────────────────────────────────────────────────┤
│ + render()                                     │
│ + setupEventListeners()                        │
│ + handleTouchInput(action)                     │
│ + addEventListener(element, event, handler)    │
│ + show()                                       │
│ + hide()                                       │
│ + destroy()                                    │
└────────────────────────────────────────────────┘
```

### 9.2 Application層

```
┌────────────────────────────────────────────────┐
│       LayoutCalculationService                 │
│       (Application Layer)                      │
├────────────────────────────────────────────────┤
│ + calculateBlockSize(viewport): BlockSize     │
│ + calculateCanvasSize(blockSize): CanvasSize  │
│ + shouldShowTouchControls(viewport): boolean  │
└────────────────────────────────────────────────┘
                    │
                    │ 生成
                    ↓
┌──────────────────┐   ┌──────────────────┐
│  ViewportSize    │   │   BlockSize      │
├──────────────────┤   ├──────────────────┤
│ - width          │   │ - size           │
│ - height         │   ├──────────────────┤
├──────────────────┤   │ + toCanvasSize() │
│ + isMobile()     │   │ + isValid()      │
│ + isDesktop()    │   └──────────────────┘
└──────────────────┘

┌────────────────────────────────────────────────┐
│         InputHandlerService                    │
│         (Application Layer)                    │
├────────────────────────────────────────────────┤
│ - gameApplicationService                       │
│ - cooldownManager: CooldownManager            │
├────────────────────────────────────────────────┤
│ + handleInput(command: InputCommand)          │
│ + executeCommand(command: InputCommand)       │
│ + handleKeyDown(key)        (既存)            │
│ + handleKeyUp(key)          (既存)            │
└────────────────────────────────────────────────┘
                    │
                    │ 使用
                    ↓
┌────────────────────────────────────────────────┐
│         CooldownManager                        │
│         (Application Layer)                    │
├────────────────────────────────────────────────┤
│ - cooldowns: Map<InputCommand, number>        │
│ - cooldownDurations: Map<InputCommand, number>│
├────────────────────────────────────────────────┤
│ + canExecute(command, time): boolean          │
│ + markExecuted(command, time)                 │
│ + reset()                                     │
└────────────────────────────────────────────────┘
```

---

## 10. シーケンス図（更新版）

### 10.1 タッチ入力処理シーケンス

```
User          TouchControl    Input        Cooldown     Game          Canvas
              Renderer        Handler      Manager      Application   Renderer
 |                |               |            |            |             |
 |-- tap -->      |               |            |            |             |
 |                |               |            |            |             |
 |                |-- add 'active' class      |            |             |
 |                |               |            |            |             |
 |                |-- handleInput(command) -->|            |             |
 |                |               |            |            |             |
 |                |               |-- canExecute(command, time) -->      |
 |                |               |            |            |             |
 |                |               |<-- true ---|            |             |
 |                |               |            |            |             |
 |                |               |-- executeCommand() ---->|             |
 |                |               |            |            |             |
 |                |               |            |-- moveBlockLeft() -->   |
 |                |               |            |            |             |
 |                |               |            |<---------- GameDto -----|
 |                |               |            |            |             |
 |                |               |-- markExecuted(command, time) -->    |
 |                |               |            |            |             |
 |                |               |            |            |-- render() -->
 |                |               |            |            |             |
 |<-- visual feedback ---------------------------------------------------|
 |                |               |            |            |             |
 |-- release -->  |               |            |            |             |
 |                |               |            |            |             |
 |                |-- remove 'active' class   |            |             |
```

**変更点**:
- CooldownManagerがApplication層（InputHandlerService内）に移動
- クールダウンチェックはInputHandlerServiceが責任を持つ

---

### 10.2 画面リサイズ処理シーケンス

```
Browser      GameController    Layout         Canvas        Touch
Window                       Calculation     Renderer      Control
                             Service (App)
 |                |                |              |             |
 |-- resize -->   |                |              |             |
 |                |                |              |             |
 |                |-- debounce(250ms)            |             |
 |                |                |              |             |
 |                |-- getViewportSize()          |             |
 |                |                |              |             |
 |                |-- calculateBlockSize() -->   |             |
 |                |                |              |             |
 |                |<-- BlockSize ---------------|  |             |
 |                |                |              |             |
 |                |-- calculateCanvasSize() -->  |             |
 |                |                |              |             |
 |                |<-- CanvasSize --------------|  |             |
 |                |                |              |             |
 |                |-- updateBlockSize() -------->|             |
 |                |                |              |             |
 |                |-- resizeCanvas() ----------->|             |
 |                |                |              |             |
 |                |-- shouldShowTouchControls() -->            |
 |                |                |              |             |
 |                |<-- boolean ------------------|  |             |
 |                |                |              |             |
 |                |-- show/hide() ---------------------------->|
 |                |                |              |             |
 |                |-- render() ------------------>|             |
```

**変更点**:
- ResponsiveLayoutService → LayoutCalculationService（Application層）

---

## 11. レイヤーアーキテクチャ（更新版）

```
┌─────────────────────────────────────────────────┐
│   Presentation Layer                            │
│   ┌───────────────────────────────────────┐     │
│   │ GameController (変更)                 │     │
│   │ CanvasRenderer (変更)                 │     │
│   │ TouchControlRenderer (新規)           │     │
│   └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│   Application Layer                             │
│   ┌───────────────────────────────────────┐     │
│   │ GameApplicationService (既存)         │     │
│   │ InputHandlerService (拡張)            │     │
│   │ LayoutCalculationService (新規)       │     │
│   │ CooldownManager (新規)                │     │
│   └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│   Domain Layer (変更なし)                        │
│   ┌───────────────────────────────────────┐     │
│   │ Game, Field, FallingBlock            │     │
│   │ Position, Color, Block, Score        │     │
│   │ BlockMatchingService                 │     │
│   │ BlockFallService                     │     │
│   │ CollisionDetectionService            │     │
│   └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│   Infrastructure Layer (変更なし)                │
│   ┌───────────────────────────────────────┐     │
│   │ InMemoryGameRepository               │     │
│   │ RequestAnimationFrameTimer           │     │
│   │ RandomGenerator                      │     │
│   └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

**重要な変更**:
- `LayoutCalculationService`: Presentation層 → Application層に移動
- `CooldownManager`: Presentation層（TouchControlRenderer内） → Application層に移動
- これにより、Presentation層はUI表示のみに専念し、ビジネスルールはApplication層が管理

---

## 12. ドメインイベント（変更なし）

モバイル対応に関連する新しいドメインイベントは追加しません。入力方法の違いはドメインレベルの関心事ではないためです。

既存のドメインイベント（`BlockLandedEvent`、`BlocksRemovedEvent`、`GameOverEvent`、`GameStartedEvent`）は引き続き使用されます。

---

## 13. テスト戦略（更新版）

### 13.1 ユニットテスト

#### Domain層
- **変更なし**: 既存テストが全てパスすること

**テストケース例**:
```typescript
describe('Game (既存)', () => {
  it('should move block left correctly', () => { /* 既存テスト */ });
  it('should detect block matching', () => { /* 既存テスト */ });
});
```

---

#### Application層

##### LayoutCalculationService
**テストケース例**:
```typescript
describe('LayoutCalculationService', () => {
  it('モバイル幅（320px）でBlockSize 15pxを返す', () => {
    const viewport = new ViewportSize(320, 568);
    const blockSize = service.calculateBlockSize(viewport);
    expect(blockSize.size).toBe(15); // 最小サイズ
  });

  it('モバイル幅（375px）で適切なBlockSizeを計算', () => {
    const viewport = new ViewportSize(375, 667);
    const blockSize = service.calculateBlockSize(viewport);
    expect(blockSize.size).toBeGreaterThanOrEqual(15);
    expect(blockSize.size).toBeLessThanOrEqual(30);
  });

  it('デスクトップ幅（1024px）でBlockSize 30pxを返す', () => {
    const viewport = new ViewportSize(1024, 768);
    const blockSize = service.calculateBlockSize(viewport);
    expect(blockSize.size).toBe(30);
  });

  it('ブレークポイント（767px）でモバイル判定', () => {
    const viewport = new ViewportSize(767, 600);
    expect(viewport.isMobile()).toBe(true);
  });

  it('ブレークポイント（768px）でデスクトップ判定', () => {
    const viewport = new ViewportSize(768, 600);
    expect(viewport.isDesktop()).toBe(true);
  });
});
```

##### CooldownManager
**テストケース例**:
```typescript
describe('CooldownManager', () => {
  it('133ms以内の連続MOVE_LEFTを防ぐ', () => {
    const manager = new CooldownManager();
    const now = Date.now();

    expect(manager.canExecute(InputCommand.MOVE_LEFT, now)).toBe(true);
    manager.markExecuted(InputCommand.MOVE_LEFT, now);

    expect(manager.canExecute(InputCommand.MOVE_LEFT, now + 100)).toBe(false);
    expect(manager.canExecute(InputCommand.MOVE_LEFT, now + 133)).toBe(true);
  });

  it('異なるコマンドは独立して実行可能', () => {
    const manager = new CooldownManager();
    const now = Date.now();

    manager.markExecuted(InputCommand.MOVE_LEFT, now);

    expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, now)).toBe(true);
    expect(manager.canExecute(InputCommand.INSTANT_DROP, now)).toBe(true);
  });

  it('INSTANT_DROPはクールダウンなし', () => {
    const manager = new CooldownManager();
    const now = Date.now();

    manager.markExecuted(InputCommand.INSTANT_DROP, now);
    expect(manager.canExecute(InputCommand.INSTANT_DROP, now)).toBe(true);
  });
});
```

##### InputHandlerService
**テストケース例**:
```typescript
describe('InputHandlerService', () => {
  it('InputCommandを正しく実行する', () => {
    const mockGame = createMockGameService();
    const service = new InputHandlerService(mockGame, new CooldownManager());

    service.handleInput(InputCommand.MOVE_LEFT);

    expect(mockGame.moveBlockLeft).toHaveBeenCalled();
  });

  it('クールダウン中のコマンドを無視する', () => {
    const mockGame = createMockGameService();
    const service = new InputHandlerService(mockGame, new CooldownManager());

    service.handleInput(InputCommand.MOVE_LEFT);
    service.handleInput(InputCommand.MOVE_LEFT); // すぐに再実行

    expect(mockGame.moveBlockLeft).toHaveBeenCalledTimes(1); // 1回のみ
  });
});
```

---

#### Presentation層

##### TouchControlRenderer
**テストケース例**:
```typescript
describe('TouchControlRenderer', () => {
  it('ボタンが正しく生成される', () => {
    const renderer = new TouchControlRenderer(container, mockInputHandler);
    renderer.render();

    expect(container.querySelector('[data-action="left"]')).toBeTruthy();
    expect(container.querySelector('[data-action="right"]')).toBeTruthy();
    expect(container.querySelector('[data-action="instant-drop"]')).toBeTruthy();
  });

  it('イベントリスナーが適切に設定される', () => {
    const renderer = new TouchControlRenderer(container, mockInputHandler);
    renderer.render();

    const leftButton = container.querySelector('[data-action="left"]');
    const event = new TouchEvent('touchstart');

    leftButton.dispatchEvent(event);

    expect(mockInputHandler.handleInput).toHaveBeenCalledWith(InputCommand.MOVE_LEFT);
  });

  it('destroy()で全リスナーが解放される', () => {
    const renderer = new TouchControlRenderer(container, mockInputHandler);
    renderer.render();

    const initialListenerCount = renderer['eventListeners'].length;
    expect(initialListenerCount).toBeGreaterThan(0);

    renderer.destroy();

    expect(renderer['eventListeners'].length).toBe(0);
    expect(container.children.length).toBe(0);
  });
});
```

---

### 13.2 統合テスト

**テストケース例**:

##### タッチ入力からゲーム更新まで
```typescript
describe('Touch Input Integration', () => {
  it('タッチ操作がゲーム状態を更新する', async () => {
    const game = initializeGame();
    const controller = new GameController(game);

    const leftButton = document.querySelector('[data-action="left"]');
    leftButton.dispatchEvent(new TouchEvent('touchstart'));

    await nextFrame();

    expect(game.getFallingBlock().position.x).toBeLessThan(initialX);
  });
});
```

##### リサイズ時のCanvas再描画
```typescript
describe('Resize Integration', () => {
  it('リサイズ時にCanvasが正しく更新される', async () => {
    const controller = new GameController(game);

    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    await delay(300); // デバウンス待ち

    const canvas = document.querySelector('canvas');
    expect(canvas.width).toBeLessThanOrEqual(375 * 0.9);
  });
});
```

---

### 13.3 E2Eテスト

**テストケース例**:
```typescript
describe('Mobile E2E', () => {
  it('モバイルデバイスで全操作が機能する', async () => {
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    await page.goto('http://localhost:3000');

    // タッチコントロールが表示されている
    const touchControls = await page.$('.touch-controls');
    expect(await touchControls.isVisible()).toBe(true);

    // 左ボタンをタップ
    await page.tap('[data-action="left"]');
    await page.waitForTimeout(50);

    // ゲームが応答している（50ms以内）
    const gameState = await page.evaluate(() => window.game.getState());
    expect(gameState.fallingBlock).toBeDefined();
  });
});
```

---

### 13.4 パフォーマンステスト

**テストケース例**:
```typescript
describe('Performance', () => {
  it('タッチ操作の応答時間が50ms以内', async () => {
    const startTime = performance.now();

    await page.tap('[data-action="left"]');
    await page.waitForFunction(() => window.game.lastInputTime > 0);

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(50);
  });

  it('リサイズ処理がデバウンスされる', async () => {
    let resizeCount = 0;

    window.addEventListener('resize', () => resizeCount++);

    // 10回連続リサイズ
    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new Event('resize'));
      await delay(10);
    }

    await delay(300); // デバウンス待ち

    // 実際の処理は1回のみ実行されるべき
    expect(mockLayoutService.calculateBlockSize).toHaveBeenCalledTimes(1);
  });
});
```

---

## 14. 非機能要件のDDD観点

### 14.1 パフォーマンス

- **責務**: Presentation層
- **実装**:
  - リサイズ処理のデバウンス（250ms）
  - タッチイベントの効率的なハンドリング
  - 不要な再描画の防止

### 14.2 保守性

- **責務**: 全層
- **実装**:
  - 各層の責務を明確に分離
  - インターフェースによる疎結合
  - 既存コードへの影響を最小化

### 14.3 拡張性

- **責務**: Application層
- **実装**:
  - IInputAdapterインターフェースで新しい入力方法を追加可能
  - ゲームパッド対応などの将来的な拡張が容易

---

## 15. 実装の優先順位（更新版）

### Phase 1: 基盤整備（High Priority）
1. 値オブジェクトの実装（ViewportSize, BlockSize, CanvasSize, InputCommand）
2. `LayoutCalculationService`の実装（Application層）
3. `CooldownManager`の実装（Application層）
4. CanvasRendererの動的サイズ対応

**重要**: Application層のサービスを先に実装することで、ビジネスルールを確定させる

### Phase 2: タッチUI（High Priority）
1. InputHandlerServiceの拡張（クールダウン統合）
2. TouchControlRendererの実装（メモリリーク対策込み）
3. エラーハンドリングの実装

### Phase 3: 統合（Medium Priority）
1. GameControllerへの統合
2. リサイズイベントハンドリング（デバウンス、エラーハンドリング）
3. 既存機能との統合テスト

### Phase 4: 最適化とテスト（Low Priority）
1. パフォーマンスチューニング
2. UI/UXの微調整
3. クロスブラウザテスト
4. E2Eテストの追加

---

## 16. リスクとDDD観点での対策

| リスク | 影響層 | 対策 |
|-------|-------|------|
| Domain層への意図しない依存 | Domain | 厳格なレイヤー分離、レビュー |
| 既存機能の破壊 | 全層 | 既存テストの実行、段階的実装 |
| 責務の曖昧化 | Application/Presentation | インターフェースの明確化 |
| パフォーマンス劣化 | Presentation | プロファイリング、最適化 |

---

## 17. まとめ

### 17.1 設計の要点

1. **Domain層の純粋性維持**: ビジネスロジックは一切変更しない
2. **責務の明確化**: 各コンポーネントの役割を明確に定義
3. **疎結合**: インターフェースを介した柔軟な設計
4. **拡張性**: 新しい入力方法への対応が容易
5. **テスタビリティ**: 各層を独立してテスト可能
6. **エラーハンドリング**: 全てのコンポーネントでエラー処理を実装
7. **メモリ管理**: イベントリスナーの自動解放でメモリリーク対策

### 17.2 期待される効果

- モバイルユーザーの操作性向上
- コードベースの保守性維持
- 将来的な機能追加への柔軟性
- 既存機能の安定性保証
- パフォーマンスの最適化
- メモリリークの防止

### 17.3 DDDの原則への準拠

✅ **単一責任の原則**: 各コンポーネントは明確な責務を持つ
✅ **開放閉鎖の原則**: 拡張により機能追加、既存コードは変更最小限
✅ **依存性逆転の原則**: 抽象（InputCommand）への依存
✅ **関心の分離**: UI、入力処理、ビジネスロジックを分離
✅ **ドメインの純粋性**: Domain層は外部依存なし
✅ **レイヤー整合性**: Application層にビジネスルール、Presentation層はUIのみ

---

### 17.4 バージョン1.1での主な変更点（レビュー対応）

**【高】重要度の対応**:
1. ✅ `LayoutCalculationService`をApplication層に配置（旧: ResponsiveLayoutService）
   - レイアウト計算ルールはビジネスロジックとして扱う
   - UIから独立してテスト可能に

2. ✅ エラーハンドリング戦略を全コンポーネントに追加
   - try-catchブロックでエラーを捕捉
   - エラーでもゲームを継続できる設計

3. ✅ メモリリーク対策を明記
   - `addEventListener()`メソッドでリスナーを自動記録
   - `destroy()`で全リスナーを確実に解放

**【中】重要度の対応**:
4. ✅ `CooldownManager`をApplication層に配置
   - クールダウン時間はゲームバランスのビジネスルール
   - InputHandlerServiceと密接に連携

5. ✅ `InputCommand`の関係を明確化
   - TouchCommandを削除し、InputCommandで統一
   - キーボードとタッチで共通のコマンド体系

6. ✅ 具体的なテストケースを追加
   - ユニットテスト、統合テスト、E2Eテストの具体例
   - パフォーマンステストも追加

**その他の改善**:
- クラス図、シーケンス図、レイヤーアーキテクチャ図を更新
- 実装の優先順位を見直し

---

**このDDD仕様書（v1.1）に基づいて実装することで、レビュー指摘事項を全て反映し、Clean Architectureの原則を守りながら、堅牢なモバイル対応機能を追加できます。**
