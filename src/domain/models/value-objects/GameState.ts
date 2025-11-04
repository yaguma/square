/**
 * GameState - ゲームの状態を表す列挙型
 *
 * @remarks
 * - Playing: ゲームプレイ中
 * - Paused: 一時停止中
 * - GameOver: ゲームオーバー
 */
export enum GameState {
  /**
   * ゲームプレイ中
   */
  Playing = 'playing',

  /**
   * 一時停止中
   */
  Paused = 'paused',

  /**
   * ゲームオーバー
   */
  GameOver = 'gameOver'
}
