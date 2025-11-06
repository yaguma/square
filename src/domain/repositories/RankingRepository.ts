/**
 * ランキングエントリー
 */
export interface RankingEntry {
  score: number;
  timestamp: number; // Unix timestamp
}

/**
 * RankingRepository
 *
 * ランキングデータの永続化を担当するインターフェース
 */
export interface RankingRepository {
  /**
   * 全てのランキングエントリーを取得
   *
   * @returns ランキングエントリーの配列（スコアの降順）
   */
  findAll(): RankingEntry[];

  /**
   * ランキングエントリーを保存
   *
   * @param entries - 保存するランキングエントリーの配列
   */
  save(entries: RankingEntry[]): void;
}
