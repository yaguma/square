# Square - 詳細設計計画書

## 1. 概要

このドキュメントは、Squareゲームの詳細設計と実装計画を定義します。DDD仕様書に基づき、実装可能な形に落とし込みます。

## 2. プロジェクト構造

### 2.1 ディレクトリ構造

```
square/
├── src/
│   ├── domain/                    # ドメイン層
│   │   ├── models/               # エンティティと値オブジェクト
│   │   │   ├── entities/
│   │   │   │   ├── Game.ts
│   │   │   │   ├── Field.ts
│   │   │   │   └── FallingBlock.ts
│   │   │   └── value-objects/
│   │   │       ├── Position.ts
│   │   │       ├── Color.ts
│   │   │       ├── Block.ts
│   │   │       ├── BlockPattern.ts
│   │   │       ├── Score.ts
│   │   │       ├── Rectangle.ts
│   │   │       └── GameState.ts
│   │   ├── services/             # ドメインサービス
│   │   │   ├── BlockMatchingService.ts
│   │   │   ├── BlockFallService.ts
│   │   │   ├── BlockRemovalService.ts
│   │   │   ├── CollisionDetectionService.ts
│   │   │   └── BlockPatternGeneratorService.ts
│   │   ├── events/               # ドメインイベント
│   │   │   ├── BlockLandedEvent.ts
│   │   │   ├── BlocksRemovedEvent.ts
│   │   │   ├── GameOverEvent.ts
│   │   │   └── GameStartedEvent.ts
│   │   └── repositories/         # リポジトリインターフェース
│   │       └── GameRepository.ts
│   ├── application/              # アプリケーション層
│   │   ├── services/
│   │   │   ├── GameApplicationService.ts
│   │   │   └── InputHandlerService.ts
│   │   └── dto/
│   │       └── GameDto.ts
│   ├── infrastructure/           # インフラ層
│   │   ├── repositories/
│   │   │   └── InMemoryGameRepository.ts
│   │   ├── random/
│   │   │   └── RandomGenerator.ts
│   │   └── timer/
│   │       └── FrameTimer.ts
│   ├── presentation/             # プレゼンテーション層
│   │   ├── renderers/
│   │   │   ├── CanvasRenderer.ts
│   │   │   └── UIRenderer.ts
│   │   └── controllers/
│   │       └── GameController.ts
│   ├── types/                    # 共通型定義
│   │   └── common.ts
│   └── main.ts                   # エントリーポイント
├── public/                       # 静的ファイル
│   ├── index.html
│   └── styles.css
├── tests/                        # テスト
│   ├── domain/
│   ├── application/
│   └── integration/
├── docs/                         # ドキュメント
│   ├── design/
│   └── api/
├── package.json
├── tsconfig.json
├── vite.config.ts               # Viteビルド設定
└── README.md
```

### 2.2 ファイル命名規則

- **クラスファイル**: PascalCase（例: `Game.ts`, `BlockPattern.ts`）
- **インターフェース**: PascalCase（例: `GameRepository.ts`）
- **型定義ファイル**: kebab-case（例: `common.ts`）
- **テストファイル**: `*.test.ts` または `*.spec.ts`

### 2.3 技術スタック

- **言語**: TypeScript 5.x
- **ビルドツール**: Vite
- **テストフレームワーク**: Vitest
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **パッケージマネージャー**: npm

## 3. レイヤー別実装方針

### 3.1 Domain Layer（ドメイン層）

#### 3.1.1 実装原則

- **純粋なビジネスロジック**: 外部依存を持たない
- **不変性**: 値オブジェクトはimmutable
- **テスタビリティ**: 単体テストが容易
- **型安全性**: TypeScriptの型システムを最大限活用

#### 3.1.2 主要クラスの実装方針

##### Game Entity
```typescript
export class Game {
  private constructor(
    private readonly _gameId: string,
    private _state: GameState,
    private _field: Field,
    private _fallingBlock: FallingBlock | null,
    private _nextBlock: BlockPattern,
    private _score: Score,
    private _frameCount: number
  ) {}

  static create(gameId: string): Game {
    // ファクトリメソッド
  }

  update(): void {
    // 1フレーム分の更新
  }

  // getters/setters
}
```

##### Position Value Object
```typescript
export class Position {
  private constructor(
    private readonly _x: number,
    private readonly _y: number
  ) {}

  static create(x: number, y: number): Position {
    // バリデーション
    return new Position(x, y);
  }

  equals(other: Position): boolean {
    return this._x === other.x && this._y === other.y;
  }

  add(other: Position): Position {
    return Position.create(this._x + other.x, this._y + other.y);
  }

  get x(): number { return this._x; }
  get y(): number { return this._y; }
}
```

#### 3.1.3 ドメインサービスの実装方針

- **Stateless**: 状態を持たない
- **Pure Function**: 副作用を最小限に
- **明確な責務**: 単一のビジネスロジックに集中

##### BlockMatchingService
```typescript
export class BlockMatchingService {
  findMatchingRectangles(field: Field): Rectangle[] {
    const rectangles: Rectangle[] = [];

    // アルゴリズム実装
    // 1. フィールドをスキャン
    // 2. 各ブロックを起点に矩形を検出
    // 3. 重複を排除

    return rectangles;
  }
}
```

### 3.2 Application Layer（アプリケーション層）

#### 3.2.1 実装原則

- **ユースケースの実行**: ドメインオブジェクトを組み合わせる
- **トランザクション境界**: ユースケース単位で管理
- **DTOへの変換**: ドメインオブジェクトをDTOに変換

#### 3.2.2 GameApplicationService

```typescript
export class GameApplicationService {
  constructor(
    private gameRepository: GameRepository,
    private blockPatternGenerator: BlockPatternGeneratorService
  ) {}

  startNewGame(): GameDto {
    const game = Game.create(crypto.randomUUID());
    this.gameRepository.save(game);
    return this.toDto(game);
  }

  moveBlockLeft(gameId: string): void {
    const game = this.gameRepository.findById(gameId);
    if (!game) throw new Error('Game not found');

    game.moveFallingBlockLeft();
    this.gameRepository.save(game);
  }

  private toDto(game: Game): GameDto {
    // DTOに変換
  }
}
```

### 3.3 Infrastructure Layer（インフラ層）

#### 3.3.1 実装原則

- **インターフェース実装**: ドメイン層のインターフェースを実装
- **技術的な詳細**: 永続化、ランダム生成、タイマーなど
- **切り替え可能**: 実装を容易に入れ替えられる

#### 3.3.2 InMemoryGameRepository

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
}
```

#### 3.3.3 FrameTimer

```typescript
export class FrameTimer {
  private intervalId: number | null = null;

  start(callback: () => void, fps: number = 30): void {
    const interval = 1000 / fps;
    this.intervalId = window.setInterval(callback, interval);
  }

  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
```

### 3.4 Presentation Layer（プレゼンテーション層）

#### 3.4.1 実装原則

- **描画のみ**: ビジネスロジックを含まない
- **イベント処理**: ユーザー入力をアプリケーション層に委譲
- **UI更新**: GameDtoを受け取り描画

#### 3.4.2 CanvasRenderer

```typescript
export class CanvasRenderer {
  constructor(
    private canvas: HTMLCanvasElement,
    private blockSize: number = 30
  ) {}

  render(gameDto: GameDto): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // クリア
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // グリッド描画
    this.drawGrid(ctx, gameDto.field);

    // ブロック描画
    this.drawField(ctx, gameDto.field);

    // 落下ブロック描画
    if (gameDto.fallingBlock) {
      this.drawFallingBlock(ctx, gameDto.fallingBlock);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D, field: (string | null)[][]): void {
    // グリッド線を描画
  }

  private drawField(ctx: CanvasRenderingContext2D, field: (string | null)[][]): void {
    // フィールドのブロックを描画
  }

  private drawFallingBlock(ctx: CanvasRenderingContext2D, fallingBlock: any): void {
    // 落下ブロックを描画
  }

  private getColorHex(colorStr: string): string {
    // 色文字列をHEXコードに変換
  }
}
```

#### 3.4.3 GameController

```typescript
export class GameController {
  private frameTimer: FrameTimer;

  constructor(
    private gameApplicationService: GameApplicationService,
    private inputHandlerService: InputHandlerService,
    private canvasRenderer: CanvasRenderer,
    private uiRenderer: UIRenderer
  ) {
    this.frameTimer = new FrameTimer();
  }

  start(): void {
    const gameDto = this.gameApplicationService.startNewGame();
    const gameId = gameDto.gameId;

    // キーボードイベント登録
    this.setupKeyboardEvents(gameId);

    // ゲームループ開始
    this.frameTimer.start(() => {
      const updatedGameDto = this.gameApplicationService.updateFrame(gameId);
      this.render(updatedGameDto);
    }, 30);
  }

  private setupKeyboardEvents(gameId: string): void {
    window.addEventListener('keydown', (e) => {
      this.inputHandlerService.handleKeyDown(e.key, gameId);
    });
  }

  private render(gameDto: GameDto): void {
    this.canvasRenderer.render(gameDto);
    this.uiRenderer.render(gameDto);
  }
}
```

## 4. 実装フェーズ計画

### Phase 1: ドメイン層の基盤（優先度: 最高）

#### 1.1 値オブジェクトの実装
- [ ] Position
- [ ] Color
- [ ] Block
- [ ] BlockPattern
- [ ] Score
- [ ] Rectangle
- [ ] GameState

**期間**: 2-3日
**依存関係**: なし

#### 1.2 エンティティの実装
- [ ] Field
- [ ] FallingBlock
- [ ] Game

**期間**: 3-4日
**依存関係**: 値オブジェクトの完成

#### 1.3 ドメインサービスの実装
- [ ] CollisionDetectionService
- [ ] BlockPatternGeneratorService
- [ ] BlockMatchingService
- [ ] BlockFallService
- [ ] BlockRemovalService

**期間**: 4-5日
**依存関係**: エンティティの完成

### Phase 2: アプリケーション層とインフラ層（優先度: 高）

#### 2.1 リポジトリの実装
- [ ] GameRepository（インターフェース）
- [ ] InMemoryGameRepository（実装）

**期間**: 1日
**依存関係**: ドメイン層の完成

#### 2.2 アプリケーションサービスの実装
- [ ] GameApplicationService
- [ ] InputHandlerService
- [ ] GameDto

**期間**: 3-4日
**依存関係**: リポジトリの完成

#### 2.3 インフラストラクチャの実装
- [ ] FrameTimer
- [ ] RandomGenerator

**期間**: 1日
**依存関係**: なし

### Phase 3: プレゼンテーション層（優先度: 高）

#### 3.1 レンダラーの実装
- [ ] CanvasRenderer
- [ ] UIRenderer

**期間**: 3-4日
**依存関係**: アプリケーション層の完成

#### 3.2 コントローラーの実装
- [ ] GameController

**期間**: 2日
**依存関係**: レンダラーの完成

#### 3.3 HTMLとCSSの実装
- [ ] index.html
- [ ] styles.css

**期間**: 1日
**依存関係**: なし

### Phase 4: 統合とテスト（優先度: 中）

#### 4.1 単体テストの実装
- [ ] ドメイン層のテスト
- [ ] アプリケーション層のテスト

**期間**: 3-4日
**依存関係**: 各層の実装完了

#### 4.2 統合テストの実装
- [ ] ゲームフローの統合テスト
- [ ] UI統合テスト

**期間**: 2日
**依存関係**: 単体テストの完成

#### 4.3 バグフィックスと調整
- [ ] バグ修正
- [ ] パフォーマンス最適化
- [ ] UI/UXの調整

**期間**: 3-5日
**依存関係**: 統合テストの完成

### Phase 5: ドキュメントと最終調整（優先度: 低）

#### 5.1 ドキュメント作成
- [ ] APIドキュメント
- [ ] ユーザーガイド
- [ ] 開発者向けドキュメント

**期間**: 2日

#### 5.2 最終レビューとリリース準備
- [ ] コードレビュー
- [ ] デプロイ準備
- [ ] README更新

**期間**: 1日

## 5. 技術的な詳細設計

### 5.1 TypeScript設定

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 5.2 Vite設定

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### 5.3 package.json

```json
{
  "name": "square",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 5.4 HTML構造

#### public/index.html
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Square - 落ちものパズルゲーム</title>
  <link rel="stylesheet" href="styles.css">
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
            <div id="score">0</div>
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
            <button id="restart-btn">リスタート</button>
          </div>
        </div>

        <div class="controls">
          <button id="pause-btn">一時停止</button>
          <button id="reset-btn">リセット</button>
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

### 5.5 エントリーポイント

#### src/main.ts
```typescript
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { BlockPatternGeneratorService } from '@domain/services/BlockPatternGeneratorService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { GameController } from '@presentation/controllers/GameController';

// 依存関係の組み立て
const gameRepository = new InMemoryGameRepository();
const blockPatternGenerator = new BlockPatternGeneratorService();

const gameApplicationService = new GameApplicationService(
  gameRepository,
  blockPatternGenerator
);

const inputHandlerService = new InputHandlerService(gameApplicationService);

const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const canvasRenderer = new CanvasRenderer(gameCanvas, 30);

const uiRenderer = new UIRenderer();

const gameController = new GameController(
  gameApplicationService,
  inputHandlerService,
  canvasRenderer,
  uiRenderer
);

// ゲーム起動
document.addEventListener('DOMContentLoaded', () => {
  gameController.start();
});
```

## 6. テスト戦略

### 6.1 単体テスト

#### ドメイン層のテスト例

```typescript
// tests/domain/models/value-objects/Position.test.ts
import { describe, it, expect } from 'vitest';
import { Position } from '@domain/models/value-objects/Position';

describe('Position', () => {
  it('正常に座標を作成できる', () => {
    const position = Position.create(3, 5);
    expect(position.x).toBe(3);
    expect(position.y).toBe(5);
  });

  it('座標を加算できる', () => {
    const pos1 = Position.create(1, 2);
    const pos2 = Position.create(3, 4);
    const result = pos1.add(pos2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  it('同じ座標の場合にequalsがtrueを返す', () => {
    const pos1 = Position.create(3, 5);
    const pos2 = Position.create(3, 5);
    expect(pos1.equals(pos2)).toBe(true);
  });
});
```

### 6.2 統合テスト

```typescript
// tests/integration/game-flow.test.ts
import { describe, it, expect } from 'vitest';
import { GameApplicationService } from '@application/services/GameApplicationService';

describe('Game Flow Integration', () => {
  it('ゲームが正常に開始される', () => {
    const service = new GameApplicationService(/* ... */);
    const gameDto = service.startNewGame();

    expect(gameDto.state).toBe('playing');
    expect(gameDto.score).toBe(0);
    expect(gameDto.fallingBlock).not.toBeNull();
  });
});
```

## 7. コーディング規約

### 7.1 命名規則

- **クラス**: PascalCase（例: `GameApplicationService`）
- **メソッド**: camelCase（例: `moveBlockLeft`）
- **定数**: UPPER_SNAKE_CASE（例: `FIELD_WIDTH`）
- **プライベート変数**: `_`プレフィックス（例: `_gameId`）

### 7.2 コメント規約

```typescript
/**
 * ゲームアプリケーションサービス
 * ゲームのユースケースを実行する
 */
export class GameApplicationService {
  /**
   * 新しいゲームを開始する
   * @returns 開始されたゲームのDTO
   */
  startNewGame(): GameDto {
    // 実装
  }
}
```

### 7.3 エラーハンドリング

```typescript
export class GameApplicationService {
  moveBlockLeft(gameId: string): void {
    const game = this.gameRepository.findById(gameId);

    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    if (game.state !== GameState.Playing) {
      throw new Error('Cannot move block when game is not playing');
    }

    game.moveFallingBlockLeft();
    this.gameRepository.save(game);
  }
}
```

## 8. パフォーマンス考慮事項

### 8.1 レンダリング最適化

- **差分更新**: 変更があった部分のみ再描画
- **requestAnimationFrame**: ブラウザのリフレッシュレートに合わせる
- **オフスクリーンキャンバス**: 複雑な描画は事前に準備

### 8.2 メモリ管理

- **オブジェクトプール**: 頻繁に生成されるオブジェクトを再利用
- **適切なガベージコレクション**: 不要なオブジェクト参照を削除

## 9. デプロイ計画

### 9.1 ビルドプロセス

```bash
# 開発環境
npm run dev

# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

### 9.2 デプロイ先候補

- **GitHub Pages**: 静的サイトホスティング
- **Netlify**: 自動デプロイ対応
- **Vercel**: フロントエンド専用ホスティング

## 10. 今後の拡張可能性

### 10.1 機能拡張案

- **難易度設定**: 落下速度の調整
- **ハイスコア機能**: LocalStorageで保存
- **サウンド効果**: 操作音、消去音
- **アニメーション**: ブロック消去時のエフェクト
- **マルチプレイヤー**: WebSocketでリアルタイム対戦

### 10.2 技術的な拡張案

- **状態管理ライブラリ**: Redux/Zustandの導入
- **WebGL**: Canvas2Dから3D描画への移行
- **Web Workers**: ゲームロジックをバックグラウンドで実行
- **PWA**: オフライン対応、インストール可能

## 11. リスクと対策

### 11.1 技術的リスク

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| Canvas APIのブラウザ互換性 | 中 | 低 | Polyfillの使用、フォールバック実装 |
| パフォーマンス問題 | 高 | 中 | プロファイリング、最適化 |
| TypeScriptの学習曲線 | 低 | 中 | ドキュメント整備、ペアプログラミング |

### 11.2 スケジュールリスク

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| 実装見積もりの甘さ | 高 | 中 | バッファを持ったスケジュール設定 |
| テストの遅延 | 中 | 中 | TDD/BDDの導入、並行テスト実施 |
| バグ修正の長期化 | 中 | 低 | 早期テスト、継続的インテグレーション |

## 12. まとめ

この詳細設計計画書は、DDD仕様書に基づいた実装可能な設計を提供します。各フェーズを順次進めることで、保守性と拡張性の高いゲームを構築できます。

### 次のステップ

1. **環境構築**: TypeScript、Vite、Vitestのセットアップ
2. **Phase 1開始**: ドメイン層の値オブジェクトから実装開始
3. **継続的レビュー**: 各フェーズ完了時にレビューと調整

### 成功の指標

- [ ] すべての単体テストが成功
- [ ] 統合テストが成功
- [ ] 要件書の全仕様を満たす
- [ ] パフォーマンス目標（30fps安定動作）達成
- [ ] コードカバレッジ80%以上
