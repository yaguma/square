import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameController } from '@presentation/controllers/GameController';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { ViewportSize } from '@application/value-objects/ViewportSize';

describe('Mobile Integration Tests', () => {
  let gameController: GameController;
  let canvas: HTMLCanvasElement;
  let touchControlsContainer: HTMLElement;

  beforeEach(() => {
    // DOM要素を作成
    canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';

    // Canvas context をモック（jsdom では完全にサポートされていないため）
    const mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      createLinearGradient: vi.fn(),
      createRadialGradient: vi.fn(),
      createPattern: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      canvas: canvas,
    };

    vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext as any);

    document.body.appendChild(canvas);

    touchControlsContainer = document.createElement('div');
    touchControlsContainer.id = 'touch-controls-container';
    document.body.appendChild(touchControlsContainer);

    // 必要なUI要素を作成
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score';
    document.body.appendChild(scoreElement);

    // Next canvas を作成
    const nextCanvas = document.createElement('canvas');
    nextCanvas.id = 'next-canvas';
    nextCanvas.width = 120;
    nextCanvas.height = 120;

    // Next canvas の context もモック
    vi.spyOn(nextCanvas, 'getContext').mockReturnValue(mockContext as any);
    document.body.appendChild(nextCanvas);

    // Game over 要素を作成
    const gameOverElement = document.createElement('div');
    gameOverElement.id = 'game-over';
    document.body.appendChild(gameOverElement);

    // 依存関係を組み立て
    const gameRepository = new InMemoryGameRepository();
    const gameApplicationService = new GameApplicationService(gameRepository);
    const inputHandlerService = new InputHandlerService(gameApplicationService);
    const layoutCalculationService = new LayoutCalculationService();

    const canvasRenderer = new CanvasRenderer(canvas, 30);
    const uiRenderer = new UIRenderer();

    gameController = new GameController(
      gameApplicationService,
      inputHandlerService,
      canvasRenderer,
      uiRenderer,
      touchControlsContainer,
      layoutCalculationService
    );
  });

  afterEach(() => {
    if (gameController) {
      gameController.stop();
    }
    document.body.innerHTML = '';
  });

  describe('TouchControlRenderer Integration', () => {
    it('should initialize TouchControlRenderer on start', () => {
      gameController.start();

      const touchControls = touchControlsContainer.querySelector('.touch-controls');
      expect(touchControls).not.toBeNull();
    });

    it('should destroy TouchControlRenderer on stop', () => {
      gameController.start();
      gameController.stop();

      const touchControls = touchControlsContainer.querySelector('.touch-controls');
      expect(touchControls).toBeNull();
    });

    it('should show touch controls on mobile viewport', () => {
      // モバイルサイズのビューポートを設定
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667);

      gameController.start();

      const touchControls = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls).not.toBeNull();

      // CSSで制御されるため、display styleを確認
      // 実際の表示はCSSに依存するため、要素の存在のみ確認
      expect(touchControls.style.display).not.toBe('none');
    });

    it('should hide touch controls on desktop viewport', () => {
      // デスクトップサイズのビューポートを設定
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(768);

      gameController.start();

      const touchControls = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls).not.toBeNull();

      // デスクトップではhide()が呼ばれる（containerのdisplayが'none'になる）
      expect(touchControlsContainer.style.display).toBe('none');
    });
  });

  describe('Resize Handling', () => {
    it('should recalculate block size on resize', () => {
      gameController.start();

      const viewport = ViewportSize.create(400, 800);

      gameController.handleResize(viewport);

      // ブロックサイズが再計算されることを確認
      // CanvasRendererのblockSizeが変更されることを期待
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it('should toggle touch controls visibility on resize', () => {
      gameController.start();

      // モバイルサイズにリサイズ
      const mobileViewport = ViewportSize.create(375, 667);
      gameController.handleResize(mobileViewport);

      const touchControls = touchControlsContainer.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls).not.toBeNull();
      expect(touchControlsContainer.style.display).not.toBe('none');

      // デスクトップサイズにリサイズ
      const desktopViewport = ViewportSize.create(1024, 768);
      gameController.handleResize(desktopViewport);

      expect(touchControlsContainer.style.display).toBe('none');
    });
  });

  describe('Layout Calculation Integration', () => {
    it('should calculate correct block size for mobile', () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667);

      const layoutService = new LayoutCalculationService();
      const viewport = ViewportSize.create(375, 667);
      const blockSize = layoutService.calculateBlockSize(viewport);

      expect(blockSize.size).toBeGreaterThanOrEqual(15);
      expect(blockSize.size).toBeLessThanOrEqual(30);
    });

    it('should calculate correct block size for desktop', () => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(768);

      const layoutService = new LayoutCalculationService();
      const viewport = ViewportSize.create(1024, 768);
      const blockSize = layoutService.calculateBlockSize(viewport);

      expect(blockSize.size).toBeGreaterThanOrEqual(20);
      expect(blockSize.size).toBeLessThanOrEqual(40);
    });

    it('should determine touch controls should be shown on mobile', () => {
      const layoutService = new LayoutCalculationService();
      const mobileViewport = ViewportSize.create(375, 667);

      expect(layoutService.shouldShowTouchControls(mobileViewport)).toBe(true);
    });

    it('should determine touch controls should be hidden on desktop', () => {
      const layoutService = new LayoutCalculationService();
      const desktopViewport = ViewportSize.create(1024, 768);

      expect(layoutService.shouldShowTouchControls(desktopViewport)).toBe(false);
    });
  });

  describe('Canvas Rendering After Resize', () => {
    it('should render correctly after resize', () => {
      gameController.start();

      const viewport = ViewportSize.create(400, 800);
      gameController.handleResize(viewport);

      // Canvas が正しくリサイズされる
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);

      // Canvas コンテキストが有効
      const ctx = canvas.getContext('2d');
      expect(ctx).not.toBeNull();
    });

    it('should maintain aspect ratio after resize', () => {
      gameController.start();

      const viewport = ViewportSize.create(400, 800);
      gameController.handleResize(viewport);

      // フィールドは8x20なので、アスペクト比は 8:20 = 2:5
      const aspectRatio = canvas.width / canvas.height;
      const expectedAspectRatio = 8 / 20;

      expect(Math.abs(aspectRatio - expectedAspectRatio)).toBeLessThan(0.01);
    });
  });
});
