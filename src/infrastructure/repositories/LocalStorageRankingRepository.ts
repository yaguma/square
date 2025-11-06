import { RankingRepository, RankingEntry } from '@domain/repositories/RankingRepository';

const STORAGE_KEY = 'square-game-ranking';

/**
 * LocalStorageRankingRepository
 *
 * ローカルストレージを使用してランキングデータを永続化する
 */
export class LocalStorageRankingRepository implements RankingRepository {
  /**
   * 全てのランキングエントリーを取得
   *
   * @returns ランキングエントリーの配列（スコアの降順）
   */
  findAll(): RankingEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const entries = JSON.parse(data) as RankingEntry[];

      // スコアの降順でソート
      return entries.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Failed to load ranking from localStorage:', error);
      return [];
    }
  }

  /**
   * ランキングエントリーを保存
   *
   * @param entries - 保存するランキングエントリーの配列
   */
  save(entries: RankingEntry[]): void {
    try {
      const data = JSON.stringify(entries);
      localStorage.setItem(STORAGE_KEY, data);
    } catch (error) {
      console.error('Failed to save ranking to localStorage:', error);
    }
  }
}
