# 値オブジェクト 詳細設計書

## 1. 概要

このドキュメントは、Squareゲームで使用する値オブジェクト（Value Object）の詳細設計を定義します。値オブジェクトは不変（Immutable）であり、等価性が値によって判定されます。

## 2. 共通原則

### 2.1 不変性（Immutability）

- すべての値オブジェクトは作成後に状態を変更できない
- 状態の変更が必要な場合は、新しいインスタンスを返す
- すべてのプロパティは`readonly`として宣言

### 2.2 等価性判定

- `equals()`メソッドで値による等価性を判定
- 参照ではなく、内部の値で等価性を比較

### 2.3 バリデーション

- コンストラクタまたはファクトリメソッドでバリデーションを実施
- 不正な値の場合はエラーをスロー
- 常に有効な状態を保証

### 2.4 TypeScript実装パターン

```typescript
export class ValueObject {
  private constructor(
    private readonly _property: Type
  ) {
    // バリデーション
  }

  static create(property: Type): ValueObject {
    // ファクトリメソッド
    return new ValueObject(property);
  }

  get property(): Type {
    return this._property;
  }

  equals(other: ValueObject): boolean {
    return this._property === other._property;
  }
}
```

## 3. Position（座標）

### 3.1 責務

- ゲームフィールド上の2次元座標を表現
- 座標計算（加算、減算）を提供
- 座標の有効性検証

### 3.2 クラス図

```
┌─────────────────────────────┐
│      Position               │
├─────────────────────────────┤
│ - _x: number                │
│ - _y: number                │
├─────────────────────────────┤
│ + static create(x, y)       │
│ + get x(): number           │
│ + get y(): number           │
│ + equals(other): boolean    │
│ + add(other): Position      │
│ + subtract(other): Position │
│ + isValid(width, height)    │
│ + toString(): string        │
└─────────────────────────────┘
```

### 3.3 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_x` | `number` | X座標（横方向） | 0以上の整数 |
| `_y` | `number` | Y座標（縦方向） | 0以上の整数 |

### 3.4 メソッド

#### create(x: number, y: number): Position

**説明**: Positionインスタンスを生成するファクトリメソッド

**パラメータ**:
- `x`: X座標（整数）
- `y`: Y座標（整数）

**戻り値**: `Position`

**例外**:
- `x`または`y`が整数でない場合、`Error`をスロー
- `x`または`y`が負の値の場合、`Error`をスロー

**使用例**:
```typescript
const position = Position.create(3, 5);
```

#### equals(other: Position): boolean

**説明**: 2つの座標が等しいかを判定

**パラメータ**:
- `other`: 比較対象の座標

**戻り値**: `boolean` - 等しい場合`true`

**使用例**:
```typescript
const pos1 = Position.create(3, 5);
const pos2 = Position.create(3, 5);
console.log(pos1.equals(pos2)); // true
```

#### add(other: Position): Position

**説明**: 2つの座標を加算した新しい座標を返す

**パラメータ**:
- `other`: 加算する座標

**戻り値**: `Position` - 加算結果の新しい座標

**使用例**:
```typescript
const pos1 = Position.create(1, 2);
const pos2 = Position.create(3, 4);
const result = pos1.add(pos2); // Position(4, 6)
```

#### subtract(other: Position): Position

**説明**: 2つの座標を減算した新しい座標を返す

**パラメータ**:
- `other`: 減算する座標

**戻り値**: `Position` - 減算結果の新しい座標

**使用例**:
```typescript
const pos1 = Position.create(5, 8);
const pos2 = Position.create(2, 3);
const result = pos1.subtract(pos2); // Position(3, 5)
```

#### isValid(width: number, height: number): boolean

**説明**: 座標が指定された範囲内にあるかを判定

**パラメータ**:
- `width`: フィールドの幅
- `height`: フィールドの高さ

**戻り値**: `boolean` - 有効範囲内の場合`true`

**使用例**:
```typescript
const position = Position.create(3, 5);
console.log(position.isValid(8, 20)); // true
console.log(position.isValid(2, 4));  // false
```

### 3.5 実装例

```typescript
export class Position {
  private constructor(
    private readonly _x: number,
    private readonly _y: number
  ) {}

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

## 4. Color（色）

### 4.1 責務

- ブロックの色を表現
- 3色（青、赤、黄）の定数を提供
- 色の等価性判定

### 4.2 クラス図

```
┌─────────────────────────────┐
│         Color               │
├─────────────────────────────┤
│ - _type: ColorType          │
│ - _hexCode: string          │
├─────────────────────────────┤
│ + static BLUE: Color        │
│ + static RED: Color         │
│ + static YELLOW: Color      │
│ + get type(): ColorType     │
│ + get hexCode(): string     │
│ + equals(other): boolean    │
│ + toString(): string        │
└─────────────────────────────┘
```

### 4.3 型定義

```typescript
export type ColorType = 'blue' | 'red' | 'yellow';
```

### 4.4 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_type` | `ColorType` | 色の種類 | 'blue', 'red', 'yellow'のいずれか |
| `_hexCode` | `string` | 16進数カラーコード | #で始まる6桁の16進数 |

### 4.5 定数

| 定数 | 色 | HEXコード |
|------|-----|-----------|
| `Color.BLUE` | 青 | `#3498db` |
| `Color.RED` | 赤 | `#e74c3c` |
| `Color.YELLOW` | 黄 | `#f1c40f` |

### 4.6 メソッド

#### equals(other: Color): boolean

**説明**: 2つの色が等しいかを判定

**パラメータ**:
- `other`: 比較対象の色

**戻り値**: `boolean` - 等しい場合`true`

**使用例**:
```typescript
const color1 = Color.BLUE;
const color2 = Color.BLUE;
console.log(color1.equals(color2)); // true
```

### 4.7 実装例

```typescript
export type ColorType = 'blue' | 'red' | 'yellow';

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

## 5. Block（ブロック）

### 5.1 責務

- 単一のブロック（1x1マス）を表現
- ブロックの色を保持
- ブロック同士の等価性判定

### 5.2 クラス図

```
┌─────────────────────────────┐
│         Block               │
├─────────────────────────────┤
│ - _color: Color             │
├─────────────────────────────┤
│ + static create(color)      │
│ + get color(): Color        │
│ + equals(other): boolean    │
│ + isSameColor(other): bool  │
│ + toString(): string        │
└─────────────────────────────┘
```

### 5.3 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_color` | `Color` | ブロックの色 | 必須、nullでない |

### 5.4 メソッド

#### create(color: Color): Block

**説明**: Blockインスタンスを生成するファクトリメソッド

**パラメータ**:
- `color`: ブロックの色

**戻り値**: `Block`

**例外**:
- `color`がnullの場合、`Error`をスロー

**使用例**:
```typescript
const block = Block.create(Color.BLUE);
```

#### isSameColor(other: Block): boolean

**説明**: 2つのブロックが同じ色かを判定

**パラメータ**:
- `other`: 比較対象のブロック

**戻り値**: `boolean` - 同じ色の場合`true`

**使用例**:
```typescript
const block1 = Block.create(Color.BLUE);
const block2 = Block.create(Color.BLUE);
console.log(block1.isSameColor(block2)); // true
```

### 5.5 実装例

```typescript
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

## 6. BlockPattern（ブロックパターン）

### 6.1 責務

- 落下ブロックの2x2パターンを表現
- 4種類のパターン（4, 3x1, 2x2, 2x1x1）を提供
- 回転後の配置を計算

### 6.2 クラス図

```
┌─────────────────────────────────────┐
│       BlockPattern                  │
├─────────────────────────────────────┤
│ - _patternType: PatternType         │
│ - _blocks: Block[][]                │
├─────────────────────────────────────┤
│ + static create(type, blocks)       │
│ + get patternType(): PatternType    │
│ + get blocks(): Block[][]           │
│ + rotate(rotation): Block[][]       │
│ + getBlockAt(x, y, rotation): Block │
│ + toString(): string                │
└─────────────────────────────────────┘
```

### 6.3 型定義

```typescript
export type PatternType = 'pattern4' | 'pattern3x1' | 'pattern2x2' | 'pattern2x1x1';
export type Rotation = 0 | 90 | 180 | 270;
```

### 6.4 パターン定義

#### Pattern4（全て同色）
```
■■
■■
```
- 4つ全て同じ色
- 回転不変

#### Pattern3x1（3つ同色+1つ別色）
```
■■  ■□  □■  ■■
■□  ■■  ■■  □■
```
- 3つが同じ色、1つが異なる色
- 4つの配置パターン

#### Pattern2x2（2つずつ同じ色）
```
■■  ■□  □■
□□  □■  ■□
```
- 横並び、縦並び、斜め配置

#### Pattern2x1x1（2つ同色+2つ異なる色）
```
■■  ■□  □■  等
□△  □△  □△
```
- 2つが同じ色、残り2つが異なる色

### 6.5 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_patternType` | `PatternType` | パターンの種類 | 必須 |
| `_blocks` | `Block[][]` | 2x2のブロック配列 | 必須、2x2のサイズ |

### 6.6 メソッド

#### create(patternType: PatternType, blocks: Block[][]): BlockPattern

**説明**: BlockPatternインスタンスを生成

**パラメータ**:
- `patternType`: パターンの種類
- `blocks`: 2x2のブロック配列

**戻り値**: `BlockPattern`

**例外**:
- `blocks`が2x2でない場合、`Error`をスロー

#### rotate(rotation: Rotation): Block[][]

**説明**: 指定された回転角度で回転後のブロック配置を返す

**パラメータ**:
- `rotation`: 回転角度（0, 90, 180, 270）

**戻り値**: `Block[][]` - 回転後の2x2配列

**回転アルゴリズム**:
- 0度: そのまま
- 90度: 時計回りに90度回転
- 180度: 180度回転
- 270度: 反時計回りに90度回転

**使用例**:
```typescript
const pattern = BlockPattern.create(/* ... */);
const rotated = pattern.rotate(90);
```

#### getBlockAt(x: number, y: number, rotation: Rotation): Block | null

**説明**: 回転を考慮して指定位置のブロックを取得

**パラメータ**:
- `x`: X座標（0-1）
- `y`: Y座標（0-1）
- `rotation`: 回転角度

**戻り値**: `Block | null` - ブロック、または存在しない場合null

### 6.7 実装例

```typescript
export type PatternType = 'pattern4' | 'pattern3x1' | 'pattern2x2' | 'pattern2x1x1';
export type Rotation = 0 | 90 | 180 | 270;

export class BlockPattern {
  private constructor(
    private readonly _patternType: PatternType,
    private readonly _blocks: Block[][]
  ) {}

  static create(patternType: PatternType, blocks: Block[][]): BlockPattern {
    if (blocks.length !== 2 || blocks[0].length !== 2 || blocks[1].length !== 2) {
      throw new Error('BlockPattern must be 2x2');
    }
    return new BlockPattern(patternType, blocks);
  }

  get patternType(): PatternType {
    return this._patternType;
  }

  get blocks(): Block[][] {
    return this._blocks.map(row => [...row]);
  }

  rotate(rotation: Rotation): Block[][] {
    switch (rotation) {
      case 0:
        return this.blocks;
      case 90:
        return [
          [this._blocks[1][0], this._blocks[0][0]],
          [this._blocks[1][1], this._blocks[0][1]]
        ];
      case 180:
        return [
          [this._blocks[1][1], this._blocks[1][0]],
          [this._blocks[0][1], this._blocks[0][0]]
        ];
      case 270:
        return [
          [this._blocks[0][1], this._blocks[1][1]],
          [this._blocks[0][0], this._blocks[1][0]]
        ];
    }
  }

  getBlockAt(x: number, y: number, rotation: Rotation): Block | null {
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      return null;
    }
    const rotated = this.rotate(rotation);
    return rotated[y][x];
  }

  toString(): string {
    return `BlockPattern(${this._patternType})`;
  }
}
```

## 7. Score（スコア）

### 7.1 責務

- ゲームのスコアを表現
- スコアの加算操作を提供
- スコアのリセット

### 7.2 クラス図

```
┌─────────────────────────────┐
│         Score               │
├─────────────────────────────┤
│ - _value: number            │
├─────────────────────────────┤
│ + static create(value)      │
│ + static zero()             │
│ + get value(): number       │
│ + add(points): Score        │
│ + equals(other): boolean    │
│ + toString(): string        │
└─────────────────────────────┘
```

### 7.3 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_value` | `number` | スコアの値 | 0以上の整数 |

### 7.4 メソッド

#### create(value: number): Score

**説明**: Scoreインスタンスを生成

**パラメータ**:
- `value`: スコアの値

**戻り値**: `Score`

**例外**:
- `value`が負の値の場合、`Error`をスロー
- `value`が整数でない場合、`Error`をスロー

#### zero(): Score

**説明**: スコア0のインスタンスを生成

**戻り値**: `Score`

**使用例**:
```typescript
const score = Score.zero(); // Score(0)
```

#### add(points: number): Score

**説明**: スコアを加算した新しいスコアを返す

**パラメータ**:
- `points`: 加算するポイント

**戻り値**: `Score` - 加算後の新しいスコア

**例外**:
- `points`が負の値の場合、`Error`をスロー

**使用例**:
```typescript
const score = Score.create(100);
const newScore = score.add(50); // Score(150)
```

### 7.5 実装例

```typescript
export class Score {
  private constructor(private readonly _value: number) {}

  static create(value: number): Score {
    if (!Number.isInteger(value)) {
      throw new Error('Score value must be an integer');
    }
    if (value < 0) {
      throw new Error('Score value must be non-negative');
    }
    return new Score(value);
  }

  static zero(): Score {
    return new Score(0);
  }

  get value(): number {
    return this._value;
  }

  add(points: number): Score {
    if (points < 0) {
      throw new Error('Points to add must be non-negative');
    }
    return Score.create(this._value + points);
  }

  equals(other: Score): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return `Score(${this._value})`;
  }
}
```

## 8. Rectangle（矩形）

### 8.1 責務

- 矩形領域を表現
- 矩形内の座標を管理
- 面積計算

### 8.2 クラス図

```
┌─────────────────────────────┐
│       Rectangle             │
├─────────────────────────────┤
│ - _topLeft: Position        │
│ - _width: number            │
│ - _height: number           │
├─────────────────────────────┤
│ + static create(...)        │
│ + get topLeft(): Position   │
│ + get width(): number       │
│ + get height(): number      │
│ + get bottomRight(): Pos    │
│ + contains(pos): boolean    │
│ + getPositions(): Position[]│
│ + area(): number            │
│ + equals(other): boolean    │
│ + toString(): string        │
└─────────────────────────────┘
```

### 8.3 属性

| 属性 | 型 | 説明 | 制約 |
|------|-----|------|------|
| `_topLeft` | `Position` | 左上の座標 | 必須 |
| `_width` | `number` | 幅 | 1以上の整数 |
| `_height` | `number` | 高さ | 1以上の整数 |

### 8.4 メソッド

#### create(topLeft: Position, width: number, height: number): Rectangle

**説明**: Rectangleインスタンスを生成

**パラメータ**:
- `topLeft`: 左上の座標
- `width`: 幅
- `height`: 高さ

**戻り値**: `Rectangle`

**例外**:
- `width`または`height`が1未満の場合、`Error`をスロー

#### contains(position: Position): boolean

**説明**: 指定座標が矩形内にあるかを判定

**パラメータ**:
- `position`: 判定対象の座標

**戻り値**: `boolean` - 矩形内の場合`true`

**使用例**:
```typescript
const rect = Rectangle.create(Position.create(0, 0), 3, 3);
console.log(rect.contains(Position.create(1, 1))); // true
console.log(rect.contains(Position.create(5, 5))); // false
```

#### getPositions(): Position[]

**説明**: 矩形内の全座標を配列で返す

**戻り値**: `Position[]` - 矩形内の全座標

**使用例**:
```typescript
const rect = Rectangle.create(Position.create(0, 0), 2, 2);
const positions = rect.getPositions();
// [Position(0,0), Position(1,0), Position(0,1), Position(1,1)]
```

#### area(): number

**説明**: 矩形の面積を返す

**戻り値**: `number` - 面積（width × height）

**使用例**:
```typescript
const rect = Rectangle.create(Position.create(0, 0), 3, 4);
console.log(rect.area()); // 12
```

### 8.5 実装例

```typescript
export class Rectangle {
  private constructor(
    private readonly _topLeft: Position,
    private readonly _width: number,
    private readonly _height: number
  ) {}

  static create(topLeft: Position, width: number, height: number): Rectangle {
    if (width < 1 || height < 1) {
      throw new Error('Rectangle dimensions must be at least 1');
    }
    return new Rectangle(topLeft, width, height);
  }

  get topLeft(): Position {
    return this._topLeft;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get bottomRight(): Position {
    return Position.create(
      this._topLeft.x + this._width - 1,
      this._topLeft.y + this._height - 1
    );
  }

  contains(position: Position): boolean {
    return (
      position.x >= this._topLeft.x &&
      position.x < this._topLeft.x + this._width &&
      position.y >= this._topLeft.y &&
      position.y < this._topLeft.y + this._height
    );
  }

  getPositions(): Position[] {
    const positions: Position[] = [];
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        positions.push(
          Position.create(this._topLeft.x + x, this._topLeft.y + y)
        );
      }
    }
    return positions;
  }

  area(): number {
    return this._width * this._height;
  }

  equals(other: Rectangle): boolean {
    return (
      this._topLeft.equals(other._topLeft) &&
      this._width === other._width &&
      this._height === other._height
    );
  }

  toString(): string {
    return `Rectangle(${this._topLeft.toString()}, ${this._width}x${this._height})`;
  }
}
```

## 9. GameState（ゲーム状態）

### 9.1 責務

- ゲームの状態を表現
- 状態遷移の型安全性を保証

### 9.2 列挙型定義

```typescript
export enum GameState {
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameOver'
}
```

### 9.3 状態遷移図

```
              start()
         ┌──────────────────┐
         │                  ↓
    [Initial] ─────→ [Playing]
                          │ ↑
                   pause()│ │resume()
                          ↓ │
                      [Paused]
                          │
                  gameOver()
                          ↓
                    [GameOver]
                          │
                   restart()
                          ↓
                     [Playing]
```

### 9.4 状態の説明

| 状態 | 値 | 説明 |
|------|-----|------|
| `Playing` | `'playing'` | ゲームがプレイ中 |
| `Paused` | `'paused'` | ゲームが一時停止中 |
| `GameOver` | `'gameOver'` | ゲームオーバー |

### 9.5 使用例

```typescript
let state: GameState = GameState.Playing;

if (state === GameState.Playing) {
  // ゲーム処理
}

state = GameState.Paused;
```

## 10. テストケース

### 10.1 Position

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

  test('有効な座標範囲を判定できる', () => {
    const position = Position.create(3, 5);
    expect(position.isValid(8, 20)).toBe(true);
    expect(position.isValid(2, 4)).toBe(false);
  });
});
```

### 10.2 Color

```typescript
describe('Color', () => {
  test('定数が正しく定義されている', () => {
    expect(Color.BLUE.type).toBe('blue');
    expect(Color.BLUE.hexCode).toBe('#3498db');
  });

  test('同じ色の場合にequalsがtrueを返す', () => {
    expect(Color.BLUE.equals(Color.BLUE)).toBe(true);
    expect(Color.BLUE.equals(Color.RED)).toBe(false);
  });
});
```

### 10.3 Block

```typescript
describe('Block', () => {
  test('正常にブロックを作成できる', () => {
    const block = Block.create(Color.BLUE);
    expect(block.color).toBe(Color.BLUE);
  });

  test('同じ色のブロックを判定できる', () => {
    const block1 = Block.create(Color.BLUE);
    const block2 = Block.create(Color.BLUE);
    expect(block1.isSameColor(block2)).toBe(true);
  });
});
```

### 10.4 Score

```typescript
describe('Score', () => {
  test('スコア0を作成できる', () => {
    const score = Score.zero();
    expect(score.value).toBe(0);
  });

  test('スコアを加算できる', () => {
    const score = Score.create(100);
    const newScore = score.add(50);
    expect(newScore.value).toBe(150);
    expect(score.value).toBe(100); // 元のスコアは不変
  });

  test('負のスコアでエラーをスローする', () => {
    expect(() => Score.create(-10)).toThrow();
  });
});
```

### 10.5 Rectangle

```typescript
describe('Rectangle', () => {
  test('正常に矩形を作成できる', () => {
    const rect = Rectangle.create(Position.create(0, 0), 3, 4);
    expect(rect.width).toBe(3);
    expect(rect.height).toBe(4);
  });

  test('座標が矩形内にあるか判定できる', () => {
    const rect = Rectangle.create(Position.create(1, 1), 3, 3);
    expect(rect.contains(Position.create(2, 2))).toBe(true);
    expect(rect.contains(Position.create(5, 5))).toBe(false);
  });

  test('面積を計算できる', () => {
    const rect = Rectangle.create(Position.create(0, 0), 3, 4);
    expect(rect.area()).toBe(12);
  });

  test('矩形内の全座標を取得できる', () => {
    const rect = Rectangle.create(Position.create(0, 0), 2, 2);
    const positions = rect.getPositions();
    expect(positions.length).toBe(4);
  });
});
```

## 11. まとめ

この詳細設計書では、以下の値オブジェクトを定義しました：

1. **Position**: 2次元座標の表現と計算
2. **Color**: ブロックの色（3色）
3. **Block**: 単一ブロック（1x1マス）
4. **BlockPattern**: 落下ブロックパターン（2x2マス）
5. **Score**: ゲームスコア
6. **Rectangle**: 矩形領域
7. **GameState**: ゲームの状態

すべての値オブジェクトは不変性を保ち、型安全性を確保しています。次のステップでは、これらの値オブジェクトを使用するエンティティの詳細設計を行います。
