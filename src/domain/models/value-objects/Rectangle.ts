import { Position } from './Position';

/**
 * Rectangle - 矩形領域を表す値オブジェクト
 *
 * @remarks
 * - 不変（Immutable）
 * - 左上の座標、幅、高さを保持
 * - 等価性は値で判定
 */
export class Rectangle {
  private constructor(
    private readonly _topLeft: Position,
    private readonly _width: number,
    private readonly _height: number
  ) {}

  /**
   * Rectangleインスタンスを生成
   *
   * @param topLeft - 左上の座標
   * @param width - 幅（1以上）
   * @param height - 高さ（1以上）
   * @returns Rectangle
   * @throws width, heightが1未満の場合
   */
  static create(topLeft: Position, width: number, height: number): Rectangle {
    if (width < 1 || height < 1) {
      throw new Error('Rectangle width and height must be positive');
    }
    return new Rectangle(topLeft, width, height);
  }

  /**
   * 左上の座標を取得
   */
  get topLeft(): Position {
    return this._topLeft;
  }

  /**
   * 幅を取得
   */
  get width(): number {
    return this._width;
  }

  /**
   * 高さを取得
   */
  get height(): number {
    return this._height;
  }

  /**
   * 右下の座標を取得
   */
  get bottomRight(): Position {
    return Position.create(
      this._topLeft.x + this._width - 1,
      this._topLeft.y + this._height - 1
    );
  }

  /**
   * 指定された座標が矩形内にあるかを判定
   *
   * @param position - 判定する座標
   * @returns 矩形内にある場合true
   */
  contains(position: Position): boolean {
    return (
      position.x >= this._topLeft.x &&
      position.x < this._topLeft.x + this._width &&
      position.y >= this._topLeft.y &&
      position.y < this._topLeft.y + this._height
    );
  }

  /**
   * 矩形内のすべての座標を取得
   *
   * @returns 座標の配列
   */
  getPositions(): Position[] {
    const positions: Position[] = [];
    for (let y = this._topLeft.y; y < this._topLeft.y + this._height; y++) {
      for (let x = this._topLeft.x; x < this._topLeft.x + this._width; x++) {
        positions.push(Position.create(x, y));
      }
    }
    return positions;
  }

  /**
   * 矩形の面積を計算
   *
   * @returns 面積
   */
  area(): number {
    return this._width * this._height;
  }

  /**
   * 等価性を判定
   *
   * @param other - 比較対象のRectangle
   * @returns 等しい場合true
   */
  equals(other: Rectangle): boolean {
    return (
      this._topLeft.equals(other._topLeft) &&
      this._width === other._width &&
      this._height === other._height
    );
  }

  /**
   * 文字列表現を返す
   *
   * @returns 文字列表現
   */
  toString(): string {
    return `Rectangle(topLeft: ${this._topLeft.toString()}, width: ${this._width}, height: ${this._height})`;
  }
}
