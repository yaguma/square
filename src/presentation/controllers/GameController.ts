import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { LayoutCalculationService } from '@application/services/LayoutCalculationService';
import { RankingService } from '@application/services/RankingService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { TouchControlRenderer } from '@presentation/renderers/TouchControlRenderer';
import { RankingDialogRenderer } from '@presentation/renderers/RankingDialogRenderer';
import { FrameTimer } from '@infrastructure/timer/FrameTimer';
import { GameDto } from '@application/dto/GameDto';
import { ViewportSize } from '@application/value-objects/ViewportSize';

/**
 * GameController
 *
 * ゲーム全体を制御するコントローラー
 */
export class GameController {
  private frameTimer: FrameTimer;
  private currentGameId: string | null = null;
  private touchControlRenderer: TouchControlRenderer | null = null;
  private lastGameState: 'playing' | 'paused' | 'gameOver' | null = null;

  // イベントハンドラーを保持（削除時に必要）
  private keydownHandler?: (event: KeyboardEvent) => void;
  private keyupHandler?: (event: KeyboardEvent) => void;
  private pauseBtnHandler?: () => void;
  private resetBtnHandler?: () => void;
  private restartBtnHandler?: () => void;
  private rankingBtnHandler?: () => void;

  constructor(
    private gameApplicationService: GameApplicationService,
    private inputHandlerService: InputHandlerService,
    private canvasRenderer: CanvasRenderer,
    private uiRenderer: UIRenderer,
    private rankingService: RankingService,
    private rankingDialogRenderer: RankingDialogRenderer,
    private touchControlsContainer: HTMLElement | null = null,
    private layoutCalculationService: LayoutCalculationService | null = null
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

    // 既存のTouchControlRendererを破棄（再実行時の対策）
    if (this.touchControlRenderer) {
      this.touchControlRenderer.destroy();
      this.touchControlRenderer = null;
    }

    // TouchControlRendererを作成
    if (this.touchControlsContainer) {
      this.touchControlRenderer = new TouchControlRenderer(
        this.touchControlsContainer,
        this.inputHandlerService,
        this.currentGameId
      );
      this.touchControlRenderer.render();

      // 初期表示状態を設定
      if (this.layoutCalculationService) {
        const viewport = ViewportSize.create(window.innerWidth, window.innerHeight);
        const shouldShow = this.layoutCalculationService.shouldShowTouchControls(viewport);
        if (shouldShow) {
          this.touchControlRenderer.show();
        } else {
          this.touchControlRenderer.hide();
        }
      }
    }

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

    // タッチコントロールを破棄
    if (this.touchControlRenderer) {
      this.touchControlRenderer.destroy();
      this.touchControlRenderer = null;
    }
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

    this.rankingBtnHandler = () => {
      const ranking = this.rankingService.getRanking();
      this.rankingDialogRenderer.show(ranking);
    };

    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const restartBtn = document.getElementById('restart-btn');
    const rankingBtn = document.getElementById('ranking-btn');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', this.pauseBtnHandler);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', this.resetBtnHandler);
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', this.restartBtnHandler);
    }

    if (rankingBtn) {
      rankingBtn.addEventListener('click', this.rankingBtnHandler);
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
    const rankingBtn = document.getElementById('ranking-btn');

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

    if (rankingBtn && this.rankingBtnHandler) {
      rankingBtn.removeEventListener('click', this.rankingBtnHandler);
      this.rankingBtnHandler = undefined;
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

      // ゲームオーバーになった瞬間を検知してランキングに保存
      if (gameDto.state === 'gameOver' && this.lastGameState !== 'gameOver') {
        this.rankingService.addScore(gameDto.score);
      }

      // 状態を更新
      this.lastGameState = gameDto.state;

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

  /**
   * リサイズイベントを処理
   *
   * @param viewport - 新しいビューポートサイズ
   *
   * @remarks
   * - ブロックサイズを再計算
   * - Canvasサイズを更新
   * - タッチコントロールの表示/非表示を切り替え
   * - 現在のゲーム状態を再描画
   */
  handleResize(viewport: ViewportSize): void {
    if (!this.layoutCalculationService) {
      return;
    }

    try {
      // ブロックサイズを再計算
      const blockSize = this.layoutCalculationService.calculateBlockSize(viewport);

      // Canvasサイズを更新
      this.canvasRenderer.updateBlockSize(blockSize.size);

      // タッチコントロールの表示/非表示を切り替え
      const shouldShowTouchControls =
        this.layoutCalculationService.shouldShowTouchControls(viewport);

      if (this.touchControlRenderer) {
        if (shouldShowTouchControls) {
          this.touchControlRenderer.show();
        } else {
          this.touchControlRenderer.hide();
        }
      }

      // 現在のゲーム状態を再描画
      if (this.currentGameId) {
        const gameDto = this.gameApplicationService.getGameState(this.currentGameId);
        this.render(gameDto);
      }
    } catch (error) {
      console.error('Resize handling error:', error);
    }
  }
}
