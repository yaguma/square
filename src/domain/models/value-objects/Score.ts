/**
 * Score - ゲームスコアを表す値オブジェクト
 *
 * @remarks
 * - 不変（Immutable）
 * - 0以上の整数
 * - 等価性は値で判定
 */
export class Score {
  private constructor(private readonly _value: number) {}

  /**
   * Scoreインスタンスを生成
   *
   * @param value - スコア値（0以上の整数）
   * @returns Score
   * @throws valueが整数でない場合、または負の値の場合
   */
  static create(value: number): Score {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('Score must be a non-negative integer');
    }
    return new Score(value);
  }

  /**
   * 0のスコアを生成
   *
   * @returns 値が0のScore
   */
  static zero(): Score {
    return new Score(0);
  }

  /**
   * スコアの値を取得
   */
  get value(): number {
    return this._value;
  }

  /**
   * スコアを加算
   *
   * @param points - 加算するポイント（0以上の整数）
   * @returns 新しいScoreインスタンス
   * @throws pointsが整数でない場合、または負の値の場合
   */
  add(points: number): Score {
    if (!Number.isInteger(points) || points < 0) {
      throw new Error('Score must be a non-negative integer');
    }
    return Score.create(this._value + points);
  }

  /**
   * 等価性を判定
   *
   * @param other - 比較対象のScore
   * @returns 等しい場合true
   */
  equals(other: Score): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列表現を返す
   *
   * @returns 文字列表現
   */
  toString(): string {
    return `Score(${this._value})`;
  }
}
