import { InputCommand } from '@application/value-objects/InputCommand';

/**
 * CooldownManager - 入力のクールダウン管理サービス
 *
 * @remarks
 * 入力のクールダウン制御（連続入力防止）のビジネスルールを提供します。
 *
 * DDD観点:
 * - Application層のサービスとして配置
 * - クールダウン時間はゲームバランスのビジネスルール
 * - 入力処理の一部としてInputHandlerServiceと密接に連携
 * - Presentation層がビジネスルールを持たない設計
 *
 * 責務:
 * - 各コマンドのクールダウン状態を管理
 * - コマンドが実行可能かを判定
 * - コマンドの実行時刻を記録
 */
export class CooldownManager {
  /**
   * 各コマンドの最終実行時刻（ミリ秒）
   */
  private cooldowns: Map<InputCommand, number> = new Map();

  /**
   * 各コマンドのクールダウン時間（ミリ秒）
   *
   * @remarks
   * ゲームバランスに基づくビジネスルール:
   * - MOVE_LEFT/RIGHT: 133ms（4フレーム @ 30fps）- 既存仕様に合わせる
   * - ROTATE系: 200ms - 誤操作防止
   * - INSTANT_DROP: 0ms - クールダウンなし（即座に実行可能）
   * - MOVE_DOWN: 0ms - 押し続け対応
   * - PAUSE/RESET: 0ms - UI操作のためクールダウン不要
   */
  private readonly cooldownDurations: Map<InputCommand, number> = new Map([
    [InputCommand.MOVE_LEFT, 133], // 4フレーム @ 30fps
    [InputCommand.MOVE_RIGHT, 133], // 4フレーム @ 30fps
    [InputCommand.ROTATE_CLOCKWISE, 200],
    [InputCommand.ROTATE_COUNTER_CLOCKWISE, 200],
    [InputCommand.INSTANT_DROP, 0], // クールダウンなし
    [InputCommand.MOVE_DOWN, 0], // 押し続け対応
    [InputCommand.PAUSE, 0], // UI操作
    [InputCommand.RESET, 0], // UI操作
  ]);

  /**
   * 指定コマンドを実行可能か判定
   *
   * @param command - 入力コマンド
   * @param currentTime - 現在時刻（ミリ秒）
   * @returns 実行可能な場合true、クールダウン中の場合false
   *
   * @remarks
   * 判定ロジック:
   * 1. 最終実行時刻を取得（未実行の場合は0）
   * 2. クールダウン時間を取得（未定義の場合は0）
   * 3. 経過時間 >= クールダウン時間 ならば実行可能
   */
  canExecute(command: InputCommand, currentTime: number): boolean {
    const lastExecutionTime = this.cooldowns.get(command) ?? 0;
    const cooldownDuration = this.cooldownDurations.get(command) ?? 0;

    return currentTime - lastExecutionTime >= cooldownDuration;
  }

  /**
   * コマンドの実行を記録
   *
   * @param command - 実行されたコマンド
   * @param currentTime - 実行時刻（ミリ秒）
   *
   * @remarks
   * InputHandlerServiceがコマンド実行後に呼び出します。
   * 次回の実行可否判定に使用されます。
   */
  markExecuted(command: InputCommand, currentTime: number): void {
    this.cooldowns.set(command, currentTime);
  }

  /**
   * すべてのクールダウンをリセット
   *
   * @remarks
   * ゲーム再開時や状態リセット時に使用します。
   */
  reset(): void {
    this.cooldowns.clear();
  }

  /**
   * 指定コマンドのクールダウン時間を取得（テスト用）
   *
   * @param command - 入力コマンド
   * @returns クールダウン時間（ミリ秒）
   */
  getCooldownDuration(command: InputCommand): number {
    return this.cooldownDurations.get(command) ?? 0;
  }

  /**
   * 指定コマンドの最終実行時刻を取得（テスト用）
   *
   * @param command - 入力コマンド
   * @returns 最終実行時刻（ミリ秒）、未実行の場合はundefined
   */
  getLastExecutionTime(command: InputCommand): number | undefined {
    return this.cooldowns.get(command);
  }
}
