# [Phase 1-3] ドメインサービスの実装（TDD）

## 概要

ドメイン層のドメインサービスをTDD（テスト駆動開発）で実装します。ドメインサービスは、複数のエンティティにまたがるビジネスロジックをカプセル化します。

**TDDの原則**: 🔴 Red → 🟢 Green → 🔵 Refactor

## 参照ドキュメント

- `docs/design/domain-services-detailed-design.md`
- `docs/design/integration-design.md`

## 進捗管理チェックリスト

### 実装対象（全5つ + Game.landBlock()完全実装）

- [ ] 1. CollisionDetectionService（衝突判定サービス）
- [ ] 2. BlockPatternGeneratorService（ブロックパターン生成サービス）
- [ ] 3. BlockMatchingService（消去判定サービス）
- [ ] 4. BlockFallService（自由落下サービス）
- [ ] 5. BlockRemovalService（削除サービス）
- [ ] 6. Game.landBlock()の完全実装

### 実装順序（依存関係順）

1. **CollisionDetectionService**（衝突判定サービス）- 基本サービス
2. **BlockPatternGeneratorService**（ブロックパターン生成サービス）- 独立
3. **BlockMatchingService**（消去判定サービス）- 独立
4. **BlockFallService**（自由落下サービス）- 独立
5. **BlockRemovalService**（削除サービス）- BlockFallServiceに依存
6. **Game.landBlock()完全実装** - すべてのサービスに依存

---

## 1. CollisionDetectionService（衝突判定サービス）のTDD実装

### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] CollisionDetectionService実装完了

### 🔴 Red: テストを先に書く（所要時間: 45分）

**ファイル**: `tests/domain/services/CollisionDetectionService.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { CollisionDetectionService } from '@domain/services/CollisionDetectionService';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('CollisionDetectionService', () => {
  const service = new CollisionDetectionService();

  describe('canPlaceBlock', () => {
    test('空のフィールドには配置できる', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]];

      const result = service.canPlaceBlock(position, blocks, field);
      expect(result).toBe(true);
    });

    test('範囲外には配置できない', () => {
      const field = Field.create();
      const position = Position.create(7, 0); // 右端
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]]; // 2x2なので範囲外に出る

      const result = service.canPlaceBlock(position, blocks, field);
      expect(result).toBe(false);
    });

    test('既存のブロックがある位置には配置できない', () => {
      const field = Field.create();
      field.placeBlock(Position.create(3, 5), Block.create(Color.RED));

      const position = Position.create(2, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [null, null]];

      const result = service.canPlaceBlock(position, blocks, field);
      expect(result).toBe(false); // (3,5)に衝突
    });

    test('nullのブロックは衝突判定に含まれない', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, null], [null, null]]; // 1つだけブロック

      const result = service.canPlaceBlock(position, blocks, field);
      expect(result).toBe(true);
    });
  });

  describe('isColliding', () => {
    test('他のブロックと衝突している場合はtrueを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(3, 5), Block.create(Color.RED));

      const position = Position.create(3, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, null], [null, null]];

      const result = service.isColliding(position, blocks, field);
      expect(result).toBe(true);
    });

    test('衝突していない場合はfalseを返す', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, null], [null, null]];

      const result = service.isColliding(position, blocks, field);
      expect(result).toBe(false);
    });
  });

  describe('isOutOfBounds', () => {
    test('範囲内の場合はfalseを返す', () => {
      const position = Position.create(0, 0);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]];

      const result = service.isOutOfBounds(position, blocks, 8, 20);
      expect(result).toBe(false);
    });

    test('範囲外の場合はtrueを返す', () => {
      const position = Position.create(7, 0); // 右端
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]];

      const result = service.isOutOfBounds(position, blocks, 8, 20);
      expect(result).toBe(true); // x=7,8で範囲外
    });

    test('下端を超える場合はtrueを返す', () => {
      const position = Position.create(0, 19); // 下端
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]];

      const result = service.isOutOfBounds(position, blocks, 8, 20);
      expect(result).toBe(true); // y=19,20で範囲外
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 1.5時間）

**ファイル**: `src/domain/services/CollisionDetectionService.ts`

```typescript
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';

/**
 * CollisionDetectionService - 衝突判定サービス
 *
 * @remarks
 * - Stateless（状態を持たない）
 * - Pure Function（副作用なし）
 */
export class CollisionDetectionService {
  /**
   * 指定位置にブロックパターンを配置できるかを判定
   */
  canPlaceBlock(
    position: Position,
    blocks: (Block | null)[][],
    field: Field
  ): boolean {
    if (this.isOutOfBounds(position, blocks, field.width, field.height)) {
      return false;
    }

    if (this.isColliding(position, blocks, field)) {
      return false;
    }

    return true;
  }

  /**
   * 他のブロックと衝突しているかを判定
   */
  isColliding(
    position: Position,
    blocks: (Block | null)[][],
    field: Field
  ): boolean {
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x] !== null) {
          const absPos = Position.create(position.x + x, position.y + y);
          if (!field.isEmpty(absPos)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * フィールドの範囲外にはみ出しているかを判定
   */
  isOutOfBounds(
    position: Position,
    blocks: (Block | null)[][],
    fieldWidth: number,
    fieldHeight: number
  ): boolean {
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x] !== null) {
          const absX = position.x + x;
          const absY = position.y + y;

          if (absX < 0 || absX >= fieldWidth || absY < 0 || absY >= fieldHeight) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
```

**実行**: テストが成功 ✅

**CollisionDetectionServiceの完了**: ✅

---

## 2. BlockPatternGeneratorService（ブロックパターン生成サービス）のTDD実装

### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く（モックRandomGenerator使用）
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] BlockPatternGeneratorService実装完了

### 🔴 Red: テストを先に書く（所要時間: 45分）

**ファイル**: `tests/domain/services/BlockPatternGeneratorService.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { BlockPatternGeneratorService } from '@domain/services/BlockPatternGeneratorService';
import { RandomGenerator } from '@infrastructure/random/RandomGenerator';

// テスト用のモックRandomGenerator
class MockRandomGenerator implements RandomGenerator {
  private values: number[] = [];
  private index = 0;

  setValues(values: number[]) {
    this.values = values;
    this.index = 0;
  }

  nextInt(max: number): number {
    const value = this.values[this.index % this.values.length];
    this.index++;
    return value % max;
  }

  nextFloat(): number {
    const value = this.values[this.index % this.values.length];
    this.index++;
    return value;
  }
}

describe('BlockPatternGeneratorService', () => {
  describe('generate', () => {
    test('ランダムなパターンを生成できる', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([0, 0, 0, 0, 0]); // すべて0を返す
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generate();
      expect(pattern).not.toBeNull();
      expect(pattern.blocks.length).toBe(2);
      expect(pattern.blocks[0].length).toBe(2);
    });

    test('Pattern4を生成できる', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([0, 0]); // パターンタイプ=0, 色=0
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generate();
      expect(pattern.patternType).toBe('pattern4');
    });

    test('Pattern3x1を生成できる', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([1, 0, 0, 0]); // パターンタイプ=1
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generate();
      expect(pattern.patternType).toBe('pattern3x1');
    });
  });

  describe('generatePattern4', () => {
    test('全て同じ色の2x2パターンを生成', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([0]); // 青
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generatePattern4();

      // すべてのブロックが同じ色
      const blocks = pattern.blocks;
      expect(blocks[0][0].color).toBe(blocks[0][1].color);
      expect(blocks[0][0].color).toBe(blocks[1][0].color);
      expect(blocks[0][0].color).toBe(blocks[1][1].color);
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 2時間）

**ファイル**: `src/domain/services/BlockPatternGeneratorService.ts`

詳細な実装は `docs/design/domain-services-detailed-design.md` を参照してください。

**重要**: RandomGeneratorを依存性注入で受け取ります。

**実行**: テストが成功 ✅

**BlockPatternGeneratorServiceの完了**: ✅

---

## 3. BlockMatchingService（消去判定サービス）のTDD実装

### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す（矩形検出アルゴリズム）
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] BlockMatchingService実装完了

### 🔴 Red: テストを先に書く（所要時間: 1時間）

**ファイル**: `tests/domain/services/BlockMatchingService.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { BlockMatchingService } from '@domain/services/BlockMatchingService';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('BlockMatchingService', () => {
  const service = new BlockMatchingService();

  describe('findMatchingRectangles', () => {
    test('空のフィールドでは何も見つからない', () => {
      const field = Field.create();
      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBe(0);
    });

    test('2x2の同色矩形を検出できる', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 2x2の青ブロックを配置
      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(1, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBe(1);
      expect(rectangles[0].width).toBe(2);
      expect(rectangles[0].height).toBe(2);
    });

    test('3x3の同色矩形を検出できる', () => {
      const field = Field.create();
      const red = Block.create(Color.RED);

      // 3x3の赤ブロックを配置
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          field.placeBlock(Position.create(x, y), red);
        }
      }

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBeGreaterThan(0);

      // 最大の矩形を探す
      const maxRect = rectangles.reduce((max, rect) =>
        rect.area() > max.area() ? rect : max
      );
      expect(maxRect.width).toBe(3);
      expect(maxRect.height).toBe(3);
    });

    test('複数の矩形を検出できる', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);
      const red = Block.create(Color.RED);

      // 2x2の青ブロック
      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(1, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      // 2x2の赤ブロック（離れた位置）
      field.placeBlock(Position.create(4, 4), red);
      field.placeBlock(Position.create(5, 4), red);
      field.placeBlock(Position.create(4, 5), red);
      field.placeBlock(Position.create(5, 5), red);

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBeGreaterThanOrEqual(2);
    });

    test('1x1のブロックは検出されない', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBe(0);
    });
  });

  describe('isRectangle', () => {
    test('同色の矩形配置はtrueを返す', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(1, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      const positions = [
        Position.create(0, 0),
        Position.create(1, 0),
        Position.create(0, 1),
        Position.create(1, 1),
      ];

      const result = service.isRectangle(positions, Color.BLUE, field);
      expect(result).toBe(true);
    });

    test('異なる色が混在する場合はfalseを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
      field.placeBlock(Position.create(1, 0), Block.create(Color.RED)); // 異なる色

      const positions = [
        Position.create(0, 0),
        Position.create(1, 0),
      ];

      const result = service.isRectangle(positions, Color.BLUE, field);
      expect(result).toBe(false);
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 3時間）

**ファイル**: `src/domain/services/BlockMatchingService.ts`

詳細な実装は `docs/design/domain-services-detailed-design.md` を参照してください。

**アルゴリズム**:
1. フィールド全体をスキャン
2. 各ブロックを起点に、右方向と下方向に同じ色が連続する数を計算
3. 2x2以上の矩形を検出
4. 重複を排除

**実行**: テストが成功 ✅

**BlockMatchingServiceの完了**: ✅

---

## 4. BlockFallService（自由落下サービス）のTDD実装

### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す（重力アルゴリズム）
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] BlockFallService実装完了

### 🔴 Red: テストを先に書く（所要時間: 45分）

**ファイル**: `tests/domain/services/BlockFallService.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { BlockFallService } from '@domain/services/BlockFallService';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('BlockFallService', () => {
  const service = new BlockFallService();

  describe('applyGravity', () => {
    test('空のフィールドでは何も起こらない', () => {
      const field = Field.create();
      const result = service.applyGravity(field);
      expect(result).toBe(false); // 落下なし
    });

    test('浮いているブロックが落下する', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 浮いているブロック
      field.placeBlock(Position.create(0, 5), blue);

      const result = service.applyGravity(field);
      expect(result).toBe(true); // 落下あり
      expect(field.isEmpty(Position.create(0, 5))).toBe(true);
      expect(field.getBlock(Position.create(0, 19))).not.toBeNull();
    });

    test('下にブロックがある場合はその上に停止する', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);
      const red = Block.create(Color.RED);

      // 下に赤ブロック
      field.placeBlock(Position.create(0, 19), red);
      // 上に青ブロック（浮いている）
      field.placeBlock(Position.create(0, 17), blue);

      service.applyGravity(field);

      expect(field.getBlock(Position.create(0, 18))).toBe(blue);
      expect(field.getBlock(Position.create(0, 19))).toBe(red);
    });

    test('複数のブロックが同時に落下する', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      field.placeBlock(Position.create(0, 5), blue);
      field.placeBlock(Position.create(1, 3), blue);

      service.applyGravity(field);

      expect(field.getBlock(Position.create(0, 19))).not.toBeNull();
      expect(field.getBlock(Position.create(1, 19))).not.toBeNull();
    });
  });

  describe('canFall', () => {
    test('下が空の場合はtrueを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 5), Block.create(Color.BLUE));

      const result = service.canFall(Position.create(0, 5), field);
      expect(result).toBe(true);
    });

    test('下端にある場合はfalseを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 19), Block.create(Color.BLUE));

      const result = service.canFall(Position.create(0, 19), field);
      expect(result).toBe(false);
    });

    test('下にブロックがある場合はfalseを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 18), Block.create(Color.BLUE));
      field.placeBlock(Position.create(0, 19), Block.create(Color.RED));

      const result = service.canFall(Position.create(0, 18), field);
      expect(result).toBe(false);
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 2時間）

**ファイル**: `src/domain/services/BlockFallService.ts`

詳細な実装は `docs/design/domain-services-detailed-design.md` を参照してください。

**実行**: テストが成功 ✅

**BlockFallServiceの完了**: ✅

---

## 5. BlockRemovalService（削除サービス）のTDD実装

### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す（連鎖処理含む）
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] BlockRemovalService実装完了

### 🔴 Red: テストを先に書く（所要時間: 45分）

**ファイル**: `tests/domain/services/BlockRemovalService.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { BlockRemovalService } from '@domain/services/BlockRemovalService';
import { BlockFallService } from '@domain/services/BlockFallService';
import { BlockMatchingService } from '@domain/services/BlockMatchingService';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';
import { Rectangle } from '@domain/models/value-objects/Rectangle';

describe('BlockRemovalService', () => {
  const blockFallService = new BlockFallService();
  const blockMatchingService = new BlockMatchingService();
  const service = new BlockRemovalService(blockFallService, blockMatchingService);

  describe('removeBlocks', () => {
    test('指定された矩形のブロックを削除できる', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 2x2の青ブロック
      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(1, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      const rectangles = [Rectangle.create(Position.create(0, 0), 2, 2)];
      const removedCount = service.removeBlocks(rectangles, field);

      expect(removedCount).toBe(4);
      expect(field.isEmpty(Position.create(0, 0))).toBe(true);
      expect(field.isEmpty(Position.create(1, 1))).toBe(true);
    });
  });

  describe('processRemovalChain', () => {
    test('連鎖なしの場合は1回だけ削除される', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 2x2の青ブロック
      field.placeBlock(Position.create(0, 18), blue);
      field.placeBlock(Position.create(1, 18), blue);
      field.placeBlock(Position.create(0, 19), blue);
      field.placeBlock(Position.create(1, 19), blue);

      const totalRemoved = service.processRemovalChain(field);
      expect(totalRemoved).toBe(4);
    });

    test('連鎖が発生する場合は複数回削除される', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);
      const red = Block.create(Color.RED);

      // 上段: 2x2の赤ブロック（浮いている）
      field.placeBlock(Position.create(0, 16), red);
      field.placeBlock(Position.create(1, 16), red);
      field.placeBlock(Position.create(0, 17), red);
      field.placeBlock(Position.create(1, 17), red);

      // 下段: 2x2の青ブロック（削除対象）
      field.placeBlock(Position.create(0, 18), blue);
      field.placeBlock(Position.create(1, 18), blue);
      field.placeBlock(Position.create(0, 19), blue);
      field.placeBlock(Position.create(1, 19), blue);

      const totalRemoved = service.processRemovalChain(field);
      expect(totalRemoved).toBeGreaterThanOrEqual(4);
    });

    test('消去可能なブロックがない場合は0を返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));

      const totalRemoved = service.processRemovalChain(field);
      expect(totalRemoved).toBe(0);
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 2時間）

**ファイル**: `src/domain/services/BlockRemovalService.ts`

詳細な実装は `docs/design/domain-services-detailed-design.md` を参照してください。

**処理フロー**:
1. 矩形内のブロックを全て削除
2. 削除マス数を計算
3. 自由落下を適用
4. 再度消去判定（連鎖）
5. 連鎖がなくなるまで繰り返す

**実行**: テストが成功 ✅

**BlockRemovalServiceの完了**: ✅

---

## Game.landBlock()の完全実装

### タスクチェックリスト

- [ ] 🔴 Red: テストケースを追加（消去判定、連鎖処理）
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: landBlock()を完全実装
  - [ ] BlockMatchingServiceで消去判定
  - [ ] BlockRemovalServiceで削除と連鎖処理
  - [ ] スコア加算
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] Game.landBlock()完全実装完了

Phase 1-3の完了後、`Game.landBlock()`メソッドを完全に実装します。

### 完全版のlandBlock()

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

  // 2. 落下ブロックを削除
  this._fallingBlock = null;

  // 3. 消去判定と連鎖処理（Phase 1-3で追加）
  const removedCount = this.blockRemovalService.processRemovalChain(this._field);

  // 4. スコア加算
  if (removedCount > 0) {
    this._score = this._score.add(removedCount);
  }

  // 5. ゲームオーバー判定
  if (this.isGameOver()) {
    this._state = GameState.GameOver;
  }
}
```

---

## 完了条件

- [ ] 5つのドメインサービスが実装されている
- [ ] すべてのメソッドが正しく動作する
- [ ] すべての単体テストが成功する（100% pass）
- [ ] テストカバレッジが85%以上
- [ ] TypeScriptのコンパイルエラーがない
- [ ] ESLintの警告がない
- [ ] JSDocドキュメントコメントが記載されている
- [ ] ドメインサービスはStateless（状態を持たない）
- [ ] Game.landBlock()の完全実装が完了

---

## TDDサイクル数

| ドメインサービス | サイクル数 | 所要時間 |
|----------------|-----------|---------|
| CollisionDetectionService | 2サイクル | 2.5時間 |
| BlockPatternGeneratorService | 2-3サイクル | 3時間 |
| BlockMatchingService | 3-4サイクル | 4時間 |
| BlockFallService | 2-3サイクル | 3時間 |
| BlockRemovalService | 2-3サイクル | 3時間 |
| Game.landBlock()完全実装 | 1サイクル | 1時間 |
| **合計** | **12-17サイクル** | **16.5時間** |

**見積もり**: 6日（1日2-3時間の作業）

---

## 依存関係

**前提**:
- Issue 1.1: 値オブジェクトの実装（TDD）
- Issue 1.2: エンティティの実装（TDD）

**後続のタスク**:
- Issue 2.1: リポジトリの実装（TDD）
- Issue 2.2: アプリケーションサービスの実装（TDD）

---

## 作業の進め方

### 1日目
- CollisionDetectionServiceの実装

### 2日目
- BlockPatternGeneratorServiceの実装

### 3日目
- BlockMatchingServiceの実装開始

### 4日目
- BlockMatchingServiceの完了
- BlockFallServiceの実装開始

### 5日目
- BlockFallServiceの完了
- BlockRemovalServiceの実装開始

### 6日目
- BlockRemovalServiceの完了
- Game.landBlock()の完全実装
- 全体の統合テスト

---

## 参考資料

- [TDD実装計画](./README.md)
- [ドメインサービス詳細設計](../../design/domain-services-detailed-design.md)
- [統合設計書](../../design/integration-design.md)
