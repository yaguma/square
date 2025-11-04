# アプリケーション層 詳細設計書

## 1. 概要

このドキュメントは、Squareゲームのアプリケーション層の詳細設計を定義します。アプリケーション層は、ユースケースを実行し、ドメイン層とプレゼンテーション層を繋ぐ役割を担います。

## 2. アプリケーション層の責務

- ユースケースの実行
- トランザクション境界の管理
- ドメインオブジェクトの調整
- DTOへの変換
- ドメインイベントの発行

## 3. GameApplicationService

### 3.1 責務

- ゲームのユースケースを実行
- ドメインオブジェクトを組み合わせてビジネスフローを実現
- ゲーム状態をDTOに変換

### 3.2 クラス図

```
┌──────────────────────────────────────────────┐
│       GameApplicationService                 │
├──────────────────────────────────────────────┤
│ - gameRepository: GameRepository             │
│ - blockPatternGenerator:                     │
│   BlockPatternGeneratorService               │
│ - blockMatchingService:                      │
│   BlockMatchingService                       │
│ - blockRemovalService:                       │
│   BlockRemovalService                        │
├──────────────────────────────────────────────┤
│ + constructor(...)                           │
│ + startNewGame(): GameDto                    │
│ + pauseGame(gameId): void                    │
│ + resumeGame(gameId): void                   │
│ + restartGame(gameId): GameDto               │
│ + moveBlockLeft(gameId): void                │
│ + moveBlockRight(gameId): void               │
│ + rotateBlockClockwise(gameId): void         │
│ + rotateBlockCounterClockwise(gameId): void  │
│ + accelerateFall(gameId): void               │
│ + decelera teFall(gameId): void              │
│ + dropInstantly(gameId): void                │
│ + updateFrame(gameId): GameDto               │
│ + getGameState(gameId): GameDto              │
│ - toDto(game): GameDto                       │
└──────────────────────────────────────────────┘
```

### 3.3 依存関係

```typescript
constructor(
  private gameRepository: GameRepository,
  private blockPatternGenerator: BlockPatternGeneratorService,
  private blockMatchingService: BlockMatchingService,
  private blockRemovalService: BlockRemovalService
)
```

### 3.4 メソッド詳細

#### startNewGame(): GameDto

**説明**: 新しいゲームを開始する

**戻り値**: `GameDto` - 開始されたゲームの状態

**処理フロー**:
1. UUIDでゲームIDを生成
2. Gameエンティティを作成
3. ゲームを開始（start()を呼び出し）
4. リポジトリに保存
5. DTOに変換して返却

**使用例**:
```typescript
const gameDto = gameApplicationService.startNewGame();
console.log(`Game started: ${gameDto.gameId}`);
```

**実装例**:
```typescript
startNewGame(): GameDto {
  const gameId = crypto.randomUUID();
  const game = Game.create(gameId);

  game.start();

  this.gameRepository.save(game);

  return this.toDto(game);
}
```

#### pauseGame(gameId: string): void

**説明**: ゲームを一時停止する

**パラメータ**:
- `gameId`: ゲームID

**例外**:
- ゲームが存在しない場合、`Error`をスロー

**処理フロー**:
1. リポジトリからゲームを取得
2. ゲームを一時停止
3. リポジトリに保存

**実装例**:
```typescript
pauseGame(gameId: string): void {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  game.pause();
  this.gameRepository.save(game);
}
```

#### resumeGame(gameId: string): void

**説明**: ゲームを再開する

**パラメータ**:
- `gameId`: ゲームID

**例外**:
- ゲームが存在しない場合、`Error`をスロー

**実装例**:
```typescript
resumeGame(gameId: string): void {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  game.resume();
  this.gameRepository.save(game);
}
```

#### restartGame(gameId: string): GameDto

**説明**: ゲームをリスタートする

**パラメータ**:
- `gameId`: ゲームID

**戻り値**: `GameDto` - リスタートされたゲームの状態

**処理フロー**:
1. リポジトリからゲームを取得
2. ゲームをリスタート
3. リポジトリに保存
4. DTOに変換して返却

**実装例**:
```typescript
restartGame(gameId: string): GameDto {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  game.restart();
  this.gameRepository.save(game);

  return this.toDto(game);
}
```

#### moveBlockLeft(gameId: string): void

**説明**: 落下ブロックを左に移動

**パラメータ**:
- `gameId`: ゲームID

**例外**:
- ゲームが存在しない場合、`Error`をスロー

**実装例**:
```typescript
moveBlockLeft(gameId: string): void {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  game.moveFallingBlockLeft();
  this.gameRepository.save(game);
}
```

#### moveBlockRight(gameId: string): void

**説明**: 落下ブロックを右に移動

**パラメータ**:
- `gameId`: ゲームID

#### rotateBlockClockwise(gameId: string): void

**説明**: 落下ブロックを時計回りに回転

**パラメータ**:
- `gameId`: ゲームID

#### rotateBlockCounterClockwise(gameId: string): void

**説明**: 落下ブロックを反時計回りに回転

**パラメータ**:
- `gameId`: ゲームID

#### accelerateFall(gameId: string): void

**説明**: 高速落下を有効化（下キー押下時）

**パラメータ**:
- `gameId`: ゲームID

**実装例**:
```typescript
accelerateFall(gameId: string): void {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  game.enableFastFall();
  this.gameRepository.save(game);
}
```

#### disableFastFall(gameId: string): void

**説明**: 高速落下を無効化（下キー解放時）

**パラメータ**:
- `gameId`: ゲームID

**実装例**:
```typescript
disableFastFall(gameId: string): void {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  game.disableFastFall();
  this.gameRepository.save(game);
}
```

#### dropInstantly(gameId: string): void

**説明**: 落下ブロックを即座に落下（スペースキー押下時）

**パラメータ**:
- `gameId`: ゲームID

**実装例**:
```typescript
dropInstantly(gameId: string): void {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  game.dropInstantly();
  this.gameRepository.save(game);
}
```

#### updateFrame(gameId: string): GameDto

**説明**: 1フレーム分のゲーム状態を更新

**パラメータ**:
- `gameId`: ゲームID

**戻り値**: `GameDto` - 更新後のゲーム状態

**処理フロー**:
1. リポジトリからゲームを取得
2. ゲームを更新（update()を呼び出し）
3. リポジトリに保存
4. DTOに変換して返却

**使用例**:
```typescript
// ゲームループ内で毎フレーム呼び出し
const gameDto = gameApplicationService.updateFrame(gameId);
renderer.render(gameDto);
```

**実装例**:
```typescript
updateFrame(gameId: string): GameDto {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  game.update();
  this.gameRepository.save(game);

  return this.toDto(game);
}
```

#### getGameState(gameId: string): GameDto

**説明**: 現在のゲーム状態を取得

**パラメータ**:
- `gameId`: ゲームID

**戻り値**: `GameDto` - 現在のゲーム状態

**実装例**:
```typescript
getGameState(gameId: string): GameDto {
  const game = this.gameRepository.findById(gameId);

  if (!game) {
    throw new Error(`Game not found: ${gameId}`);
  }

  return this.toDto(game);
}
```

### 3.5 DTO変換メソッド

#### toDto(game: Game): GameDto

**説明**: GameエンティティをGameDtoに変換

**パラメータ**:
- `game`: Gameエンティティ

**戻り値**: `GameDto`

**実装例**:
```typescript
private toDto(game: Game): GameDto {
  return {
    gameId: game.gameId,
    state: game.state,
    score: game.score.value,
    field: this.convertFieldToDto(game.field),
    fallingBlock: game.fallingBlock
      ? this.convertFallingBlockToDto(game.fallingBlock)
      : null,
    nextBlock: this.convertBlockPatternToDto(game.nextBlock)
  };
}

private convertFieldToDto(field: Field): (string | null)[][] {
  const grid: (string | null)[][] = [];

  for (let y = 0; y < field.height; y++) {
    grid[y] = [];
    for (let x = 0; x < field.width; x++) {
      const block = field.getBlock(Position.create(x, y));
      grid[y][x] = block ? block.color.type : null;
    }
  }

  return grid;
}

private convertFallingBlockToDto(fallingBlock: FallingBlock) {
  return {
    pattern: this.convertBlockPatternToDto(fallingBlock.pattern),
    position: {
      x: fallingBlock.position.x,
      y: fallingBlock.position.y
    },
    rotation: fallingBlock.rotation
  };
}

private convertBlockPatternToDto(pattern: BlockPattern): string[][] {
  const blocks = pattern.blocks;
  const result: string[][] = [];

  for (let y = 0; y < 2; y++) {
    result[y] = [];
    for (let x = 0; x < 2; x++) {
      result[y][x] = blocks[y][x] ? blocks[y][x].color.type : 'empty';
    }
  }

  return result;
}
```

### 3.6 完全な実装例

```typescript
export class GameApplicationService {
  constructor(
    private gameRepository: GameRepository,
    private blockPatternGenerator: BlockPatternGeneratorService,
    private blockMatchingService: BlockMatchingService,
    private blockRemovalService: BlockRemovalService
  ) {}

  startNewGame(): GameDto {
    const gameId = crypto.randomUUID();
    const game = Game.create(gameId);

    game.start();

    this.gameRepository.save(game);

    return this.toDto(game);
  }

  pauseGame(gameId: string): void {
    const game = this.getGame(gameId);
    game.pause();
    this.gameRepository.save(game);
  }

  resumeGame(gameId: string): void {
    const game = this.getGame(gameId);
    game.resume();
    this.gameRepository.save(game);
  }

  restartGame(gameId: string): GameDto {
    const game = this.getGame(gameId);
    game.restart();
    this.gameRepository.save(game);
    return this.toDto(game);
  }

  moveBlockLeft(gameId: string): void {
    const game = this.getGame(gameId);
    game.moveFallingBlockLeft();
    this.gameRepository.save(game);
  }

  moveBlockRight(gameId: string): void {
    const game = this.getGame(gameId);
    game.moveFallingBlockRight();
    this.gameRepository.save(game);
  }

  rotateBlockClockwise(gameId: string): void {
    const game = this.getGame(gameId);
    game.rotateFallingBlockClockwise();
    this.gameRepository.save(game);
  }

  rotateBlockCounterClockwise(gameId: string): void {
    const game = this.getGame(gameId);
    game.rotateFallingBlockCounterClockwise();
    this.gameRepository.save(game);
  }

  accelerateFall(gameId: string): void {
    const game = this.getGame(gameId);
    game.enableFastFall();
    this.gameRepository.save(game);
  }

  disableFastFall(gameId: string): void {
    const game = this.getGame(gameId);
    game.disableFastFall();
    this.gameRepository.save(game);
  }

  dropInstantly(gameId: string): void {
    const game = this.getGame(gameId);
    game.dropInstantly();
    this.gameRepository.save(game);
  }

  updateFrame(gameId: string): GameDto {
    const game = this.getGame(gameId);
    game.update();
    this.gameRepository.save(game);
    return this.toDto(game);
  }

  getGameState(gameId: string): GameDto {
    const game = this.getGame(gameId);
    return this.toDto(game);
  }

  private getGame(gameId: string): Game {
    const game = this.gameRepository.findById(gameId);

    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    return game;
  }

  private toDto(game: Game): GameDto {
    // 前述の実装
  }
}
```

## 4. InputHandlerService

### 4.1 責務

- ユーザー入力の処理
- キー入力のマッピング
- 連続入力待ちの管理

### 4.2 クラス図

```
┌──────────────────────────────────────────┐
│       InputHandlerService                │
├──────────────────────────────────────────┤
│ - gameApplicationService:                │
│   GameApplicationService                 │
│ - lastInputFrame: Map<string, number>    │
│ - inputCooldown: number                  │
├──────────────────────────────────────────┤
│ + constructor(gameAppService)            │
│ + handleKeyDown(key, gameId): void       │
│ + handleKeyUp(key, gameId): void         │
│ + canAcceptInput(key, frameCount): bool  │
│ - updateLastInputFrame(key, frame)       │
└──────────────────────────────────────────┘
```

### 4.3 定数

```typescript
const INPUT_COOLDOWN = 4; // 4フレーム待ち
```

### 4.4 キーマッピング

| キー | アクション |
|------|-----------|
| `ArrowLeft` | 左移動 |
| `ArrowRight` | 右移動 |
| `ArrowUp` / `z` | 右回転 |
| `x` / `Control` | 左回転 |
| `ArrowDown` | 高速落下（押下中のみ） |
| `Space` | 即座落下 |
| `p` | 一時停止/再開 |
| `r` | リスタート |

### 4.5 メソッド詳細

#### handleKeyDown(key: string, gameId: string): void

**説明**: キー押下イベントを処理

**パラメータ**:
- `key`: 押下されたキー
- `gameId`: ゲームID

**処理フロー**:
1. キーに応じた処理を実行
2. 連続入力待ちが必要なキーの場合、最終入力フレームを更新

**実装例**:
```typescript
handleKeyDown(key: string, gameId: string): void {
  switch (key) {
    case 'ArrowLeft':
      this.gameApplicationService.moveBlockLeft(gameId);
      this.updateLastInputFrame('left', Date.now());
      break;

    case 'ArrowRight':
      this.gameApplicationService.moveBlockRight(gameId);
      this.updateLastInputFrame('right', Date.now());
      break;

    case 'ArrowUp':
    case 'z':
      this.gameApplicationService.rotateBlockClockwise(gameId);
      break;

    case 'x':
    case 'Control':
      this.gameApplicationService.rotateBlockCounterClockwise(gameId);
      break;

    case 'ArrowDown':
      this.gameApplicationService.accelerateFall(gameId);
      break;

    case ' ': // Space
      this.gameApplicationService.dropInstantly(gameId);
      break;

    case 'p':
      // 一時停止/再開のトグル
      const gameState = this.gameApplicationService.getGameState(gameId);
      if (gameState.state === 'playing') {
        this.gameApplicationService.pauseGame(gameId);
      } else if (gameState.state === 'paused') {
        this.gameApplicationService.resumeGame(gameId);
      }
      break;

    case 'r':
      this.gameApplicationService.restartGame(gameId);
      break;
  }
}
```

#### handleKeyUp(key: string, gameId: string): void

**説明**: キー解放イベントを処理

**パラメータ**:
- `key`: 解放されたキー
- `gameId`: ゲームID

**実装例**:
```typescript
handleKeyUp(key: string, gameId: string): void {
  switch (key) {
    case 'ArrowDown':
      this.gameApplicationService.disableFastFall(gameId);
      break;
  }
}
```

#### canAcceptInput(key: string, frameCount: number): boolean

**説明**: 連続入力待ちを考慮して、入力を受け付けるかを判定

**パラメータ**:
- `key`: キー
- `frameCount`: 現在のフレームカウント

**戻り値**: `boolean` - 入力を受け付ける場合`true`

**実装例**:
```typescript
canAcceptInput(key: string, frameCount: number): boolean {
  const lastFrame = this.lastInputFrame.get(key);

  if (lastFrame === undefined) {
    return true;
  }

  return frameCount - lastFrame >= this.inputCooldown;
}
```

### 4.6 完全な実装例

```typescript
const INPUT_COOLDOWN = 4;

export class InputHandlerService {
  private lastInputFrame: Map<string, number> = new Map();
  private inputCooldown: number = INPUT_COOLDOWN;

  constructor(
    private gameApplicationService: GameApplicationService
  ) {}

  handleKeyDown(key: string, gameId: string): void {
    // 前述の実装
  }

  handleKeyUp(key: string, gameId: string): void {
    // 前述の実装
  }

  canAcceptInput(key: string, frameCount: number): boolean {
    // 前述の実装
  }

  private updateLastInputFrame(key: string, frameCount: number): void {
    this.lastInputFrame.set(key, frameCount);
  }
}
```

## 5. GameDto（データ転送オブジェクト）

### 5.1 責務

- ドメインオブジェクトをプレゼンテーション層に渡すためのデータ構造
- シリアライズ可能な形式

### 5.2 型定義

```typescript
export interface GameDto {
  gameId: string;
  state: 'playing' | 'paused' | 'gameOver';
  score: number;
  field: (string | null)[][];
  fallingBlock: {
    pattern: string[][];
    position: { x: number; y: number };
    rotation: number;
  } | null;
  nextBlock: string[][];
}
```

### 5.3 プロパティ

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `gameId` | `string` | ゲームの一意識別子 |
| `state` | `'playing' \| 'paused' \| 'gameOver'` | ゲームの状態 |
| `score` | `number` | 現在のスコア |
| `field` | `(string \| null)[][]` | フィールドの状態（色の文字列表現） |
| `fallingBlock` | オブジェクト \| `null` | 落下ブロックの情報 |
| `nextBlock` | `string[][]` | 次のブロックの情報 |

### 5.4 使用例

```typescript
const gameDto: GameDto = {
  gameId: '123e4567-e89b-12d3-a456-426614174000',
  state: 'playing',
  score: 120,
  field: [
    [null, null, null, null, null, null, null, null],
    // ... 20 rows
  ],
  fallingBlock: {
    pattern: [
      ['blue', 'blue'],
      ['blue', 'blue']
    ],
    position: { x: 3, y: 5 },
    rotation: 0
  },
  nextBlock: [
    ['red', 'yellow'],
    ['red', 'red']
  ]
};

// プレゼンテーション層で使用
renderer.render(gameDto);
```

## 6. シーケンス図

### 6.1 ゲーム開始シーケンス

```
User   InputHandler   GameAppService   Game   Repository
  │          │               │          │         │
  │ keyDown('r')             │          │         │
  ├────────>│               │          │         │
  │          │ startNewGame()│          │         │
  │          ├──────────────>│          │         │
  │          │               │ create() │         │
  │          │               ├────────>│         │
  │          │               │<─────────┤         │
  │          │               │ start()  │         │
  │          │               ├────────>│         │
  │          │               │<─────────┤         │
  │          │               │ save()   │         │
  │          │               ├──────────────────>│
  │          │               │<───────────────────┤
  │          │               │ toDto()  │         │
  │          │               ├────────>│         │
  │          │<──────────────┤ (dto)    │         │
  │<─────────┤               │          │         │
```

### 6.2 ブロック移動シーケンス

```
User   InputHandler   GameAppService   Game   Repository
  │          │               │          │         │
  │ keyDown('ArrowLeft')     │          │         │
  ├────────>│               │          │         │
  │          │ moveBlockLeft()          │         │
  │          ├──────────────>│          │         │
  │          │               │ findById()          │
  │          │               ├──────────────────>│
  │          │               │<───────────────────┤
  │          │               │ moveLeft()         │
  │          │               ├────────>│         │
  │          │               │<─────────┤         │
  │          │               │ save()   │         │
  │          │               ├──────────────────>│
  │          │<──────────────┤          │         │
  │<─────────┤               │          │         │
```

### 6.3 フレーム更新シーケンス

```
GameLoop   GameAppService   Game   Repository
    │             │          │         │
    │ updateFrame()          │         │
    ├───────────>│          │         │
    │             │ findById()         │
    │             ├──────────────────>│
    │             │<───────────────────┤
    │             │ update() │         │
    │             ├────────>│         │
    │             │<─────────┤         │
    │             │ save()   │         │
    │             ├──────────────────>│
    │             │ toDto()  │         │
    │             ├────────>│         │
    │<────────────┤ (dto)    │         │
```

## 7. テストケース

### 7.1 GameApplicationService

```typescript
describe('GameApplicationService', () => {
  let service: GameApplicationService;
  let repository: GameRepository;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
    const blockPatternGenerator = new BlockPatternGeneratorService();
    const blockMatchingService = new BlockMatchingService();
    const blockFallService = new BlockFallService();
    const blockRemovalService = new BlockRemovalService(
      blockMatchingService,
      blockFallService
    );

    service = new GameApplicationService(
      repository,
      blockPatternGenerator,
      blockMatchingService,
      blockRemovalService
    );
  });

  test('新しいゲームを開始できる', () => {
    const gameDto = service.startNewGame();

    expect(gameDto.gameId).toBeDefined();
    expect(gameDto.state).toBe('playing');
    expect(gameDto.score).toBe(0);
  });

  test('ゲームを一時停止できる', () => {
    const gameDto = service.startNewGame();

    service.pauseGame(gameDto.gameId);

    const updatedDto = service.getGameState(gameDto.gameId);
    expect(updatedDto.state).toBe('paused');
  });

  test('ブロックを移動できる', () => {
    const gameDto = service.startNewGame();
    const initialPosition = gameDto.fallingBlock?.position.x;

    service.moveBlockLeft(gameDto.gameId);

    const updatedDto = service.getGameState(gameDto.gameId);
    const newPosition = updatedDto.fallingBlock?.position.x;

    expect(newPosition).toBe(initialPosition! - 1);
  });
});
```

### 7.2 InputHandlerService

```typescript
describe('InputHandlerService', () => {
  let service: InputHandlerService;
  let gameApplicationService: GameApplicationService;

  beforeEach(() => {
    // セットアップ
    gameApplicationService = new GameApplicationService(/* ... */);
    service = new InputHandlerService(gameApplicationService);
  });

  test('左キー押下でブロックを左に移動', () => {
    const gameDto = gameApplicationService.startNewGame();

    service.handleKeyDown('ArrowLeft', gameDto.gameId);

    const updatedDto = gameApplicationService.getGameState(gameDto.gameId);
    // 検証
  });

  test('下キー押下で高速落下が有効化される', () => {
    const gameDto = gameApplicationService.startNewGame();

    service.handleKeyDown('ArrowDown', gameDto.gameId);

    // 高速落下が有効化されていることを検証
  });

  test('下キー解放で高速落下が無効化される', () => {
    const gameDto = gameApplicationService.startNewGame();

    service.handleKeyDown('ArrowDown', gameDto.gameId);
    service.handleKeyUp('ArrowDown', gameDto.gameId);

    // 高速落下が無効化されていることを検証
  });
});
```

## 8. まとめ

このドキュメントでは、アプリケーション層の以下のコンポーネントを詳細に設計しました：

1. **GameApplicationService**: ゲームのユースケースを実行
2. **InputHandlerService**: ユーザー入力を処理
3. **GameDto**: ドメインオブジェクトをプレゼンテーション層に渡すデータ構造

アプリケーション層は、ドメイン層のビジネスロジックを組み合わせて、ユースケースを実現します。次のステップでは、インフラ層とプレゼンテーション層の詳細設計を行います。
