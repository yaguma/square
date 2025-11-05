# Square モバイル対応 - ドメイン駆動設計 仕様書

**作成日**: 2025-11-05
**バージョン**: 1.0
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
│  - ResponsiveLayoutService (新規)       │
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
- `InputHandlerService`: タッチ入力の受付を追加

**追加インターフェース**:
```typescript
interface IInputAdapter {
  handleInput(command: InputCommand): void;
}
```

**設計方針**:
- キーボード入力とタッチ入力を統一的に扱う
- 入力源（キーボード/タッチ）の違いをアダプターパターンで吸収
- 既存のキーボード処理は影響を受けない

### 3.3 Presentation層（変更・追加）

**影響**: あり（主な変更箇所）

**新規追加**:
- `TouchControlRenderer`: タッチUIの描画と管理
- `ResponsiveLayoutService`: レスポンシブレイアウトの計算

**変更対象**:
- `CanvasRenderer`: 動的ブロックサイズ対応
- `GameController`: TouchControlRendererの統合、リサイズ処理

**設計方針**:
- UIコンポーネントは描画のみに専念
- ビジネスロジックはApplication層に委譲
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

### 4.4 TouchCommand（タッチコマンド）

**責務**: タッチ操作から生成される操作指示を表現する

**属性**:
- `action: TouchAction` - 操作の種類
- `timestamp: number` - 操作発生時刻

**列挙型 TouchAction**:
- `MoveLeft` - 左移動
- `MoveRight` - 右移動
- `MoveDown` - 下移動（ソフトドロップ）
- `RotateClockwise` - 右回転
- `RotateCounterClockwise` - 左回転
- `InstantDrop` - 即座落下（ハードドロップ）

**振る舞い**:
- `toInputCommand(): InputCommand` - 既存のInputCommandに変換

---

## 5. 新規追加のサービス

### 5.1 ResponsiveLayoutService（レスポンシブレイアウトサービス）

**責務**: 画面サイズに応じた最適なレイアウト計算を提供する

**メソッド**:

#### `calculateBlockSize(viewport: ViewportSize): BlockSize`
ビューポートサイズからブロックサイズを計算する。

**アルゴリズム**:
```typescript
const isMobile = viewport.isMobile();
const maxCanvasWidth = isMobile
  ? viewport.width * 0.9
  : Math.min(400, viewport.width * 0.4);

const rawBlockSize = Math.floor(maxCanvasWidth / FIELD_WIDTH);

const minSize = isMobile ? 15 : 20;
const maxSize = isMobile ? 30 : 40;

const blockSize = Math.max(minSize, Math.min(maxSize, rawBlockSize));
```

#### `calculateCanvasSize(blockSize: BlockSize): CanvasSize`
ブロックサイズからCanvas全体のサイズを計算する。

**アルゴリズム**:
```typescript
const width = blockSize.size * FIELD_WIDTH;
const height = blockSize.size * FIELD_HEIGHT;
return new CanvasSize(width, height);
```

#### `shouldShowTouchControls(viewport: ViewportSize): boolean`
タッチコントロールを表示すべきか判定する。

**ルール**:
- モバイル（width < 768px）: true
- デスクトップ（width >= 768px）: false

---

## 6. 新規追加のプレゼンテーション層コンポーネント

### 6.1 TouchControlRenderer

**責務**: タッチ操作用UIコントロールの描画とイベントハンドリング

**属性**:
- `container: HTMLElement` - コントロールのコンテナ要素
- `buttons: Map<TouchAction, HTMLButtonElement>` - ボタン要素のマップ
- `inputAdapter: IInputAdapter` - 入力処理のアダプター
- `cooldownManager: CooldownManager` - 連続入力制御

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
各ボタンにタッチイベントリスナーを設定する。

**イベント処理**:
- `touchstart`: ボタン押下開始
  - 視覚フィードバック（`active`クラス追加）
  - コマンドを生成して`inputAdapter`に送信
  - `preventDefault()`でスクロール防止
- `touchend`: ボタン押下終了
  - 視覚フィードバック解除（`active`クラス削除）
- `touchcancel`: タッチキャンセル
  - 視覚フィードバック解除

#### `handleTouchCommand(action: TouchAction): void`
タッチ操作からコマンドを生成して処理する。

**クールダウン制御**:
- 左右移動: 133ms（4フレーム）
- 回転: 200ms
- 即座落下: クールダウンなし

#### `show(): void`
タッチコントロールを表示する。

#### `hide(): void`
タッチコントロールを非表示にする。

#### `destroy(): void`
イベントリスナーを解除し、DOM要素を削除する。

---

### 6.2 CooldownManager（クールダウン管理）

**責務**: ボタンの連続押下を制御する

**属性**:
- `cooldowns: Map<TouchAction, number>` - 各アクションの最終実行時刻
- `cooldownDurations: Map<TouchAction, number>` - 各アクションのクールダウン時間

**メソッド**:

#### `canExecute(action: TouchAction, currentTime: number): boolean`
指定アクションを実行可能か判定する。

**判定ロジック**:
```typescript
const lastExecutionTime = this.cooldowns.get(action) ?? 0;
const cooldownDuration = this.cooldownDurations.get(action) ?? 0;
return currentTime - lastExecutionTime >= cooldownDuration;
```

#### `markExecuted(action: TouchAction, currentTime: number): void`
アクションの実行を記録する。

#### `reset(): void`
すべてのクールダウンをリセットする。

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

**変更内容**: タッチ入力を受け付けるメソッドを追加

**追加メソッド**:

#### `handleTouchInput(command: TouchCommand): void`
タッチコマンドを処理する。

**処理フロー**:
1. TouchCommandをInputCommandに変換
2. クールダウンチェック
3. GameApplicationServiceに操作を委譲

**アダプターパターンの適用**:
```typescript
interface IInputAdapter {
  handleInput(command: InputCommand): void;
}

class KeyboardInputAdapter implements IInputAdapter {
  handleInput(command: InputCommand): void {
    // 既存のキーボード処理
  }
}

class TouchInputAdapter implements IInputAdapter {
  handleInput(command: InputCommand): void {
    // タッチ入力からの処理
  }
}
```

**既存処理への影響**:
- 既存の`handleKeyDown`、`handleKeyUp`は無変更
- タッチ入力は別メソッドで処理

---

### 7.3 GameController（変更）

**変更内容**:
1. TouchControlRendererの統合
2. リサイズイベントハンドリング

**追加属性**:
- `touchControlRenderer: TouchControlRenderer | null`
- `responsiveLayoutService: ResponsiveLayoutService`
- `currentViewportSize: ViewportSize`

**追加メソッド**:

#### `setupResponsiveLayout(): void`
レスポンシブレイアウトの初期設定を行う。

**処理内容**:
1. 初期ビューポートサイズを取得
2. ブロックサイズとCanvasサイズを計算
3. CanvasRendererを初期化
4. タッチコントロール表示判定

#### `handleResize(): void`
ウィンドウリサイズ時の処理。

**処理内容**:
1. 新しいビューポートサイズを取得
2. サイズ変更があれば、再計算
3. CanvasとUIを更新

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
1. TouchControlRendererインスタンスを作成
2. InputHandlerServiceと連携
3. 初期表示/非表示を設定

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
5. `ResponsiveLayoutService`で新しい`BlockSize`を計算
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

## 9. クラス図

```
┌────────────────────────────────────────────────┐
│            GameController                      │
├────────────────────────────────────────────────┤
│ - gameApplicationService                       │
│ - inputHandlerService                          │
│ - canvasRenderer                               │
│ - touchControlRenderer                         │
│ - responsiveLayoutService                      │
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
│       ResponsiveLayoutService                  │
├────────────────────────────────────────────────┤
│ + calculateBlockSize(viewport)                 │
│ + calculateCanvasSize(blockSize)               │
│ + shouldShowTouchControls(viewport)            │
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
│        TouchControlRenderer                    │
├────────────────────────────────────────────────┤
│ - container                                    │
│ - buttons                                      │
│ - inputAdapter                                 │
│ - cooldownManager                              │
├────────────────────────────────────────────────┤
│ + render()                                     │
│ + setupEventListeners()                        │
│ + handleTouchCommand(action)                   │
│ + show()                                       │
│ + hide()                                       │
│ + destroy()                                    │
└────────────────────────────────────────────────┘
                    │
                    │ 使用
                    ↓
┌────────────────────────────────────────────────┐
│         CooldownManager                        │
├────────────────────────────────────────────────┤
│ - cooldowns                                    │
│ - cooldownDurations                            │
├────────────────────────────────────────────────┤
│ + canExecute(action, time)                     │
│ + markExecuted(action, time)                   │
│ + reset()                                      │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│         InputHandlerService                    │
├────────────────────────────────────────────────┤
│ - gameApplicationService                       │
│ - keyboardAdapter                              │
│ - touchAdapter                                 │
├────────────────────────────────────────────────┤
│ + handleKeyDown(key)        (既存)            │
│ + handleKeyUp(key)          (既存)            │
│ + handleTouchInput(command) (新規)            │
└────────────────────────────────────────────────┘
                    │
                    │ 実装
                    ↓
         ┌──────────────────────┐
         │   IInputAdapter      │
         ├──────────────────────┤
         │ + handleInput()      │
         └──────────────────────┘
                    △
                    │
         ┌──────────┴──────────┐
         │                     │
┌────────────────┐   ┌────────────────┐
│ KeyboardInput  │   │  TouchInput    │
│   Adapter      │   │   Adapter      │
└────────────────┘   └────────────────┘
```

---

## 10. シーケンス図

### 10.1 タッチ入力処理シーケンス

```
User          TouchControl    Cooldown     Input        Game          Canvas
              Renderer        Manager      Handler      Application   Renderer
 |                |               |            |            |             |
 |-- tap -->      |               |            |            |             |
 |                |               |            |            |             |
 |                |-- add 'active' class      |            |             |
 |                |               |            |            |             |
 |                |-- canExecute(action) -->  |            |             |
 |                |               |            |            |             |
 |                |<-- true ------------------|            |             |
 |                |               |            |            |             |
 |                |-- handleTouchInput(command) ----------->|             |
 |                |               |            |            |             |
 |                |               |            |-- moveBlockLeft() -->   |
 |                |               |            |            |             |
 |                |               |            |<---------- GameDto -----|
 |                |               |            |            |             |
 |                |               |<-- markExecuted(action) |             |
 |                |               |            |            |             |
 |                |               |            |            |-- render() -->
 |                |               |            |            |             |
 |<-- visual feedback ---------------------------------------------------|
 |                |               |            |            |             |
 |-- release -->  |               |            |            |             |
 |                |               |            |            |             |
 |                |-- remove 'active' class   |            |             |
```

### 10.2 画面リサイズ処理シーケンス

```
Browser      GameController    Responsive     Canvas        Touch
Window                        Layout Service  Renderer      Control
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

---

## 11. レイヤーアーキテクチャ（更新版）

```
┌─────────────────────────────────────────────────┐
│   Presentation Layer                            │
│   ┌───────────────────────────────────────┐     │
│   │ GameController                        │     │
│   │ CanvasRenderer (変更)                 │     │
│   │ TouchControlRenderer (新規)           │     │
│   │ ResponsiveLayoutService (新規)        │     │
│   └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│   Application Layer                             │
│   ┌───────────────────────────────────────┐     │
│   │ GameApplicationService (既存)         │     │
│   │ InputHandlerService (拡張)            │     │
│   │ IInputAdapter (新規インターフェース)   │     │
│   │   - KeyboardInputAdapter (既存)       │     │
│   │   - TouchInputAdapter (新規)          │     │
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

---

## 12. ドメインイベント（変更なし）

モバイル対応に関連する新しいドメインイベントは追加しません。入力方法の違いはドメインレベルの関心事ではないためです。

既存のドメインイベント（`BlockLandedEvent`、`BlocksRemovedEvent`、`GameOverEvent`、`GameStartedEvent`）は引き続き使用されます。

---

## 13. テスト戦略

### 13.1 ユニットテスト

#### Domain層
- **変更なし**: 既存テストが全てパスすること

#### Application層
- `InputHandlerService.handleTouchInput()`のテスト
  - 各TouchCommandが正しくInputCommandに変換されるか
  - クールダウンが機能するか

#### Presentation層
- `ResponsiveLayoutService`のテスト
  - 各画面サイズで正しいBlockSizeが計算されるか
  - ブレークポイント判定が正確か

- `TouchControlRenderer`のテスト
  - ボタンが正しく生成されるか
  - イベントリスナーが適切に設定されるか
  - 視覚フィードバックが機能するか

- `CooldownManager`のテスト
  - クールダウン時間が正確か
  - 複数アクションが独立して管理されるか

### 13.2 統合テスト

- タッチ入力からゲーム状態更新までの全フロー
- リサイズ時のCanvas再描画
- キーボードとタッチの併用（デスクトップでの両対応）

### 13.3 E2Eテスト

- モバイルデバイスシミュレーションでの操作
- 画面サイズ変更時の動作
- タッチ操作の応答性（50ms以内）

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

## 15. 実装の優先順位

### Phase 1: 基盤整備（High Priority）
1. 値オブジェクトの実装（ViewportSize, BlockSize, CanvasSize）
2. ResponsiveLayoutServiceの実装
3. CanvasRendererの動的サイズ対応

### Phase 2: タッチUI（High Priority）
1. TouchCommandの実装
2. CooldownManagerの実装
3. TouchControlRendererの実装
4. InputHandlerServiceの拡張

### Phase 3: 統合（Medium Priority）
1. GameControllerへの統合
2. リサイズイベントハンドリング
3. 既存機能との統合テスト

### Phase 4: 最適化（Low Priority）
1. パフォーマンスチューニング
2. UI/UXの微調整
3. クロスブラウザテスト

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

### 17.2 期待される効果

- モバイルユーザーの操作性向上
- コードベースの保守性維持
- 将来的な機能追加への柔軟性
- 既存機能の安定性保証

### 17.3 DDDの原則への準拠

✅ **単一責任の原則**: 各コンポーネントは明確な責務を持つ
✅ **開放閉鎖の原則**: 拡張により機能追加、既存コードは変更最小限
✅ **依存性逆転の原則**: 抽象（IInputAdapter）への依存
✅ **関心の分離**: UI、入力処理、ビジネスロジックを分離
✅ **ドメインの純粋性**: Domain層は外部依存なし

---

**このDDD仕様書に基づいて実装することで、Clean Architectureの原則を守りながら、モバイル対応機能を追加できます。**
