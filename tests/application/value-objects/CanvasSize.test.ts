import { describe, test, expect } from 'vitest';
import { CanvasSize } from '@application/value-objects/CanvasSize';

describe('CanvasSize', () => {
  describe('create', () => {
    test('正常な値でインスタンスを生成できる', () => {
      const size = CanvasSize.create(300, 750);

      expect(size.width).toBe(300);
      expect(size.height).toBe(750);
    });

    test('最小値（200x500）を生成できる', () => {
      const size = CanvasSize.create(200, 500);

      expect(size.width).toBe(200);
      expect(size.height).toBe(500);
    });

    test('最大値（400x1000）を生成できる', () => {
      const size = CanvasSize.create(400, 1000);

      expect(size.width).toBe(400);
      expect(size.height).toBe(1000);
    });

    test('幅が最小値未満（199）で例外をスローする', () => {
      expect(() => CanvasSize.create(199, 500)).toThrow(
        'CanvasSize width must be between 200 and 400 pixels'
      );
    });

    test('幅が最大値超過（401）で例外をスローする', () => {
      expect(() => CanvasSize.create(401, 500)).toThrow(
        'CanvasSize width must be between 200 and 400 pixels'
      );
    });

    test('高さが最小値未満（499）で例外をスローする', () => {
      expect(() => CanvasSize.create(300, 499)).toThrow(
        'CanvasSize height must be between 500 and 1000 pixels'
      );
    });

    test('高さが最大値超過（1001）で例外をスローする', () => {
      expect(() => CanvasSize.create(300, 1001)).toThrow(
        'CanvasSize height must be between 500 and 1000 pixels'
      );
    });

    test('小数の幅で例外をスローする', () => {
      expect(() => CanvasSize.create(300.5, 750)).toThrow(
        'CanvasSize dimensions must be integers'
      );
    });

    test('小数の高さで例外をスローする', () => {
      expect(() => CanvasSize.create(300, 750.5)).toThrow(
        'CanvasSize dimensions must be integers'
      );
    });
  });

  describe('isValid', () => {
    test('最小値は有効', () => {
      const size = CanvasSize.create(200, 500);

      expect(size.isValid()).toBe(true);
    });

    test('最大値は有効', () => {
      const size = CanvasSize.create(400, 1000);

      expect(size.isValid()).toBe(true);
    });

    test('中間値は有効', () => {
      const size = CanvasSize.create(300, 750);

      expect(size.isValid()).toBe(true);
    });
  });

  describe('equals', () => {
    test('同じ値のインスタンスは等しい', () => {
      const size1 = CanvasSize.create(300, 750);
      const size2 = CanvasSize.create(300, 750);

      expect(size1.equals(size2)).toBe(true);
    });

    test('幅が異なる場合は等しくない', () => {
      const size1 = CanvasSize.create(300, 750);
      const size2 = CanvasSize.create(250, 750);

      expect(size1.equals(size2)).toBe(false);
    });

    test('高さが異なる場合は等しくない', () => {
      const size1 = CanvasSize.create(300, 750);
      const size2 = CanvasSize.create(300, 700);

      expect(size1.equals(size2)).toBe(false);
    });
  });

  describe('getAspectRatio', () => {
    test('アスペクト比を計算できる（300x750 = 0.4）', () => {
      const size = CanvasSize.create(300, 750);

      expect(size.getAspectRatio()).toBe(0.4);
    });

    test('アスペクト比を計算できる（400x1000 = 0.4）', () => {
      const size = CanvasSize.create(400, 1000);

      expect(size.getAspectRatio()).toBe(0.4);
    });

    test('アスペクト比を計算できる（200x500 = 0.4）', () => {
      const size = CanvasSize.create(200, 500);

      expect(size.getAspectRatio()).toBe(0.4);
    });
  });

  describe('toString', () => {
    test('文字列表現を返す', () => {
      const size = CanvasSize.create(300, 750);

      expect(size.toString()).toBe('CanvasSize(300x750px)');
    });
  });

  describe('static getters', () => {
    test('最小幅を取得', () => {
      expect(CanvasSize.minWidth).toBe(200);
    });

    test('最大幅を取得', () => {
      expect(CanvasSize.maxWidth).toBe(400);
    });

    test('最小高さを取得', () => {
      expect(CanvasSize.minHeight).toBe(500);
    });

    test('最大高さを取得', () => {
      expect(CanvasSize.maxHeight).toBe(1000);
    });
  });
});
