import { Color } from './Color';

/**
 * Block - 単一ブロック（1x1マス）を表す値オブジェクト
 *
 * @remarks
 * - 不変（Immutable）
 * - 色を保持
 * - 等価性は色で判定
 */
export class Block {
  private constructor(private readonly _color: Color) {}

  /**
   * Blockインスタンスを生成
   *
   * @param color - ブロックの色
   * @returns Block
   * @throws colorがnullまたはundefinedの場合
   */
  static create(color: Color): Block {
    if (!color) {
      throw new Error('Block color is required');
    }
    return new Block(color);
  }

  /**
   * ブロックの色を取得
   */
  get color(): Color {
    return this._color;
  }

  /**
   * 等価性を判定
   *
   * @param other - 比較対象のBlock
   * @returns 等しい場合true
   */
  equals(other: Block): boolean {
    return this._color.equals(other._color);
  }

  /**
   * 同じ色かを判定
   *
   * @param other - 比較対象のBlock
   * @returns 同じ色の場合true
   */
  isSameColor(other: Block): boolean {
    return this._color.equals(other._color);
  }

  /**
   * 文字列表現を返す
   *
   * @returns 文字列表現
   */
  toString(): string {
    return `Block(${this._color.toString()})`;
  }
}
