import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { FrameTimer } from '@infrastructure/timer/FrameTimer';
import { GameDto } from '@application/dto/GameDto';

/**
 * GameController
 *
 * ゲーム全体を制御するコントローラー
 */
export class GameController {
  private frameTimer: FrameTimer;
  private currentGameId: string | null = null;

  // イベントハンドラーを保持（削除時に必要）
  private keydownHandler?: (event: KeyboardEvent) => void;
  private keyupHandler?: (event: KeyboardEvent) => void;
  private pauseBtnHandler?: () => void;
  private resetBtnHandler?: () => void;
  private restartBtnHandler?: () => void;

  constructor(
    private gameApplicationService: GameApplicationService,
    private inputHandlerService: InputHandlerService,
    private canvasRenderer: CanvasRenderer,
    private uiRenderer: UIRenderer
  ) {
    this.frameTimer = new FrameTimer();
  }

  /**
   * ゲームを開始
   */
  start(): void {
    // 新しいゲームを開始
    const gameDto = this.gameApplicationService.startNewGame();
    this.currentGameId = gameDto.gameId;

    // イベントリスナーを設定
    this.setupEventListeners();

    // 初回描画
    this.render(gameDto);

    // ゲームループを開始
    this.frameTimer.start(() => {
      this.gameLoop();
    }, 30);
  }

  /**
   * ゲームを停止
   */
  stop(): void {
    this.frameTimer.stop();
    this.removeEventListeners();
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // 既存のイベントリスナーを削除（重複登録を防ぐ）
    this.removeEventListeners();

    // キーボードイベント
    this.keydownHandler = (event: KeyboardEvent) => {
      if (!this.currentGameId) return;
      this.inputHandlerService.handleKeyDown(event.key, this.currentGameId);
    };

    this.keyupHandler = (event: KeyboardEvent) => {
      if (!this.currentGameId) return;
      this.inputHandlerService.handleKeyUp(event.key, this.currentGameId);
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);

    // ボタンイベント
    this.pauseBtnHandler = () => {
      if (!this.currentGameId) return;

      const gameState = this.gameApplicationService.getGameState(
        this.currentGameId
      );
      if (gameState.state === 'playing') {
        this.gameApplicationService.pauseGame(this.currentGameId);
      } else if (gameState.state === 'paused') {
        this.gameApplicationService.resumeGame(this.currentGameId);
      }
    };

    this.resetBtnHandler = () => {
      if (!this.currentGameId) return;
      this.gameApplicationService.restartGame(this.currentGameId);
    };

    this.restartBtnHandler = () => {
      if (!this.currentGameId) return;
      this.gameApplicationService.restartGame(this.currentGameId);
    };

    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', this.pauseBtnHandler);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', this.resetBtnHandler);
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', this.restartBtnHandler);
    }
  }

  /**
   * イベントリスナーを削除
   */
  private removeEventListeners(): void {
    // キーボードイベントリスナーを削除
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = undefined;
    }

    if (this.keyupHandler) {
      window.removeEventListener('keyup', this.keyupHandler);
      this.keyupHandler = undefined;
    }

    // ボタンイベントリスナーを削除
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (pauseBtn && this.pauseBtnHandler) {
      pauseBtn.removeEventListener('click', this.pauseBtnHandler);
      this.pauseBtnHandler = undefined;
    }

    if (resetBtn && this.resetBtnHandler) {
      resetBtn.removeEventListener('click', this.resetBtnHandler);
      this.resetBtnHandler = undefined;
    }

    if (restartBtn && this.restartBtnHandler) {
      restartBtn.removeEventListener('click', this.restartBtnHandler);
      this.restartBtnHandler = undefined;
    }
  }

  /**
   * ゲームループ
   */
  private gameLoop(): void {
    if (!this.currentGameId) return;

    try {
      // ゲーム状態を更新
      const gameDto = this.gameApplicationService.updateFrame(
        this.currentGameId
      );

      // 描画
      this.render(gameDto);
    } catch (error) {
      console.error('Game loop error:', error);
      this.stop();
      this.showError('ゲームループでエラーが発生しました。ゲームを停止します。');
    }
  }

  /**
   * 描画
   */
  private render(gameDto: GameDto): void {
    try {
      this.canvasRenderer.render(gameDto);
      this.uiRenderer.render(gameDto);
    } catch (error) {
      console.error('Render error:', error);
      throw error; // gameLoop()でキャッチされる
    }
  }

  /**
   * エラーメッセージを表示
   */
  private showError(message: string): void {
    // シンプルなエラー表示（将来的にはUIを改善する）
    alert(message);
  }
}
