import { Field } from '@domain/models/entities/Field';
import { Rectangle } from '@domain/models/value-objects/Rectangle';
import { BlockMatchingService } from '@domain/services/BlockMatchingService';
import { BlockFallService } from '@domain/services/BlockFallService';

/**
 * BlockRemovalService - ブロック削除サービス
 *
 * @remarks
 * - BlockMatchingServiceとBlockFallServiceに依存
 * - フィールドの状態を変更する（副作用あり）
 */
export class BlockRemovalService {
  /**
   * コンストラクタ
   *
   * @param blockFallService - 自由落下サービス
   * @param blockMatchingService - 消去判定サービス
   */
  constructor(
    private readonly blockFallService: BlockFallService,
    private readonly blockMatchingService: BlockMatchingService
  ) {}

  /**
   * 指定された矩形のブロックを削除し、削除マス数を返す
   *
   * @param rectangles - 削除する矩形の配列
   * @param field - フィールド
   * @returns 削除したマス数
   */
  removeBlocks(rectangles: Rectangle[], field: Field): number {
    let totalRemoved = 0;

    for (const rectangle of rectangles) {
      this.removeRectangle(rectangle, field);
      totalRemoved += rectangle.area();
    }

    return totalRemoved;
  }

  /**
   * 連鎖も含めた削除処理を実行し、総削除マス数を返す
   *
   * @param field - フィールド
   * @returns 総削除マス数
   */
  processRemovalChain(field: Field): number {
    let totalRemoved = 0;
    let chainCount = 0;

    while (true) {
      // 消去可能な矩形を検索
      const rectangles = this.blockMatchingService.findMatchingRectangles(field);

      if (rectangles.length === 0) {
        break;
      }

      // ブロックを削除
      const removed = this.removeBlocks(rectangles, field);
      totalRemoved += removed;
      chainCount++;

      // 自由落下を適用
      while (this.blockFallService.applyGravity(field)) {
        // 落下が完了するまで繰り返し
      }
    }

    return totalRemoved;
  }

  /**
   * 指定矩形のブロックを削除
   *
   * @param rectangle - 削除する矩形
   * @param field - フィールド
   * @private
   */
  private removeRectangle(rectangle: Rectangle, field: Field): void {
    const positions = rectangle.getPositions();

    for (const position of positions) {
      field.removeBlock(position);
    }
  }
}
