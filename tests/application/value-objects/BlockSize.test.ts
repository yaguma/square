import { describe, test, expect } from 'vitest';
import { BlockSize } from '@application/value-objects/BlockSize';
import { CanvasSize } from '@application/value-objects/CanvasSize';

describe('BlockSize', () => {
  describe('create', () => {
    test('正常な値でインスタンスを生成できる', () => {
      const size = BlockSize.create(30);

      expect(size.size).toBe(30);
    });

    test('最小値（15px）を生成できる', () => {
      const size = BlockSize.create(15);

      expect(size.size).toBe(15);
    });

    test('最大値（40px）を生成できる', () => {
      const size = BlockSize.create(40);

      expect(size.size).toBe(40);
    });

    test('最小値未満（14px）で例外をスローする', () => {
      expect(() => BlockSize.create(14)).toThrow(
        'BlockSize must be between 15 and 40 pixels'
      );
    });

    test('最大値超過（41px）で例外をスローする', () => {
      expect(() => BlockSize.create(41)).toThrow(
        'BlockSize must be between 15 and 40 pixels'
      );
    });

    test('小数で例外をスローする', () => {
      expect(() => BlockSize.create(30.5)).toThrow('BlockSize must be an integer');
    });

    test('0で例外をスローする', () => {
      expect(() => BlockSize.create(0)).toThrow(
        'BlockSize must be between 15 and 40 pixels'
      );
    });
  });

  describe('toCanvasSize', () => {
    test('ブロックサイズからCanvasサイズを計算できる（10x25フィールド、30pxブロック）', () => {
      const blockSize = BlockSize.create(30);
      const canvasSize = blockSize.toCanvasSize(10, 25);

      expect(canvasSize.width).toBe(300);
      expect(canvasSize.height).toBe(750);
    });

    test('ブロックサイズからCanvasサイズを計算できる（10x25フィールド、20pxブロック）', () => {
      const blockSize = BlockSize.create(20);
      const canvasSize = blockSize.toCanvasSize(10, 25);

      expect(canvasSize.width).toBe(200);
      expect(canvasSize.height).toBe(500);
    });
  });

  describe('isValid', () => {
    test('15pxは有効', () => {
      const size = BlockSize.create(15);

      expect(size.isValid()).toBe(true);
    });

    test('40pxは有効', () => {
      const size = BlockSize.create(40);

      expect(size.isValid()).toBe(true);
    });

    test('30pxは有効', () => {
      const size = BlockSize.create(30);

      expect(size.isValid()).toBe(true);
    });
  });

  describe('isValidForMobile', () => {
    test('15pxはモバイル有効範囲内', () => {
      const size = BlockSize.create(15);

      expect(size.isValidForMobile()).toBe(true);
    });

    test('30pxはモバイル有効範囲内', () => {
      const size = BlockSize.create(30);

      expect(size.isValidForMobile()).toBe(true);
    });

    test('31pxはモバイル有効範囲外', () => {
      const size = BlockSize.create(31);

      expect(size.isValidForMobile()).toBe(false);
    });

    test('20pxはモバイル有効範囲内', () => {
      const size = BlockSize.create(20);

      expect(size.isValidForMobile()).toBe(true);
    });
  });

  describe('isValidForDesktop', () => {
    test('20pxはデスクトップ有効範囲内', () => {
      const size = BlockSize.create(20);

      expect(size.isValidForDesktop()).toBe(true);
    });

    test('40pxはデスクトップ有効範囲内', () => {
      const size = BlockSize.create(40);

      expect(size.isValidForDesktop()).toBe(true);
    });

    test('19pxはデスクトップ有効範囲外', () => {
      const size = BlockSize.create(19);

      expect(size.isValidForDesktop()).toBe(false);
    });

    test('30pxはデスクトップ有効範囲内', () => {
      const size = BlockSize.create(30);

      expect(size.isValidForDesktop()).toBe(true);
    });
  });

  describe('equals', () => {
    test('同じ値のインスタンスは等しい', () => {
      const size1 = BlockSize.create(30);
      const size2 = BlockSize.create(30);

      expect(size1.equals(size2)).toBe(true);
    });

    test('異なる値のインスタンスは等しくない', () => {
      const size1 = BlockSize.create(30);
      const size2 = BlockSize.create(20);

      expect(size1.equals(size2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を返す', () => {
      const size = BlockSize.create(30);

      expect(size.toString()).toBe('BlockSize(30px)');
    });
  });

  describe('static getters', () => {
    test('モバイル最小サイズを取得', () => {
      expect(BlockSize.mobileMinSize).toBe(15);
    });

    test('モバイル最大サイズを取得', () => {
      expect(BlockSize.mobileMaxSize).toBe(30);
    });

    test('デスクトップ最小サイズを取得', () => {
      expect(BlockSize.desktopMinSize).toBe(20);
    });

    test('デスクトップ最大サイズを取得', () => {
      expect(BlockSize.desktopMaxSize).toBe(40);
    });
  });
});
