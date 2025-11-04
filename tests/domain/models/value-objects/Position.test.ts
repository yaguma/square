import { describe, test, expect } from 'vitest';
import { Position } from '@domain/models/value-objects/Position';

describe('Position', () => {
  describe('create', () => {
    test('正常に座標を作成できる', () => {
      const position = Position.create(3, 5);
      expect(position.x).toBe(3);
      expect(position.y).toBe(5);
    });

    test('負の座標でエラーをスローする', () => {
      expect(() => Position.create(-1, 5)).toThrow('Position coordinates must be non-negative');
    });

    test('小数でエラーをスローする', () => {
      expect(() => Position.create(1.5, 5)).toThrow('Position coordinates must be integers');
    });

    test('x座標が負の場合にエラーをスローする', () => {
      expect(() => Position.create(-1, 0)).toThrow('Position coordinates must be non-negative');
    });

    test('y座標が負の場合にエラーをスローする', () => {
      expect(() => Position.create(0, -1)).toThrow('Position coordinates must be non-negative');
    });
  });

  describe('equals', () => {
    test('同じ座標の場合にtrueを返す', () => {
      const pos1 = Position.create(3, 5);
      const pos2 = Position.create(3, 5);
      expect(pos1.equals(pos2)).toBe(true);
    });

    test('異なる座標の場合にfalseを返す', () => {
      const pos1 = Position.create(3, 5);
      const pos2 = Position.create(3, 6);
      expect(pos1.equals(pos2)).toBe(false);
    });

    test('x座標が異なる場合にfalseを返す', () => {
      const pos1 = Position.create(3, 5);
      const pos2 = Position.create(4, 5);
      expect(pos1.equals(pos2)).toBe(false);
    });
  });

  describe('add', () => {
    test('座標を加算できる', () => {
      const pos1 = Position.create(1, 2);
      const pos2 = Position.create(3, 4);
      const result = pos1.add(pos2);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    test('元のオブジェクトは変更されない（不変性）', () => {
      const pos1 = Position.create(1, 2);
      const pos2 = Position.create(3, 4);
      pos1.add(pos2);
      expect(pos1.x).toBe(1);
      expect(pos1.y).toBe(2);
    });

    test('ゼロを加算できる', () => {
      const pos1 = Position.create(5, 7);
      const pos2 = Position.create(0, 0);
      const result = pos1.add(pos2);
      expect(result.x).toBe(5);
      expect(result.y).toBe(7);
    });
  });

  describe('subtract', () => {
    test('座標を減算できる', () => {
      const pos1 = Position.create(5, 8);
      const pos2 = Position.create(2, 3);
      const result = pos1.subtract(pos2);
      expect(result.x).toBe(3);
      expect(result.y).toBe(5);
    });

    test('同じ座標を減算すると(0, 0)になる', () => {
      const pos1 = Position.create(5, 7);
      const pos2 = Position.create(5, 7);
      const result = pos1.subtract(pos2);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('isValid', () => {
    test('有効な座標範囲を判定できる', () => {
      const position = Position.create(3, 5);
      expect(position.isValid(8, 20)).toBe(true);
    });

    test('範囲外の座標を判定できる', () => {
      const position = Position.create(3, 5);
      expect(position.isValid(2, 4)).toBe(false);
    });

    test('境界値(width)を判定できる', () => {
      const position = Position.create(7, 5);
      expect(position.isValid(8, 20)).toBe(true);
      expect(position.isValid(7, 20)).toBe(false);
    });

    test('境界値(height)を判定できる', () => {
      const position = Position.create(3, 19);
      expect(position.isValid(8, 20)).toBe(true);
      expect(position.isValid(8, 19)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を返す', () => {
      const position = Position.create(3, 5);
      expect(position.toString()).toBe('Position(3, 5)');
    });

    test('(0, 0)の文字列表現を返す', () => {
      const position = Position.create(0, 0);
      expect(position.toString()).toBe('Position(0, 0)');
    });
  });
});
