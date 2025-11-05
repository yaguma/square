import { describe, test, expect } from 'vitest';
import { BlockMatchingService } from '@domain/services/BlockMatchingService';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('BlockMatchingService', () => {
  const service = new BlockMatchingService();

  describe('findMatchingRectangles', () => {
    test('空のフィールドでは何も見つからない', () => {
      const field = Field.create();
      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBe(0);
    });

    test('2x2の同色矩形を検出できる', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // 2x2の青ブロックを配置
      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(1, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBe(1);
      expect(rectangles[0].width).toBe(2);
      expect(rectangles[0].height).toBe(2);
    });

    test('3x3の同色矩形を検出できる', () => {
      const field = Field.create();
      const red = Block.create(Color.RED);

      // 3x3の赤ブロックを配置
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          field.placeBlock(Position.create(x, y), red);
        }
      }

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBeGreaterThan(0);

      // 最大の矩形を探す
      const maxRect = rectangles.reduce((max, rect) =>
        rect.area() > max.area() ? rect : max
      );
      expect(maxRect.width).toBe(3);
      expect(maxRect.height).toBe(3);
    });

    test('複数の矩形を検出できる', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);
      const red = Block.create(Color.RED);

      // 2x2の青ブロック
      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(1, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      // 2x2の赤ブロック（離れた位置）
      field.placeBlock(Position.create(4, 4), red);
      field.placeBlock(Position.create(5, 4), red);
      field.placeBlock(Position.create(4, 5), red);
      field.placeBlock(Position.create(5, 5), red);

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBeGreaterThanOrEqual(2);
    });

    test('1x1のブロックは検出されない', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBe(0);
    });

    test('L字型は矩形として検出されない', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      // L字型を配置
      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      const rectangles = service.findMatchingRectangles(field);
      expect(rectangles.length).toBe(0);
    });
  });

  describe('isRectangle', () => {
    test('同色の矩形配置はtrueを返す', () => {
      const field = Field.create();
      const blue = Block.create(Color.BLUE);

      field.placeBlock(Position.create(0, 0), blue);
      field.placeBlock(Position.create(1, 0), blue);
      field.placeBlock(Position.create(0, 1), blue);
      field.placeBlock(Position.create(1, 1), blue);

      const positions = [
        Position.create(0, 0),
        Position.create(1, 0),
        Position.create(0, 1),
        Position.create(1, 1),
      ];

      const result = service.isRectangle(positions, Color.BLUE, field);
      expect(result).toBe(true);
    });

    test('異なる色が混在する場合はfalseを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
      field.placeBlock(Position.create(1, 0), Block.create(Color.RED)); // 異なる色

      const positions = [
        Position.create(0, 0),
        Position.create(1, 0),
      ];

      const result = service.isRectangle(positions, Color.BLUE, field);
      expect(result).toBe(false);
    });
  });
});
