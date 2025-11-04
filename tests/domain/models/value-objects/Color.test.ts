import { describe, test, expect } from 'vitest';
import { Color } from '@domain/models/value-objects/Color';

describe('Color', () => {
  describe('定数', () => {
    test('BLUEが正しく定義されている', () => {
      expect(Color.BLUE.type).toBe('blue');
      expect(Color.BLUE.hexCode).toBe('#3498db');
    });

    test('REDが正しく定義されている', () => {
      expect(Color.RED.type).toBe('red');
      expect(Color.RED.hexCode).toBe('#e74c3c');
    });

    test('YELLOWが正しく定義されている', () => {
      expect(Color.YELLOW.type).toBe('yellow');
      expect(Color.YELLOW.hexCode).toBe('#f1c40f');
    });
  });

  describe('equals', () => {
    test('同じ色の場合にtrueを返す', () => {
      expect(Color.BLUE.equals(Color.BLUE)).toBe(true);
      expect(Color.RED.equals(Color.RED)).toBe(true);
      expect(Color.YELLOW.equals(Color.YELLOW)).toBe(true);
    });

    test('異なる色の場合にfalseを返す', () => {
      expect(Color.BLUE.equals(Color.RED)).toBe(false);
      expect(Color.BLUE.equals(Color.YELLOW)).toBe(false);
      expect(Color.RED.equals(Color.YELLOW)).toBe(false);
    });
  });

  describe('toString', () => {
    test('色の文字列表現を返す', () => {
      expect(Color.BLUE.toString()).toBe('blue');
      expect(Color.RED.toString()).toBe('red');
      expect(Color.YELLOW.toString()).toBe('yellow');
    });
  });

  describe('不変性', () => {
    test('定数は同一のインスタンスを返す', () => {
      const blue1 = Color.BLUE;
      const blue2 = Color.BLUE;
      expect(blue1).toBe(blue2);
    });
  });
});
