import { GameApplicationService } from './GameApplicationService';

/**
 * 入力受付のクールダウン期間（ミリ秒）
 * 4フレーム @ 30fps = 約133ms
 */
const INPUT_COOLDOWN_MS = 133;

/**
 * InputHandlerService - ユーザー入力の処理サービス
 *
 * @remarks
 * キーボード入力を受け取り、適切なゲームアクションを実行する
 */
export class InputHandlerService {
  private lastInputTime: Map<string, number> = new Map();
  private inputCooldownMs: number = INPUT_COOLDOWN_MS;

  constructor(private gameApplicationService: GameApplicationService) {}

  /**
   * キー押下イベントを処理
   *
   * @param key - 押下されたキー
   * @param gameId - ゲームID
   */
  handleKeyDown(key: string, gameId: string): void {
    switch (key) {
      case 'ArrowLeft':
        if (this.canAcceptInput('left')) {
          this.gameApplicationService.moveBlockLeft(gameId);
        }
        break;

      case 'ArrowRight':
        if (this.canAcceptInput('right')) {
          this.gameApplicationService.moveBlockRight(gameId);
        }
        break;

      case 'ArrowUp':
      case 'z':
        this.gameApplicationService.rotateBlockClockwise(gameId);
        break;

      case 'x':
      case 'Control':
        this.gameApplicationService.rotateBlockCounterClockwise(gameId);
        break;

      case 'ArrowDown':
        this.gameApplicationService.accelerateFall(gameId);
        break;

      case ' ': // Space
        this.gameApplicationService.dropInstantly(gameId);
        break;

      case 'p':
        // 一時停止/再開のトグル
        const gameState = this.gameApplicationService.getGameState(gameId);
        if (gameState.state === 'playing') {
          this.gameApplicationService.pauseGame(gameId);
        } else if (gameState.state === 'paused') {
          this.gameApplicationService.resumeGame(gameId);
        }
        break;

      case 'r':
        this.gameApplicationService.restartGame(gameId);
        break;
    }
  }

  /**
   * キー解放イベントを処理
   *
   * @param key - 解放されたキー
   * @param gameId - ゲームID
   */
  handleKeyUp(key: string, gameId: string): void {
    switch (key) {
      case 'ArrowDown':
        this.gameApplicationService.disableFastFall(gameId);
        break;
    }
  }

  /**
   * 連続入力待ちを考慮して、入力を受け付けるかを判定
   *
   * @param key - キー
   * @param currentTime - 現在時刻（ミリ秒）。省略時はDate.now()を使用
   * @returns 入力を受け付ける場合true
   */
  canAcceptInput(key: string, currentTime: number = Date.now()): boolean {
    const lastTime = this.lastInputTime.get(key);

    if (lastTime === undefined) {
      this.updateLastInputTime(key, currentTime);
      return true;
    }

    const canAccept = currentTime - lastTime >= this.inputCooldownMs;

    if (canAccept) {
      this.updateLastInputTime(key, currentTime);
    }

    return canAccept;
  }

  /**
   * 最終入力時刻を更新
   *
   * @param key - キー
   * @param currentTime - 現在時刻（ミリ秒）
   */
  private updateLastInputTime(key: string, currentTime: number): void {
    this.lastInputTime.set(key, currentTime);
  }
}
