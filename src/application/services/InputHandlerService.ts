import { GameApplicationService } from './GameApplicationService';

/**
 * 入力受付のクールダウン期間（フレーム数）
 */
const INPUT_COOLDOWN = 4;

/**
 * InputHandlerService - ユーザー入力の処理サービス
 *
 * @remarks
 * キーボード入力を受け取り、適切なゲームアクションを実行する
 */
export class InputHandlerService {
  private lastInputFrame: Map<string, number> = new Map();
  private inputCooldown: number = INPUT_COOLDOWN;

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
        this.gameApplicationService.moveBlockLeft(gameId);
        this.updateLastInputFrame('left', Date.now());
        break;

      case 'ArrowRight':
        this.gameApplicationService.moveBlockRight(gameId);
        this.updateLastInputFrame('right', Date.now());
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
   * @param frameCount - 現在のフレームカウント
   * @returns 入力を受け付ける場合true
   */
  canAcceptInput(key: string, frameCount: number): boolean {
    const lastFrame = this.lastInputFrame.get(key);

    if (lastFrame === undefined) {
      this.updateLastInputFrame(key, frameCount);
      return true;
    }

    const canAccept = frameCount - lastFrame >= this.inputCooldown;

    if (canAccept) {
      this.updateLastInputFrame(key, frameCount);
    }

    return canAccept;
  }

  /**
   * 最終入力フレームを更新
   *
   * @param key - キー
   * @param frameCount - フレームカウント
   */
  private updateLastInputFrame(key: string, frameCount: number): void {
    this.lastInputFrame.set(key, frameCount);
  }
}
