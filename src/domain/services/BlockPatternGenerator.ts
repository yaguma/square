import { BlockPattern, PatternType } from '@domain/models/value-objects/BlockPattern';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

/**
 * BlockPatternGenerator - ブロックパターン生成ユーティリティ
 *
 * ランダムなブロックパターンを生成します。
 *
 * @remarks
 * Phase1-2では簡易実装のみ。Phase1-3で完全実装します。
 */
export class BlockPatternGenerator {
  private static readonly COLORS: Color[] = [Color.BLUE, Color.RED, Color.YELLOW];
  private static readonly PATTERN_TYPES: PatternType[] = ['pattern4', 'pattern3x1', 'pattern2x2', 'pattern2x1x1'];

  /**
   * ランダムなブロックパターンを生成
   *
   * @returns BlockPattern
   *
   * @example
   * ```typescript
   * const pattern = BlockPatternGenerator.generate();
   * ```
   */
  static generate(): BlockPattern {
    const patternType = this.PATTERN_TYPES[Math.floor(Math.random() * this.PATTERN_TYPES.length)];

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

  /**
   * pattern4: 全て同色
   */
  private static generatePattern4(): BlockPattern {
    const color = this.randomColor();
    const block = Block.create(color);
    return BlockPattern.create('pattern4', [
      [block, block],
      [block, block]
    ]);
  }

  /**
   * pattern3x1: 3つ同色 + 1つ別色
   */
  private static generatePattern3x1(): BlockPattern {
    const color1 = this.randomColor();
    const color2 = this.randomColorExcept(color1);
    const block1 = Block.create(color1);
    const block2 = Block.create(color2);

    // ランダムな位置に別色を配置
    const position = Math.floor(Math.random() * 4);
    const blocks = [block1, block1, block1, block1];
    blocks[position] = block2;

    return BlockPattern.create('pattern3x1', [
      [blocks[0], blocks[1]],
      [blocks[2], blocks[3]]
    ]);
  }

  /**
   * pattern2x2: 2つずつ同じ色
   */
  private static generatePattern2x2(): BlockPattern {
    const color1 = this.randomColor();
    const color2 = this.randomColorExcept(color1);
    const block1 = Block.create(color1);
    const block2 = Block.create(color2);

    // ランダムな配置パターン
    const patterns = [
      [[block1, block1], [block2, block2]],
      [[block1, block2], [block1, block2]],
      [[block1, block2], [block2, block1]],
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return BlockPattern.create('pattern2x2', pattern);
  }

  /**
   * pattern2x1x1: 2つ同色 + 2つ異なる色
   */
  private static generatePattern2x1x1(): BlockPattern {
    const color1 = this.randomColor();
    const color2 = this.randomColorExcept(color1);
    const color3 = this.randomColorExcept(color1, color2);

    const block1 = Block.create(color1);
    const block2 = Block.create(color2);
    const block3 = Block.create(color3);

    // 2つ同色をランダムな位置に配置
    const blocks = [block1, block1, block2, block3];
    this.shuffle(blocks);

    return BlockPattern.create('pattern2x1x1', [
      [blocks[0], blocks[1]],
      [blocks[2], blocks[3]]
    ]);
  }

  /**
   * ランダムな色を取得
   */
  private static randomColor(): Color {
    return this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
  }

  /**
   * 指定された色以外のランダムな色を取得
   */
  private static randomColorExcept(...excludeColors: Color[]): Color {
    const availableColors = this.COLORS.filter(c => !excludeColors.includes(c));
    if (availableColors.length === 0) {
      // 除外しすぎた場合は、ランダムな色を返す
      return this.randomColor();
    }
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  }

  /**
   * 配列をシャッフル
   */
  private static shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
