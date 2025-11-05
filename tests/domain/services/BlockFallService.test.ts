import { describe, test, expect } from 'vitest';
import { BlockFallService } from '@domain/services/BlockFallService';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('BlockFallService', () => {
  const service = new BlockFallService();

  describe('applyGravity', () => {
    test('空のフィールドでは何も起こらない', () => {
      const field = Field.create();
      const result = service.applyGravity(field);
      expect(result).toBe(false); // 落下なし
    });

    test('浮いているブロックが落下する', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 浮いているブロック
      field.placeBlock(Position.create(0, 5), blue);

      const result = service.applyGravity(field);
      expect(result).toBe(true); // 落下あり
      expect(field.isEmpty(Position.create(0, 5))).toBe(true);
      expect(field.getBlock(Position.create(0, 19))).not.toBeNull();
    });

    test('下にブロックがある場合はその上に停止する', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);
      const red = Block.create(Color.RED);

      // 下に赤ブロック
      field.placeBlock(Position.create(0, 19), red);
      // 上に青ブロック（浮いている）
      field.placeBlock(Position.create(0, 17), blue);

      service.applyGravity(field);

      expect(field.getBlock(Position.create(0, 18))).toBe(blue);
      expect(field.getBlock(Position.create(0, 19))).toBe(red);
    });

    test('複数のブロックが同時に落下する', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      field.placeBlock(Position.create(0, 5), blue);
      field.placeBlock(Position.create(1, 3), blue);

      service.applyGravity(field);

      expect(field.getBlock(Position.create(0, 19))).not.toBeNull();
      expect(field.getBlock(Position.create(1, 19))).not.toBeNull();
    });

    test('床に接しているブロックは落下しない', () => {
      const field = Field.create();
      const block = Block.create(Color.BLUE);
      field.placeBlock(Position.create(0, 19), block);

      const result = service.applyGravity(field);

      expect(result).toBe(false); // 落下なし
      expect(field.getBlock(Position.create(0, 19))).toBe(block);
    });
  });

  describe('canFall', () => {
    test('下が空の場合はtrueを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 5), Block.create(Color.BLUE));

      const result = service.canFall(Position.create(0, 5), field);
      expect(result).toBe(true);
    });

    test('下端にある場合はfalseを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 19), Block.create(Color.BLUE));

      const result = service.canFall(Position.create(0, 19), field);
      expect(result).toBe(false);
    });

    test('下にブロックがある場合はfalseを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 18), Block.create(Color.BLUE));
      field.placeBlock(Position.create(0, 19), Block.create(Color.RED));

      const result = service.canFall(Position.create(0, 18), field);
      expect(result).toBe(false);
    });
  });

  describe('getLowestEmptyPosition', () => {
    test('空の列では最下端を返す', () => {
      const field = Field.create();
      const result = service.getLowestEmptyPosition(0, 0, field);
      expect(result).toBe(19);
    });

    test('下にブロックがある場合はその上を返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 19), Block.create(Color.BLUE));

      const result = service.getLowestEmptyPosition(0, 5, field);
      expect(result).toBe(18);
    });

    test('既に最下位置にある場合は同じ位置を返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 19), Block.create(Color.BLUE));

      const result = service.getLowestEmptyPosition(0, 19, field);
      expect(result).toBe(19);
    });
  });
});
