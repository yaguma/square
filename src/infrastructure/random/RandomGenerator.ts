/**
 * RandomGenerator - 乱数生成インターフェース
 *
 * @remarks
 * テスト時にモック化できるように、インターフェースとして定義
 */
export interface RandomGenerator {
  /**
   * 0以上max未満のランダムな整数を返す
   *
   * @param max - 最大値（この値は含まない）
   * @returns 0以上max未満の整数
   */
  nextInt(max: number): number;

  /**
   * 0以上1未満のランダムな浮動小数点数を返す
   *
   * @returns 0以上1未満の浮動小数点数
   */
  nextFloat(): number;
}

/**
 * DefaultRandomGenerator - Math.randomを使用した標準実装
 */
export class DefaultRandomGenerator implements RandomGenerator {
  nextInt(max: number): number {
    return Math.floor(Math.random() * max);
  }

  nextFloat(): number {
    return Math.random();
  }
}
