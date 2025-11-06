import { GameApplicationService } from './GameApplicationService';
import { InputCommand } from '@application/value-objects/InputCommand';

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
   * 統一的な入力処理メソッド
   *
   * @remarks
   * タッチ入力とキーボード入力の両方で使用される
   * Phase 3でCooldownManagerと統合予定
   *
   * @param command - 入力コマンド
   * @param gameId - ゲームID
   */
  handleInput(command: InputCommand, gameId: string): void {
    try {
      // 簡易クールダウンチェック（MOVE_LEFT/RIGHTのみ）
      const needsCooldown = command === InputCommand.MOVE_LEFT || command === InputCommand.MOVE_RIGHT;

      if (needsCooldown) {
        const key = command === InputCommand.MOVE_LEFT ? 'left' : 'right';
        if (!this.canAcceptInput(key)) {
          return; // クールダウン中は無視
        }
      }

      // コマンドに応じてゲーム操作を実行
      this.executeCommand(command, gameId);
    } catch (error) {
      console.error(`Failed to handle input command ${command}:`, error);
      // エラーでもゲームを継続
    }
  }

  /**
   * 統一的な入力リリース処理メソッド
   *
   * @remarks
   * タッチ入力やキーボード入力のリリースイベントで使用される
   *
   * @param command - 入力コマンド
   * @param gameId - ゲームID
   */
  handleInputRelease(command: InputCommand, gameId: string): void {
    try {
      // コマンドに応じてリリース処理を実行
      this.executeReleaseCommand(command, gameId);
    } catch (error) {
      console.error(`Failed to handle input release for command ${command}:`, error);
      // エラーでもゲームを継続
    }
  }

  /**
   * InputCommandに応じたゲーム操作を実行
   *
   * @param command - 入力コマンド
   * @param gameId - ゲームID
   */
  private executeCommand(command: InputCommand, gameId: string): void {
    switch (command) {
      case InputCommand.MOVE_LEFT:
        this.gameApplicationService.moveBlockLeft(gameId);
        break;
      case InputCommand.MOVE_RIGHT:
        this.gameApplicationService.moveBlockRight(gameId);
        break;
      case InputCommand.MOVE_DOWN:
        this.gameApplicationService.accelerateFall(gameId);
        break;
      case InputCommand.ROTATE_CLOCKWISE:
        this.gameApplicationService.rotateBlockClockwise(gameId);
        break;
      case InputCommand.ROTATE_COUNTER_CLOCKWISE:
        this.gameApplicationService.rotateBlockCounterClockwise(gameId);
        break;
      case InputCommand.INSTANT_DROP:
        this.gameApplicationService.dropInstantly(gameId);
        break;
      case InputCommand.PAUSE:
        // 一時停止/再開のトグル
        const gameState = this.gameApplicationService.getGameState(gameId);
        if (gameState.state === 'playing') {
          this.gameApplicationService.pauseGame(gameId);
        } else if (gameState.state === 'paused') {
          this.gameApplicationService.resumeGame(gameId);
        }
        break;
      case InputCommand.RESET:
        this.gameApplicationService.restartGame(gameId);
        break;
      default:
        console.warn(`Unknown input command: ${command}`);
    }
  }

  /**
   * InputCommandに応じたリリース処理を実行
   *
   * @param command - 入力コマンド
   * @param gameId - ゲームID
   */
  private executeReleaseCommand(command: InputCommand, gameId: string): void {
    switch (command) {
      case InputCommand.MOVE_DOWN:
        // 高速落下を解除
        this.gameApplicationService.disableFastFall(gameId);
        break;
      // 他のコマンドはリリース処理不要
      default:
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
