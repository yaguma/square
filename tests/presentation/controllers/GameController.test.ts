import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { GameController } from '@presentation/controllers/GameController';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';

describe('GameController', () => {
  let controller: GameController;
  let gameApplicationService: GameApplicationService;
  let inputHandlerService: InputHandlerService;
  let canvasRenderer: CanvasRenderer;
  let uiRenderer: UIRenderer;

  // DOM要素をモック
  let pauseBtn: HTMLButtonElement;
  let resetBtn: HTMLButtonElement;
  let restartBtn: HTMLButtonElement;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    // DOM要素を作成
    pauseBtn = document.createElement('button');
    pauseBtn.id = 'pause-btn';
    document.body.appendChild(pauseBtn);

    resetBtn = document.createElement('button');
    resetBtn.id = 'reset-btn';
    document.body.appendChild(resetBtn);

    restartBtn = document.createElement('button');
    restartBtn.id = 'restart-btn';
    document.body.appendChild(restartBtn);

    // Canvas要素を作成
    canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    canvas.width = 400;
    canvas.height = 600;

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

    document.body.appendChild(canvas);

    // UI要素を作成（UIRendererが必要とする要素）
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score';
    document.body.appendChild(scoreElement);

    const nextCanvas = document.createElement('canvas');
    nextCanvas.id = 'next-canvas';
    // next-canvasのgetContextもモック
    vi.spyOn(nextCanvas, 'getContext').mockReturnValue(ctx);
    document.body.appendChild(nextCanvas);

    const gameOverElement = document.createElement('div');
    gameOverElement.id = 'game-over';
    document.body.appendChild(gameOverElement);

    // 依存関係を作成
    const repository = new InMemoryGameRepository();
    gameApplicationService = new GameApplicationService(repository);
    inputHandlerService = new InputHandlerService(gameApplicationService);
    canvasRenderer = new CanvasRenderer(canvas);
    uiRenderer = new UIRenderer();

    // GameControllerを作成
    controller = new GameController(
      gameApplicationService,
      inputHandlerService,
      canvasRenderer,
      uiRenderer
    );
  });

  afterEach(() => {
    // DOM要素をクリーンアップ
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    test('正しく初期化される', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(GameController);
    });
  });

  describe('start', () => {
    test('ゲームを開始する', () => {
      const startNewGameSpy = vi.spyOn(gameApplicationService, 'startNewGame');

      controller.start();

      expect(startNewGameSpy).toHaveBeenCalledOnce();
    });

    test('初回描画が実行される', () => {
      const canvasRenderSpy = vi.spyOn(canvasRenderer, 'render');
      const uiRenderSpy = vi.spyOn(uiRenderer, 'render');

      controller.start();

      expect(canvasRenderSpy).toHaveBeenCalled();
      expect(uiRenderSpy).toHaveBeenCalled();
    });

    test('イベントリスナーが設定される', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      controller.start();

      // keydownとkeyupのイベントリスナーが登録されることを確認
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });
  });

  describe('stop', () => {
    test('ゲームを停止する', () => {
      controller.start();

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      controller.stop();

      // keydownとkeyupのイベントリスナーが削除されることを確認
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });
  });

  describe('イベントハンドリング', () => {
    test('pause-btnクリックでゲームが一時停止/再開される', () => {
      controller.start();

      const pauseGameSpy = vi.spyOn(gameApplicationService, 'pauseGame');

      pauseBtn.click();

      expect(pauseGameSpy).toHaveBeenCalled();
    });

    test('reset-btnクリックでゲームが再スタートされる', () => {
      controller.start();

      const restartGameSpy = vi.spyOn(gameApplicationService, 'restartGame');

      resetBtn.click();

      expect(restartGameSpy).toHaveBeenCalled();
    });

    test('restart-btnクリックでゲームが再スタートされる', () => {
      controller.start();

      const restartGameSpy = vi.spyOn(gameApplicationService, 'restartGame');

      restartBtn.click();

      expect(restartGameSpy).toHaveBeenCalled();
    });

    test('keydownイベントがInputHandlerServiceに渡される', () => {
      controller.start();

      const handleKeyDownSpy = vi.spyOn(inputHandlerService, 'handleKeyDown');

      // キーダウンイベントを発火
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(handleKeyDownSpy).toHaveBeenCalledWith('ArrowLeft', expect.any(String));
    });

    test('keyupイベントがInputHandlerServiceに渡される', () => {
      controller.start();

      const handleKeyUpSpy = vi.spyOn(inputHandlerService, 'handleKeyUp');

      // キーアップイベントを発火
      const event = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(handleKeyUpSpy).toHaveBeenCalledWith('ArrowLeft', expect.any(String));
    });

    test('pause-btnを2回クリックで一時停止→再開される', () => {
      controller.start();

      const pauseGameSpy = vi.spyOn(gameApplicationService, 'pauseGame');
      const resumeGameSpy = vi.spyOn(gameApplicationService, 'resumeGame');

      // 1回目のクリック: pause
      pauseBtn.click();
      expect(pauseGameSpy).toHaveBeenCalled();

      // ゲーム状態をpausedに変更（モック）
      vi.spyOn(gameApplicationService, 'getGameState').mockReturnValue({
        gameId: 'test-game',
        state: 'paused',
        score: 0,
        level: 1,
        linesCleared: 0,
        field: [],
        fallingBlock: null,
        nextBlock: null,
      });

      // 2回目のクリック: resume
      pauseBtn.click();
      expect(resumeGameSpy).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    test('レンダリング中のエラーがスローされる', () => {
      // レンダラーがエラーをスローするようにモック
      vi.spyOn(canvasRenderer, 'render').mockImplementation(() => {
        throw new Error('Render error');
      });

      // start()の初回描画でエラーが発生することを確認
      expect(() => controller.start()).toThrow('Render error');
    });

    test('ゲームループ内でupdateFrameがエラーをスローした場合、ゲームを停止する', () => {
      // タイマーをモック化
      vi.useFakeTimers();

      // コンソールエラーとアラートをモック
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      // updateFrameがエラーをスローするようにモック（start()前に設定）
      vi.spyOn(gameApplicationService, 'updateFrame').mockImplementation(() => {
        throw new Error('Update frame error');
      });

      // ゲームを開始
      controller.start();

      // タイマーを進めてゲームループを実行（1000/30 = 33.33ms）
      vi.advanceTimersByTime(34);

      // エラーハンドリングが実行されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Game loop error:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('ゲームループでエラーが発生しました。ゲームを停止します。');

      // クリーンアップ
      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
      vi.useRealTimers();
    });

    test('ゲームループ内でレンダリングエラーが発生した場合、ゲームを停止する', () => {
      // タイマーをモック化
      vi.useFakeTimers();

      // コンソールエラーとアラートをモック
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      // 初回のrenderは成功させる
      let renderCallCount = 0;
      vi.spyOn(canvasRenderer, 'render').mockImplementation(() => {
        renderCallCount++;
        if (renderCallCount > 1) {
          // 2回目以降（ゲームループ内）でエラーをスロー
          throw new Error('Render error in loop');
        }
      });

      // ゲームを開始（初回描画は成功）
      controller.start();

      // タイマーを進めてゲームループを実行（1000/30 = 33.33ms）
      vi.advanceTimersByTime(34);

      // エラーハンドリングが実行されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Render error:', expect.any(Error));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Game loop error:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('ゲームループでエラーが発生しました。ゲームを停止します。');

      // クリーンアップ
      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
      vi.useRealTimers();
    });
  });

  describe('メモリリーク対策', () => {
    test('start()を複数回呼んでもイベントリスナーが重複登録されない', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      controller.start();
      const firstCallCount = addEventListenerSpy.mock.calls.length;

      controller.start();
      const secondCallCount = addEventListenerSpy.mock.calls.length;

      // 2回目のstart()でも同じ数のイベントリスナーが登録される
      // （古いリスナーが削除されてから新しいリスナーが登録される）
      expect(secondCallCount).toBeGreaterThan(firstCallCount);
    });

    test('stop()後にイベントリスナーが削除される', () => {
      controller.start();
      controller.stop();

      const handleKeyDownSpy = vi.spyOn(inputHandlerService, 'handleKeyDown');

      // キーダウンイベントを発火
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      // stop()後はイベントハンドラーが呼ばれない
      expect(handleKeyDownSpy).not.toHaveBeenCalled();
    });
  });
});
