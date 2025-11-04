import { describe, test, expect } from 'vitest';
import { Rectangle } from '@domain/models/value-objects/Rectangle';
import { Position } from '@domain/models/value-objects/Position';

describe('Rectangle', () => {
  describe('create', () => {
    test('正常に矩形を作成できる', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      expect(rect.topLeft.equals(topLeft)).toBe(true);
      expect(rect.width).toBe(4);
      expect(rect.height).toBe(5);
    });

    test('1x1の矩形を作成できる', () => {
      const topLeft = Position.create(0, 0);
      const rect = Rectangle.create(topLeft, 1, 1);
      expect(rect.width).toBe(1);
      expect(rect.height).toBe(1);
    });

    test('widthが0以下の場合にエラーをスローする', () => {
      const topLeft = Position.create(0, 0);
      expect(() => Rectangle.create(topLeft, 0, 5)).toThrow('Rectangle width and height must be positive');
    });

    test('heightが0以下の場合にエラーをスローする', () => {
      const topLeft = Position.create(0, 0);
      expect(() => Rectangle.create(topLeft, 5, 0)).toThrow('Rectangle width and height must be positive');
    });

    test('widthが負の場合にエラーをスローする', () => {
      const topLeft = Position.create(0, 0);
      expect(() => Rectangle.create(topLeft, -1, 5)).toThrow('Rectangle width and height must be positive');
    });

    test('heightが負の場合にエラーをスローする', () => {
      const topLeft = Position.create(0, 0);
      expect(() => Rectangle.create(topLeft, 5, -1)).toThrow('Rectangle width and height must be positive');
    });
  });

  describe('bottomRight', () => {
    test('右下の座標を取得できる', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      const bottomRight = rect.bottomRight;
      expect(bottomRight.x).toBe(5); // 2 + 4 - 1
      expect(bottomRight.y).toBe(7); // 3 + 5 - 1
    });

    test('1x1の場合の右下座標', () => {
      const topLeft = Position.create(0, 0);
      const rect = Rectangle.create(topLeft, 1, 1);
      const bottomRight = rect.bottomRight;
      expect(bottomRight.x).toBe(0);
      expect(bottomRight.y).toBe(0);
    });
  });

  describe('contains', () => {
    test('矩形内の座標を含むと判定できる', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      const pos = Position.create(4, 5);
      expect(rect.contains(pos)).toBe(true);
    });

    test('左上の座標を含むと判定できる', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      expect(rect.contains(topLeft)).toBe(true);
    });

    test('右下の座標を含むと判定できる', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      const bottomRight = Position.create(5, 7);
      expect(rect.contains(bottomRight)).toBe(true);
    });

    test('矩形外の座標を含まないと判定できる', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      const pos = Position.create(10, 10);
      expect(rect.contains(pos)).toBe(false);
    });

    test('左側の境界外を含まないと判定できる', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      const pos = Position.create(1, 5);
      expect(rect.contains(pos)).toBe(false);
    });

    test('右側の境界外を含まないと判定できる', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      const pos = Position.create(6, 5);
      expect(rect.contains(pos)).toBe(false);
    });
  });

  describe('getPositions', () => {
    test('矩形内のすべての座標を取得できる', () => {
      const topLeft = Position.create(0, 0);
      const rect = Rectangle.create(topLeft, 2, 2);
      const positions = rect.getPositions();
      expect(positions.length).toBe(4);
      expect(positions.some(p => p.x === 0 && p.y === 0)).toBe(true);
      expect(positions.some(p => p.x === 1 && p.y === 0)).toBe(true);
      expect(positions.some(p => p.x === 0 && p.y === 1)).toBe(true);
      expect(positions.some(p => p.x === 1 && p.y === 1)).toBe(true);
    });

    test('1x1の矩形の座標を取得できる', () => {
      const topLeft = Position.create(3, 4);
      const rect = Rectangle.create(topLeft, 1, 1);
      const positions = rect.getPositions();
      expect(positions.length).toBe(1);
      expect(positions[0].x).toBe(3);
      expect(positions[0].y).toBe(4);
    });
  });

  describe('area', () => {
    test('矩形の面積を計算できる', () => {
      const topLeft = Position.create(0, 0);
      const rect = Rectangle.create(topLeft, 4, 5);
      expect(rect.area()).toBe(20);
    });

    test('1x1の矩形の面積', () => {
      const topLeft = Position.create(0, 0);
      const rect = Rectangle.create(topLeft, 1, 1);
      expect(rect.area()).toBe(1);
    });
  });

  describe('equals', () => {
    test('同じ矩形の場合にtrueを返す', () => {
      const topLeft1 = Position.create(2, 3);
      const rect1 = Rectangle.create(topLeft1, 4, 5);
      const topLeft2 = Position.create(2, 3);
      const rect2 = Rectangle.create(topLeft2, 4, 5);
      expect(rect1.equals(rect2)).toBe(true);
    });

    test('異なる位置の矩形の場合にfalseを返す', () => {
      const topLeft1 = Position.create(2, 3);
      const rect1 = Rectangle.create(topLeft1, 4, 5);
      const topLeft2 = Position.create(3, 3);
      const rect2 = Rectangle.create(topLeft2, 4, 5);
      expect(rect1.equals(rect2)).toBe(false);
    });

    test('異なるサイズの矩形の場合にfalseを返す', () => {
      const topLeft1 = Position.create(2, 3);
      const rect1 = Rectangle.create(topLeft1, 4, 5);
      const topLeft2 = Position.create(2, 3);
      const rect2 = Rectangle.create(topLeft2, 5, 5);
      expect(rect1.equals(rect2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を返す', () => {
      const topLeft = Position.create(2, 3);
      const rect = Rectangle.create(topLeft, 4, 5);
      expect(rect.toString()).toBe('Rectangle(topLeft: Position(2, 3), width: 4, height: 5)');
    });
  });
});
