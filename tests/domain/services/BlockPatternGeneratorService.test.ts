import { describe, test, expect } from 'vitest';
import { BlockPatternGeneratorService } from '@domain/services/BlockPatternGeneratorService';
import { RandomGenerator } from '@infrastructure/random/RandomGenerator';

// テスト用のモックRandomGenerator
class MockRandomGenerator implements RandomGenerator {
  private values: number[] = [];
  private index = 0;

  setValues(values: number[]) {
    this.values = values;
    this.index = 0;
  }

  nextInt(max: number): number {
    const value = this.values[this.index % this.values.length];
    this.index++;
    return value % max;
  }

  nextFloat(): number {
    const value = this.values[this.index % this.values.length];
    this.index++;
    return value;
  }
}

describe('BlockPatternGeneratorService', () => {
  describe('generate', () => {
    test('ランダムなパターンを生成できる', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([0, 0, 0, 0, 0]); // すべて0を返す
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generate();
      expect(pattern).not.toBeNull();
      expect(pattern.blocks.length).toBe(2);
      expect(pattern.blocks[0].length).toBe(2);
    });

    test('Pattern4を生成できる', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([0, 0]); // パターンタイプ=0, 色=0
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generate();
      expect(pattern.patternType).toBe('pattern4');
    });

    test('Pattern3x1を生成できる', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([1, 0, 0, 0]); // パターンタイプ=1
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generate();
      expect(pattern.patternType).toBe('pattern3x1');
    });

    test('Pattern2x2を生成できる', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([2, 0, 0, 0]); // パターンタイプ=2
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generate();
      expect(pattern.patternType).toBe('pattern2x2');
    });

    test('Pattern2x1x1を生成できる', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([3, 0, 0, 0, 0]); // パターンタイプ=3
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generate();
      expect(pattern.patternType).toBe('pattern2x1x1');
    });
  });

  describe('generatePattern4', () => {
    test('全て同じ色の2x2パターンを生成', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([0]); // 青
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generatePattern4();

      // すべてのブロックが同じ色
      const blocks = pattern.blocks;
      expect(blocks[0][0].color).toBe(blocks[0][1].color);
      expect(blocks[0][0].color).toBe(blocks[1][0].color);
      expect(blocks[0][0].color).toBe(blocks[1][1].color);
    });
  });

  describe('generatePattern3x1', () => {
    test('3つ同色+1つ別色のパターンを生成', () => {
      const mockRandom = new MockRandomGenerator();
      mockRandom.setValues([0, 1, 0]); // 色1=0(Blue), 色2=1(Red), 位置=0
      const service = new BlockPatternGeneratorService(mockRandom);

      const pattern = service.generatePattern3x1();

      // 色の種類をカウント
      const colors = new Set();
      const blocks = pattern.blocks;
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          colors.add(blocks[y][x].color.type);
        }
      }

      // 2種類の色がある
      expect(colors.size).toBe(2);
    });
  });
});
