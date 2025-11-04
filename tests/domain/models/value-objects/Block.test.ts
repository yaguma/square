import { describe, test, expect } from 'vitest';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('Block', () => {
  describe('create', () => {
    test('正常にブロックを作成できる', () => {
      const block = Block.create(Color.BLUE);
      expect(block.color).toBe(Color.BLUE);
    });

    test('赤色のブロックを作成できる', () => {
      const block = Block.create(Color.RED);
      expect(block.color).toBe(Color.RED);
    });

    test('黄色のブロックを作成できる', () => {
      const block = Block.create(Color.YELLOW);
      expect(block.color).toBe(Color.YELLOW);
    });

    test('colorがnullの場合にエラーをスローする', () => {
      expect(() => Block.create(null as any)).toThrow('Block color is required');
    });

    test('colorがundefinedの場合にエラーをスローする', () => {
      expect(() => Block.create(undefined as any)).toThrow('Block color is required');
    });
  });

  describe('equals', () => {
    test('同じ色のブロックはequalsがtrueを返す', () => {
      const block1 = Block.create(Color.BLUE);
      const block2 = Block.create(Color.BLUE);
      expect(block1.equals(block2)).toBe(true);
    });

    test('異なる色のブロックはequalsがfalseを返す', () => {
      const block1 = Block.create(Color.BLUE);
      const block2 = Block.create(Color.RED);
      expect(block1.equals(block2)).toBe(false);
    });

    test('赤と黄色のブロックはequalsがfalseを返す', () => {
      const block1 = Block.create(Color.RED);
      const block2 = Block.create(Color.YELLOW);
      expect(block1.equals(block2)).toBe(false);
    });
  });

  describe('isSameColor', () => {
    test('同じ色のブロックを判定できる', () => {
      const block1 = Block.create(Color.BLUE);
      const block2 = Block.create(Color.BLUE);
      expect(block1.isSameColor(block2)).toBe(true);
    });

    test('異なる色のブロックを判定できる', () => {
      const block1 = Block.create(Color.BLUE);
      const block2 = Block.create(Color.RED);
      expect(block1.isSameColor(block2)).toBe(false);
    });

    test('全ての色の組み合わせで判定できる', () => {
      const blue1 = Block.create(Color.BLUE);
      const blue2 = Block.create(Color.BLUE);
      const red = Block.create(Color.RED);
      const yellow = Block.create(Color.YELLOW);

      expect(blue1.isSameColor(blue2)).toBe(true);
      expect(blue1.isSameColor(red)).toBe(false);
      expect(blue1.isSameColor(yellow)).toBe(false);
      expect(red.isSameColor(yellow)).toBe(false);
    });
  });

  describe('toString', () => {
    test('青色ブロックの文字列表現を返す', () => {
      const block = Block.create(Color.BLUE);
      expect(block.toString()).toBe('Block(blue)');
    });

    test('赤色ブロックの文字列表現を返す', () => {
      const block = Block.create(Color.RED);
      expect(block.toString()).toBe('Block(red)');
    });

    test('黄色ブロックの文字列表現を返す', () => {
      const block = Block.create(Color.YELLOW);
      expect(block.toString()).toBe('Block(yellow)');
    });
  });
});
