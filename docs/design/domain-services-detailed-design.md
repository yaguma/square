# ドメインサービス 詳細設計書

## 1. 概要

このドキュメントは、Squareゲームで使用するドメインサービス（Domain Service）の詳細設計を定義します。ドメインサービスは、複数のエンティティや値オブジェクトにまたがるビジネスロジックを提供します。

## 2. ドメインサービスの原則

### 2.1 ステートレス（Stateless）

- ドメインサービスは状態を持たない
- すべての情報はメソッドのパラメータとして受け取る
- インスタンス変数を持たない（定数は可）

### 2.2 純粋関数（Pure Function）

- 同じ入力に対して常に同じ出力を返す
- 副作用を最小限にする
- 外部状態に依存しない

### 2.3 明確な責務

- 単一のビジネスロジックに集中
- エンティティに属さない振る舞いをカプセル化

## 3. BlockMatchingService（消去判定サービス）

### 3.1 責務

- フィールド内の消去可能な矩形を検索
- 同じ色で4マス以上の矩形を検出
- 重複する矩形の処理

### 3.2 クラス図

```
┌─────────────────────────────────────────┐
│      BlockMatchingService               │
├─────────────────────────────────────────┤
│ (no instance variables)                 │
├─────────────────────────────────────────┤
│ + findMatchingRectangles(field)         │
│ + isRectangle(positions, color, field)  │
│ + canFormRectangle(position, field)     │
│ - scanForRectangles(field)              │
│ - removeDuplicates(rectangles)          │
│ - getAllRectanglesAt(position, field)   │
└─────────────────────────────────────────┘
```

### 3.3 メソッド詳細

#### findMatchingRectangles(field: Field): Rectangle[]

**説明**: フィールド内のすべての消去可能な矩形を検索

**パラメータ**:
- `field`: 検索対象のフィールド

**戻り値**: `Rectangle[]` - 消去可能な矩形の配列

**アルゴリズム**:
1. フィールド全体をスキャン（左上から右下へ）
2. 各ブロックを起点として、右方向と下方向に同じ色が連続する数を計算
3. 2x2以上の矩形を検出
4. 重複を排除して返却

**計算量**: O(W × H × max(W, H)²)
- W: フィールドの幅
- H: フィールドの高さ

**使用例**:
```typescript
const service = new BlockMatchingService();
const rectangles = service.findMatchingRectangles(field);

if (rectangles.length > 0) {
  // 消去処理を実行
}
```

**実装詳細**:
```typescript
findMatchingRectangles(field: Field): Rectangle[] {
  const rectangles: Rectangle[] = [];

  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const position = Position.create(x, y);
      const block = field.getBlock(position);

      if (block === null) {
        continue;
      }

      // この位置を起点とする全ての矩形を検出
      const rectsAtPos = this.getAllRectanglesAt(position, field);
      rectangles.push(...rectsAtPos);
    }
  }

  // 重複を排除
  return this.removeDuplicates(rectangles);
}
```

#### getAllRectanglesAt(position: Position, field: Field): Rectangle[]

**説明**: 指定位置を左上とするすべての矩形を検出

**パラメータ**:
- `position`: 起点となる位置
- `field`: フィールド

**戻り値**: `Rectangle[]` - 検出された矩形の配列

**アルゴリズム**:
1. 起点の色を取得
2. 右方向に連続する同色ブロックの数を数える（maxWidth）
3. 各幅（2 〜 maxWidth）について：
   - 下方向に連続する同色ブロックの数を数える（maxHeight）
   - 高さが2以上の場合、矩形として登録

**使用例**:
```typescript
const rectangles = service.getAllRectanglesAt(Position.create(0, 0), field);
```

**実装詳細**:
```typescript
private getAllRectanglesAt(position: Position, field: Field): Rectangle[] {
  const rectangles: Rectangle[] = [];
  const block = field.getBlock(position);

  if (block === null) {
    return rectangles;
  }

  const color = block.color;

  // 右方向に連続する同色ブロックの最大幅を計算
  let maxWidth = 1;
  while (maxWidth < field.width - position.x) {
    const checkPos = Position.create(position.x + maxWidth, position.y);
    const checkBlock = field.getBlock(checkPos);

    if (checkBlock === null || !checkBlock.color.equals(color)) {
      break;
    }
    maxWidth++;
  }

  // 各幅について、下方向の高さを計算
  for (let width = 2; width <= maxWidth; width++) {
    let height = 1;

    // 下方向に連続する同色の行を探す
    while (height < field.height - position.y) {
      let allMatch = true;

      // この行の全てのブロックが同色かチェック
      for (let dx = 0; dx < width; dx++) {
        const checkPos = Position.create(position.x + dx, position.y + height);
        const checkBlock = field.getBlock(checkPos);

        if (checkBlock === null || !checkBlock.color.equals(color)) {
          allMatch = false;
          break;
        }
      }

      if (!allMatch) {
        break;
      }

      height++;
    }

    // 2x2以上の矩形を登録
    if (height >= 2) {
      rectangles.push(Rectangle.create(position, width, height));
    }
  }

  return rectangles;
}
```

#### removeDuplicates(rectangles: Rectangle[]): Rectangle[]

**説明**: 重複する矩形を排除

**パラメータ**:
- `rectangles`: 矩形の配列

**戻り値**: `Rectangle[]` - 重複を排除した矩形の配列

**戦略**: より大きい矩形を優先（面積が大きい方を残す）

**実装詳細**:
```typescript
private removeDuplicates(rectangles: Rectangle[]): Rectangle[] {
  const unique: Rectangle[] = [];

  for (const rect of rectangles) {
    let isDuplicate = false;

    for (const existing of unique) {
      if (this.isContained(rect, existing)) {
        isDuplicate = true;
        break;
      }

      if (this.isContained(existing, rect)) {
        // 既存の矩形より大きい場合、置き換え
        const index = unique.indexOf(existing);
        unique.splice(index, 1);
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(rect);
    }
  }

  return unique;
}

private isContained(inner: Rectangle, outer: Rectangle): boolean {
  const innerPositions = inner.getPositions();
  const outerPositions = outer.getPositions();

  return innerPositions.every(pos =>
    outerPositions.some(outerPos => pos.equals(outerPos))
  );
}
```

### 3.4 テストケース

```typescript
describe('BlockMatchingService', () => {
  test('2x2の矩形を検出できる', () => {
    const field = Field.create();
    const blue = Block.create(Color.BLUE);

    // 2x2の青いブロックを配置
    field.placeBlock(Position.create(0, 0), blue);
    field.placeBlock(Position.create(1, 0), blue);
    field.placeBlock(Position.create(0, 1), blue);
    field.placeBlock(Position.create(1, 1), blue);

    const service = new BlockMatchingService();
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

    const service = new BlockMatchingService();
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

    const service = new BlockMatchingService();
    const rectangles = service.findMatchingRectangles(field);

    expect(rectangles.length).toBe(2);
  });
});
```

## 4. BlockFallService（落下処理サービス）

### 4.1 責務

- ブロックの自由落下処理
- 重力シミュレーション
- 空きスペースへのブロック移動

### 4.2 クラス図

```
┌─────────────────────────────────────────┐
│        BlockFallService                 │
├─────────────────────────────────────────┤
│ (no instance variables)                 │
├─────────────────────────────────────────┤
│ + applyGravity(field): boolean          │
│ + getLowestEmptyPosition(col, y, field) │
│ + canFall(position, field): boolean     │
│ - processColumnFall(col, field)         │
└─────────────────────────────────────────┘
```

### 4.3 メソッド詳細

#### applyGravity(field: Field): boolean

**説明**: 重力を適用してブロックを落下させる

**パラメータ**:
- `field`: 対象のフィールド

**戻り値**: `boolean` - ブロックが落下した場合`true`

**副作用**: フィールドの状態を変更

**アルゴリズム**:
1. 各列を独立して処理
2. 下から2行目から上に向かってスキャン
3. 各ブロックについて、下に空きがあるかチェック
4. 空きがある場合、可能な限り下に移動
5. いずれかの列で落下が発生した場合、trueを返す

**使用例**:
```typescript
const service = new BlockFallService();
let hasFallen = false;

do {
  hasFallen = service.applyGravity(field);
} while (hasFallen); // 落下がなくなるまで繰り返し
```

**実装詳細**:
```typescript
applyGravity(field: Field): boolean {
  let hasAnyFall = false;

  // 各列を処理
  for (let x = 0; x < field.width; x++) {
    const hasFall = this.processColumnFall(x, field);
    if (hasFall) {
      hasAnyFall = true;
    }
  }

  return hasAnyFall;
}

private processColumnFall(column: number, field: Field): boolean {
  let hasFall = false;

  // 下から2行目から上に向かってスキャン
  for (let y = field.height - 2; y >= 0; y--) {
    const position = Position.create(column, y);
    const block = field.getBlock(position);

    if (block === null) {
      continue;
    }

    // このブロックが落下可能な最下位置を見つける
    const lowestY = this.getLowestEmptyPosition(column, y, field);

    if (lowestY > y) {
      // ブロックを移動
      field.removeBlock(position);
      field.placeBlock(Position.create(column, lowestY), block);
      hasFall = true;
    }
  }

  return hasFall;
}
```

#### getLowestEmptyPosition(column: number, startY: number, field: Field): number

**説明**: 指定列の指定位置から下方向で、ブロックが落下できる最下位置を取得

**パラメータ**:
- `column`: 列番号
- `startY`: 開始Y座標
- `field`: フィールド

**戻り値**: `number` - 落下可能な最下のY座標

**使用例**:
```typescript
const lowestY = service.getLowestEmptyPosition(3, 5, field);
```

**実装詳細**:
```typescript
getLowestEmptyPosition(column: number, startY: number, field: Field): number {
  let lowestY = startY;

  // 下方向に空きを探す
  for (let y = startY + 1; y < field.height; y++) {
    const position = Position.create(column, y);

    if (!field.isEmpty(position)) {
      break;
    }

    lowestY = y;
  }

  return lowestY;
}
```

#### canFall(position: Position, field: Field): boolean

**説明**: 指定位置のブロックが落下可能かを判定

**パラメータ**:
- `position`: 判定対象の位置
- `field`: フィールド

**戻り値**: `boolean` - 落下可能な場合`true`

**使用例**:
```typescript
if (service.canFall(Position.create(3, 5), field)) {
  // 落下処理
}
```

**実装詳細**:
```typescript
canFall(position: Position, field: Field): boolean {
  const block = field.getBlock(position);
  if (block === null) {
    return false;
  }

  // 最下行のブロックは落下不可
  if (position.y === field.height - 1) {
    return false;
  }

  // 下の位置が空きかチェック
  const below = Position.create(position.x, position.y + 1);
  return field.isEmpty(below);
}
```

### 4.4 テストケース

```typescript
describe('BlockFallService', () => {
  test('ブロックを1マス落下させることができる', () => {
    const field = Field.create();
    const block = Block.create(Color.BLUE);
    field.placeBlock(Position.create(0, 0), block);

    const service = new BlockFallService();
    const hasFallen = service.applyGravity(field);

    expect(hasFallen).toBe(true);
    expect(field.isEmpty(Position.create(0, 0))).toBe(true);
    expect(field.getBlock(Position.create(0, 1))).toBe(block);
  });

  test('複数のブロックを同時に落下させることができる', () => {
    const field = Field.create();
    field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
    field.placeBlock(Position.create(1, 0), Block.create(Color.RED));

    const service = new BlockFallService();
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

    const service = new BlockFallService();

    // 複数回落下処理を実行
    while (service.applyGravity(field)) {
      // 落下が完了するまで繰り返し
    }

    expect(field.getBlock(Position.create(0, field.height - 1))).toBe(bottom);
    expect(field.getBlock(Position.create(0, field.height - 2))).toBe(top);
  });
});
```

## 5. BlockRemovalService（ブロック削除サービス）

### 5.1 責務

- ブロックの削除処理
- スコア計算
- 連鎖処理の管理

### 5.2 クラス図

```
┌─────────────────────────────────────────┐
│      BlockRemovalService                │
├─────────────────────────────────────────┤
│ - blockMatchingService                  │
│ - blockFallService                      │
├─────────────────────────────────────────┤
│ + removeBlocks(rectangles, field): int  │
│ + processRemovalChain(field): int       │
│ - removeRectangle(rectangle, field)     │
└─────────────────────────────────────────┘
```

### 5.3 メソッド詳細

#### removeBlocks(rectangles: Rectangle[], field: Field): number

**説明**: 指定された矩形のブロックを削除し、削除マス数を返す

**パラメータ**:
- `rectangles`: 削除する矩形の配列
- `field`: フィールド

**戻り値**: `number` - 削除したマス数

**副作用**: フィールドの状態を変更

**使用例**:
```typescript
const service = new BlockRemovalService(matchingService, fallService);
const removedCount = service.removeBlocks(rectangles, field);
score = score.add(removedCount);
```

**実装詳細**:
```typescript
removeBlocks(rectangles: Rectangle[], field: Field): number {
  let totalRemoved = 0;

  for (const rectangle of rectangles) {
    this.removeRectangle(rectangle, field);
    totalRemoved += rectangle.area();
  }

  return totalRemoved;
}

private removeRectangle(rectangle: Rectangle, field: Field): void {
  const positions = rectangle.getPositions();

  for (const position of positions) {
    field.removeBlock(position);
  }
}
```

#### processRemovalChain(field: Field): number

**説明**: 連鎖も含めた削除処理を実行し、総削除マス数を返す

**パラメータ**:
- `field`: フィールド

**戻り値**: `number` - 総削除マス数

**副作用**: フィールドの状態を変更

**処理フロー**:
1. 消去可能な矩形を検索
2. 矩形内のブロックを削除
3. 削除マス数を計算
4. 自由落下を適用
5. 再度消去判定（連鎖）
6. 連鎖がなくなるまで繰り返す

**使用例**:
```typescript
const service = new BlockRemovalService(matchingService, fallService);
const totalRemoved = service.processRemovalChain(field);
score = score.add(totalRemoved);
```

**実装詳細**:
```typescript
processRemovalChain(field: Field): number {
  let totalRemoved = 0;
  let chainCount = 0;

  while (true) {
    // 消去可能な矩形を検索
    const rectangles = this.blockMatchingService.findMatchingRectangles(field);

    if (rectangles.length === 0) {
      break;
    }

    // ブロックを削除
    const removed = this.removeBlocks(rectangles, field);
    totalRemoved += removed;
    chainCount++;

    // 自由落下を適用
    while (this.blockFallService.applyGravity(field)) {
      // 落下が完了するまで繰り返し
    }
  }

  return totalRemoved;
}
```

### 5.4 依存関係

このサービスは以下のサービスに依存します：
- `BlockMatchingService`: 消去可能な矩形の検索
- `BlockFallService`: 自由落下の処理

### 5.5 テストケース

```typescript
describe('BlockRemovalService', () => {
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
    const matchingService = new BlockMatchingService();
    const fallService = new BlockFallService();
    const service = new BlockRemovalService(matchingService, fallService);

    const removed = service.removeBlocks([rectangle], field);

    expect(removed).toBe(4);
    expect(field.isEmpty(Position.create(0, 0))).toBe(true);
  });

  test('連鎖処理が正しく動作する', () => {
    const field = Field.create();
    const blue = Block.create(Color.BLUE);

    // 連鎖するように配置
    // (詳細は省略)

    const matchingService = new BlockMatchingService();
    const fallService = new BlockFallService();
    const service = new BlockRemovalService(matchingService, fallService);

    const totalRemoved = service.processRemovalChain(field);

    expect(totalRemoved).toBeGreaterThan(0);
  });
});
```

## 6. CollisionDetectionService（衝突判定サービス）

### 6.1 責務

- ブロックの衝突判定
- フィールド境界チェック
- 配置可能性の検証

### 6.2 クラス図

```
┌─────────────────────────────────────────┐
│    CollisionDetectionService            │
├─────────────────────────────────────────┤
│ (no instance variables)                 │
├─────────────────────────────────────────┤
│ + canPlaceBlock(pos, blocks, field)     │
│ + isColliding(pos, blocks, field)       │
│ + isOutOfBounds(pos, blocks, w, h)      │
└─────────────────────────────────────────┘
```

### 6.3 メソッド詳細

#### canPlaceBlock(position: Position, blocks: Block[][], field: Field): boolean

**説明**: 指定位置にブロックパターンを配置できるかを判定

**パラメータ**:
- `position`: 配置位置（左上）
- `blocks`: 2x2のブロック配列
- `field`: フィールド

**戻り値**: `boolean` - 配置可能な場合`true`

**判定条件**:
- フィールドの範囲内
- 配置先に既存のブロックがない

**使用例**:
```typescript
const service = new CollisionDetectionService();
const canPlace = service.canPlaceBlock(position, blocks, field);

if (canPlace) {
  // 配置処理
}
```

**実装詳細**:
```typescript
canPlaceBlock(position: Position, blocks: Block[][], field: Field): boolean {
  // 境界チェック
  if (this.isOutOfBounds(position, blocks, field.width, field.height)) {
    return false;
  }

  // 衝突チェック
  if (this.isColliding(position, blocks, field)) {
    return false;
  }

  return true;
}
```

#### isColliding(position: Position, blocks: Block[][], field: Field): boolean

**説明**: 指定位置でブロックが既存のブロックと衝突するかを判定

**パラメータ**:
- `position`: 配置位置（左上）
- `blocks`: 2x2のブロック配列
- `field`: フィールド

**戻り値**: `boolean` - 衝突する場合`true`

**実装詳細**:
```typescript
isColliding(position: Position, blocks: Block[][], field: Field): boolean {
  for (let y = 0; y < blocks.length; y++) {
    for (let x = 0; x < blocks[y].length; x++) {
      if (blocks[y][x] !== null) {
        const checkPos = Position.create(position.x + x, position.y + y);

        if (!field.isEmpty(checkPos)) {
          return true;
        }
      }
    }
  }

  return false;
}
```

#### isOutOfBounds(position: Position, blocks: Block[][], fieldWidth: number, fieldHeight: number): boolean

**説明**: ブロックがフィールド外にはみ出すかを判定

**パラメータ**:
- `position`: 配置位置（左上）
- `blocks`: 2x2のブロック配列
- `fieldWidth`: フィールドの幅
- `fieldHeight`: フィールドの高さ

**戻り値**: `boolean` - はみ出す場合`true`

**実装詳細**:
```typescript
isOutOfBounds(
  position: Position,
  blocks: Block[][],
  fieldWidth: number,
  fieldHeight: number
): boolean {
  for (let y = 0; y < blocks.length; y++) {
    for (let x = 0; x < blocks[y].length; x++) {
      if (blocks[y][x] !== null) {
        const checkPos = Position.create(position.x + x, position.y + y);

        if (!checkPos.isValid(fieldWidth, fieldHeight)) {
          return true;
        }
      }
    }
  }

  return false;
}
```

### 6.4 テストケース

```typescript
describe('CollisionDetectionService', () => {
  test('空の位置に配置可能と判定される', () => {
    const field = Field.create();
    const blocks = [
      [Block.create(Color.BLUE), Block.create(Color.BLUE)],
      [Block.create(Color.BLUE), Block.create(Color.BLUE)]
    ];

    const service = new CollisionDetectionService();
    const canPlace = service.canPlaceBlock(Position.create(0, 0), blocks, field);

    expect(canPlace).toBe(true);
  });

  test('既存のブロックと衝突する場合に配置不可と判定される', () => {
    const field = Field.create();
    field.placeBlock(Position.create(0, 0), Block.create(Color.RED));

    const blocks = [
      [Block.create(Color.BLUE), Block.create(Color.BLUE)],
      [Block.create(Color.BLUE), Block.create(Color.BLUE)]
    ];

    const service = new CollisionDetectionService();
    const canPlace = service.canPlaceBlock(Position.create(0, 0), blocks, field);

    expect(canPlace).toBe(false);
  });

  test('フィールド外にはみ出す場合に配置不可と判定される', () => {
    const field = Field.create();
    const blocks = [
      [Block.create(Color.BLUE), Block.create(Color.BLUE)],
      [Block.create(Color.BLUE), Block.create(Color.BLUE)]
    ];

    const service = new CollisionDetectionService();
    const canPlace = service.canPlaceBlock(Position.create(7, 0), blocks, field);

    expect(canPlace).toBe(false); // 幅8のフィールドで7,8は範囲外
  });
});
```

## 7. BlockPatternGeneratorService（ブロックパターン生成サービス）

### 7.1 責務

- ランダムなブロックパターンの生成
- 4種類のパターン（4, 3x1, 2x2, 2x1x1）の生成
- 色のランダム選択

### 7.2 クラス図

```
┌─────────────────────────────────────────┐
│  BlockPatternGeneratorService           │
├─────────────────────────────────────────┤
│ (no instance variables)                 │
├─────────────────────────────────────────┤
│ + generate(): BlockPattern              │
│ + generatePattern4(): BlockPattern      │
│ + generatePattern3x1(): BlockPattern    │
│ + generatePattern2x2(): BlockPattern    │
│ + generatePattern2x1x1(): BlockPattern  │
│ - getRandomColor(): Color               │
│ - getRandomPattern(): PatternType       │
└─────────────────────────────────────────┘
```

### 7.3 メソッド詳細

#### generate(): BlockPattern

**説明**: ランダムなブロックパターンを生成

**戻り値**: `BlockPattern` - ランダムに生成されたパターン

**生成ルール**:
- 各パターンの出現確率は均等（25%ずつ）
- 色はBlue、Red、Yellowからランダムに選択

**使用例**:
```typescript
const generator = new BlockPatternGeneratorService();
const pattern = generator.generate();
```

**実装詳細**:
```typescript
generate(): BlockPattern {
  const patternType = this.getRandomPattern();

  switch (patternType) {
    case 'pattern4':
      return this.generatePattern4();
    case 'pattern3x1':
      return this.generatePattern3x1();
    case 'pattern2x2':
      return this.generatePattern2x2();
    case 'pattern2x1x1':
      return this.generatePattern2x1x1();
  }
}

private getRandomPattern(): PatternType {
  const patterns: PatternType[] = ['pattern4', 'pattern3x1', 'pattern2x2', 'pattern2x1x1'];
  const index = Math.floor(Math.random() * patterns.length);
  return patterns[index];
}

private getRandomColor(): Color {
  const colors = [Color.BLUE, Color.RED, Color.YELLOW];
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}
```

#### generatePattern4(): BlockPattern

**説明**: パターン4（全て同色）を生成

**戻り値**: `BlockPattern`

**パターン**:
```
■■
■■
```

**実装詳細**:
```typescript
generatePattern4(): BlockPattern {
  const color = this.getRandomColor();
  const block = Block.create(color);

  const blocks = [
    [block, block],
    [block, block]
  ];

  return BlockPattern.create('pattern4', blocks);
}
```

#### generatePattern3x1(): BlockPattern

**説明**: パターン3x1（3つ同色+1つ別色）を生成

**戻り値**: `BlockPattern`

**パターン例**:
```
■■  ■□  □■  ■■
■□  ■■  ■■  □■
```

**実装詳細**:
```typescript
generatePattern3x1(): BlockPattern {
  const mainColor = this.getRandomColor();
  let differentColor = this.getRandomColor();

  // 異なる色を保証
  while (differentColor.equals(mainColor)) {
    differentColor = this.getRandomColor();
  }

  const mainBlock = Block.create(mainColor);
  const diffBlock = Block.create(differentColor);

  // 4つの配置パターンからランダムに選択
  const patterns = [
    [[mainBlock, mainBlock], [mainBlock, diffBlock]], // 右下が異なる
    [[mainBlock, mainBlock], [diffBlock, mainBlock]], // 左下が異なる
    [[mainBlock, diffBlock], [mainBlock, mainBlock]], // 右上が異なる
    [[diffBlock, mainBlock], [mainBlock, mainBlock]]  // 左上が異なる
  ];

  const index = Math.floor(Math.random() * patterns.length);
  return BlockPattern.create('pattern3x1', patterns[index]);
}
```

#### generatePattern2x2(): BlockPattern

**説明**: パターン2x2（2つずつ同じ色）を生成

**戻り値**: `BlockPattern`

**パターン例**:
```
■■  ■□  □■
□□  □■  ■□
```

**実装詳細**:
```typescript
generatePattern2x2(): BlockPattern {
  const color1 = this.getRandomColor();
  let color2 = this.getRandomColor();

  // 異なる色を保証
  while (color2.equals(color1)) {
    color2 = this.getRandomColor();
  }

  const block1 = Block.create(color1);
  const block2 = Block.create(color2);

  // 3つの配置パターンからランダムに選択
  const patterns = [
    [[block1, block1], [block2, block2]], // 横並び
    [[block1, block2], [block1, block2]], // 縦並び
    [[block1, block2], [block2, block1]]  // 斜め
  ];

  const index = Math.floor(Math.random() * patterns.length);
  return BlockPattern.create('pattern2x2', patterns[index]);
}
```

#### generatePattern2x1x1(): BlockPattern

**説明**: パターン2x1x1（2つ同色+2つ異なる色）を生成

**戻り値**: `BlockPattern`

**パターン例**:
```
■■  ■□
□△  △□
```

**実装詳細**:
```typescript
generatePattern2x1x1(): BlockPattern {
  const colors = [Color.BLUE, Color.RED, Color.YELLOW];

  // 3色からランダムに選択
  const shuffled = colors.sort(() => Math.random() - 0.5);
  const color1 = shuffled[0]; // 2つ
  const color2 = shuffled[1]; // 1つ
  const color3 = shuffled[2]; // 1つ

  const block1 = Block.create(color1);
  const block2 = Block.create(color2);
  const block3 = Block.create(color3);

  // 複数の配置パターンからランダムに選択
  const patterns = [
    [[block1, block1], [block2, block3]], // 上2つ同色
    [[block1, block2], [block1, block3]], // 左2つ同色
    [[block1, block2], [block3, block1]], // 右2つ同色
    [[block2, block3], [block1, block1]]  // 下2つ同色
  ];

  const index = Math.floor(Math.random() * patterns.length);
  return BlockPattern.create('pattern2x1x1', patterns[index]);
}
```

### 7.4 テストケース

```typescript
describe('BlockPatternGeneratorService', () => {
  test('パターンを生成できる', () => {
    const generator = new BlockPatternGeneratorService();
    const pattern = generator.generate();

    expect(pattern).toBeInstanceOf(BlockPattern);
    expect(pattern.blocks.length).toBe(2);
    expect(pattern.blocks[0].length).toBe(2);
  });

  test('パターン4を生成できる', () => {
    const generator = new BlockPatternGeneratorService();
    const pattern = generator.generatePattern4();

    expect(pattern.patternType).toBe('pattern4');

    // 全て同じ色
    const blocks = pattern.blocks;
    const firstColor = blocks[0][0].color;

    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        expect(blocks[y][x].color.equals(firstColor)).toBe(true);
      }
    }
  });

  test('パターン3x1を生成できる', () => {
    const generator = new BlockPatternGeneratorService();
    const pattern = generator.generatePattern3x1();

    expect(pattern.patternType).toBe('pattern3x1');

    // 色の種類をカウント
    const colors = new Map<string, number>();
    const blocks = pattern.blocks;

    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const colorType = blocks[y][x].color.type;
        colors.set(colorType, (colors.get(colorType) || 0) + 1);
      }
    }

    // 2種類の色がある
    expect(colors.size).toBe(2);

    // 1つが3個、もう1つが1個
    const counts = Array.from(colors.values()).sort();
    expect(counts).toEqual([1, 3]);
  });
});
```

## 8. サービス間の連携

### 8.1 依存関係図

```
BlockRemovalService
  ├─→ BlockMatchingService
  └─→ BlockFallService

Game (Entity)
  ├─→ BlockMatchingService
  ├─→ BlockFallService
  ├─→ BlockRemovalService
  ├─→ CollisionDetectionService (via FallingBlock)
  └─→ BlockPatternGeneratorService
```

### 8.2 処理フロー

#### ブロック接地時の処理フロー

```
1. Game.landBlock()
2. └─→ BlockMatchingService.findMatchingRectangles()
3.     └─→ Rectangle[]を取得
4. └─→ BlockRemovalService.processRemovalChain()
5.     ├─→ BlockRemovalService.removeBlocks()
6.     └─→ BlockFallService.applyGravity()
7.         └─→ 再度 BlockMatchingService.findMatchingRectangles()
8.             └─→ 連鎖処理（rectanglesがなくなるまで繰り返し）
```

## 9. まとめ

このドキュメントでは、以下の5つのドメインサービスを詳細に設計しました：

1. **BlockMatchingService**: ブロックの消去判定
2. **BlockFallService**: ブロックの自由落下処理
3. **BlockRemovalService**: ブロックの削除とスコア計算
4. **CollisionDetectionService**: 衝突判定
5. **BlockPatternGeneratorService**: ブロックパターンの生成

これらのドメインサービスは、エンティティに属さないビジネスロジックをカプセル化し、ゲームのコア機能を実現します。次のステップでは、アプリケーション層の詳細設計を行います。
