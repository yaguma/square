# Phase 3: モバイル統合実装 - 実装計画書

**作成日**: 2025-11-06
**バージョン**: 1.0
**対象**: モバイル対応 Phase 3 - 統合とレスポンシブレイアウト実装
**前提**: Phase 1（基盤整備）、Phase 2（タッチUI実装）完了

---

## 1. Phase 3 概要

### 1.1 目的

Phase 1とPhase 2で実装した値オブジェクト、サービス、UIコンポーネントを既存のGameControllerとmain.tsに統合し、モバイル端末でのゲームプレイを完全に機能させるのだ。

### 1.2 実装スコープ

#### Phase 3で実装する内容

| # | タスク | 説明 | 見積もり |
|---|--------|------|---------|
| 3.1 | GameControllerへのTouchControlRenderer統合 | タッチコントロール統合 | 2時間 |
| 3.2 | GameControllerへのリサイズ対応追加 | 動的レイアウト変更 | 2時間 |
| 3.3 | main.tsの動的レイアウト計算実装 | LayoutCalculationService統合 | 2時間 |
| 3.4 | レスポンシブCSSの追加 | タッチコントロールとメディアクエリ | 2時間 |
| 3.5 | 統合テストの実装 | GameController統合テスト | 3時間 |
| 3.6 | 手動テストとデバッグ | 実機テストと調整 | 3時間 |

**Phase 3 合計**: 14時間（約2日）

### 1.3 Phase 3の完了条件

- ✅ TouchControlRendererがGameControllerに統合される
- ✅ リサイズイベントで動的にCanvas とタッチコントロールが調整される
- ✅ モバイルとデスクトップで適切なレイアウトが表示される
- ✅ タッチ操作でゲームが動作する
- ✅ レスポンシブCSSが機能する
- ✅ 統合テストが全てパスする
- ✅ 既存のテストが全てパスする

---

## 2. 実装タスク詳細

### タスク 3.1: GameControllerへのTouchControlRenderer統合

#### 3.1.1 ファイル情報

**変更ファイル**: `src/presentation/controllers/GameController.ts`

#### 3.1.2 変更内容サマリー

- TouchControlRendererをコンストラクタで受け取る
- start()でTouchControlRendererを初期化
- stop()でTouchControlRendererを破棄
- タッチコントロールの表示/非表示制御

#### 3.1.3 コンストラクタの変更

**変更前**:
```typescript
constructor(
  private gameApplicationService: GameApplicationService,
  private inputHandlerService: InputHandlerService,
  private canvasRenderer: CanvasRenderer,
  private uiRenderer: UIRenderer
) {
  this.frameTimer = new FrameTimer();
}
```

**変更後**:
```typescript
constructor(
  private gameApplicationService: GameApplicationService,
  private inputHandlerService: InputHandlerService,
  private canvasRenderer: CanvasRenderer,
  private uiRenderer: UIRenderer,
  private touchControlRenderer: TouchControlRenderer | null = null
) {
  this.frameTimer = new FrameTimer();
}
```

#### 3.1.4 start()メソッドの変更

**追加内容**:
```typescript
start(): void {
  // 新しいゲームを開始
  const gameDto = this.gameApplicationService.startNewGame();
  this.currentGameId = gameDto.gameId;

  // イベントリスナーを設定
  this.setupEventListeners();

  // タッチコントロールを初期化
  if (this.touchControlRenderer) {
    this.touchControlRenderer.render();
  }

  // 初回描画
  this.render(gameDto);

  // ゲームループを開始
  this.frameTimer.start(() => {
    this.gameLoop();
  }, 30);
}
```

#### 3.1.5 stop()メソッドの変更

**追加内容**:
```typescript
stop(): void {
  this.frameTimer.stop();
  this.removeEventListeners();

  // タッチコントロールを破棄
  if (this.touchControlRenderer) {
    this.touchControlRenderer.destroy();
  }
}
```

#### 3.1.6 完了条件

- ✅ TouchControlRendererがコンストラクタで受け取られる
- ✅ start()でTouchControlRenderer.render()が呼ばれる
- ✅ stop()でTouchControlRenderer.destroy()が呼ばれる
- ✅ touchControlRendererがnullの場合も正常動作する（後方互換性）

---

### タスク 3.2: GameControllerへのリサイズ対応追加

#### 3.2.1 ファイル情報

**変更ファイル**: `src/presentation/controllers/GameController.ts`

#### 3.2.2 追加内容サマリー

- LayoutCalculationServiceをコンストラクタで受け取る
- handleResize()メソッドを追加
- Canvasサイズとタッチコントロール表示を動的に更新

#### 3.2.3 新規メソッド追加

```typescript
/**
 * リサイズイベントを処理
 *
 * @param viewport - 新しいビューポートサイズ
 *
 * @remarks
 * - ブロックサイズを再計算
 * - Canvasサイズを更新
 * - タッチコントロールの表示/非表示を切り替え
 * - 現在のゲーム状態を再描画
 */
handleResize(viewport: ViewportSize): void {
  if (!this.layoutCalculationService) {
    return;
  }

  try {
    // ブロックサイズを再計算
    const blockSize = this.layoutCalculationService.calculateBlockSize(viewport);

    // Canvasサイズを更新
    this.canvasRenderer.updateBlockSize(blockSize.size);

    // タッチコントロールの表示/非表示を切り替え
    const shouldShowTouchControls =
      this.layoutCalculationService.shouldShowTouchControls(viewport);

    if (this.touchControlRenderer) {
      if (shouldShowTouchControls) {
        this.touchControlRenderer.show();
      } else {
        this.touchControlRenderer.hide();
      }
    }

    // 現在のゲーム状態を再描画
    if (this.currentGameId) {
      const gameDto = this.gameApplicationService.getGameState(this.currentGameId);
      this.render(gameDto);
    }
  } catch (error) {
    console.error('Resize handling error:', error);
  }
}
```

#### 3.2.4 コンストラクタの変更

**変更後**:
```typescript
constructor(
  private gameApplicationService: GameApplicationService,
  private inputHandlerService: InputHandlerService,
  private canvasRenderer: CanvasRenderer,
  private uiRenderer: UIRenderer,
  private touchControlRenderer: TouchControlRenderer | null = null,
  private layoutCalculationService: LayoutCalculationService | null = null
) {
  this.frameTimer = new FrameTimer();
}
```

#### 3.2.5 完了条件

- ✅ LayoutCalculationServiceがコンストラクタで受け取られる
- ✅ handleResize()メソッドが実装される
- ✅ ブロックサイズが動的に再計算される
- ✅ タッチコントロールの表示/非表示が切り替わる
- ✅ リサイズ後も正常に描画される

---

### タスク 3.3: main.tsの動的レイアウト計算実装

#### 3.3.1 ファイル情報

**変更ファイル**: `src/main.ts`

#### 3.3.2 変更内容サマリー

- LayoutCalculationServiceのインスタンス化
- 初期ビューポートサイズからブロックサイズを計算
- TouchControlRendererの初期化
- リサイズイベントリスナーの設定
- デバウンス処理の実装

#### 3.3.3 完全な実装例

```typescript
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { TouchControlRenderer } from '@presentation/renderers/TouchControlRenderer';
import { GameController } from '@presentation/controllers/GameController';
import { ViewportSize } from '@application/value-objects/ViewportSize';

/**
 * デバウンス処理
 *
 * @param func - 実行する関数
 * @param wait - 待機時間（ミリ秒）
 * @returns デバウンスされた関数
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 現在のビューポートサイズを取得
 *
 * @returns ViewportSize
 */
function getCurrentViewportSize(): ViewportSize {
  return ViewportSize.create(window.innerWidth, window.innerHeight);
}

/**
 * アプリケーションのエントリーポイント
 */
function main() {
  // DOM要素を取得
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const touchControlsContainer = document.getElementById('touch-controls-container');

  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  // 依存関係の組み立て
  const gameRepository = new InMemoryGameRepository();
  const gameApplicationService = new GameApplicationService(gameRepository);
  const inputHandlerService = new InputHandlerService(gameApplicationService);
  const layoutCalculationService = new LayoutCalculationService();

  // 初期ビューポートサイズを取得
  const initialViewport = getCurrentViewportSize();

  // ブロックサイズを計算
  const blockSize = layoutCalculationService.calculateBlockSize(initialViewport);
  const canvasSize = layoutCalculationService.calculateCanvasSize(blockSize);

  // Canvasサイズを設定
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;

  // レンダラーの作成
  const canvasRenderer = new CanvasRenderer(canvas, blockSize.size);
  const uiRenderer = new UIRenderer();

  // ゲームを開始してGameIDを取得（仮）
  // 注意: GameControllerでstartNewGameするので、ここでは仮のゲームIDを使う
  // 実際には、GameController内でgameIdが決まってからTouchControlRendererを作成する必要がある
  // → この問題を解決するため、TouchControlRendererの初期化をGameController.start()内で行う

  let touchControlRenderer: TouchControlRenderer | null = null;

  // タッチコントロールコンテナが存在する場合のみ作成
  // ただし、gameIdが必要なので、start後に作成する必要がある
  // → 代替案: gameIdを先に取得するか、TouchControlRendererをlazy初期化する

  // ゲームコントローラーの作成
  const gameController = new GameController(
    gameApplicationService,
    inputHandlerService,
    canvasRenderer,
    uiRenderer,
    null, // touchControlRendererは後で設定
    layoutCalculationService
  );

  // ゲームを開始してgameIdを取得
  gameController.start();

  // start後にcurrentGameIdが設定されるので、それを使ってTouchControlRendererを作成
  // → GameControllerにgameIdを公開するか、TouchControlRendererをGameController内で作成する必要がある

  // 解決策: TouchControlRendererの作成をGameControllerに移譲
  // または、TouchControlRendererがgameIdを受け取らないようにする
  // → InputHandlerService.handleInput()がgameIdを要求しているため、必要

  // 最も簡単な解決策: GameController.start()の前にdummy gameIdを使わず、
  // start()内でTouchControlRendererを作成する

  // リサイズイベントリスナーを設定（デバウンス250ms）
  const debouncedResize = debounce(() => {
    const viewport = getCurrentViewportSize();
    gameController.handleResize(viewport);
  }, 250);

  window.addEventListener('resize', debouncedResize);

  console.log('Square game started with mobile support!');
}

// DOMContentLoadedイベントで実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
```

#### 3.3.4 TouchControlRendererの初期化問題の解決

TouchControlRendererはgameIdを必要とするが、gameIdはGameController.start()内で生成される。この循環依存を解決するため、以下のアプローチを採用:

**解決策A: TouchControlRendererをGameController内で作成**

GameControllerが`touchControlsContainer`要素を受け取り、start()内でTouchControlRendererを作成する。

```typescript
export class GameController {
  private touchControlRenderer: TouchControlRenderer | null = null;

  constructor(
    // ... 既存のパラメータ
    private touchControlsContainer: HTMLElement | null = null,
    private layoutCalculationService: LayoutCalculationService | null = null
  ) {
    // ...
  }

  start(): void {
    const gameDto = this.gameApplicationService.startNewGame();
    this.currentGameId = gameDto.gameId;

    // TouchControlRendererを作成
    if (this.touchControlsContainer) {
      this.touchControlRenderer = new TouchControlRenderer(
        this.touchControlsContainer,
        this.inputHandlerService,
        this.currentGameId
      );
      this.touchControlRenderer.render();

      // 初期表示状態を設定
      if (this.layoutCalculationService) {
        const viewport = ViewportSize.create(window.innerWidth, window.innerHeight);
        const shouldShow = this.layoutCalculationService.shouldShowTouchControls(viewport);
        if (shouldShow) {
          this.touchControlRenderer.show();
        } else {
          this.touchControlRenderer.hide();
        }
      }
    }

    // ... 残りの処理
  }
}
```

この方が依存関係が明確で、コンストラクタがシンプルになるのだ！

#### 3.3.5 main.tsの最終実装

```typescript
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { GameController } from '@presentation/controllers/GameController';
import { ViewportSize } from '@application/value-objects/ViewportSize';

/**
 * デバウンス処理
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 現在のビューポートサイズを取得
 */
function getCurrentViewportSize(): ViewportSize {
  return ViewportSize.create(window.innerWidth, window.innerHeight);
}

/**
 * アプリケーションのエントリーポイント
 */
function main() {
  // DOM要素を取得
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const touchControlsContainer = document.getElementById('touch-controls-container');

  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  // 依存関係の組み立て
  const gameRepository = new InMemoryGameRepository();
  const gameApplicationService = new GameApplicationService(gameRepository);
  const inputHandlerService = new InputHandlerService(gameApplicationService);
  const layoutCalculationService = new LayoutCalculationService();

  // 初期ビューポートサイズを取得
  const initialViewport = getCurrentViewportSize();

  // ブロックサイズとCanvasサイズを計算
  const blockSize = layoutCalculationService.calculateBlockSize(initialViewport);
  const canvasSize = layoutCalculationService.calculateCanvasSize(blockSize);

  // Canvasサイズを設定
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;

  // レンダラーの作成
  const canvasRenderer = new CanvasRenderer(canvas, blockSize.size);
  const uiRenderer = new UIRenderer();

  // ゲームコントローラーの作成
  const gameController = new GameController(
    gameApplicationService,
    inputHandlerService,
    canvasRenderer,
    uiRenderer,
    touchControlsContainer,
    layoutCalculationService
  );

  // ゲームを開始
  gameController.start();

  // リサイズイベントリスナーを設定（デバウンス250ms）
  const debouncedResize = debounce(() => {
    const viewport = getCurrentViewportSize();
    gameController.handleResize(viewport);
  }, 250);

  window.addEventListener('resize', debouncedResize);

  console.log('Square game started with mobile support!');
}

// DOMContentLoadedイベントで実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
```

#### 3.3.6 完了条件

- ✅ LayoutCalculationServiceが初期化される
- ✅ 初期ビューポートサイズからブロックサイズが計算される
- ✅ Canvasサイズが動的に設定される
- ✅ リサイズイベントリスナーが設定される
- ✅ デバウンス処理が実装される
- ✅ TouchControlRendererがGameController内で作成される

---

### タスク 3.4: レスポンシブCSSの追加

#### 3.4.1 ファイル情報

**変更ファイル**: `public/styles.css`

#### 3.4.2 追加するCSS

既存のstyles.cssの最後に以下を追加:

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

.rotation-buttons,
.direction-buttons,
.drop-button {
  display: flex;
  justify-content: center;
  gap: 12px;
}

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

/* ========================================
   レスポンシブ対応
   ======================================== */

/* モバイル端末（768px未満） */
@media (max-width: 767px) {
  #app {
    padding: 10px;
  }

  header h1 {
    font-size: 32px;
  }

  .game-container {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .game-info {
    flex-direction: row;
    width: 100%;
    max-width: 400px;
  }

  .score-panel,
  .next-panel {
    flex: 1;
  }

  .game-field {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  #game-canvas {
    max-width: 90vw;
    height: auto;
  }

  .controls {
    width: 100%;
    max-width: 400px;
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .touch-controls {
    max-width: 100%;
  }

  .touch-btn {
    min-width: 70px;
    min-height: 70px;
    font-size: 28px;
  }

  .instructions {
    width: 100%;
    max-width: 400px;
  }

  .instructions h2 {
    font-size: 18px;
  }

  .instructions ul {
    font-size: 14px;
  }
}

/* 非常に小さい画面（375px未満） */
@media (max-width: 374px) {
  header h1 {
    font-size: 28px;
  }

  .touch-btn {
    min-width: 60px;
    min-height: 60px;
    font-size: 24px;
    padding: 8px;
  }

  .rotation-buttons,
  .direction-buttons,
  .drop-button {
    gap: 8px;
  }

  .touch-controls {
    padding: 12px;
    gap: 12px;
  }
}

/* デスクトップ（768px以上） */
@media (min-width: 768px) {
  .touch-controls {
    display: none !important; /* デスクトップでは常に非表示 */
  }
}

/* アクセシビリティ: モーション低減設定 */
@media (prefers-reduced-motion: reduce) {
  .touch-btn {
    transition: none;
  }

  .touch-btn.active {
    transform: none;
  }
}
```

#### 3.4.3 完了条件

- ✅ タッチコントロールのスタイルが追加される
- ✅ レスポンシブ対応のメディアクエリが追加される
- ✅ モバイルとデスクトップで適切なレイアウトが表示される
- ✅ アクセシビリティ対応が実装される
- ✅ ブラウザでスタイルが正しく適用される

---

### タスク 3.5: 統合テストの実装

#### 3.5.1 ファイル情報

**作成ファイル**: `tests/integration/mobile-integration.test.ts`

#### 3.5.2 テストケース一覧

##### GameControllerとTouchControlRendererの統合

- ✅ TouchControlRendererがstart()で初期化される
- ✅ TouchControlRendererがstop()で破棄される
- ✅ タッチコントロールがモバイルサイズで表示される
- ✅ タッチコントロールがデスクトップサイズで非表示になる

##### リサイズ処理の統合

- ✅ リサイズでブロックサイズが再計算される
- ✅ リサイズでCanvasサイズが更新される
- ✅ リサイズでタッチコントロールの表示/非表示が切り替わる
- ✅ リサイズ後も正常に描画される

##### レイアウト計算の統合

- ✅ 初期表示でブロックサイズが正しく計算される
- ✅ 初期表示でCanvasサイズが正しく設定される
- ✅ モバイルサイズでタッチコントロールが表示される
- ✅ デスクトップサイズでタッチコントロールが非表示になる

#### 3.5.3 テスト実装例

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameController } from '@presentation/controllers/GameController';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { ViewportSize } from '@application/value-objects/ViewportSize';

describe('Mobile Integration Tests', () => {
  let gameController: GameController;
  let canvas: HTMLCanvasElement;
  let touchControlsContainer: HTMLElement;

  beforeEach(() => {
    // DOM要素を作成
    canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    document.body.appendChild(canvas);

    touchControlsContainer = document.createElement('div');
    touchControlsContainer.id = 'touch-controls-container';
    document.body.appendChild(touchControlsContainer);

    // 必要なUI要素を作成
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score';
    document.body.appendChild(scoreElement);

    // 依存関係を組み立て
    const gameRepository = new InMemoryGameRepository();
    const gameApplicationService = new GameApplicationService(gameRepository);
    const inputHandlerService = new InputHandlerService(gameApplicationService);
    const layoutCalculationService = new LayoutCalculationService();

    const canvasRenderer = new CanvasRenderer(canvas, 30);
    const uiRenderer = new UIRenderer();

    gameController = new GameController(
      gameApplicationService,
      inputHandlerService,
      canvasRenderer,
      uiRenderer,
      touchControlsContainer,
      layoutCalculationService
    );
  });

  afterEach(() => {
    gameController.stop();
    document.body.innerHTML = '';
  });

  describe('TouchControlRenderer Integration', () => {
    it('should initialize TouchControlRenderer on start', () => {
      gameController.start();

      const touchControls = touchControlsContainer.querySelector('.touch-controls');
      expect(touchControls).not.toBeNull();
    });

    it('should destroy TouchControlRenderer on stop', () => {
      gameController.start();
      gameController.stop();

      const touchControls = touchControlsContainer.querySelector('.touch-controls');
      expect(touchControls).toBeNull();
    });

    it('should show touch controls on mobile viewport', () => {
      // モバイルサイズのビューポートを設定
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667);

      gameController.start();

      const touchControls = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls).not.toBeNull();

      // CSSで制御されるため、display styleを確認
      // 実際の表示はCSSに依存するため、要素の存在のみ確認
      expect(touchControls.style.display).not.toBe('none');
    });

    it('should hide touch controls on desktop viewport', () => {
      // デスクトップサイズのビューポートを設定
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(768);

      gameController.start();

      const touchControls = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls).not.toBeNull();

      // デスクトップではhide()が呼ばれる
      expect(touchControls.style.display).toBe('none');
    });
  });

  describe('Resize Handling', () => {
    it('should recalculate block size on resize', () => {
      gameController.start();

      const initialBlockSize = 30;
      const viewport = ViewportSize.create(400, 800);

      gameController.handleResize(viewport);

      // ブロックサイズが再計算されることを確認
      // CanvasRendererのblockSizeが変更されることを期待
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it('should toggle touch controls visibility on resize', () => {
      gameController.start();

      // モバイルサイズにリサイズ
      const mobileViewport = ViewportSize.create(375, 667);
      gameController.handleResize(mobileViewport);

      let touchControls = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls.style.display).not.toBe('none');

      // デスクトップサイズにリサイズ
      const desktopViewport = ViewportSize.create(1024, 768);
      gameController.handleResize(desktopViewport);

      touchControls = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls.style.display).toBe('none');
    });
  });

  describe('Layout Calculation Integration', () => {
    it('should calculate correct block size for mobile', () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667);

      const layoutService = new LayoutCalculationService();
      const viewport = ViewportSize.create(375, 667);
      const blockSize = layoutService.calculateBlockSize(viewport);

      expect(blockSize.size).toBeGreaterThanOrEqual(15);
      expect(blockSize.size).toBeLessThanOrEqual(30);
    });

    it('should calculate correct block size for desktop', () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(768);

      const layoutService = new LayoutCalculationService();
      const viewport = ViewportSize.create(1024, 768);
      const blockSize = layoutService.calculateBlockSize(viewport);

      expect(blockSize.size).toBeGreaterThanOrEqual(20);
      expect(blockSize.size).toBeLessThanOrEqual(40);
    });
  });
});
```

#### 3.5.4 完了条件

- ✅ 全ての統合テストが実装される
- ✅ 全てのテストがパスする
- ✅ カバレッジが80%以上

---

### タスク 3.6: 手動テストとデバッグ

#### 3.6.1 テスト項目

##### モバイル端末（Chrome DevTools）

| テスト項目 | 確認内容 | 期待結果 |
|----------|---------|---------|
| 初期表示 | ページ読み込み時の表示 | Canvas とタッチコントロールが正しく表示される |
| タッチ操作 | 各ボタンをタップ | ブロックが正しく動く |
| 視覚FB | ボタンタップ時 | activeクラスが適用され、色が変わる |
| リサイズ | 画面サイズ変更 | レイアウトが動的に調整される |
| ゲームプレイ | フルゲームプレイ | 最後までプレイできる |

##### デスクトップ

| テスト項目 | 確認内容 | 期待結果 |
|----------|---------|---------|
| 初期表示 | ページ読み込み時の表示 | Canvas が表示され、タッチコントロールは非表示 |
| キーボード操作 | 既存のキー操作 | 全て正常に動作する |
| リサイズ | ウィンドウサイズ変更 | Canvas サイズが調整される |

##### クロスブラウザ

- Chrome（デスクトップ・モバイル）
- Firefox（デスクトップ・モバイル）
- Safari（iOS）

#### 3.6.2 完了条件

- ✅ 全ての手動テストがパスする
- ✅ バグが修正される
- ✅ パフォーマンスが30fps維持される
- ✅ 実機テストで正常動作する

---

## 3. 実装順序

### 3.1 推奨実装順序

```
Day 1 (7時間):
  1. [2h]   タスク 3.1: GameControllerへのTouchControlRenderer統合
  2. [2h]   タスク 3.2: GameControllerへのリサイズ対応追加
  3. [2h]   タスク 3.3: main.tsの動的レイアウト計算実装
  4. [1h]   手動テスト・デバッグ

Day 2 (7時間):
  1. [2h]   タスク 3.4: レスポンシブCSSの追加
  2. [3h]   タスク 3.5: 統合テストの実装
  3. [2h]   タスク 3.6: 手動テストとデバッグ
```

### 3.2 依存関係

```
3.1 GameController統合
  ↓
3.2 リサイズ対応
  ↓
3.3 main.ts実装 ← 3.4 CSS（並行可能）
  ↓
3.5 統合テスト
  ↓
3.6 手動テスト
```

---

## 4. テスト戦略

### 4.1 ユニットテスト

既存のユニットテストが全てパスすることを確認:
- Domain層のテスト
- Application層のテスト
- Presentation層のテスト

### 4.2 統合テスト

新規に統合テストを作成:
- GameControllerとTouchControlRendererの統合
- リサイズ処理の統合
- レイアウト計算の統合

### 4.3 手動テスト

実機とブラウザDevToolsでテスト:
- モバイル端末での動作確認
- デスクトップでの動作確認
- リサイズ動作確認
- クロスブラウザテスト

---

## 5. Phase 3完了後の状態

### 5.1 実装されるファイル

#### 変更

- `src/presentation/controllers/GameController.ts`
- `src/main.ts`
- `public/styles.css`

#### 新規作成

- `tests/integration/mobile-integration.test.ts`

### 5.2 モバイル対応の完成

Phase 3完了後、以下が実現される:

- ✅ モバイル端末でゲームがプレイできる
- ✅ タッチ操作でゲームを操作できる
- ✅ レスポンシブレイアウトが機能する
- ✅ リサイズに動的に対応する
- ✅ デスクトップとモバイルの両方で動作する
- ✅ 全てのテストがパスする

---

## 6. リスクと対策

| リスク | 影響 | 対策 |
|-------|------|------|
| TouchControlRendererの初期化タイミング | 機能不全 | GameController内で遅延初期化 |
| リサイズ処理のパフォーマンス | UI遅延 | デバウンス処理（250ms）実装 |
| 既存機能の破壊 | 重大 | 既存テスト全実行、段階的実装 |
| CSS適用されない | UI崩れ | ブラウザDevToolsで確認 |
| メモリリーク | パフォーマンス低下 | stop()でのクリーンアップ確認 |

---

## 7. 成功基準

### 7.1 機能要件

- ✅ モバイルでタッチ操作ができる
- ✅ デスクトップでキーボード操作ができる
- ✅ リサイズに動的に対応する
- ✅ レスポンシブレイアウトが機能する

### 7.2 品質要件

- ✅ 既存テストが全てパスする
- ✅ 統合テストが全てパスする
- ✅ カバレッジが80%以上
- ✅ エラーハンドリングが適切

### 7.3 非機能要件

- ✅ パフォーマンスが30fps維持される
- ✅ タッチ応答時間が50ms以内
- ✅ レスポンシブデザインが機能する

---

## 8. 参照ドキュメント

- **Phase 1実装レポート**: git commit d97f2c7
- **Phase 2実装計画書**: `docs/implementation-plan/phase2-touch-ui-plan.md`
- **Phase 2実装レポート**: git commit 26011bf
- **DDD仕様書**: `docs/design/mobile-responsive-ddd-specification.md`
- **詳細設計書**: `docs/design/mobile-responsive-detailed-design.md`
- **要件定義書**: `docs/mobile-responsive-requirements.md`

---

**Phase 3実装計画書 完成なのだ！** ✨

この計画に従って実装すれば、モバイル対応が完全に統合されるのだ。
