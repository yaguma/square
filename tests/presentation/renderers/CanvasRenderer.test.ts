/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { GameDto } from '@application/dto/GameDto';

describe('CanvasRenderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: CanvasRenderer;

  beforeEach(() => {
    // HTMLCanvasElementのモックを作成
    canvas = document.createElement('canvas');

    // getContextのモックを作成
    const ctx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: 'left' as CanvasTextAlign,
      textBaseline: 'alphabetic' as CanvasTextBaseline,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx);

    renderer = new CanvasRenderer(canvas, 30);
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(renderer).toBeInstanceOf(CanvasRenderer);
    });

    it('should set canvas width and height', () => {
      expect(canvas.width).toBe(30 * 8); // 240
      expect(canvas.height).toBe(30 * 20); // 600
    });

    it('should throw error if canvas context is not available', () => {
      const badCanvas = document.createElement('canvas');
      vi.spyOn(badCanvas, 'getContext').mockReturnValue(null);

      expect(() => new CanvasRenderer(badCanvas)).toThrow('Failed to get canvas context');
    });
  });

  describe('render', () => {
    it('should render game state', () => {
      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'playing',
        score: 0,
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: {
          pattern: [
            ['blue', 'blue'],
            ['blue', 'blue']
          ],
          position: { x: 3, y: 0 },
          rotation: 0
        },
        nextBlock: [
          ['red', 'red'],
          ['red', 'red']
        ]
      };

      expect(() => renderer.render(gameDto)).not.toThrow();
    });

    it('should render game over state', () => {
      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'gameOver',
        score: 100,
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: null,
        nextBlock: [
          ['red', 'red'],
          ['red', 'red']
        ]
      };

      expect(() => renderer.render(gameDto)).not.toThrow();
    });

    it('should render paused state', () => {
      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'paused',
        score: 50,
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: null,
        nextBlock: [
          ['yellow', 'yellow'],
          ['yellow', 'yellow']
        ]
      };

      expect(() => renderer.render(gameDto)).not.toThrow();
    });

    it('should render field with blocks', () => {
      const field = Array(20).fill(null).map(() => Array(8).fill(null));
      field[19][0] = 'blue';
      field[19][1] = 'red';
      field[19][2] = 'yellow';

      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'playing',
        score: 0,
        field,
        fallingBlock: null,
        nextBlock: [
          ['red', 'red'],
          ['red', 'red']
        ]
      };

      expect(() => renderer.render(gameDto)).not.toThrow();
    });

    it('should render without falling block', () => {
      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'playing',
        score: 0,
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: null,
        nextBlock: [
          ['red', 'red'],
          ['red', 'red']
        ]
      };

      expect(() => renderer.render(gameDto)).not.toThrow();
    });
  });
});
