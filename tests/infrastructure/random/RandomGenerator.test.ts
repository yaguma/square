import { describe, test, expect } from 'vitest';
import { DefaultRandomGenerator } from '@infrastructure/random/RandomGenerator';

describe('DefaultRandomGenerator', () => {
  const generator = new DefaultRandomGenerator();

  describe('nextInt', () => {
    test('0以上max未満の整数を返す', () => {
      const max = 10;
      for (let i = 0; i < 100; i++) {
        const value = generator.nextInt(max);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(max);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    test('max=1の場合は常に0を返す', () => {
      for (let i = 0; i < 10; i++) {
        const value = generator.nextInt(1);
        expect(value).toBe(0);
      }
    });

    test('max=3の場合は0,1,2のいずれかを返す', () => {
      const results = new Set<number>();
      for (let i = 0; i < 100; i++) {
        results.add(generator.nextInt(3));
      }
      // 100回試行すれば全パターン出現するはず
      expect(results.size).toBeGreaterThan(1);
      results.forEach(value => {
        expect([0, 1, 2]).toContain(value);
      });
    });
  });

  describe('nextFloat', () => {
    test('0以上1未満の浮動小数点数を返す', () => {
      for (let i = 0; i < 100; i++) {
        const value = generator.nextFloat();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
        expect(typeof value).toBe('number');
      }
    });

    test('異なる値を返す（ランダム性の確認）', () => {
      const values = new Set<number>();
      for (let i = 0; i < 100; i++) {
        values.add(generator.nextFloat());
      }
      // 100回試行すれば異なる値が多数出るはず
      expect(values.size).toBeGreaterThan(90);
    });
  });
});
