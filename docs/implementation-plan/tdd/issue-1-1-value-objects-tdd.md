# [Phase 1-1] 値オブジェクトの実装（TDD）

## 概要

ドメイン層の基盤となる値オブジェクト（Value Object）をTDD（テスト駆動開発）で実装します。

**TDDの原則**: 🔴 Red → 🟢 Green → 🔵 Refactor

## 参照ドキュメント

- `docs/design/value-objects-detailed-design.md`
- `docs/design/integration-design.md`

## 進捗管理チェックリスト

### 実装対象（全7つ）

- [ ] 1. Position（座標）
- [ ] 2. Color（色）
- [ ] 3. Block（ブロック）
- [ ] 4. Score（スコア）
- [ ] 5. Rectangle（矩形）
- [ ] 6. GameState（ゲーム状態）
- [ ] 7. BlockPattern（ブロックパターン）

### 実装順序（依存関係順）

1. **Position**（座標）- 他に依存なし
2. **Color**（色）- 他に依存なし
3. **Block**（ブロック）- Colorに依存
4. **Score**（スコア）- 他に依存なし
5. **Rectangle**（矩形）- Positionに依存
6. **GameState**（ゲーム状態）- 他に依存なし（列挙型）
7. **BlockPattern**（ブロックパターン）- Block, Colorに依存

---

## 1. Position（座標）のTDD実装

### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] Position実装完了

### 🔴 Red: テストを先に書く（所要時間: 30分）

**ファイル**: `tests/domain/models/value-objects/Position.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { Position } from '@domain/models/value-objects/Position';

describe('Position', () => {
  describe('create', () => {
    test('正常に座標を作成できる', () => {
      const position = Position.create(3, 5);
      expect(position.x).toBe(3);
      expect(position.y).toBe(5);
    });

    test('負の座標でエラーをスローする', () => {
      expect(() => Position.create(-1, 5)).toThrow('Position coordinates must be non-negative');
    });

    test('小数でエラーをスローする', () => {
      expect(() => Position.create(1.5, 5)).toThrow('Position coordinates must be integers');
    });
  });

  describe('equals', () => {
    test('同じ座標の場合にtrueを返す', () => {
      const pos1 = Position.create(3, 5);
      const pos2 = Position.create(3, 5);
      expect(pos1.equals(pos2)).toBe(true);
    });

    test('異なる座標の場合にfalseを返す', () => {
      const pos1 = Position.create(3, 5);
      const pos2 = Position.create(3, 6);
      expect(pos1.equals(pos2)).toBe(false);
    });
  });

  describe('add', () => {
    test('座標を加算できる', () => {
      const pos1 = Position.create(1, 2);
      const pos2 = Position.create(3, 4);
      const result = pos1.add(pos2);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    test('元のオブジェクトは変更されない（不変性）', () => {
      const pos1 = Position.create(1, 2);
      const pos2 = Position.create(3, 4);
      pos1.add(pos2);
      expect(pos1.x).toBe(1);
      expect(pos1.y).toBe(2);
    });
  });

  describe('subtract', () => {
    test('座標を減算できる', () => {
      const pos1 = Position.create(5, 8);
      const pos2 = Position.create(2, 3);
      const result = pos1.subtract(pos2);
      expect(result.x).toBe(3);
      expect(result.y).toBe(5);
    });
  });

  describe('isValid', () => {
    test('有効な座標範囲を判定できる', () => {
      const position = Position.create(3, 5);
      expect(position.isValid(8, 20)).toBe(true);
    });

    test('範囲外の座標を判定できる', () => {
      const position = Position.create(3, 5);
      expect(position.isValid(2, 4)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を返す', () => {
      const position = Position.create(3, 5);
      expect(position.toString()).toBe('Position(3, 5)');
    });
  });
});
```

**実行**: `npm test Position.test.ts`
**期待結果**: すべてのテストが失敗 ❌（Positionクラスが未実装のため）

---

### 🟢 Green: 実装してテストを通す（所要時間: 1時間）

**ファイル**: `src/domain/models/value-objects/Position.ts`

```typescript
/**
 * Position - 2次元座標を表す値オブジェクト
 *
 * @remarks
 * - 不変（Immutable）
 * - 等価性は値で判定
 * - x, yは非負の整数
 */
export class Position {
  private constructor(
    private readonly _x: number,
    private readonly _y: number
  ) {}

  /**
   * Positionインスタンスを生成
   *
   * @param x - X座標（0以上の整数）
   * @param y - Y座標（0以上の整数）
   * @returns Position
   * @throws x, yが整数でない場合、または負の値の場合
   */
  static create(x: number, y: number): Position {
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error('Position coordinates must be integers');
    }
    if (x < 0 || y < 0) {
      throw new Error('Position coordinates must be non-negative');
    }
    return new Position(x, y);
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  equals(other: Position): boolean {
    return this._x === other._x && this._y === other._y;
  }

  add(other: Position): Position {
    return Position.create(this._x + other._x, this._y + other._y);
  }

  subtract(other: Position): Position {
    return Position.create(this._x - other._x, this._y - other._y);
  }

  isValid(width: number, height: number): boolean {
    return this._x >= 0 && this._x < width && this._y >= 0 && this._y < height;
  }

  toString(): string {
    return `Position(${this._x}, ${this._y})`;
  }
}
```

**実行**: `npm test Position.test.ts`
**期待結果**: すべてのテストが成功 ✅

---

### 🔵 Refactor: リファクタリング（所要時間: 15分）

- コードの重複を排除
- 可読性の向上
- パフォーマンスの最適化

現時点では、コードは十分にシンプルなのでリファクタリング不要。

**Positionの完了**: ✅

---

## 2. Color（色）のTDD実装

### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング（必要に応じて）
- [ ] Color実装完了

### 🔴 Red: テストを先に書く（所要時間: 20分）

**ファイル**: `tests/domain/models/value-objects/Color.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { Color } from '@domain/models/value-objects/Color';

describe('Color', () => {
  describe('定数', () => {
    test('BLUEが正しく定義されている', () => {
      expect(Color.BLUE.type).toBe('blue');
      expect(Color.BLUE.hexCode).toBe('#3498db');
    });

    test('REDが正しく定義されている', () => {
      expect(Color.RED.type).toBe('red');
      expect(Color.RED.hexCode).toBe('#e74c3c');
    });

    test('YELLOWが正しく定義されている', () => {
      expect(Color.YELLOW.type).toBe('yellow');
      expect(Color.YELLOW.hexCode).toBe('#f1c40f');
    });
  });

  describe('equals', () => {
    test('同じ色の場合にtrueを返す', () => {
      expect(Color.BLUE.equals(Color.BLUE)).toBe(true);
    });

    test('異なる色の場合にfalseを返す', () => {
      expect(Color.BLUE.equals(Color.RED)).toBe(false);
    });
  });

  describe('toString', () => {
    test('色の文字列表現を返す', () => {
      expect(Color.BLUE.toString()).toBe('blue');
      expect(Color.RED.toString()).toBe('red');
      expect(Color.YELLOW.toString()).toBe('yellow');
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 30分）

**ファイル**: `src/domain/models/value-objects/Color.ts`

```typescript
export type ColorType = 'blue' | 'red' | 'yellow';

/**
 * Color - ブロックの色を表す値オブジェクト
 *
 * @remarks
 * - 3色（青、赤、黄）の定数を提供
 * - 不変（Immutable）
 */
export class Color {
  private constructor(
    private readonly _type: ColorType,
    private readonly _hexCode: string
  ) {}

  static readonly BLUE = new Color('blue', '#3498db');
  static readonly RED = new Color('red', '#e74c3c');
  static readonly YELLOW = new Color('yellow', '#f1c40f');

  get type(): ColorType {
    return this._type;
  }

  get hexCode(): string {
    return this._hexCode;
  }

  equals(other: Color): boolean {
    return this._type === other._type;
  }

  toString(): string {
    return this._type;
  }
}
```

**実行**: テストが成功 ✅

**Colorの完了**: ✅

---

## 3. Block（ブロック）のTDD実装

### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング（必要に応じて）
- [ ] Block実装完了

### 🔴 Red: テストを先に書く（所要時間: 20分）

**ファイル**: `tests/domain/models/value-objects/Block.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('Block', () => {
  describe('create', () => {
    test('正常にブロックを作成できる', () => {
      const block = Block.create(Color.BLUE);
      expect(block.color).toBe(Color.BLUE);
    });

    test('colorがnullの場合にエラーをスローする', () => {
      expect(() => Block.create(null as any)).toThrow('Block color is required');
    });
  });

  describe('equals', () => {
    test('同じ色のブロックはequalsがtrueを返す', () => {
      const block1 = Block.create(Color.BLUE);
      const block2 = Block.create(Color.BLUE);
      expect(block1.equals(block2)).toBe(true);
    });

    test('異なる色のブロックはequalsがfalseを返す', () => {
      const block1 = Block.create(Color.BLUE);
      const block2 = Block.create(Color.RED);
      expect(block1.equals(block2)).toBe(false);
    });
  });

  describe('isSameColor', () => {
    test('同じ色のブロックを判定できる', () => {
      const block1 = Block.create(Color.BLUE);
      const block2 = Block.create(Color.BLUE);
      expect(block1.isSameColor(block2)).toBe(true);
    });

    test('異なる色のブロックを判定できる', () => {
      const block1 = Block.create(Color.BLUE);
      const block2 = Block.create(Color.RED);
      expect(block1.isSameColor(block2)).toBe(false);
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 30分）

**ファイル**: `src/domain/models/value-objects/Block.ts`

```typescript
import { Color } from './Color';

/**
 * Block - 単一ブロック（1x1マス）を表す値オブジェクト
 *
 * @remarks
 * - 不変（Immutable）
 * - 色を保持
 */
export class Block {
  private constructor(private readonly _color: Color) {}

  static create(color: Color): Block {
    if (!color) {
      throw new Error('Block color is required');
    }
    return new Block(color);
  }

  get color(): Color {
    return this._color;
  }

  equals(other: Block): boolean {
    return this._color.equals(other._color);
  }

  isSameColor(other: Block): boolean {
    return this._color.equals(other._color);
  }

  toString(): string {
    return `Block(${this._color.toString()})`;
  }
}
```

**実行**: テストが成功 ✅

**Blockの完了**: ✅

---

## 4-7. 残りの値オブジェクト

同様の流れで実装します：

### 4. Score（スコア）

#### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] Score実装完了

**詳細**:
- **テスト**: `tests/domain/models/value-objects/Score.test.ts`
- **実装**: `src/domain/models/value-objects/Score.ts`
- **所要時間**: 1時間

---

### 5. Rectangle（矩形）

#### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] Rectangle実装完了

**詳細**:
- **テスト**: `tests/domain/models/value-objects/Rectangle.test.ts`
- **実装**: `src/domain/models/value-objects/Rectangle.ts`
- **所要時間**: 1.5時間

---

### 6. GameState（ゲーム状態）

#### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング（必要に応じて）
- [ ] GameState実装完了

**詳細**:
- **テスト**: `tests/domain/models/value-objects/GameState.test.ts`
- **実装**: `src/domain/models/value-objects/GameState.ts`
- **所要時間**: 30分

---

### 7. BlockPattern（ブロックパターン）

#### タスクチェックリスト

- [ ] 🔴 Red: テストを先に書く
- [ ] テストを実行して失敗を確認
- [ ] 🟢 Green: 実装してテストを通す
- [ ] テストを実行して成功を確認
- [ ] 🔵 Refactor: リファクタリング
- [ ] BlockPattern実装完了

**詳細**:
- **テスト**: `tests/domain/models/value-objects/BlockPattern.test.ts`
- **実装**: `src/domain/models/value-objects/BlockPattern.ts`
- **所要時間**: 2時間（最も複雑）

---

## 完了条件

- [ ] すべての値オブジェクト（7つ）が実装されている
- [ ] すべてのメソッドが正しく動作する
- [ ] すべての単体テストが成功する（100% pass）
- [ ] テストカバレッジが90%以上
- [ ] TypeScriptのコンパイルエラーがない
- [ ] ESLintの警告がない
- [ ] すべてのバリデーションが正しく機能する
- [ ] JSDocドキュメントコメントが記載されている
- [ ] 不変性が保証されている

---

## TDDサイクル数

| 値オブジェクト | サイクル数 | 所要時間 |
|--------------|-----------|---------|
| Position | 1サイクル | 2時間 |
| Color | 1サイクル | 1時間 |
| Block | 1サイクル | 1時間 |
| Score | 1サイクル | 1時間 |
| Rectangle | 1サイクル | 1.5時間 |
| GameState | 1サイクル | 0.5時間 |
| BlockPattern | 2-3サイクル | 2時間 |
| **合計** | **8-9サイクル** | **9時間** |

**見積もり**: 4日（1日2-3時間の作業）

---

## 依存関係

**前提**: なし（最初に実装すべき基盤コンポーネント）

**後続のタスク**:
- Issue 1.2: エンティティの実装（TDD）
- Issue 1.3: ドメインサービスの実装（TDD）

---

## 作業の進め方

### 1日目
- Position, Color, Blockの実装
- テストファースト、Red-Green-Refactorサイクルを徹底

### 2日目
- Score, Rectangleの実装

### 3日目
- GameStateの実装
- BlockPatternの実装開始

### 4日目
- BlockPatternの実装完了
- 全体のリファクタリング
- ドキュメントの充実

---

## コミットメッセージ例

```bash
# テスト追加時
test(domain): Position値オブジェクトのテストを追加

- create, equals, add, subtract, isValidのテストケースを追加
- 正常系と異常系の両方をカバー

Related to #[Issue番号]

# 実装完了時
feat(domain): Position値オブジェクトを実装

- ファクトリメソッドcreate()を実装
- バリデーション（整数、非負）を実装
- 不変性を保証
- 座標演算（add, subtract）を実装

すべてのテストが成功: 12/12 passed

Related to #[Issue番号]
```

---

## 参考資料

- [TDD実装計画](./README.md)
- [値オブジェクト詳細設計](../../design/value-objects-detailed-design.md)
- [統合設計書](../../design/integration-design.md)
