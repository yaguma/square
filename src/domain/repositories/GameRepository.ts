import { Game } from '@domain/models/entities/Game';

/**
 * GameRepository - ゲームの永続化を担当するリポジトリインターフェース
 *
 * @remarks
 * このインターフェースは、ゲームの保存、取得、削除を抽象化します。
 * 具体的な実装（InMemory、LocalStorage、など）はインフラ層で行います。
 *
 * DDD（ドメイン駆動設計）のリポジトリパターンに従い、
 * ドメイン層にインターフェースを配置し、インフラ層で実装します。
 */
export interface GameRepository {
  /**
   * ゲームを保存する
   *
   * @param game - 保存するゲーム
   *
   * @remarks
   * 同じgameIdのゲームが既に存在する場合は上書きされます。
   *
   * @example
   * ```typescript
   * const game = Game.create('game-1');
   * repository.save(game);
   * ```
   */
  save(game: Game): void;

  /**
   * ゲームIDでゲームを取得する
   *
   * @param gameId - ゲームの一意識別子
   * @returns 見つかった場合はGameインスタンス、見つからない場合はnull
   *
   * @example
   * ```typescript
   * const game = repository.findById('game-1');
   * if (game !== null) {
   *   console.log('ゲームが見つかりました:', game.gameId);
   * }
   * ```
   */
  findById(gameId: string): Game | null;

  /**
   * ゲームを削除する
   *
   * @param gameId - 削除するゲームの一意識別子
   *
   * @remarks
   * 存在しないgameIdを指定してもエラーにはなりません（冪等性）。
   *
   * @example
   * ```typescript
   * repository.delete('game-1');
   * ```
   */
  delete(gameId: string): void;
}
