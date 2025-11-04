import { describe, test, expect } from 'vitest';
import { BlockPattern, PatternType, Rotation } from '@domain/models/value-objects/BlockPattern';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('BlockPattern', () => {
  describe('create', () => {
    test('正常にパターンを作成できる', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.BLUE)],
        [Block.create(Color.BLUE), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern4', blocks);
      expect(pattern.patternType).toBe('pattern4');
      expect(pattern.blocks).toEqual(blocks);
    });

    test('pattern3x1を作成できる', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.BLUE)],
        [Block.create(Color.BLUE), Block.create(Color.RED)]
      ];
      const pattern = BlockPattern.create('pattern3x1', blocks);
      expect(pattern.patternType).toBe('pattern3x1');
    });

    test('pattern2x2を作成できる', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.RED)],
        [Block.create(Color.BLUE), Block.create(Color.RED)]
      ];
      const pattern = BlockPattern.create('pattern2x2', blocks);
      expect(pattern.patternType).toBe('pattern2x2');
    });

    test('pattern2x1x1を作成できる', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.BLUE)],
        [Block.create(Color.RED), Block.create(Color.YELLOW)]
      ];
      const pattern = BlockPattern.create('pattern2x1x1', blocks);
      expect(pattern.patternType).toBe('pattern2x1x1');
    });

    test('blocksが2x2でない場合にエラーをスローする', () => {
      const blocks = [
        [Block.create(Color.BLUE)]
      ];
      expect(() => BlockPattern.create('pattern4', blocks as any)).toThrow('BlockPattern must be 2x2');
    });

    test('blocksの行が2つでない場合にエラーをスローする', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.BLUE)]
      ];
      expect(() => BlockPattern.create('pattern4', blocks)).toThrow('BlockPattern must be 2x2');
    });

    test('blocksの列が2つでない場合にエラーをスローする', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.BLUE), Block.create(Color.BLUE)],
        [Block.create(Color.BLUE), Block.create(Color.BLUE), Block.create(Color.BLUE)]
      ];
      expect(() => BlockPattern.create('pattern4', blocks as any)).toThrow('BlockPattern must be 2x2');
    });
  });

  describe('getBlockAt', () => {
    test('指定された座標のブロックを取得できる（回転なし）', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.RED)],
        [Block.create(Color.YELLOW), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern2x1x1', blocks);

      const block00 = pattern.getBlockAt(0, 0, 0);
      expect(block00?.color.equals(Color.BLUE)).toBe(true);

      const block10 = pattern.getBlockAt(1, 0, 0);
      expect(block10?.color.equals(Color.RED)).toBe(true);

      const block01 = pattern.getBlockAt(0, 1, 0);
      expect(block01?.color.equals(Color.YELLOW)).toBe(true);

      const block11 = pattern.getBlockAt(1, 1, 0);
      expect(block11?.color.equals(Color.BLUE)).toBe(true);
    });

    test('指定された座標のブロックを取得できる（90度回転）', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.RED)],
        [Block.create(Color.YELLOW), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern2x1x1', blocks);

      // 90度回転後:
      // [YELLOW, BLUE]
      // [BLUE,   RED]
      const block00 = pattern.getBlockAt(0, 0, 90);
      expect(block00?.color.equals(Color.YELLOW)).toBe(true);

      const block10 = pattern.getBlockAt(1, 0, 90);
      expect(block10?.color.equals(Color.BLUE)).toBe(true);

      const block01 = pattern.getBlockAt(0, 1, 90);
      expect(block01?.color.equals(Color.BLUE)).toBe(true);

      const block11 = pattern.getBlockAt(1, 1, 90);
      expect(block11?.color.equals(Color.RED)).toBe(true);
    });

    test('範囲外の座標でnullを返す', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.BLUE)],
        [Block.create(Color.BLUE), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern4', blocks);

      expect(pattern.getBlockAt(-1, 0, 0)).toBeNull();
      expect(pattern.getBlockAt(2, 0, 0)).toBeNull();
      expect(pattern.getBlockAt(0, -1, 0)).toBeNull();
      expect(pattern.getBlockAt(0, 2, 0)).toBeNull();
    });
  });

  describe('rotate', () => {
    test('0度回転で元のパターンを返す', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.RED)],
        [Block.create(Color.YELLOW), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern2x1x1', blocks);
      const rotated = pattern.rotate(0);

      expect(rotated[0][0].color.equals(Color.BLUE)).toBe(true);
      expect(rotated[0][1].color.equals(Color.RED)).toBe(true);
      expect(rotated[1][0].color.equals(Color.YELLOW)).toBe(true);
      expect(rotated[1][1].color.equals(Color.BLUE)).toBe(true);
    });

    test('90度回転ができる', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.RED)],
        [Block.create(Color.YELLOW), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern2x1x1', blocks);
      const rotated = pattern.rotate(90);

      // 90度回転後:
      // [YELLOW, BLUE]
      // [BLUE,   RED]
      expect(rotated[0][0].color.equals(Color.YELLOW)).toBe(true);
      expect(rotated[0][1].color.equals(Color.BLUE)).toBe(true);
      expect(rotated[1][0].color.equals(Color.BLUE)).toBe(true);
      expect(rotated[1][1].color.equals(Color.RED)).toBe(true);
    });

    test('180度回転ができる', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.RED)],
        [Block.create(Color.YELLOW), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern2x1x1', blocks);
      const rotated = pattern.rotate(180);

      // 180度回転後:
      // [BLUE,   YELLOW]
      // [RED,    BLUE]
      expect(rotated[0][0].color.equals(Color.BLUE)).toBe(true);
      expect(rotated[0][1].color.equals(Color.YELLOW)).toBe(true);
      expect(rotated[1][0].color.equals(Color.RED)).toBe(true);
      expect(rotated[1][1].color.equals(Color.BLUE)).toBe(true);
    });

    test('270度回転ができる', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.RED)],
        [Block.create(Color.YELLOW), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern2x1x1', blocks);
      const rotated = pattern.rotate(270);

      // 270度回転後:
      // [RED,    BLUE]
      // [BLUE,   YELLOW]
      expect(rotated[0][0].color.equals(Color.RED)).toBe(true);
      expect(rotated[0][1].color.equals(Color.BLUE)).toBe(true);
      expect(rotated[1][0].color.equals(Color.BLUE)).toBe(true);
      expect(rotated[1][1].color.equals(Color.YELLOW)).toBe(true);
    });
  });

  describe('toString', () => {
    test('文字列表現を返す', () => {
      const blocks = [
        [Block.create(Color.BLUE), Block.create(Color.BLUE)],
        [Block.create(Color.BLUE), Block.create(Color.BLUE)]
      ];
      const pattern = BlockPattern.create('pattern4', blocks);
      expect(pattern.toString()).toBe('BlockPattern(pattern4)');
    });
  });
});
