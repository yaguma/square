/**
 * ColorType - ブロックの色の型定義
 */
export type ColorType = 'blue' | 'red' | 'yellow';

/**
 * Color - ブロックの色を表す値オブジェクト
 *
 * @remarks
 * - 3色（青、赤、黄）の定数を提供
 * - 不変（Immutable）
 * - 等価性は値で判定
 */
export class Color {
  private constructor(
    private readonly _type: ColorType,
    private readonly _hexCode: string
  ) {}

  /**
   * 青色
   */
  static readonly BLUE = new Color('blue', '#3498db');

  /**
   * 赤色
   */
  static readonly RED = new Color('red', '#e74c3c');

  /**
   * 黄色
   */
  static readonly YELLOW = new Color('yellow', '#f1c40f');

  /**
   * 色のタイプを取得
   */
  get type(): ColorType {
    return this._type;
  }

  /**
   * 16進数カラーコードを取得
   */
  get hexCode(): string {
    return this._hexCode;
  }

  /**
   * 等価性を判定
   *
   * @param other - 比較対象のColor
   * @returns 等しい場合true
   */
  equals(other: Color): boolean {
    return this._type === other._type;
  }

  /**
   * 文字列表現を返す
   *
   * @returns 色のタイプ名
   */
  toString(): string {
    return this._type;
  }
}
