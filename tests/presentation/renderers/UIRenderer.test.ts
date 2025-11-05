/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { GameDto } from '@application/dto/GameDto';

describe('UIRenderer', () => {
  let scoreElement: HTMLElement;
  let nextCanvas: HTMLCanvasElement;
  let gameOverElement: HTMLElement;
  let renderer: UIRenderer;

  beforeEach(() => {
    // DOM要素のセットアップ
    document.body.innerHTML = `
      <div id="score">0</div>
      <canvas id="next-canvas" width="80" height="80"></canvas>
      <div id="game-over" class="hidden"></div>
    `;

    scoreElement = document.getElementById('score')!;
    nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
    gameOverElement = document.getElementById('game-over')!;

    // Canvasコンテキストのモックを作成
    const ctx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(nextCanvas, 'getContext').mockReturnValue(ctx);

    renderer = new UIRenderer();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(renderer).toBeInstanceOf(UIRenderer);
    });

    it('should throw error if score element is not found', () => {
      document.body.innerHTML = '';

      expect(() => new UIRenderer()).toThrow('Score element not found');
    });

    it('should throw error if next canvas element is not found', () => {
      document.body.innerHTML = `
        <div id="score">0</div>
      `;

      expect(() => new UIRenderer()).toThrow('Next canvas element not found');
    });

    it('should throw error if game over element is not found', () => {
      document.body.innerHTML = `
        <div id="score">0</div>
        <canvas id="next-canvas" width="80" height="80"></canvas>
      `;

      expect(() => new UIRenderer()).toThrow('Game over element not found');
    });

    it('should throw error if canvas context is not available', () => {
      document.body.innerHTML = `
        <div id="score">0</div>
        <canvas id="next-canvas" width="80" height="80"></canvas>
        <div id="game-over" class="hidden"></div>
      `;

      const canvas = document.getElementById('next-canvas') as HTMLCanvasElement;
      vi.spyOn(canvas, 'getContext').mockReturnValue(null);

      expect(() => new UIRenderer()).toThrow('Failed to get next canvas context');
    });
  });

  describe('render', () => {
    it('should render game state', () => {
      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'playing',
        score: 100,
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: null,
        nextBlock: [
          ['blue', 'blue'],
          ['blue', 'blue']
        ]
      };

      renderer.render(gameDto);

      expect(scoreElement.textContent).toBe('100');
      expect(gameOverElement.classList.contains('hidden')).toBe(true);
    });

    it('should update score', () => {
      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'playing',
        score: 250,
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: null,
        nextBlock: [
          ['red', 'red'],
          ['red', 'red']
        ]
      };

      renderer.render(gameDto);

      expect(scoreElement.textContent).toBe('250');
    });

    it('should show game over when state is gameOver', () => {
      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'gameOver',
        score: 150,
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: null,
        nextBlock: [
          ['yellow', 'yellow'],
          ['yellow', 'yellow']
        ]
      };

      renderer.render(gameDto);

      expect(gameOverElement.classList.contains('hidden')).toBe(false);
    });

    it('should hide game over when state is playing', () => {
      // 最初にゲームオーバー状態にする
      gameOverElement.classList.remove('hidden');

      const gameDto: GameDto = {
        gameId: 'test-game',
        state: 'playing',
        score: 0,
        field: Array(20).fill(null).map(() => Array(8).fill(null)),
        fallingBlock: null,
        nextBlock: [
          ['blue', 'blue'],
          ['blue', 'blue']
        ]
      };

      renderer.render(gameDto);

      expect(gameOverElement.classList.contains('hidden')).toBe(true);
    });

    it('should render next block', () => {
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
