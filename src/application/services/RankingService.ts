import { RankingRepository, RankingEntry } from '@domain/repositories/RankingRepository';

/**
 * RankingService
 *
 * ランキング機能を管理するアプリケーションサービス
 */
export class RankingService {
  private static readonly MAX_RANKING_SIZE = 10;

  constructor(private rankingRepository: RankingRepository) {}

  /**
   * スコアをランキングに追加
   *
   * @param score - 追加するスコア
   */
  addScore(score: number): void {
    const entries = this.rankingRepository.findAll();

    // 新しいエントリーを追加
    const newEntry: RankingEntry = {
      score,
      timestamp: Date.now()
    };

    entries.push(newEntry);

    // スコアの降順でソート
    entries.sort((a, b) => b.score - a.score);

    // 上位MAX_RANKING_SIZE件のみ保持
    const topEntries = entries.slice(0, RankingService.MAX_RANKING_SIZE);

    this.rankingRepository.save(topEntries);
  }

  /**
   * ランキングを取得
   *
   * @returns ランキングエントリーの配列（スコアの降順）
   */
  getRanking(): RankingEntry[] {
    return this.rankingRepository.findAll();
  }

  /**
   * 指定したスコアが上位N位以内に入るかチェック
   *
   * @param score - チェックするスコア
   * @returns 上位に入る場合true
   */
  isTopScore(score: number): boolean {
    const entries = this.rankingRepository.findAll();

    // ランキングがMAX_RANKING_SIZE件未満の場合は常にtrue
    if (entries.length < RankingService.MAX_RANKING_SIZE) {
      return true;
    }

    // 最下位のスコアより高い場合true
    const lowestScore = entries[entries.length - 1].score;
    return score > lowestScore;
  }

  /**
   * ランキングをクリア
   */
  clearRanking(): void {
    this.rankingRepository.save([]);
  }
}
