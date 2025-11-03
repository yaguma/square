# インフラ層・プレゼンテーション層 詳細設計書

## 第1部: インフラストラクチャ層

### 1. 概要

インフラストラクチャ層は、ドメイン層のインターフェースを実装し、技術的な詳細を提供します。永続化、ランダム生成、タイマーなどの機能を実装します。

### 2. InMemoryGameRepository

#### 2.1 責務

- ゲームの永続化（インメモリ実装）
- ゲームの保存・取得・削除

#### 2.2 クラス図

```
┌──────────────────────────────────┐
│   InMemoryGameRepository         │
├──────────────────────────────────┤
│ - games: Map<string, Game>       │
├──────────────────────────────────┤
│ + save(game): void               │
│ + findById(gameId): Game | null  │
│ + delete(gameId): void           │
│ + clear(): void                  │
└──────────────────────────────────┘
         ▲
         │ implements
         │
┌──────────────────────────────────┐
│   «interface»                    │
│   GameRepository                 │
├──────────────────────────────────┤
│ + save(game): void               │
│ + findById(gameId): Game | null  │
│ + delete(gameId): void           │
└──────────────────────────────────┘
```

#### 2.3 実装例

```typescript
export class InMemoryGameRepository implements GameRepository {
  private games: Map<string, Game> = new Map();

  save(game: Game): void {
    this.games.set(game.gameId, game);
  }

  findById(gameId: string): Game | null {
    return this.games.get(gameId) || null;
  }

  delete(gameId: string): void {
    this.games.delete(gameId);
  }

  clear(): void {
    this.games.clear();
  }
}
```

#### 2.4 拡張実装案

##### LocalStorageGameRepository

**説明**: ブラウザのLocalStorageを使用した永続化

```typescript
export class LocalStorageGameRepository implements GameRepository {
  private readonly STORAGE_KEY = 'square_game';

  save(game: Game): void {
    const serialized = JSON.stringify(this.gameToSerializable(game));
    localStorage.setItem(`${this.STORAGE_KEY}_${game.gameId}`, serialized);
  }

  findById(gameId: string): Game | null {
    const serialized = localStorage.getItem(`${this.STORAGE_KEY}_${gameId}`);

    if (!serialized) {
      return null;
    }

    return this.serializableToGame(JSON.parse(serialized));
  }

  delete(gameId: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY}_${gameId}`);
  }

  private gameToSerializable(game: Game): any {
    // シリアライズ処理
  }

  private serializableToGame(data: any): Game {
    // デシリアライズ処理
  }
}
```

### 3. FrameTimer

#### 3.1 責務

- ゲームループのタイミング制御
- 指定FPSでのコールバック実行

#### 3.2 クラス図

```
┌──────────────────────────────────┐
│       FrameTimer                 │
├──────────────────────────────────┤
│ - intervalId: number | null      │
│ - isRunning: boolean             │
├──────────────────────────────────┤
│ + start(callback, fps): void     │
│ + stop(): void                   │
│ + get isRunning(): boolean       │
└──────────────────────────────────┘
```

#### 3.3 実装例

```typescript
export class FrameTimer {
  private intervalId: number | null = null;
  private _isRunning: boolean = false;

  /**
   * タイマーを開始
   * @param callback - 毎フレーム呼び出される関数
   * @param fps - フレームレート（デフォルト: 30）
   */
  start(callback: () => void, fps: number = 30): void {
    if (this._isRunning) {
      return;
    }

    const interval = 1000 / fps;

    this.intervalId = window.setInterval(() => {
      callback();
    }, interval);

    this._isRunning = true;
  }

  /**
   * タイマーを停止
   */
  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
      this._isRunning = false;
    }
  }

  get isRunning(): boolean {
    return this._isRunning;
  }
}
```

#### 3.4 使用例

```typescript
const timer = new FrameTimer();

timer.start(() => {
  // ゲームループ処理
  const gameDto = gameApplicationService.updateFrame(gameId);
  renderer.render(gameDto);
}, 30);

// 停止
timer.stop();
```

### 4. RandomGenerator

#### 4.1 責務

- ランダム値の生成
- テスト容易性のための抽象化

#### 4.2 クラス図

```
┌──────────────────────────────────┐
│   «interface»                    │
│   RandomGenerator                │
├──────────────────────────────────┤
│ + nextInt(max): number           │
│ + nextFloat(): number            │
└──────────────────────────────────┘
         ▲
         │ implements
         │
┌──────────────────────────────────┐
│   MathRandomGenerator            │
├──────────────────────────────────┤
│ + nextInt(max): number           │
│ + nextFloat(): number            │
└──────────────────────────────────┘
```

#### 4.3 実装例

```typescript
export interface RandomGenerator {
  nextInt(max: number): number;
  nextFloat(): number;
}

export class MathRandomGenerator implements RandomGenerator {
  nextInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  nextFloat(): number {
    return Math.random();
  }
}
```

#### 4.4 テスト用実装

```typescript
export class MockRandomGenerator implements RandomGenerator {
  private sequence: number[] = [];
  private index: number = 0;

  setSequence(sequence: number[]): void {
    this.sequence = sequence;
    this.index = 0;
  }

  nextInt(max: number): number {
    const value = this.sequence[this.index % this.sequence.length];
    this.index++;
    return value % max;
  }

  nextFloat(): number {
    const value = this.sequence[this.index % this.sequence.length];
    this.index++;
    return value;
  }
}
```

---

## 第2部: プレゼンテーション層

### 1. 概要

プレゼンテーション層は、ゲームの描画とユーザー入力を処理します。ビジネスロジックは含まず、GameDtoを受け取って表示するのみです。

### 2. CanvasRenderer

#### 2.1 責務

- ゲームフィールドの描画
- ブロックの描画
- Canvas APIの使用

#### 2.2 クラス図

```
┌──────────────────────────────────────┐
│       CanvasRenderer                 │
├──────────────────────────────────────┤
│ - canvas: HTMLCanvasElement          │
│ - ctx: CanvasRenderingContext2D      │
│ - blockSize: number                  │
│ - gridColor: string                  │
│ - backgroundColor: string            │
├──────────────────────────────────────┤
│ + constructor(canvas, blockSize)     │
│ + render(gameDto): void              │
│ - clear(): void                      │
│ - drawGrid(): void                   │
│ - drawField(field): void             │
│ - drawFallingBlock(fallingBlock): vo │
│ - drawBlock(x, y, color): void       │
│ - getColorHex(colorType): string     │
└──────────────────────────────────────┘
```

#### 2.3 定数

```typescript
const COLORS = {
  blue: '#3498db',
  red: '#e74c3c',
  yellow: '#f1c40f'
};

const BACKGROUND_COLOR = '#2c3e50';
const GRID_COLOR = '#34495e';
```

#### 2.4 実装例

```typescript
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(
    private canvas: HTMLCanvasElement,
    private blockSize: number = 30
  ) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    this.ctx = ctx;

    // キャンバスサイズを設定（8x20マス）
    this.canvas.width = blockSize * 8;
    this.canvas.height = blockSize * 20;
  }

  /**
   * ゲーム状態を描画
   */
  render(gameDto: GameDto): void {
    this.clear();
    this.drawGrid();
    this.drawField(gameDto.field);

    if (gameDto.fallingBlock) {
      this.drawFallingBlock(gameDto.fallingBlock);
    }

    // ゲームオーバー時のオーバーレイ
    if (gameDto.state === 'gameOver') {
      this.drawGameOverOverlay();
    }

    // 一時停止時のオーバーレイ
    if (gameDto.state === 'paused') {
      this.drawPausedOverlay();
    }
  }

  /**
   * キャンバスをクリア
   */
  private clear(): void {
    this.ctx.fillStyle = BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * グリッド線を描画
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = GRID_COLOR;
    this.ctx.lineWidth = 1;

    // 縦線
    for (let x = 0; x <= 8; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.blockSize, 0);
      this.ctx.lineTo(x * this.blockSize, this.canvas.height);
      this.ctx.stroke();
    }

    // 横線
    for (let y = 0; y <= 20; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.blockSize);
      this.ctx.lineTo(this.canvas.width, y * this.blockSize);
      this.ctx.stroke();
    }
  }

  /**
   * フィールドのブロックを描画
   */
  private drawField(field: (string | null)[][]): void {
    for (let y = 0; y < field.length; y++) {
      for (let x = 0; x < field[y].length; x++) {
        const colorType = field[y][x];

        if (colorType) {
          this.drawBlock(x, y, this.getColorHex(colorType));
        }
      }
    }
  }

  /**
   * 落下ブロックを描画
   */
  private drawFallingBlock(fallingBlock: {
    pattern: string[][];
    position: { x: number; y: number };
    rotation: number;
  }): void {
    const { pattern, position } = fallingBlock;

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorType = pattern[y][x];

        if (colorType && colorType !== 'empty') {
          const absX = position.x + x;
          const absY = position.y + y;

          this.drawBlock(absX, absY, this.getColorHex(colorType));
        }
      }
    }
  }

  /**
   * 単一のブロックを描画
   */
  private drawBlock(x: number, y: number, color: string): void {
    const pixelX = x * this.blockSize;
    const pixelY = y * this.blockSize;

    // ブロックの塗りつぶし
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      pixelX + 1,
      pixelY + 1,
      this.blockSize - 2,
      this.blockSize - 2
    );

    // ブロックの枠線（立体感）
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      pixelX + 1,
      pixelY + 1,
      this.blockSize - 2,
      this.blockSize - 2
    );

    // ハイライト
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(
      pixelX + 2,
      pixelY + 2,
      this.blockSize - 4,
      (this.blockSize - 4) / 3
    );
  }

  /**
   * ゲームオーバーのオーバーレイを描画
   */
  private drawGameOverOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'GAME OVER',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  /**
   * 一時停止のオーバーレイを描画
   */
  private drawPausedOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'PAUSED',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  /**
   * 色文字列をHEXコードに変換
   */
  private getColorHex(colorType: string): string {
    const colors: { [key: string]: string } = {
      blue: '#3498db',
      red: '#e74c3c',
      yellow: '#f1c40f'
    };

    return colors[colorType] || '#000';
  }
}
```

### 3. UIRenderer

#### 3.1 責務

- スコア表示の更新
- ネクストブロックの表示
- ボタンの状態管理

#### 3.2 クラス図

```
┌──────────────────────────────────┐
│       UIRenderer                 │
├──────────────────────────────────┤
│ - scoreElement: HTMLElement      │
│ - nextCanvas: HTMLCanvasElement  │
│ - gameOverElement: HTMLElement   │
├──────────────────────────────────┤
│ + constructor()                  │
│ + render(gameDto): void          │
│ - updateScore(score): void       │
│ - drawNextBlock(pattern): void   │
│ - showGameOver(show): void       │
└──────────────────────────────────┘
```

#### 3.3 実装例

```typescript
export class UIRenderer {
  private scoreElement: HTMLElement;
  private nextCanvas: HTMLCanvasElement;
  private nextCtx: CanvasRenderingContext2D;
  private gameOverElement: HTMLElement;

  constructor() {
    this.scoreElement = document.getElementById('score')!;
    this.nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
    this.nextCtx = this.nextCanvas.getContext('2d')!;
    this.gameOverElement = document.getElementById('game-over')!;
  }

  /**
   * UI要素を更新
   */
  render(gameDto: GameDto): void {
    this.updateScore(gameDto.score);
    this.drawNextBlock(gameDto.nextBlock);
    this.showGameOver(gameDto.state === 'gameOver');
  }

  /**
   * スコアを更新
   */
  private updateScore(score: number): void {
    this.scoreElement.textContent = score.toString();
  }

  /**
   * ネクストブロックを描画
   */
  private drawNextBlock(pattern: string[][]): void {
    const blockSize = 30;

    // クリア
    this.nextCtx.fillStyle = BACKGROUND_COLOR;
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    // パターンを中央に描画
    const offsetX = (this.nextCanvas.width - blockSize * 2) / 2;
    const offsetY = (this.nextCanvas.height - blockSize * 2) / 2;

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorType = pattern[y][x];

        if (colorType && colorType !== 'empty') {
          const pixelX = offsetX + x * blockSize;
          const pixelY = offsetY + y * blockSize;

          this.nextCtx.fillStyle = this.getColorHex(colorType);
          this.nextCtx.fillRect(
            pixelX + 1,
            pixelY + 1,
            blockSize - 2,
            blockSize - 2
          );
        }
      }
    }
  }

  /**
   * ゲームオーバー表示の切り替え
   */
  private showGameOver(show: boolean): void {
    if (show) {
      this.gameOverElement.classList.remove('hidden');
    } else {
      this.gameOverElement.classList.add('hidden');
    }
  }

  private getColorHex(colorType: string): string {
    const colors: { [key: string]: string } = {
      blue: '#3498db',
      red: '#e74c3c',
      yellow: '#f1c40f'
    };

    return colors[colorType] || '#000';
  }
}
```

### 4. GameController

#### 4.1 責務

- ゲーム全体の制御
- ゲームループの管理
- イベントハンドラの設定

#### 4.2 クラス図

```
┌──────────────────────────────────────┐
│       GameController                 │
├──────────────────────────────────────┤
│ - gameApplicationService             │
│ - inputHandlerService                │
│ - canvasRenderer                     │
│ - uiRenderer                         │
│ - frameTimer                         │
│ - currentGameId: string | null       │
├──────────────────────────────────────┤
│ + constructor(...)                   │
│ + start(): void                      │
│ + stop(): void                       │
│ - setupEventListeners(): void        │
│ - gameLoop(): void                   │
│ - render(gameDto): void              │
└──────────────────────────────────────┘
```

#### 4.3 実装例

```typescript
export class GameController {
  private frameTimer: FrameTimer;
  private currentGameId: string | null = null;

  constructor(
    private gameApplicationService: GameApplicationService,
    private inputHandlerService: InputHandlerService,
    private canvasRenderer: CanvasRenderer,
    private uiRenderer: UIRenderer
  ) {
    this.frameTimer = new FrameTimer();
  }

  /**
   * ゲームを開始
   */
  start(): void {
    // 新しいゲームを開始
    const gameDto = this.gameApplicationService.startNewGame();
    this.currentGameId = gameDto.gameId;

    // イベントリスナーを設定
    this.setupEventListeners();

    // 初回描画
    this.render(gameDto);

    // ゲームループを開始
    this.frameTimer.start(() => {
      this.gameLoop();
    }, 30);
  }

  /**
   * ゲームを停止
   */
  stop(): void {
    this.frameTimer.stop();
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // キーボードイベント
    window.addEventListener('keydown', (event) => {
      if (!this.currentGameId) return;

      this.inputHandlerService.handleKeyDown(event.key, this.currentGameId);
    });

    window.addEventListener('keyup', (event) => {
      if (!this.currentGameId) return;

      this.inputHandlerService.handleKeyUp(event.key, this.currentGameId);
    });

    // ボタンイベント
    document.getElementById('pause-btn')?.addEventListener('click', () => {
      if (!this.currentGameId) return;

      const gameState = this.gameApplicationService.getGameState(this.currentGameId);
      if (gameState.state === 'playing') {
        this.gameApplicationService.pauseGame(this.currentGameId);
      } else if (gameState.state === 'paused') {
        this.gameApplicationService.resumeGame(this.currentGameId);
      }
    });

    document.getElementById('reset-btn')?.addEventListener('click', () => {
      if (!this.currentGameId) return;

      this.gameApplicationService.restartGame(this.currentGameId);
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      if (!this.currentGameId) return;

      this.gameApplicationService.restartGame(this.currentGameId);
    });
  }

  /**
   * ゲームループ
   */
  private gameLoop(): void {
    if (!this.currentGameId) return;

    // ゲーム状態を更新
    const gameDto = this.gameApplicationService.updateFrame(this.currentGameId);

    // 描画
    this.render(gameDto);
  }

  /**
   * 描画
   */
  private render(gameDto: GameDto): void {
    this.canvasRenderer.render(gameDto);
    this.uiRenderer.render(gameDto);
  }
}
```

### 5. HTMLとCSS

#### 5.1 HTML構造

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Square - 落ちものパズルゲーム</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div id="app">
    <header>
      <h1>Square</h1>
    </header>

    <main>
      <div class="game-container">
        <div class="game-info">
          <div class="score-panel">
            <h2>スコア</h2>
            <div id="score" class="score-value">0</div>
          </div>

          <div class="next-panel">
            <h2>ネクスト</h2>
            <canvas id="next-canvas" width="80" height="80"></canvas>
          </div>
        </div>

        <div class="game-field">
          <canvas id="game-canvas" width="240" height="600"></canvas>
          <div id="game-over" class="game-over hidden">
            <h2>GAME OVER</h2>
            <button id="restart-btn" class="btn btn-primary">リスタート</button>
          </div>
        </div>

        <div class="controls">
          <button id="pause-btn" class="btn">一時停止</button>
          <button id="reset-btn" class="btn">リセット</button>
        </div>
      </div>

      <div class="instructions">
        <h2>操作方法</h2>
        <ul>
          <li><kbd>←</kbd><kbd>→</kbd> : 移動</li>
          <li><kbd>↑</kbd> / <kbd>Z</kbd> : 右回転</li>
          <li><kbd>X</kbd> / <kbd>Ctrl</kbd> : 左回転</li>
          <li><kbd>↓</kbd> : 高速落下</li>
          <li><kbd>Space</kbd> : 即座落下</li>
          <li><kbd>P</kbd> : 一時停止</li>
          <li><kbd>R</kbd> : リスタート</li>
        </ul>
      </div>
    </main>
  </div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

#### 5.2 CSS

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #1a1a1a;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

#app {
  max-width: 800px;
  width: 100%;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  font-size: 48px;
  color: #3498db;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.game-container {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.score-panel,
.next-panel {
  background-color: #2c3e50;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.score-panel h2,
.next-panel h2 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #ecf0f1;
}

.score-value {
  font-size: 32px;
  font-weight: bold;
  color: #f1c40f;
  text-align: center;
}

#next-canvas {
  display: block;
  background-color: #2c3e50;
}

.game-field {
  position: relative;
}

#game-canvas {
  border: 3px solid #34495e;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
}

.game-over h2 {
  font-size: 36px;
  margin-bottom: 20px;
  color: #e74c3c;
}

.game-over.hidden {
  display: none;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #34495e;
  color: #fff;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #2c3e50;
}

.btn-primary {
  background-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.instructions {
  background-color: #2c3e50;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.instructions h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #ecf0f1;
}

.instructions ul {
  list-style: none;
}

.instructions li {
  margin-bottom: 8px;
  font-size: 14px;
}

kbd {
  display: inline-block;
  padding: 3px 8px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  background-color: #34495e;
  border: 1px solid #4a5f7f;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin: 0 3px;
}
```

## 6. まとめ

このドキュメントでは、インフラ層とプレゼンテーション層の詳細設計を行いました：

**インフラ層**:
1. **InMemoryGameRepository**: ゲームの永続化
2. **FrameTimer**: ゲームループのタイミング制御
3. **RandomGenerator**: ランダム値生成の抽象化

**プレゼンテーション層**:
1. **CanvasRenderer**: ゲーム画面の描画
2. **UIRenderer**: UI要素の更新
3. **GameController**: ゲーム全体の制御
4. **HTML/CSS**: ユーザーインターフェース

これらの設計により、技術的な詳細をドメイン層から分離し、保守性と拡張性の高いアーキテクチャを実現します。
