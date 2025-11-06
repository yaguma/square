import { describe, test, expect } from 'vitest';
import { ViewportSize } from '@application/value-objects/ViewportSize';

describe('ViewportSize', () => {
  describe('create', () => {
    test('正常な値でインスタンスを生成できる', () => {
      const size = ViewportSize.create(1024, 768);

      expect(size.width).toBe(1024);
      expect(size.height).toBe(768);
    });

    test('モバイルサイズ（375x667）を生成できる', () => {
      const size = ViewportSize.create(375, 667);

      expect(size.width).toBe(375);
      expect(size.height).toBe(667);
    });

    test('最小値（0x0）を生成できる', () => {
      const size = ViewportSize.create(0, 0);

      expect(size.width).toBe(0);
      expect(size.height).toBe(0);
    });

    test('負の幅で例外をスローする', () => {
      expect(() => ViewportSize.create(-1, 768)).toThrow(
        'ViewportSize dimensions must be non-negative'
      );
    });

    test('負の高さで例外をスローする', () => {
      expect(() => ViewportSize.create(1024, -1)).toThrow(
        'ViewportSize dimensions must be non-negative'
      );
    });

    test('小数の幅で例外をスローする', () => {
      expect(() => ViewportSize.create(1024.5, 768)).toThrow(
        'ViewportSize dimensions must be integers'
      );
    });

    test('小数の高さで例外をスローする', () => {
      expect(() => ViewportSize.create(1024, 768.5)).toThrow(
        'ViewportSize dimensions must be integers'
      );
    });
  });

  describe('isMobile', () => {
    test('幅767pxはモバイルと判定される', () => {
      const size = ViewportSize.create(767, 600);

      expect(size.isMobile()).toBe(true);
      expect(size.isDesktop()).toBe(false);
    });

    test('幅768pxはデスクトップと判定される（境界値）', () => {
      const size = ViewportSize.create(768, 600);

      expect(size.isMobile()).toBe(false);
      expect(size.isDesktop()).toBe(true);
    });

    test('幅375pxはモバイルと判定される', () => {
      const size = ViewportSize.create(375, 667);

      expect(size.isMobile()).toBe(true);
    });

    test('幅1024pxはデスクトップと判定される', () => {
      const size = ViewportSize.create(1024, 768);

      expect(size.isDesktop()).toBe(true);
    });
  });

  describe('equals', () => {
    test('同じ値のインスタンスは等しい', () => {
      const size1 = ViewportSize.create(1024, 768);
      const size2 = ViewportSize.create(1024, 768);

      expect(size1.equals(size2)).toBe(true);
    });

    test('幅が異なる場合は等しくない', () => {
      const size1 = ViewportSize.create(1024, 768);
      const size2 = ViewportSize.create(800, 768);

      expect(size1.equals(size2)).toBe(false);
    });

    test('高さが異なる場合は等しくない', () => {
      const size1 = ViewportSize.create(1024, 768);
      const size2 = ViewportSize.create(1024, 600);

      expect(size1.equals(size2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('モバイルサイズの文字列表現を返す', () => {
      const size = ViewportSize.create(375, 667);

      expect(size.toString()).toBe('ViewportSize(375x667, Mobile)');
    });

    test('デスクトップサイズの文字列表現を返す', () => {
      const size = ViewportSize.create(1024, 768);

      expect(size.toString()).toBe('ViewportSize(1024x768, Desktop)');
    });
  });
});
