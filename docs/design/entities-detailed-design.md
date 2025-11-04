# エンティティ 詳細設計書

## 1. 概要

このドキュメントは、Squareゲームで使用するエンティティ（Entity）の詳細設計を定義します。エンティティは一意の識別子を持ち、ライフサイクルを通じて状態が変化するオブジェクトです。

## 2. エンティティの共通原則

### 2.1 アイデンティティ

- すべてのエンティティは一意の識別子を持つ
- 等価性は識別子で判定される（内部状態ではない）

### 2.2 状態の変更

- エンティティは状態を持ち、その状態は変更可能
- 状態変更は明示的なメソッドを通じて行う
- カプセル化を守り、内部状態を直接変更させない

### 2.3 不変条件（Invariant）

- エンティティは常に有効な状態を維持する
- 不正な状態遷移を防ぐ

## 3. Field（ゲームフィールド）

### 3.1 責務

- ゲームフィールドの状態を管理
- 固定されたブロックの配置を保持
- ブロックの配置・削除・取得を提供
- フィールドの有効性検証

### 3.2 クラス図

```
┌─────────────────────────────────────────┐
│              Field                      │
├─────────────────────────────────────────┤
│ - _width: number                        │
│ - _height: number                       │
│ - _grid: (Block | null)[][]             │
├─────────────────────────────────────────┤
│ + static create(width, height)          │
│ + get width(): number                   │
│ + get height(): number                  │
│ + get grid(): (Block | null)[][]        │
│ + placeBlock(position, block): void     │
│ + removeBlock(position): void           │
│ + getBlock(position): Block | null      │
│ + isEmpty(position): boolean            │
│ + isValidPosition(position): boolean    │
│ + clear(): void                         │
│ + clone(): Field                        │
│ + hasBlockInTopRow(): boolean           │
└─────────────────────────────────────────┘
```

### 3.3 定数

```typescript
export const FIELD_WIDTH = 8;
export const FIELD_HEIGHT = 20;
```

### 3.4 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_width` | `number` | フィールドの幅 | 8（固定） |
| `_height` | `number` | フィールドの高さ | 20（固定） |
| `_grid` | `(Block \| null)[][]` | ブロック配置の2次元配列 | width × height のサイズ |

### 3.5 メソッド詳細

#### create(width: number, height: number): Field

**説明**: Fieldインスタンスを生成するファクトリメソッド

**パラメータ**:
- `width`: フィールドの幅（デフォルト: 8）
- `height`: フィールドの高さ（デフォルト: 20）

**戻り値**: `Field` - 空のフィールド

**使用例**:
```typescript
const field = Field.create(FIELD_WIDTH, FIELD_HEIGHT);
```

#### placeBlock(position: Position, block: Block): void

**説明**: 指定位置にブロックを配置する

**パラメータ**:
- `position`: 配置する座標
- `block`: 配置するブロック

**例外**:
- 位置が無効な場合、`Error`をスロー
- 既にブロックが存在する場合、`Error`をスロー

**副作用**: フィールドの状態を変更

**使用例**:
```typescript
field.placeBlock(Position.create(3, 5), Block.create(Color.BLUE));
```

#### removeBlock(position: Position): void

**説明**: 指定位置のブロックを削除する

**パラメータ**:
- `position`: 削除する座標

**例外**:
- 位置が無効な場合、`Error`をスロー

**副作用**: フィールドの状態を変更

**使用例**:
```typescript
field.removeBlock(Position.create(3, 5));
```

#### getBlock(position: Position): Block | null

**説明**: 指定位置のブロックを取得する

**パラメータ**:
- `position`: 取得する座標

**戻り値**: `Block | null` - ブロック、または存在しない場合null

**使用例**:
```typescript
const block = field.getBlock(Position.create(3, 5));
if (block !== null) {
  console.log(block.color);
}
```

#### isEmpty(position: Position): boolean

**説明**: 指定位置が空かどうかを判定

**パラメータ**:
- `position`: 判定する座標

**戻り値**: `boolean` - 空の場合`true`

**使用例**:
```typescript
if (field.isEmpty(Position.create(3, 5))) {
  // ブロックを配置可能
}
```

#### isValidPosition(position: Position): boolean

**説明**: 指定位置がフィールド内かどうかを判定

**パラメータ**:
- `position`: 判定する座標

**戻り値**: `boolean` - フィールド内の場合`true`

**使用例**:
```typescript
if (field.isValidPosition(Position.create(3, 5))) {
  // 有効な位置
}
```

#### clear(): void

**説明**: フィールドをクリアし、全てのブロックを削除

**副作用**: フィールドの状態を変更

**使用例**:
```typescript
field.clear();
```

#### hasBlockInTopRow(): boolean

**説明**: 最上段（Y座標0）にブロックが存在するかを判定

**戻り値**: `boolean` - 存在する場合`true`

**使用目的**: ゲームオーバー判定に使用

**使用例**:
```typescript
if (field.hasBlockInTopRow()) {
  // ゲームオーバー
}
```

### 3.6 実装例

```typescript
export const FIELD_WIDTH = 8;
export const FIELD_HEIGHT = 20;

export class Field {
  private constructor(
    private readonly _width: number,
    private readonly _height: number,
    private _grid: (Block | null)[][]
  ) {}

  static create(width: number = FIELD_WIDTH, height: number = FIELD_HEIGHT): Field {
    const grid: (Block | null)[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = new Array(width).fill(null);
    }
    return new Field(width, height, grid);
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get grid(): (Block | null)[][] {
    return this._grid.map(row => [...row]);
  }

  placeBlock(position: Position, block: Block): void {
    if (!this.isValidPosition(position)) {
      throw new Error(`Invalid position: ${position.toString()}`);
    }
    if (!this.isEmpty(position)) {
      throw new Error(`Position already occupied: ${position.toString()}`);
    }
    this._grid[position.y][position.x] = block;
  }

  removeBlock(position: Position): void {
    if (!this.isValidPosition(position)) {
      throw new Error(`Invalid position: ${position.toString()}`);
    }
    this._grid[position.y][position.x] = null;
  }

  getBlock(position: Position): Block | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    return this._grid[position.y][position.x];
  }

  isEmpty(position: Position): boolean {
    return this.getBlock(position) === null;
  }

  isValidPosition(position: Position): boolean {
    return position.isValid(this._width, this._height);
  }

  clear(): void {
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        this._grid[y][x] = null;
      }
    }
  }

  hasBlockInTopRow(): boolean {
    for (let x = 0; x < this._width; x++) {
      if (this._grid[0][x] !== null) {
        return true;
      }
    }
    return false;
  }

  clone(): Field {
    const newField = Field.create(this._width, this._height);
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        if (this._grid[y][x] !== null) {
          newField.placeBlock(
            Position.create(x, y),
            this._grid[y][x]!
          );
        }
      }
    }
    return newField;
  }
}
```

### 3.7 不変条件

- フィールドのサイズは常に8x20
- グリッドの各要素はBlockまたはnull
- 無効な位置へのアクセスは許可されない

## 4. FallingBlock（落下ブロック）

### 4.1 責務

- 現在落下中のブロックの状態を管理
- ブロックの移動（左右下）
- ブロックの回転（時計回り、反時計回り）
- 移動・回転の可否判定

### 4.2 クラス図

```
┌─────────────────────────────────────────────┐
│           FallingBlock                      │
├─────────────────────────────────────────────┤
│ - _pattern: BlockPattern                    │
│ - _position: Position                       │
│ - _rotation: Rotation                       │
├─────────────────────────────────────────────┤
│ + static create(pattern, position)          │
│ + get pattern(): BlockPattern               │
│ + get position(): Position                  │
│ + get rotation(): Rotation                  │
│ + moveLeft(): void                          │
│ + moveRight(): void                         │
│ + moveDown(): void                          │
│ + rotateClockwise(): void                   │
│ + rotateCounterClockwise(): void            │
│ + canMove(direction, field): boolean        │
│ + canRotate(direction, field): boolean      │
│ + getBlocks(): BlockWithPosition[]          │
│ + setPosition(position): void               │
│ + setRotation(rotation): void               │
└─────────────────────────────────────────────┘
```

### 4.3 型定義

```typescript
export type Direction = 'left' | 'right' | 'down';
export type RotationDirection = 'clockwise' | 'counterclockwise';

export interface BlockWithPosition {
  block: Block;
  position: Position;
}
```

### 4.4 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_pattern` | `BlockPattern` | ブロックパターン | 必須 |
| `_position` | `Position` | 現在位置（左上の座標） | 必須 |
| `_rotation` | `Rotation` | 回転状態（0, 90, 180, 270度） | 必須 |

### 4.5 メソッド詳細

#### create(pattern: BlockPattern, position?: Position): FallingBlock

**説明**: FallingBlockインスタンスを生成

**パラメータ**:
- `pattern`: ブロックパターン
- `position`: 初期位置（省略時はフィールド中央上部）

**戻り値**: `FallingBlock`

**使用例**:
```typescript
const fallingBlock = FallingBlock.create(
  pattern,
  Position.create(3, 0)
);
```

#### moveLeft(): void

**説明**: ブロックを左に1マス移動

**副作用**: 位置を変更

**使用例**:
```typescript
if (fallingBlock.canMove('left', field)) {
  fallingBlock.moveLeft();
}
```

#### moveRight(): void

**説明**: ブロックを右に1マス移動

**副作用**: 位置を変更

#### moveDown(): void

**説明**: ブロックを下に1マス移動

**副作用**: 位置を変更

#### rotateClockwise(): void

**説明**: ブロックを時計回りに90度回転

**副作用**: 回転状態を変更

**使用例**:
```typescript
if (fallingBlock.canRotate('clockwise', field)) {
  fallingBlock.rotateClockwise();
}
```

#### rotateCounterClockwise(): void

**説明**: ブロックを反時計回りに90度回転

**副作用**: 回転状態を変更

#### canMove(direction: Direction, field: Field): boolean

**説明**: 指定方向に移動可能かを判定

**パラメータ**:
- `direction`: 移動方向（'left', 'right', 'down'）
- `field`: ゲームフィールド

**戻り値**: `boolean` - 移動可能な場合`true`

**判定条件**:
- フィールドの範囲内
- 移動先にブロックがない

**使用例**:
```typescript
if (fallingBlock.canMove('down', field)) {
  fallingBlock.moveDown();
} else {
  // 接地
}
```

#### canRotate(direction: RotationDirection, field: Field): boolean

**説明**: 指定方向に回転可能かを判定

**パラメータ**:
- `direction`: 回転方向（'clockwise', 'counterclockwise'）
- `field`: ゲームフィールド

**戻り値**: `boolean` - 回転可能な場合`true`

**判定条件**:
- 回転後の位置がフィールドの範囲内
- 回転後の位置にブロックがない

#### getBlocks(): BlockWithPosition[]

**説明**: 落下ブロックを構成する各ブロックの絶対座標を取得

**戻り値**: `BlockWithPosition[]` - ブロックと座標のペアの配列

**使用目的**: 描画、衝突判定に使用

**使用例**:
```typescript
const blocks = fallingBlock.getBlocks();
blocks.forEach(({ block, position }) => {
  field.placeBlock(position, block);
});
```

### 4.6 実装例

```typescript
export type Direction = 'left' | 'right' | 'down';
export type RotationDirection = 'clockwise' | 'counterclockwise';

export interface BlockWithPosition {
  block: Block;
  position: Position;
}

export class FallingBlock {
  private constructor(
    private readonly _pattern: BlockPattern,
    private _position: Position,
    private _rotation: Rotation
  ) {}

  static create(pattern: BlockPattern, position?: Position): FallingBlock {
    const defaultPosition = Position.create(3, 0); // フィールド中央上部
    return new FallingBlock(pattern, position || defaultPosition, 0);
  }

  get pattern(): BlockPattern {
    return this._pattern;
  }

  get position(): Position {
    return this._position;
  }

  get rotation(): Rotation {
    return this._rotation;
  }

  moveLeft(): void {
    this._position = Position.create(this._position.x - 1, this._position.y);
  }

  moveRight(): void {
    this._position = Position.create(this._position.x + 1, this._position.y);
  }

  moveDown(): void {
    this._position = Position.create(this._position.x, this._position.y + 1);
  }

  rotateClockwise(): void {
    this._rotation = ((this._rotation + 90) % 360) as Rotation;
  }

  rotateCounterClockwise(): void {
    this._rotation = ((this._rotation - 90 + 360) % 360) as Rotation;
  }

  canMove(direction: Direction, field: Field): boolean {
    let newPosition: Position;

    switch (direction) {
      case 'left':
        newPosition = Position.create(this._position.x - 1, this._position.y);
        break;
      case 'right':
        newPosition = Position.create(this._position.x + 1, this._position.y);
        break;
      case 'down':
        newPosition = Position.create(this._position.x, this._position.y + 1);
        break;
    }

    return this.canPlaceAt(newPosition, this._rotation, field);
  }

  canRotate(direction: RotationDirection, field: Field): boolean {
    let newRotation: Rotation;

    if (direction === 'clockwise') {
      newRotation = ((this._rotation + 90) % 360) as Rotation;
    } else {
      newRotation = ((this._rotation - 90 + 360) % 360) as Rotation;
    }

    return this.canPlaceAt(this._position, newRotation, field);
  }

  private canPlaceAt(position: Position, rotation: Rotation, field: Field): boolean {
    const rotatedBlocks = this._pattern.rotate(rotation);

    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        if (rotatedBlocks[y][x] !== null) {
          const absPos = Position.create(position.x + x, position.y + y);

          if (!field.isValidPosition(absPos)) {
            return false;
          }

          if (!field.isEmpty(absPos)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  getBlocks(): BlockWithPosition[] {
    const blocks: BlockWithPosition[] = [];
    const rotatedBlocks = this._pattern.rotate(this._rotation);

    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        if (rotatedBlocks[y][x] !== null) {
          blocks.push({
            block: rotatedBlocks[y][x]!,
            position: Position.create(this._position.x + x, this._position.y + y)
          });
        }
      }
    }

    return blocks;
  }

  setPosition(position: Position): void {
    this._position = position;
  }

  setRotation(rotation: Rotation): void {
    this._rotation = rotation;
  }
}
```

### 4.7 不変条件

- パターンは常に有効なBlockPattern
- 回転は常に0, 90, 180, 270度のいずれか
- 位置は常に有効なPosition

## 5. Game（ゲーム）

### 5.1 責務

- ゲーム全体のライフサイクル管理
- ゲーム状態の管理
- フレーム更新処理の統括
- ゲームルールの適用

### 5.2 クラス図

```
┌─────────────────────────────────────────────┐
│              Game                           │
├─────────────────────────────────────────────┤
│ - _gameId: string                           │
│ - _state: GameState                         │
│ - _field: Field                             │
│ - _fallingBlock: FallingBlock | null        │
│ - _nextBlock: BlockPattern                  │
│ - _score: Score                             │
│ - _frameCount: number                       │
│ - _fallSpeed: number                        │
│ - _isFastFalling: boolean                   │
├─────────────────────────────────────────────┤
│ + static create(gameId)                     │
│ + get gameId(): string                      │
│ + get state(): GameState                    │
│ + get field(): Field                        │
│ + get fallingBlock(): FallingBlock | null   │
│ + get nextBlock(): BlockPattern             │
│ + get score(): Score                        │
│ + get frameCount(): number                  │
│ + start(): void                             │
│ + pause(): void                             │
│ + resume(): void                            │
│ + restart(): void                           │
│ + update(): void                            │
│ + moveFallingBlockLeft(): void              │
│ + moveFallingBlockRight(): void             │
│ + rotateFallingBlockClockwise(): void       │
│ + rotateFallingBlockCounterClockwise(): vo  │
│ + enableFastFall(): void                    │
│ + disableFastFall(): void                   │
│ + dropInstantly(): void                     │
│ + isGameOver(): boolean                     │
└─────────────────────────────────────────────┘
```

### 5.3 定数

```typescript
export const NORMAL_FALL_SPEED = 30; // 30フレームで1マス
export const FAST_FALL_SPEED = 5;    // 5フレームで1マス
```

### 5.4 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_gameId` | `string` | ゲームの一意識別子 | 必須、UUID |
| `_state` | `GameState` | ゲームの状態 | Playing/Paused/GameOver |
| `_field` | `Field` | ゲームフィールド | 必須 |
| `_fallingBlock` | `FallingBlock \| null` | 現在落下中のブロック | nullの場合もある |
| `_nextBlock` | `BlockPattern` | 次に落ちてくるブロック | 必須 |
| `_score` | `Score` | 現在のスコア | 必須 |
| `_frameCount` | `number` | ゲーム開始からのフレーム数 | 0以上 |
| `_fallSpeed` | `number` | 落下速度（フレーム数） | 正の整数 |
| `_isFastFalling` | `boolean` | 高速落下中かどうか | true/false |

### 5.5 メソッド詳細

#### create(gameId: string): Game

**説明**: Gameインスタンスを生成するファクトリメソッド

**パラメータ**:
- `gameId`: ゲームの一意識別子（UUID推奨）

**戻り値**: `Game` - 初期化されたゲーム

**初期状態**:
- state: Playing
- field: 空のフィールド
- fallingBlock: null（start()で生成）
- score: 0
- frameCount: 0

**使用例**:
```typescript
const game = Game.create(crypto.randomUUID());
game.start();
```

#### start(): void

**説明**: ゲームを開始する

**副作用**:
- 状態をPlayingに設定
- 最初の落下ブロックを生成
- 次のブロックを生成

**使用例**:
```typescript
game.start();
```

#### pause(): void

**説明**: ゲームを一時停止する

**前提条件**: 状態がPlaying

**副作用**: 状態をPausedに設定

#### resume(): void

**説明**: ゲームを再開する

**前提条件**: 状態がPaused

**副作用**: 状態をPlayingに設定

#### restart(): void

**説明**: ゲームをリセットして再開する

**副作用**:
- フィールドをクリア
- スコアを0にリセット
- フレームカウントを0にリセット
- 新しいブロックを生成
- 状態をPlayingに設定

#### update(): void

**説明**: 1フレーム分のゲーム状態を更新する

**処理フロー**:
1. 状態がPlayingでない場合は何もしない
2. フレームカウントを増加
3. 落下ブロックがない場合、新しいブロックを生成
4. 落下タイミングをチェック
5. 落下可能なら下に移動
6. 落下不可なら接地処理
   - フィールドにブロックを固定
   - 消去判定
   - ブロック削除
   - 自由落下
   - 連鎖処理
   - スコア加算
   - ゲームオーバー判定
   - 次のブロック生成

**副作用**: ゲームの状態全体を更新

**使用例**:
```typescript
// ゲームループ内で毎フレーム呼び出し
setInterval(() => {
  game.update();
}, 1000 / 30); // 30fps
```

#### moveFallingBlockLeft(): void

**説明**: 落下ブロックを左に移動

**前提条件**:
- 状態がPlaying
- 落下ブロックが存在

**使用例**:
```typescript
game.moveFallingBlockLeft();
```

#### moveFallingBlockRight(): void

**説明**: 落下ブロックを右に移動

**前提条件**:
- 状態がPlaying
- 落下ブロックが存在

#### rotateFallingBlockClockwise(): void

**説明**: 落下ブロックを時計回りに回転

**前提条件**:
- 状態がPlaying
- 落下ブロックが存在

#### rotateFallingBlockCounterClockwise(): void

**説明**: 落下ブロックを反時計回りに回転

**前提条件**:
- 状態がPlaying
- 落下ブロックが存在

#### enableFastFall(): void

**説明**: 高速落下を有効化

**副作用**: `_isFastFalling`をtrueに設定、`_fallSpeed`を5に変更

#### disableFastFall(): void

**説明**: 高速落下を無効化

**副作用**: `_isFastFalling`をfalseに設定、`_fallSpeed`を30に変更

#### dropInstantly(): void

**説明**: 落下ブロックを即座に接地位置まで移動

**処理**:
- 落下可能な最下位置まで一気に移動
- 接地処理を実行

**使用例**:
```typescript
game.dropInstantly(); // スペースキー押下時
```

#### isGameOver(): boolean

**説明**: ゲームオーバー判定

**判定条件**:
- 最上段（Y座標0）にブロックが存在し、消去可能なブロックがない

**戻り値**: `boolean` - ゲームオーバーの場合`true`

### 5.6 実装例（一部）

```typescript
export const NORMAL_FALL_SPEED = 30;
export const FAST_FALL_SPEED = 5;

export class Game {
  private constructor(
    private readonly _gameId: string,
    private _state: GameState,
    private _field: Field,
    private _fallingBlock: FallingBlock | null,
    private _nextBlock: BlockPattern,
    private _score: Score,
    private _frameCount: number,
    private _fallSpeed: number,
    private _isFastFalling: boolean
  ) {}

  static create(gameId: string): Game {
    return new Game(
      gameId,
      GameState.Playing,
      Field.create(),
      null,
      BlockPatternGenerator.generate(), // 次のブロックを事前生成
      Score.zero(),
      0,
      NORMAL_FALL_SPEED,
      false
    );
  }

  get gameId(): string {
    return this._gameId;
  }

  get state(): GameState {
    return this._state;
  }

  get field(): Field {
    return this._field;
  }

  get fallingBlock(): FallingBlock | null {
    return this._fallingBlock;
  }

  get nextBlock(): BlockPattern {
    return this._nextBlock;
  }

  get score(): Score {
    return this._score;
  }

  get frameCount(): number {
    return this._frameCount;
  }

  start(): void {
    this._state = GameState.Playing;
    this._fallingBlock = FallingBlock.create(this._nextBlock);
    this._nextBlock = BlockPatternGenerator.generate();
  }

  pause(): void {
    if (this._state === GameState.Playing) {
      this._state = GameState.Paused;
    }
  }

  resume(): void {
    if (this._state === GameState.Paused) {
      this._state = GameState.Playing;
    }
  }

  restart(): void {
    this._field.clear();
    this._score = Score.zero();
    this._frameCount = 0;
    this._isFastFalling = false;
    this._fallSpeed = NORMAL_FALL_SPEED;
    this._nextBlock = BlockPatternGenerator.generate();
    this.start();
  }

  update(): void {
    if (this._state !== GameState.Playing) {
      return;
    }

    this._frameCount++;

    // 落下ブロックがない場合、新規生成
    if (this._fallingBlock === null) {
      this._fallingBlock = FallingBlock.create(this._nextBlock);
      this._nextBlock = BlockPatternGenerator.generate();

      // 生成直後に配置できない場合はゲームオーバー
      if (!this._fallingBlock.canMove('down', this._field)) {
        this._state = GameState.GameOver;
        return;
      }
    }

    // 落下タイミングのチェック
    if (this._frameCount % this._fallSpeed === 0) {
      if (this._fallingBlock.canMove('down', this._field)) {
        this._fallingBlock.moveDown();
      } else {
        // 接地処理
        this.landBlock();
      }
    }
  }

  private landBlock(): void {
    if (this._fallingBlock === null) {
      return;
    }

    // フィールドにブロックを固定
    const blocks = this._fallingBlock.getBlocks();
    blocks.forEach(({ block, position }) => {
      this._field.placeBlock(position, block);
    });

    // ブロックを削除
    this._fallingBlock = null;

    // 【実装タイミング】
    // Phase 1-2 (Issue 1-2): ここまでのスタブ実装（基本的なブロック固定のみ）
    // Phase 1-3 (Issue 1-3): 以下を追加実装
    //   - BlockMatchingServiceで消去判定
    //   - BlockRemovalServiceで削除と連鎖処理
    //   - スコア加算
    //   - 次のブロック生成

    // ゲームオーバー判定
    if (this.isGameOver()) {
      this._state = GameState.GameOver;
    }
  }

  moveFallingBlockLeft(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    if (this._fallingBlock.canMove('left', this._field)) {
      this._fallingBlock.moveLeft();
    }
  }

  moveFallingBlockRight(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    if (this._fallingBlock.canMove('right', this._field)) {
      this._fallingBlock.moveRight();
    }
  }

  rotateFallingBlockClockwise(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    if (this._fallingBlock.canRotate('clockwise', this._field)) {
      this._fallingBlock.rotateClockwise();
    }
  }

  rotateFallingBlockCounterClockwise(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    if (this._fallingBlock.canRotate('counterclockwise', this._field)) {
      this._fallingBlock.rotateCounterClockwise();
    }
  }

  enableFastFall(): void {
    this._isFastFalling = true;
    this._fallSpeed = FAST_FALL_SPEED;
  }

  disableFastFall(): void {
    this._isFastFalling = false;
    this._fallSpeed = NORMAL_FALL_SPEED;
  }

  dropInstantly(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    while (this._fallingBlock.canMove('down', this._field)) {
      this._fallingBlock.moveDown();
    }

    this.landBlock();
  }

  isGameOver(): boolean {
    return this._field.hasBlockInTopRow();
  }
}
```

### 5.7 不変条件

- gameIdは一意で不変
- stateは常にPlaying、Paused、GameOverのいずれか
- scoreは常に0以上
- frameCountは常に0以上
- 同時に落下できるブロックは1つのみ
- ゲームオーバー時はstate === GameState.GameOver

## 6. シーケンス図

### 6.1 ゲーム開始シーケンス

```
User          Game         Field      BlockPatternGenerator
  │             │            │                 │
  │ create()    │            │                 │
  ├───────────>│            │                 │
  │             │ create()   │                 │
  │             ├──────────>│                 │
  │             │<───────────┤                 │
  │             │            │                 │
  │ start()     │            │                 │
  ├───────────>│            │                 │
  │             │ generate() │                 │
  │             ├────────────────────────────>│
  │             │<─────────────────────────────┤
  │             │ (nextBlock)                  │
  │             │            │                 │
  │             │ create(nextBlock)            │
  │             ├──────────────────>           │
  │             │<───────────────────           │
  │             │ (fallingBlock)                │
  │<────────────┤            │                 │
```

### 6.2 ブロック移動シーケンス

```
User          Game         FallingBlock    Field
  │             │                 │          │
  │ moveLeft()  │                 │          │
  ├───────────>│                 │          │
  │             │ canMove(left)   │          │
  │             ├───────────────>│          │
  │             │                 │ isEmpty()│
  │             │                 ├────────>│
  │             │                 │<─────────┤
  │             │<────────────────┤ (true)   │
  │             │ (true)          │          │
  │             │ moveLeft()      │          │
  │             ├───────────────>│          │
  │             │<────────────────┤          │
  │<────────────┤                 │          │
```

### 6.3 ブロック接地と消去シーケンス

```
Game    FallingBlock   Field   BlockMatchingService   BlockRemovalService
  │          │           │              │                     │
  │ update() │           │              │                     │
  ├────────>│           │              │                     │
  │ canMove(down)        │              │                     │
  ├────────>│           │              │                     │
  │<─────────┤ (false)   │              │                     │
  │          │           │              │                     │
  │ landBlock()          │              │                     │
  ├─────────────────────>│              │                     │
  │ placeBlock() x4      │              │                     │
  │                      │              │                     │
  │ findMatchingRectangles()            │                     │
  ├────────────────────────────────────>│                     │
  │<─────────────────────────────────────┤ (rectangles)       │
  │                      │              │                     │
  │ removeBlocks(rectangles)            │                     │
  ├─────────────────────────────────────────────────────────>│
  │<──────────────────────────────────────────────────────────┤
  │                      │              │          (removedCount)
  │ add(removedCount)    │              │                     │
  ├────>                 │              │                     │
  │<─────                │              │                     │
```

## 7. テストケース

### 7.1 Field

```typescript
describe('Field', () => {
  test('正常にフィールドを作成できる', () => {
    const field = Field.create();
    expect(field.width).toBe(8);
    expect(field.height).toBe(20);
  });

  test('ブロックを配置できる', () => {
    const field = Field.create();
    const position = Position.create(3, 5);
    const block = Block.create(Color.BLUE);

    field.placeBlock(position, block);
    expect(field.getBlock(position)).toBe(block);
  });

  test('ブロックを削除できる', () => {
    const field = Field.create();
    const position = Position.create(3, 5);
    const block = Block.create(Color.BLUE);

    field.placeBlock(position, block);
    field.removeBlock(position);
    expect(field.isEmpty(position)).toBe(true);
  });

  test('最上段にブロックがある場合を検出できる', () => {
    const field = Field.create();
    field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
    expect(field.hasBlockInTopRow()).toBe(true);
  });
});
```

### 7.2 FallingBlock

```typescript
describe('FallingBlock', () => {
  test('正常に落下ブロックを作成できる', () => {
    const pattern = BlockPattern.create(/* ... */);
    const fallingBlock = FallingBlock.create(pattern);

    expect(fallingBlock.pattern).toBe(pattern);
    expect(fallingBlock.rotation).toBe(0);
  });

  test('左に移動できる', () => {
    const pattern = BlockPattern.create(/* ... */);
    const fallingBlock = FallingBlock.create(pattern, Position.create(3, 0));

    fallingBlock.moveLeft();
    expect(fallingBlock.position.x).toBe(2);
  });

  test('回転できる', () => {
    const pattern = BlockPattern.create(/* ... */);
    const fallingBlock = FallingBlock.create(pattern);

    fallingBlock.rotateClockwise();
    expect(fallingBlock.rotation).toBe(90);
  });

  test('移動可否を判定できる', () => {
    const field = Field.create();
    const pattern = BlockPattern.create(/* ... */);
    const fallingBlock = FallingBlock.create(pattern, Position.create(0, 0));

    expect(fallingBlock.canMove('left', field)).toBe(false); // 左端
    expect(fallingBlock.canMove('right', field)).toBe(true);
  });
});
```

### 7.3 Game

```typescript
describe('Game', () => {
  test('正常にゲームを作成できる', () => {
    const game = Game.create('test-game-id');
    expect(game.gameId).toBe('test-game-id');
    expect(game.state).toBe(GameState.Playing);
  });

  test('ゲームを開始できる', () => {
    const game = Game.create('test-game-id');
    game.start();

    expect(game.fallingBlock).not.toBeNull();
    expect(game.nextBlock).not.toBeNull();
  });

  test('ゲームを一時停止・再開できる', () => {
    const game = Game.create('test-game-id');
    game.start();

    game.pause();
    expect(game.state).toBe(GameState.Paused);

    game.resume();
    expect(game.state).toBe(GameState.Playing);
  });

  test('フレーム更新が正しく動作する', () => {
    const game = Game.create('test-game-id');
    game.start();

    const initialFrameCount = game.frameCount;
    game.update();
    expect(game.frameCount).toBe(initialFrameCount + 1);
  });
});
```

## 8. まとめ

このドキュメントでは、以下の3つのエンティティを詳細に設計しました：

1. **Field**: ゲームフィールドの状態管理
2. **FallingBlock**: 落下ブロックの移動と回転
3. **Game**: ゲーム全体のライフサイクル管理

これらのエンティティは、値オブジェクトを組み合わせて使用し、ゲームのコアロジックを実現します。次のステップでは、ドメインサービスの詳細設計を行います。
