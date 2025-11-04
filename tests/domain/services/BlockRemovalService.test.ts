import { describe, test, expect } from 'vitest';
import { BlockRemovalService } from '@domain/services/BlockRemovalService';
import { BlockFallService } from '@domain/services/BlockFallService';
import { BlockMatchingService } from '@domain/services/BlockMatchingService';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';
import { Rectangle } from '@domain/models/value-objects/Rectangle';

describe('BlockRemovalService', () => {
  const blockFallService = new BlockFallService();
  const blockMatchingService = new BlockMatchingService();
  const service = new BlockRemovalService(blockFallService, blockMatchingService);

  describe('removeBlocks', () => {
    test('指定された矩形のブロックを削除できる', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 2x2の青ブロック
      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(1, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      const rectangles = [Rectangle.create(Position.create(0, 0), 2, 2)];
      const removedCount = service.removeBlocks(rectangles, field);

      expect(removedCount).toBe(4);
      expect(field.isEmpty(Position.create(0, 0))).toBe(true);
      expect(field.isEmpty(Position.create(1, 1))).toBe(true);
    });

    test('複数の矩形を削除できる', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 2つの2x2矩形
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          field.placeBlock(Position.create(x, y), blue);
          field.placeBlock(Position.create(x + 4, y), blue);
        }
      }

      const rectangles = [
        Rectangle.create(Position.create(0, 0), 2, 2),
        Rectangle.create(Position.create(4, 0), 2, 2)
      ];
      const removedCount = service.removeBlocks(rectangles, field);

      expect(removedCount).toBe(8);
    });
  });

  describe('processRemovalChain', () => {
    test('連鎖なしの場合は1回だけ削除される', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 2x2の青ブロック（下端）
      field.placeBlock(Position.create(0, 18), blue);
      field.placeBlock(Position.create(1, 18), blue);
      field.placeBlock(Position.create(0, 19), blue);
      field.placeBlock(Position.create(1, 19), blue);

      const totalRemoved = service.processRemovalChain(field);
      expect(totalRemoved).toBe(4);
    });

    test('連鎖が発生する場合は複数回削除される', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);
      const red = Block.create(Color.RED);

      // 上段: 2x2の赤ブロック（浮いている）
      field.placeBlock(Position.create(0, 16), red);
      field.placeBlock(Position.create(1, 16), red);
      field.placeBlock(Position.create(0, 17), red);
      field.placeBlock(Position.create(1, 17), red);

      // 下段: 2x2の青ブロック（削除対象）
      field.placeBlock(Position.create(0, 18), blue);
      field.placeBlock(Position.create(1, 18), blue);
      field.placeBlock(Position.create(0, 19), blue);
      field.placeBlock(Position.create(1, 19), blue);

      const totalRemoved = service.processRemovalChain(field);
      expect(totalRemoved).toBeGreaterThanOrEqual(4);
    });

    test('消去可能なブロックがない場合は0を返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));

      const totalRemoved = service.processRemovalChain(field);
      expect(totalRemoved).toBe(0);
    });

    test('空のフィールドでは0を返す', () => {
      const field = Field.create();
      const totalRemoved = service.processRemovalChain(field);
      expect(totalRemoved).toBe(0);
    });
  });
});
