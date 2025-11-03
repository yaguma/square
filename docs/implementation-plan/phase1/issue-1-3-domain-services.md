# [Phase 1-3] ドメインサービスの実装

## 概要

複数のエンティティや値オブジェクトにまたがるビジネスロジックを提供するドメインサービスを実装します。

## 参照ドキュメント

- `docs/design/domain-services-detailed-design.md`
- `docs/design/integration-design.md`

## 実装対象

以下の5つのドメインサービスを実装します：

### 1. CollisionDetectionService（衝突判定サービス）

**ファイル**: `src/domain/services/CollisionDetectionService.ts`

**責務**: ブロックの衝突判定

**メソッド**:
- `canPlaceBlock(position: Position, blocks: Block[][], field: Field): boolean`
- `isColliding(position: Position, blocks: Block[][], field: Field): boolean`
- `isOutOfBounds(position: Position, blocks: Block[][], fieldWidth: number, fieldHeight: number): boolean`

**実装優先度**: 高（FallingBlockの`canMove()`メソッドで使用）

---

### 2. BlockPatternGeneratorService（ブロックパターン生成サービス）

**ファイル**: `src/domain/services/BlockPatternGeneratorService.ts`

**責務**: ランダムなブロックパターンの生成

**メソッド**:
- `generate(): BlockPattern`
- `generatePattern4(): BlockPattern`
- `generatePattern3x1(): BlockPattern`
- `generatePattern2x2(): BlockPattern`
- `generatePattern2x1x1(): BlockPattern`

**プライベートメソッド**:
- `getRandomColor(): Color`
- `getRandomPattern(): PatternType`

**生成ルール**:
- 各パターンの出現確率は均等（25%ずつ）
- 色はBlue、Red、Yellowからランダムに選択
- パターン3x1は4つの配置パターンからランダムに選択
- パターン2x2は横並び、縦並び、斜め配置からランダムに選択

**実装優先度**: 高（Gameの`start()`メソッドで使用）

---

### 3. BlockMatchingService（消去判定サービス）

**ファイル**: `src/domain/services/BlockMatchingService.ts`

**責務**: ブロックの消去判定

**メソッド**:
- `findMatchingRectangles(field: Field): Rectangle[]`
- `isRectangle(positions: Position[], color: Color, field: Field): boolean`
- `canFormRectangle(position: Position, field: Field): boolean`

**プライベートメソッド**:
- `scanForRectangles(field: Field): Rectangle[]`
- `removeDuplicates(rectangles: Rectangle[]): Rectangle[]`
- `getAllRectanglesAt(position: Position, field: Field): Rectangle[]`
- `isContained(inner: Rectangle, outer: Rectangle): boolean`

**アルゴリズム**:
1. フィールド全体をスキャン（左上から右下へ）
2. 各ブロックを起点として、右方向と下方向に同じ色が連続する数を計算
3. 2x2以上の矩形を検出
4. 重複を排除して返却

**計算量**: O(W × H × max(W, H)²)

**実装優先度**: 中（Game.landBlock()で使用）

---

### 4. BlockFallService（落下処理サービス）

**ファイル**: `src/domain/services/BlockFallService.ts`

**責務**: ブロックの自由落下処理

**メソッド**:
- `applyGravity(field: Field): boolean`
- `getLowestEmptyPosition(column: number, startY: number, field: Field): number`
- `canFall(position: Position, field: Field): boolean`

**プライベートメソッド**:
- `processColumnFall(column: number, field: Field): boolean`

**アルゴリズム**:
1. 各列を独立して処理
2. 下から2行目から上に向かってスキャン
3. 各ブロックについて、下に空きがあるかチェック
4. 空きがある場合、可能な限り下に移動
5. いずれかの列で落下が発生した場合、trueを返す

**実装優先度**: 中（Game.landBlock()で使用）

---

### 5. BlockRemovalService（ブロック削除サービス）

**ファイル**: `src/domain/services/BlockRemovalService.ts`

**責務**: ブロックの削除とスコア計算、連鎖処理

**依存関係**:
```typescript
constructor(
  private blockMatchingService: BlockMatchingService,
  private blockFallService: BlockFallService
)
```

**メソッド**:
- `removeBlocks(rectangles: Rectangle[], field: Field): number`
- `processRemovalChain(field: Field): number`

**プライベートメソッド**:
- `removeRectangle(rectangle: Rectangle, field: Field): void`

**処理フロー（processRemovalChain）**:
1. 消去可能な矩形を検索
2. 矩形内のブロックを削除
3. 削除マス数を計算
4. 自由落下を適用
5. 再度消去判定（連鎖）
6. 連鎖がなくなるまで繰り返す

**実装優先度**: 中（Game.landBlock()で使用）

---

## 実装の順序

1. **CollisionDetectionService** - FallingBlockで即座に必要
2. **BlockPatternGeneratorService** - Gameで即座に必要
3. **BlockMatchingService** - 消去判定の基盤
4. **BlockFallService** - 落下処理の基盤
5. **BlockRemovalService** - 上記2つに依存

---

## Game.landBlock()の完全な実装

このPhaseの完了後、`Game.landBlock()`メソッドを完全に実装します。

```typescript
private landBlock(): void {
  if (this._fallingBlock === null) {
    return;
  }

  // 1. フィールドにブロックを固定
  const blocks = this._fallingBlock.getBlocks();
  blocks.forEach(({ block, position }) => {
    this._field.placeBlock(position, block);
  });

  // ブロックを削除
  this._fallingBlock = null;

  // 2. 消去処理（連鎖を含む）
  const blockRemovalService = new BlockRemovalService(
    new BlockMatchingService(),
    new BlockFallService()
  );
  const removedCount = blockRemovalService.processRemovalChain(this._field);

  // 3. スコア加算
  if (removedCount > 0) {
    this._score = this._score.add(removedCount);
  }

  // 4. ゲームオーバー判定
  if (this.isGameOver()) {
    this._state = GameState.GameOver;
  }
}
```

---

## テスト

### テストファイル

- `tests/domain/services/CollisionDetectionService.test.ts`
- `tests/domain/services/BlockPatternGeneratorService.test.ts`
- `tests/domain/services/BlockMatchingService.test.ts`
- `tests/domain/services/BlockFallService.test.ts`
- `tests/domain/services/BlockRemovalService.test.ts`

### テストケース例（BlockMatchingService）

```typescript
describe('BlockMatchingService', () => {
  let service: BlockMatchingService;

  beforeEach(() => {
    service = new BlockMatchingService();
  });

  test('2x2の矩形を検出できる', () => {
    const field = Field.create();
    const blue = Block.create(Color.BLUE);

    // 2x2の青いブロックを配置
    field.placeBlock(Position.create(0, 0), blue);
    field.placeBlock(Position.create(1, 0), blue);
    field.placeBlock(Position.create(0, 1), blue);
    field.placeBlock(Position.create(1, 1), blue);

    const rectangles = service.findMatchingRectangles(field);

    expect(rectangles.length).toBe(1);
    expect(rectangles[0].width).toBe(2);
    expect(rectangles[0].height).toBe(2);
  });

  test('3x3の矩形を検出できる', () => {
    const field = Field.create();
    const red = Block.create(Color.RED);

    // 3x3の赤いブロックを配置
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        field.placeBlock(Position.create(x, y), red);
      }
    }

    const rectangles = service.findMatchingRectangles(field);

    expect(rectangles.length).toBe(1);
    expect(rectangles[0].area()).toBe(9);
  });

  test('複数の矩形を検出できる', () => {
    const field = Field.create();
    const blue = Block.create(Color.BLUE);
    const red = Block.create(Color.RED);

    // 2つの2x2矩形を配置
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        field.placeBlock(Position.create(x, y), blue);
        field.placeBlock(Position.create(x + 4, y), red);
      }
    }

    const rectangles = service.findMatchingRectangles(field);

    expect(rectangles.length).toBe(2);
  });

  test('L字型は矩形として検出されない', () => {
    const field = Field.create();
    const blue = Block.create(Color.BLUE);

    // L字型を配置
    field.placeBlock(Position.create(0, 0), blue);
    field.placeBlock(Position.create(0, 1), blue);
    field.placeBlock(Position.create(1, 1), blue);

    const rectangles = service.findMatchingRectangles(field);

    expect(rectangles.length).toBe(0);
  });

  test('重複する矩形を正しく処理する', () => {
    const field = Field.create();
    const blue = Block.create(Color.BLUE);

    // 2x3の矩形を配置（2x2も含まれる）
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 2; x++) {
        field.placeBlock(Position.create(x, y), blue);
      }
    }

    const rectangles = service.findMatchingRectangles(field);

    // より大きい矩形（2x3）のみが返される
    expect(rectangles.length).toBe(1);
    expect(rectangles[0].area()).toBe(6);
  });
});
```

### テストケース例（BlockFallService）

```typescript
describe('BlockFallService', () => {
  let service: BlockFallService;

  beforeEach(() => {
    service = new BlockFallService();
  });

  test('ブロックを1マス落下させることができる', () => {
    const field = Field.create();
    const block = Block.create(Color.BLUE);
    field.placeBlock(Position.create(0, 0), block);

    const hasFallen = service.applyGravity(field);

    expect(hasFallen).toBe(true);
    expect(field.isEmpty(Position.create(0, 0))).toBe(true);
    expect(field.getBlock(Position.create(0, 1))).toBe(block);
  });

  test('複数のブロックを同時に落下させることができる', () => {
    const field = Field.create();
    field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
    field.placeBlock(Position.create(1, 0), Block.create(Color.RED));

    service.applyGravity(field);

    expect(field.isEmpty(Position.create(0, 0))).toBe(true);
    expect(field.isEmpty(Position.create(1, 0))).toBe(true);
  });

  test('ブロックの上のブロックが連鎖的に落下する', () => {
    const field = Field.create();
    const bottom = Block.create(Color.BLUE);
    const top = Block.create(Color.RED);

    field.placeBlock(Position.create(0, field.height - 1), bottom);
    field.placeBlock(Position.create(0, 0), top);

    // 複数回落下処理を実行
    while (service.applyGravity(field)) {
      // 落下が完了するまで繰り返し
    }

    expect(field.getBlock(Position.create(0, field.height - 1))).toBe(bottom);
    expect(field.getBlock(Position.create(0, field.height - 2))).toBe(top);
  });

  test('床に接しているブロックは落下しない', () => {
    const field = Field.create();
    const block = Block.create(Color.BLUE);
    field.placeBlock(Position.create(0, field.height - 1), block);

    const hasFallen = service.applyGravity(field);

    expect(hasFallen).toBe(false);
  });
});
```

### テストケース例（BlockRemovalService）

```typescript
describe('BlockRemovalService', () => {
  let service: BlockRemovalService;
  let matchingService: BlockMatchingService;
  let fallService: BlockFallService;

  beforeEach(() => {
    matchingService = new BlockMatchingService();
    fallService = new BlockFallService();
    service = new BlockRemovalService(matchingService, fallService);
  });

  test('矩形のブロックを削除できる', () => {
    const field = Field.create();
    const blue = Block.create(Color.BLUE);

    // 2x2の矩形を配置
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        field.placeBlock(Position.create(x, y), blue);
      }
    }

    const rectangle = Rectangle.create(Position.create(0, 0), 2, 2);
    const removed = service.removeBlocks([rectangle], field);

    expect(removed).toBe(4);
    expect(field.isEmpty(Position.create(0, 0))).toBe(true);
    expect(field.isEmpty(Position.create(1, 1))).toBe(true);
  });

  test('連鎖処理が正しく動作する', () => {
    const field = Field.create();
    const blue = Block.create(Color.BLUE);
    const red = Block.create(Color.RED);

    // 連鎖するように配置
    // 下段: 青2x2
    for (let y = field.height - 2; y < field.height; y++) {
      for (let x = 0; x < 2; x++) {
        field.placeBlock(Position.create(x, y), blue);
      }
    }

    // 中段: 赤2x2（落下後に青の上に乗る）
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        field.placeBlock(Position.create(x, y), red);
      }
    }

    const totalRemoved = service.processRemovalChain(field);

    // 青4マス + 赤4マス = 8マス
    expect(totalRemoved).toBe(8);

    // フィールドが空になっていることを確認
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < 2; x++) {
        expect(field.isEmpty(Position.create(x, y))).toBe(true);
      }
    }
  });
});
```

---

## 完了条件

- [ ] すべてのドメインサービスが実装されている
- [ ] すべてのメソッドが正しく動作する
- [ ] すべての単体テストが成功する
- [ ] テストカバレッジが80%以上
- [ ] TypeScriptのコンパイルエラーがない
- [ ] ESLintの警告がない
- [ ] ドキュメントコメント（JSDoc）が記載されている
- [ ] `Game.landBlock()`メソッドが完全に実装されている
- [ ] ゲーム全体の動作確認（手動テスト）

---

## 見積もり

**工数**: 4-5日

**内訳**:
- CollisionDetectionService: 0.5日
- BlockPatternGeneratorService: 1日
- BlockMatchingService: 1.5日
- BlockFallService: 1日
- BlockRemovalService: 0.5日
- Game.landBlock()の完全実装: 0.5日
- テスト作成: 1日

---

## 依存関係

**前提**:
- Issue 1.1: 値オブジェクトの実装
- Issue 1.2: エンティティの実装

**後続のタスク**:
- Issue 2.1: リポジトリの実装（Phase 2）
- Issue 2.2: アプリケーションサービスの実装（Phase 2）

---

## 注意事項

- ドメインサービスは状態を持たない（Stateless）
- 各サービスは独立しているため、BlockRemovalService以外は並行して実装可能
- BlockRemovalServiceは他の2つのサービス（BlockMatchingService, BlockFallService）に依存
- 実装順序の推奨: CollisionDetectionService, BlockPatternGeneratorService → BlockMatchingService, BlockFallService → BlockRemovalService
- すべてのドメインサービスが完成したら、`Game.landBlock()`を完全に実装

---

## 統合テスト

Phase 1の完了後、ドメイン層全体の統合テストを実施：

```typescript
describe('Domain Layer Integration', () => {
  test('ゲームの基本フローが正しく動作する', () => {
    const game = Game.create('integration-test');
    game.start();

    // ブロックを落下させる
    for (let i = 0; i < 100; i++) {
      game.update();
    }

    // ゲームが正常に動作していることを確認
    expect(game.state).not.toBe(GameState.GameOver);
    expect(game.frameCount).toBe(100);
  });
});
```

---

## 参考コード

詳細な実装例は `docs/design/domain-services-detailed-design.md` を参照してください。
