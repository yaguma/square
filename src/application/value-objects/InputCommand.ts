/**
 * InputCommand - ユーザー入力を抽象化した操作指示を表す列挙型
 *
 * @remarks
 * 入力デバイス（キーボード、タッチ、将来的にはゲームパッド等）に依存しない
 * 統一的なコマンドインターフェースを提供します。
 *
 * DDD観点:
 * - デバイスの違いをドメインレベルで吸収
 * - キーボード入力とタッチ入力を同じコマンドとして扱う
 * - 将来の入力デバイス追加が容易
 */
export enum InputCommand {
  /**
   * ブロックを左に移動
   */
  MOVE_LEFT = 'MOVE_LEFT',

  /**
   * ブロックを右に移動
   */
  MOVE_RIGHT = 'MOVE_RIGHT',

  /**
   * ブロックを下に移動（高速落下）
   */
  MOVE_DOWN = 'MOVE_DOWN',

  /**
   * ブロックを時計回りに回転
   */
  ROTATE_CLOCKWISE = 'ROTATE_CW',

  /**
   * ブロックを反時計回りに回転
   */
  ROTATE_COUNTER_CLOCKWISE = 'ROTATE_CCW',

  /**
   * ブロックを即座に落下
   */
  INSTANT_DROP = 'INSTANT_DROP',

  /**
   * ゲームを一時停止/再開
   */
  PAUSE = 'PAUSE',

  /**
   * ゲームをリセット
   */
  RESET = 'RESET',
}
