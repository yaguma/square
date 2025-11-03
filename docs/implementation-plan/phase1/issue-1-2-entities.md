# [Phase 1-2] エンティティの実装

## 概要

ドメイン層のエンティティ（Entity）を実装します。エンティティは一意の識別子を持ち、ライフサイクルを通じて状態が変化するオブジェクトです。

## 参照ドキュメント

- `docs/design/entities-detailed-design.md`
- `docs/design/integration-design.md`

## 実装対象

以下の3つのエンティティを実装します：

### 1. Field（ゲームフィールド）

**ファイル**: `src/domain/models/entities/Field.ts`

**責務**: ゲームフィールドの状態を管理

**定数**:
```typescript
export const FIELD_WIDTH = 8;
export const FIELD_HEIGHT = 20;
```

**属性**:
- `_width: number` - フィールドの幅（8固定）
- `_height: number` - フィールドの高さ（20固定）
- `_grid: (Block | null)[][]` - ブロック配置の2次元配列

**メソッド**:
- `static create(width?: number, height?: number): Field`
- `get width(): number`
- `get height(): number`
- `get grid(): (Block | null)[][]`
- `placeBlock(position: Position, block: Block): void`
- `removeBlock(position: Position): void`
- `getBlock(position: Position): Block | null`
- `isEmpty(position: Position): boolean`
- `isValidPosition(position: Position): boolean`
- `clear(): void`
- `clone(): Field`
- `hasBlockInTopRow(): boolean`

**不変条件**:
- フィールドのサイズは常に8x20
- グリッドの各要素はBlockまたはnull
- 無効な位置へのアクセスは許可されない

---

### 2. FallingBlock（落下ブロック）

**ファイル**: `src/domain/models/entities/FallingBlock.ts`

**責務**: 現在落下中のブロックの状態を管理

**型定義**:
```typescript
export type Direction = 'left' | 'right' | 'down';
export type RotationDirection = 'clockwise' | 'counterclockwise';

export interface BlockWithPosition {
  block: Block;
  position: Position;
}
```

**属性**:
- `_pattern: BlockPattern` - ブロックパターン
- `_position: Position` - 現在位置（左上の座標）
- `_rotation: Rotation` - 回転状態（0, 90, 180, 270度）

**メソッド**:
- `static create(pattern: BlockPattern, position?: Position): FallingBlock`
- `get pattern(): BlockPattern`
- `get position(): Position`
- `get rotation(): Rotation`
- `moveLeft(): void`
- `moveRight(): void`
- `moveDown(): void`
- `rotateClockwise(): void`
- `rotateCounterClockwise(): void`
- `canMove(direction: Direction, field: Field): boolean`
- `canRotate(direction: RotationDirection, field: Field): boolean`
- `getBlocks(): BlockWithPosition[]`
- `setPosition(position: Position): void`
- `setRotation(rotation: Rotation): void`

**不変条件**:
- パターンは常に有効なBlockPattern
- 回転は常に0, 90, 180, 270度のいずれか
- 位置は常に有効なPosition

---

### 3. Game（ゲーム）

**ファイル**: `src/domain/models/entities/Game.ts`

**責務**: ゲーム全体のライフサイクルを管理

**定数**:
```typescript
export const NORMAL_FALL_SPEED = 30; // 30フレームで1マス
export const FAST_FALL_SPEED = 5;    // 5フレームで1マス
```

**属性**:
- `_gameId: string` - ゲームの一意識別子
- `_state: GameState` - ゲームの状態
- `_field: Field` - ゲームフィールド
- `_fallingBlock: FallingBlock | null` - 現在落下中のブロック
- `_nextBlock: BlockPattern` - 次に落ちてくるブロック
- `_score: Score` - 現在のスコア
- `_frameCount: number` - ゲーム開始からのフレーム数
- `_fallSpeed: number` - 落下速度（フレーム数）
- `_isFastFalling: boolean` - 高速落下中かどうか

**メソッド**:
- `static create(gameId: string): Game`
- `get gameId(): string`
- `get state(): GameState`
- `get field(): Field`
- `get fallingBlock(): FallingBlock | null`
- `get nextBlock(): BlockPattern`
- `get score(): Score`
- `get frameCount(): number`
- `start(): void`
- `pause(): void`
- `resume(): void`
- `restart(): void`
- `update(): void` - ★最も重要なメソッド
- `moveFallingBlockLeft(): void`
- `moveFallingBlockRight(): void`
- `rotateFallingBlockClockwise(): void`
- `rotateFallingBlockCounterClockwise(): void`
- `enableFastFall(): void`
- `disableFastFall(): void`
- `dropInstantly(): void`
- `isGameOver(): boolean`

**プライベートメソッド**:
- `landBlock(): void` - 接地処理（重要）

**不変条件**:
- gameIdは一意で不変
- stateは常にPlaying、Paused、GameOverのいずれか
- scoreは常に0以上
- frameCountは常に0以上
- 同時に落下できるブロックは1つのみ
- ゲームオーバー時はstate === GameState.GameOver

---

## 実装の順序

1. **Field** - 他のエンティティの基盤となるため最初に実装
2. **FallingBlock** - Fieldに依存
3. **Game** - Field, FallingBlockに依存

---

## 重要な実装ポイント

### Game.update()メソッド

このメソッドは1フレームごとに呼び出され、ゲームの状態を更新します。

**処理フロー**:
```typescript
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
```

### Game.landBlock()メソッド

ブロックが接地したときの処理。消去判定、連鎖処理を含む最も複雑な処理です。

**処理フロー**:
1. フィールドにブロックを固定
2. 消去可能な矩形を検索
3. ブロック削除
4. 自由落下
5. 連鎖処理
6. スコア加算
7. ゲームオーバー判定
8. 次のブロック生成

**注意**: この実装には、ドメインサービス（Phase 1-3で実装予定）が必要です。Phase 1-3完了後に実装します。

---

## テスト

### テストファイル

- `tests/domain/models/entities/Field.test.ts`
- `tests/domain/models/entities/FallingBlock.test.ts`
- `tests/domain/models/entities/Game.test.ts`

### テストケース例（Field）

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
    expect(field.isEmpty(position)).toBe(false);
  });

  test('ブロックを削除できる', () => {
    const field = Field.create();
    const position = Position.create(3, 5);
    const block = Block.create(Color.BLUE);

    field.placeBlock(position, block);
    field.removeBlock(position);
    expect(field.isEmpty(position)).toBe(true);
  });

  test('既にブロックがある位置に配置しようとするとエラー', () => {
    const field = Field.create();
    const position = Position.create(3, 5);
    const block = Block.create(Color.BLUE);

    field.placeBlock(position, block);
    expect(() => field.placeBlock(position, block)).toThrow();
  });

  test('無効な位置に配置しようとするとエラー', () => {
    const field = Field.create();
    const position = Position.create(10, 5); // 範囲外
    const block = Block.create(Color.BLUE);

    expect(() => field.placeBlock(position, block)).toThrow();
  });

  test('最上段にブロックがある場合を検出できる', () => {
    const field = Field.create();
    field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
    expect(field.hasBlockInTopRow()).toBe(true);
  });

  test('フィールドをクリアできる', () => {
    const field = Field.create();
    field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
    field.clear();
    expect(field.isEmpty(Position.create(0, 0))).toBe(true);
  });
});
```

### テストケース例（FallingBlock）

```typescript
describe('FallingBlock', () => {
  test('正常に落下ブロックを作成できる', () => {
    const pattern = createTestPattern();
    const fallingBlock = FallingBlock.create(pattern);

    expect(fallingBlock.pattern).toBe(pattern);
    expect(fallingBlock.rotation).toBe(0);
  });

  test('左に移動できる', () => {
    const pattern = createTestPattern();
    const fallingBlock = FallingBlock.create(pattern, Position.create(3, 0));

    fallingBlock.moveLeft();
    expect(fallingBlock.position.x).toBe(2);
  });

  test('回転できる', () => {
    const pattern = createTestPattern();
    const fallingBlock = FallingBlock.create(pattern);

    fallingBlock.rotateClockwise();
    expect(fallingBlock.rotation).toBe(90);

    fallingBlock.rotateClockwise();
    expect(fallingBlock.rotation).toBe(180);
  });

  test('移動可否を判定できる', () => {
    const field = Field.create();
    const pattern = createTestPattern();
    const fallingBlock = FallingBlock.create(pattern, Position.create(0, 0));

    expect(fallingBlock.canMove('left', field)).toBe(false); // 左端
    expect(fallingBlock.canMove('right', field)).toBe(true);
    expect(fallingBlock.canMove('down', field)).toBe(true);
  });

  test('ブロック配置を取得できる', () => {
    const pattern = createTestPattern();
    const fallingBlock = FallingBlock.create(pattern, Position.create(3, 5));

    const blocks = fallingBlock.getBlocks();
    expect(blocks.length).toBeGreaterThan(0);

    // 最初のブロックの位置が正しいか確認
    const firstBlock = blocks[0];
    expect(firstBlock.position.x).toBeGreaterThanOrEqual(3);
    expect(firstBlock.position.y).toBeGreaterThanOrEqual(5);
  });
});
```

### テストケース例（Game）

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

  test('ブロックを移動できる', () => {
    const game = Game.create('test-game-id');
    game.start();

    const initialX = game.fallingBlock?.position.x;
    game.moveFallingBlockLeft();

    const newX = game.fallingBlock?.position.x;
    expect(newX).toBe(initialX! - 1);
  });
});
```

---

## 完了条件

- [ ] Field, FallingBlock, Gameの3つのエンティティが実装されている
- [ ] すべてのメソッドが正しく動作する
- [ ] すべての単体テストが成功する
- [ ] テストカバレッジが80%以上
- [ ] TypeScriptのコンパイルエラーがない
- [ ] ESLintの警告がない
- [ ] ドキュメントコメント（JSDoc）が記載されている
- [ ] 不変条件がすべて守られている

**注意**: `Game.landBlock()`の完全な実装はPhase 1-3（ドメインサービス）完了後に行います。

---

## 見積もり

**工数**: 3-4日

**内訳**:
- Field: 1日
- FallingBlock: 1日
- Game（基本機能のみ）: 1-2日
- テスト作成: 1日

---

## 依存関係

**前提**:
- Issue 1.1: 値オブジェクトの実装（Position, Color, Block, BlockPattern, Score, GameState）

**後続のタスク**:
- Issue 1.3: ドメインサービスの実装（Game.landBlock()の完全な実装に必要）

---

## 注意事項

- Gameエンティティの`landBlock()`メソッドは、Phase 1-3でドメインサービスを実装した後に完全な実装を行う
- 現時点では、`landBlock()`は基本的な処理（ブロックをフィールドに固定）のみ実装し、消去判定と連鎖処理はスタブまたはTODOコメントにする
- FieldとFallingBlockは独立しているため、並行して実装可能
- Gameは両方に依存するため、最後に実装

---

## 参考コード

詳細な実装例は `docs/design/entities-detailed-design.md` を参照してください。
