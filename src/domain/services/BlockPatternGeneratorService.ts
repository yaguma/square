import { BlockPattern, PatternType } from '@domain/models/value-objects/BlockPattern';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';
import { RandomGenerator } from '@infrastructure/random/RandomGenerator';

/**
 * BlockPatternGeneratorService - ブロックパターン生成サービス
 *
 * ランダムなブロックパターンを生成します。
 *
 * @remarks
 * - RandomGeneratorを依存性注入で受け取る
 * - Stateless（状態を持たない、RandomGeneratorは依存オブジェクト）
 */
export class BlockPatternGeneratorService {
  private static readonly COLORS: Color[] = [Color.BLUE, Color.RED, Color.YELLOW];
  private static readonly PATTERN_TYPES: PatternType[] = ['pattern4', 'pattern3x1', 'pattern2x2', 'pattern2x1x1'];

  /**
   * コンストラクタ
   *
   * @param randomGenerator - 乱数生成器（依存性注入）
   */
  constructor(private readonly randomGenerator: RandomGenerator) {}

  /**
   * ランダムなブロックパターンを生成
   *
   * @returns BlockPattern
   *
   * @example
   * ```typescript
   * const randomGenerator = new DefaultRandomGenerator();
   * const service = new BlockPatternGeneratorService(randomGenerator);
   * const pattern = service.generate();
   * ```
   */
  generate(): BlockPattern {
    const patternType = this.getRandomPattern();

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
   *
   * @returns BlockPattern
   */
  generatePattern4(): BlockPattern {
    const color = this.getRandomColor();
    const block = Block.create(color);
    return BlockPattern.create('pattern4', [
      [block, block],
      [block, block]
    ]);
  }

  /**
   * pattern3x1: 3つ同色 + 1つ別色
   *
   * @returns BlockPattern
   */
  generatePattern3x1(): BlockPattern {
    const color1 = this.getRandomColor();
    const color2 = this.getRandomColorExcept(color1);
    const block1 = Block.create(color1);
    const block2 = Block.create(color2);

    // ランダムな位置に別色を配置
    const position = this.randomGenerator.nextInt(4);
    const blocks = [block1, block1, block1, block1];
    blocks[position] = block2;

    return BlockPattern.create('pattern3x1', [
      [blocks[0], blocks[1]],
      [blocks[2], blocks[3]]
    ]);
  }

  /**
   * pattern2x2: 2つずつ同じ色
   *
   * @returns BlockPattern
   */
  generatePattern2x2(): BlockPattern {
    const color1 = this.getRandomColor();
    const color2 = this.getRandomColorExcept(color1);
    const block1 = Block.create(color1);
    const block2 = Block.create(color2);

    // ランダムな配置パターン
    const patterns = [
      [[block1, block1], [block2, block2]], // 横並び
      [[block1, block2], [block1, block2]], // 縦並び
      [[block1, block2], [block2, block1]], // 斜め
    ];

    const index = this.randomGenerator.nextInt(patterns.length);
    return BlockPattern.create('pattern2x2', patterns[index]);
  }

  /**
   * pattern2x1x1: 2つ同色 + 2つ異なる色
   *
   * @returns BlockPattern
   */
  generatePattern2x1x1(): BlockPattern {
    const color1 = this.getRandomColor();
    const color2 = this.getRandomColorExcept(color1);
    const color3 = this.getRandomColorExcept(color1, color2);

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
   *
   * @private
   */
  private getRandomColor(): Color {
    const index = this.randomGenerator.nextInt(BlockPatternGeneratorService.COLORS.length);
    return BlockPatternGeneratorService.COLORS[index];
  }

  /**
   * 指定された色以外のランダムな色を取得
   *
   * @param excludeColors - 除外する色
   * @returns 除外されていない色
   * @throws Error すべての色が除外された場合
   * @private
   */
  private getRandomColorExcept(...excludeColors: Color[]): Color {
    const availableColors = BlockPatternGeneratorService.COLORS.filter(c => !excludeColors.includes(c));
    if (availableColors.length === 0) {
      throw new Error(
        'Cannot generate color: all available colors are excluded. ' +
        `Excluded colors: ${excludeColors.map(c => c.type).join(', ')}`
      );
    }
    const index = this.randomGenerator.nextInt(availableColors.length);
    return availableColors[index];
  }

  /**
   * ランダムなパターンタイプを取得
   *
   * @private
   */
  private getRandomPattern(): PatternType {
    const index = this.randomGenerator.nextInt(BlockPatternGeneratorService.PATTERN_TYPES.length);
    return BlockPatternGeneratorService.PATTERN_TYPES[index];
  }

  /**
   * 配列をシャッフル（Fisher-Yatesアルゴリズム）
   *
   * @private
   */
  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.randomGenerator.nextInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
