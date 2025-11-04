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

  /**
   * X座標を取得
   */
  get x(): number {
    return this._x;
  }

  /**
   * Y座標を取得
   */
  get y(): number {
    return this._y;
  }

  /**
   * 等価性を判定
   *
   * @param other - 比較対象のPosition
   * @returns 等しい場合true
   */
  equals(other: Position): boolean {
    return this._x === other._x && this._y === other._y;
  }

  /**
   * 座標を加算
   *
   * @param other - 加算する座標
   * @returns 新しいPositionインスタンス
   */
  add(other: Position): Position {
    return Position.create(this._x + other._x, this._y + other._y);
  }

  /**
   * 座標を減算
   *
   * @param other - 減算する座標
   * @returns 新しいPositionインスタンス
   */
  subtract(other: Position): Position {
    return Position.create(this._x - other._x, this._y - other._y);
  }

  /**
   * 指定された範囲内にあるかを判定
   *
   * @param width - 幅
   * @param height - 高さ
   * @returns 範囲内の場合true
   */
  isValid(width: number, height: number): boolean {
    return this._x >= 0 && this._x < width && this._y >= 0 && this._y < height;
  }

  /**
   * 文字列表現を返す
   *
   * @returns 文字列表現
   */
  toString(): string {
    return `Position(${this._x}, ${this._y})`;
  }
}
