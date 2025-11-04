import { Block } from './Block';

/**
 * PatternType - ブロックパターンの種類
 */
export type PatternType = 'pattern4' | 'pattern3x1' | 'pattern2x2' | 'pattern2x1x1';

/**
 * Rotation - 回転角度（度）
 */
export type Rotation = 0 | 90 | 180 | 270;

/**
 * BlockPattern - 落下ブロックの2x2パターンを表す値オブジェクト
 *
 * @remarks
 * - 不変（Immutable）
 * - 2x2のブロック配列を保持
 * - 回転機能を提供
 *
 * パターンの種類:
 * - pattern4: 全て同色
 * - pattern3x1: 3つ同色 + 1つ別色
 * - pattern2x2: 2つずつ同じ色
 * - pattern2x1x1: 2つ同色 + 2つ異なる色
 */
export class BlockPattern {
  private constructor(
    private readonly _patternType: PatternType,
    private readonly _blocks: Block[][]
  ) {}

  /**
   * BlockPatternインスタンスを生成
   *
   * @param patternType - パターンの種類
   * @param blocks - 2x2のブロック配列
   * @returns BlockPattern
   * @throws blocksが2x2でない場合
   */
  static create(patternType: PatternType, blocks: Block[][]): BlockPattern {
    if (blocks.length !== 2 || blocks[0].length !== 2 || blocks[1].length !== 2) {
      throw new Error('BlockPattern must be 2x2');
    }
    return new BlockPattern(patternType, blocks);
  }

  /**
   * パターンの種類を取得
   */
  get patternType(): PatternType {
    return this._patternType;
  }

  /**
   * ブロック配列を取得
   */
  get blocks(): Block[][] {
    return this._blocks;
  }

  /**
   * 指定された回転角度でブロック配列を回転
   *
   * @param rotation - 回転角度
   * @returns 回転後のブロック配列
   */
  rotate(rotation: Rotation): Block[][] {
    switch (rotation) {
      case 0:
        return [
          [this._blocks[0][0], this._blocks[0][1]],
          [this._blocks[1][0], this._blocks[1][1]]
        ];
      case 90:
        // 90度時計回りに回転
        // [0][0] [0][1]    [1][0] [0][0]
        // [1][0] [1][1] => [1][1] [0][1]
        return [
          [this._blocks[1][0], this._blocks[0][0]],
          [this._blocks[1][1], this._blocks[0][1]]
        ];
      case 180:
        // 180度回転
        // [0][0] [0][1]    [1][1] [1][0]
        // [1][0] [1][1] => [0][1] [0][0]
        return [
          [this._blocks[1][1], this._blocks[1][0]],
          [this._blocks[0][1], this._blocks[0][0]]
        ];
      case 270:
        // 270度時計回りに回転（90度反時計回り）
        // [0][0] [0][1]    [0][1] [1][1]
        // [1][0] [1][1] => [0][0] [1][0]
        return [
          [this._blocks[0][1], this._blocks[1][1]],
          [this._blocks[0][0], this._blocks[1][0]]
        ];
    }
  }

  /**
   * 指定された座標と回転角度でブロックを取得
   *
   * @param x - X座標（0または1）
   * @param y - Y座標（0または1）
   * @param rotation - 回転角度
   * @returns ブロック、範囲外の場合null
   */
  getBlockAt(x: number, y: number, rotation: Rotation): Block | null {
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      return null;
    }
    const rotated = this.rotate(rotation);
    return rotated[y][x];
  }

  /**
   * 文字列表現を返す
   *
   * @returns 文字列表現
   */
  toString(): string {
    return `BlockPattern(${this._patternType})`;
  }
}
