import { GameRepository } from '@domain/repositories/GameRepository';
import { Game } from '@domain/models/entities/Game';

/**
 * InMemoryGameRepository - インメモリでゲームを管理するリポジトリ実装
 *
 * @remarks
 * このクラスは、ゲームをメモリ上のMapで管理します。
 * 開発環境やテスト環境での使用を想定しています。
 *
 * 本番環境では、LocalStorageやサーバーサイドDBを使った
 * 実装に置き換えることを推奨します。
 *
 * @example
 * ```typescript
 * const repository = new InMemoryGameRepository();
 * const game = Game.create('game-1');
 * repository.save(game);
 * const found = repository.findById('game-1');
 * ```
 */
export class InMemoryGameRepository implements GameRepository {
  /**
   * ゲームを保存するMap
   * - Key: gameId（string）
   * - Value: Gameインスタンス
   */
  private games: Map<string, Game> = new Map();

  /**
   * ゲームを保存する
   *
   * @param game - 保存するゲーム
   *
   * @remarks
   * 同じgameIdのゲームが既に存在する場合は上書きされます。
   */
  save(game: Game): void {
    this.games.set(game.gameId, game);
  }

  /**
   * ゲームIDでゲームを取得する
   *
   * @param gameId - ゲームの一意識別子
   * @returns 見つかった場合はGameインスタンス、見つからない場合はnull
   */
  findById(gameId: string): Game | null {
    return this.games.get(gameId) || null;
  }

  /**
   * ゲームを削除する
   *
   * @param gameId - 削除するゲームの一意識別子
   *
   * @remarks
   * 存在しないgameIdを指定してもエラーにはなりません（冪等性）。
   */
  delete(gameId: string): void {
    this.games.delete(gameId);
  }

  /**
   * すべてのゲームをクリアする（テスト用）
   *
   * @remarks
   * このメソッドは主にテストで使用します。
   * 本番コードでは使用しないことを推奨します。
   */
  clear(): void {
    this.games.clear();
  }
}
