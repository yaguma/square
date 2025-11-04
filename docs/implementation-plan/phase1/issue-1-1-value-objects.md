# [Phase 1-1] 値オブジェクトの実装

## 概要

ドメイン層の基盤となる値オブジェクト（Value Object）を実装します。

## 参照ドキュメント

- `docs/design/value-objects-detailed-design.md`
- `docs/design/integration-design.md`

## 実装対象

以下の7つの値オブジェクトを実装します：

### 1. Position（座標）

**ファイル**: `src/domain/models/value-objects/Position.ts`

**責務**: 2次元座標の表現と計算

**メソッド**:
- `static create(x: number, y: number): Position`
- `get x(): number`
- `get y(): number`
- `equals(other: Position): boolean`
- `add(other: Position): Position`
- `subtract(other: Position): Position`
- `isValid(width: number, height: number): boolean`
- `toString(): string`

**バリデーション**:
- x, yは整数
- x, yは0以上

---

### 2. Color（色）

**ファイル**: `src/domain/models/value-objects/Color.ts`

**責務**: ブロックの色（青、赤、黄）

**型定義**:
```typescript
export type ColorType = 'blue' | 'red' | 'yellow';
```

**定数**:
- `static readonly BLUE: Color`
- `static readonly RED: Color`
- `static readonly YELLOW: Color`

**メソッド**:
- `get type(): ColorType`
- `get hexCode(): string`
- `equals(other: Color): boolean`
- `toString(): string`

**色の定義**:
- BLUE: `#3498db`
- RED: `#e74c3c`
- YELLOW: `#f1c40f`

---

### 3. Block（ブロック）

**ファイル**: `src/domain/models/value-objects/Block.ts`

**責務**: 単一ブロック（1x1マス）

**メソッド**:
- `static create(color: Color): Block`
- `get color(): Color`
- `equals(other: Block): boolean`
- `isSameColor(other: Block): boolean`
- `toString(): string`

**バリデーション**:
- colorはnullでないこと

---

### 4. BlockPattern（ブロックパターン）

**ファイル**: `src/domain/models/value-objects/BlockPattern.ts`

**責務**: 落下ブロックの2x2パターン（4種類）

**型定義**:
```typescript
export type PatternType = 'pattern4' | 'pattern3x1' | 'pattern2x2' | 'pattern2x1x1';
export type Rotation = 0 | 90 | 180 | 270;
```

**メソッド**:
- `static create(patternType: PatternType, blocks: Block[][]): BlockPattern`
- `get patternType(): PatternType`
- `get blocks(): Block[][]`
- `rotate(rotation: Rotation): Block[][]`
- `getBlockAt(x: number, y: number, rotation: Rotation): Block | null`
- `toString(): string`

**バリデーション**:
- blocksは2x2のサイズ

**パターンの種類**:
1. **Pattern4**: 全て同色
2. **Pattern3x1**: 3つ同色 + 1つ別色
3. **Pattern2x2**: 2つずつ同じ色
4. **Pattern2x1x1**: 2つ同色 + 2つ異なる色

---

### 5. Score（スコア）

**ファイル**: `src/domain/models/value-objects/Score.ts`

**責務**: ゲームスコア

**メソッド**:
- `static create(value: number): Score`
- `static zero(): Score`
- `get value(): number`
- `add(points: number): Score`
- `equals(other: Score): boolean`
- `toString(): string`

**バリデーション**:
- valueは0以上の整数

---

### 6. Rectangle（矩形）

**ファイル**: `src/domain/models/value-objects/Rectangle.ts`

**責務**: 矩形領域

**メソッド**:
- `static create(topLeft: Position, width: number, height: number): Rectangle`
- `get topLeft(): Position`
- `get width(): number`
- `get height(): number`
- `get bottomRight(): Position`
- `contains(position: Position): boolean`
- `getPositions(): Position[]`
- `area(): number`
- `equals(other: Rectangle): boolean`
- `toString(): string`

**バリデーション**:
- width, heightは1以上

---

### 7. GameState（ゲーム状態）

**ファイル**: `src/domain/models/value-objects/GameState.ts`

**責務**: ゲームの状態

**実装**:
```typescript
export enum GameState {
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameOver'
}
```

---

## 実装原則

### 不変性（Immutability）

- すべての値オブジェクトは作成後に状態を変更できない
- すべてのプロパティは`readonly`として宣言
- 状態の変更が必要な場合は、新しいインスタンスを返す

### ファクトリメソッド

- プライベートコンストラクタを使用
- `static create()`メソッドでインスタンスを生成
- ファクトリメソッド内でバリデーションを実施
- 不正な値の場合はエラーをスロー

### 等価性判定

- `equals()`メソッドで値による等価性を判定
- 参照ではなく、内部の値で比較

### 実装パターン

```typescript
export class ValueObject {
  private constructor(
    private readonly _property: Type
  ) {}

  static create(property: Type): ValueObject {
    // バリデーション
    if (/* 不正な値 */) {
      throw new Error('...');
    }
    return new ValueObject(property);
  }

  get property(): Type {
    return this._property;
  }

  equals(other: ValueObject): boolean {
    return this._property === other._property;
  }

  toString(): string {
    return `ValueObject(${this._property})`;
  }
}
```

---

## テスト

各値オブジェクトに対して単体テストを作成します。

### テストファイル

- `tests/domain/models/value-objects/Position.test.ts`
- `tests/domain/models/value-objects/Color.test.ts`
- `tests/domain/models/value-objects/Block.test.ts`
- `tests/domain/models/value-objects/BlockPattern.test.ts`
- `tests/domain/models/value-objects/Score.test.ts`
- `tests/domain/models/value-objects/Rectangle.test.ts`
- `tests/domain/models/value-objects/GameState.test.ts`

### テストケース例（Position）

```typescript
describe('Position', () => {
  test('正常に座標を作成できる', () => {
    const position = Position.create(3, 5);
    expect(position.x).toBe(3);
    expect(position.y).toBe(5);
  });

  test('負の座標でエラーをスローする', () => {
    expect(() => Position.create(-1, 5)).toThrow();
  });

  test('小数でエラーをスローする', () => {
    expect(() => Position.create(1.5, 5)).toThrow();
  });

  test('座標を加算できる', () => {
    const pos1 = Position.create(1, 2);
    const pos2 = Position.create(3, 4);
    const result = pos1.add(pos2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  test('同じ座標の場合にequalsがtrueを返す', () => {
    const pos1 = Position.create(3, 5);
    const pos2 = Position.create(3, 5);
    expect(pos1.equals(pos2)).toBe(true);
  });

  test('異なる座標の場合にequalsがfalseを返す', () => {
    const pos1 = Position.create(3, 5);
    const pos2 = Position.create(3, 6);
    expect(pos1.equals(pos2)).toBe(false);
  });

  test('有効な座標範囲を判定できる', () => {
    const position = Position.create(3, 5);
    expect(position.isValid(8, 20)).toBe(true);
    expect(position.isValid(2, 4)).toBe(false);
  });
});
```

---

## 完了条件

- [ ] すべての値オブジェクトが実装されている
- [ ] すべてのメソッドが正しく動作する
- [ ] すべての単体テストが成功する
- [ ] テストカバレッジが80%以上
- [ ] TypeScriptのコンパイルエラーがない
- [ ] ESLintの警告がない
- [ ] すべてのバリデーションが正しく機能する
- [ ] ドキュメントコメント（JSDoc）が記載されている

---

## 見積もり

**工数**: 2-3日

**内訳**:
- Position, Color, Block: 0.5日
- BlockPattern: 1日
- Score, Rectangle: 0.5日
- GameState: 0.5日
- テスト作成: 0.5-1日

---

## 依存関係

**前提**: なし（最初に実装すべき基盤コンポーネント）

**後続のタスク**:
- Issue 1.2: エンティティの実装（FieldがPosition, Blockに依存）
- Issue 1.3: ドメインサービスの実装（各サービスが値オブジェクトに依存）

---

## 注意事項

- 各値オブジェクトは独立しているため、並行して実装可能
- BlockPatternは他の値オブジェクト（Block, Color）に依存するため、後で実装
- 実装順序の推奨: Position → Color → Block → Score → Rectangle → GameState → BlockPattern

---

## 参考コード

詳細な実装例は `docs/design/value-objects-detailed-design.md` を参照してください。
