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
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // キーボードイベント
    window.addEventListener('keydown', (event) => {
      if (!this.currentGameId) return;

      this.inputHandlerService.handleKeyDown(event.key, this.currentGameId);
    });

    window.addEventListener('keyup', (event) => {
      if (!this.currentGameId) return;

      this.inputHandlerService.handleKeyUp(event.key, this.currentGameId);
    });

    // ボタンイベント
    document.getElementById('pause-btn')?.addEventListener('click', () => {
      if (!this.currentGameId) return;

      const gameState = this.gameApplicationService.getGameState(
        this.currentGameId
      );
      if (gameState.state === 'playing') {
        this.gameApplicationService.pauseGame(this.currentGameId);
      } else if (gameState.state === 'paused') {
        this.gameApplicationService.resumeGame(this.currentGameId);
      }
    });

    document.getElementById('reset-btn')?.addEventListener('click', () => {
      if (!this.currentGameId) return;

      this.gameApplicationService.restartGame(this.currentGameId);
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      if (!this.currentGameId) return;

      this.gameApplicationService.restartGame(this.currentGameId);
    });
  }

  /**
   * ゲームループ
   */
  private gameLoop(): void {
    if (!this.currentGameId) return;

    // ゲーム状態を更新
    const gameDto = this.gameApplicationService.updateFrame(this.currentGameId);

    // 描画
    this.render(gameDto);
  }

  /**
   * 描画
   */
  private render(gameDto: GameDto): void {
    this.canvasRenderer.render(gameDto);
    this.uiRenderer.render(gameDto);
  }
}
