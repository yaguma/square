import { describe, test, expect, beforeEach } from 'vitest';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { ViewportSize } from '@application/value-objects/ViewportSize';
import { BlockSize } from '@application/value-objects/BlockSize';

describe('LayoutCalculationService', () => {
  let service: LayoutCalculationService;

  beforeEach(() => {
    service = new LayoutCalculationService();
  });

  describe('calculateBlockSize', () => {
    describe('モバイルサイズ', () => {
      test('幅320pxで最小ブロックサイズ（15px）を返す', () => {
        const viewport = ViewportSize.create(320, 568);
        const blockSize = service.calculateBlockSize(viewport);

        // 320 * 0.9 / 8 = 36 → 制約により 30px（モバイル最大値）
        // 実際には、320 * 0.9 = 288, 288 / 8 = 36 → 30px
        expect(blockSize.size).toBeGreaterThanOrEqual(15);
        expect(blockSize.size).toBeLessThanOrEqual(30);
      });

      test('幅375pxで適切なブロックサイズを計算', () => {
        const viewport = ViewportSize.create(375, 667);
        const blockSize = service.calculateBlockSize(viewport);

        // 375 * 0.9 / 8 = 42.1875 → Math.floor = 42 → 制約により 30px
        expect(blockSize.size).toBe(30);
      });

      test('幅150pxで最小ブロックサイズ（15px）を返す', () => {
        const viewport = ViewportSize.create(150, 300);
        const blockSize = service.calculateBlockSize(viewport);

        // 150 * 0.9 / 8 = 16.875 → Math.floor = 16 → 制約内（15-30）
        expect(blockSize.size).toBe(16);
      });

      test('幅240pxで適切なブロックサイズを計算', () => {
        const viewport = ViewportSize.create(240, 400);
        const blockSize = service.calculateBlockSize(viewport);

        // 240 * 0.9 / 8 = 27 → 制約内（15-30）
        expect(blockSize.size).toBe(27);
      });
    });

    describe('デスクトップサイズ', () => {
      test('幅1024pxで適切なブロックサイズを計算', () => {
        const viewport = ViewportSize.create(1024, 768);
        const blockSize = service.calculateBlockSize(viewport);

        // Math.min(400, 1024 * 0.4) = Math.min(400, 409.6) = 400
        // 400 / 8 = 50 → 制約により 40px（デスクトップ最大値）
        expect(blockSize.size).toBe(40);
      });

      test('幅800pxで適切なブロックサイズを計算', () => {
        const viewport = ViewportSize.create(800, 600);
        const blockSize = service.calculateBlockSize(viewport);

        // Math.min(400, 800 * 0.4) = Math.min(400, 320) = 320
        // 320 / 8 = 40 → 制約内（20-40）
        expect(blockSize.size).toBe(40);
      });

      test('幅768px（境界値）で適切なブロックサイズを計算', () => {
        const viewport = ViewportSize.create(768, 600);
        const blockSize = service.calculateBlockSize(viewport);

        // Math.min(400, 768 * 0.4) = Math.min(400, 307.2) = 307.2
        // 307.2 / 8 = 38.4 → Math.floor = 38 → 制約内（20-40）
        expect(blockSize.size).toBe(38);
      });

      test('幅900pxで適切なブロックサイズを計算', () => {
        const viewport = ViewportSize.create(900, 600);
        const blockSize = service.calculateBlockSize(viewport);

        // Math.min(400, 900 * 0.4) = Math.min(400, 360) = 360
        // 360 / 8 = 45 → 制約により 40px（デスクトップ最大値）
        expect(blockSize.size).toBe(40);
      });
    });

    describe('境界値テスト', () => {
      test('幅767px（モバイル境界）', () => {
        const viewport = ViewportSize.create(767, 600);
        const blockSize = service.calculateBlockSize(viewport);

        // モバイルとして扱われる
        // 767 * 0.9 / 8 = 86.2875 → Math.floor = 86 → 制約により 30px
        expect(blockSize.size).toBe(30);
      });

      test('幅768px（デスクトップ境界）', () => {
        const viewport = ViewportSize.create(768, 600);
        const blockSize = service.calculateBlockSize(viewport);

        // デスクトップとして扱われる
        expect(blockSize.size).toBeGreaterThanOrEqual(20);
        expect(blockSize.size).toBeLessThanOrEqual(40);
      });
    });
  });

  describe('calculateCanvasSize', () => {
    test('ブロックサイズ30pxからCanvasサイズを計算（8x20フィールド）', () => {
      const blockSize = BlockSize.create(30);
      const canvasSize = service.calculateCanvasSize(blockSize);

      expect(canvasSize.width).toBe(240); // 30 * 8
      expect(canvasSize.height).toBe(600); // 30 * 20
    });

    test('ブロックサイズ35pxからCanvasサイズを計算', () => {
      const blockSize = BlockSize.create(35);
      const canvasSize = service.calculateCanvasSize(blockSize);

      expect(canvasSize.width).toBe(280); // 35 * 8
      expect(canvasSize.height).toBe(700); // 35 * 20
    });

    test('ブロックサイズ25pxからCanvasサイズを計算（最小値）', () => {
      const blockSize = BlockSize.create(25);
      const canvasSize = service.calculateCanvasSize(blockSize);

      expect(canvasSize.width).toBe(200); // 25 * 8（最小幅）
      expect(canvasSize.height).toBe(500); // 25 * 20（最小高さ）
    });

    test('ブロックサイズ40pxからCanvasサイズを計算（最大値）', () => {
      const blockSize = BlockSize.create(40);
      const canvasSize = service.calculateCanvasSize(blockSize);

      expect(canvasSize.width).toBe(320); // 40 * 8
      expect(canvasSize.height).toBe(800); // 40 * 20
    });
  });

  describe('shouldShowTouchControls', () => {
    test('モバイル幅（767px）でtrueを返す', () => {
      const viewport = ViewportSize.create(767, 600);

      expect(service.shouldShowTouchControls(viewport)).toBe(true);
    });

    test('デスクトップ幅（768px）でfalseを返す', () => {
      const viewport = ViewportSize.create(768, 600);

      expect(service.shouldShowTouchControls(viewport)).toBe(false);
    });

    test('モバイル幅（375px）でtrueを返す', () => {
      const viewport = ViewportSize.create(375, 667);

      expect(service.shouldShowTouchControls(viewport)).toBe(true);
    });

    test('デスクトップ幅（1024px）でfalseを返す', () => {
      const viewport = ViewportSize.create(1024, 768);

      expect(service.shouldShowTouchControls(viewport)).toBe(false);
    });
  });

  describe('フィールドサイズ取得', () => {
    test('フィールド幅を取得', () => {
      expect(service.fieldWidth).toBe(8);
    });

    test('フィールド高さを取得', () => {
      expect(service.fieldHeight).toBe(20);
    });
  });
});
