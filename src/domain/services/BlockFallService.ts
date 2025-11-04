import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';

/**
 * BlockFallService - 自由落下サービス
 *
 * @remarks
 * - Stateless（状態を持たない）
 * - フィールドの状態を変更する（副作用あり）
 */
export class BlockFallService {
  /**
   * 重力を適用してブロックを落下させる
   *
   * @param field - 対象のフィールド
   * @returns ブロックが落下した場合true
   */
  applyGravity(field: Field): boolean {
    let hasAnyFall = false;

    // 各列を処理
    for (let x = 0; x < field.width; x++) {
      const hasFall = this.processColumnFall(x, field);
      if (hasFall) {
        hasAnyFall = true;
      }
    }

    return hasAnyFall;
  }

  /**
   * 指定列の指定位置から下方向で、ブロックが落下できる最下位置を取得
   *
   * @param column - 列番号
   * @param startY - 開始Y座標
   * @param field - フィールド
   * @returns 落下可能な最下のY座標
   */
  getLowestEmptyPosition(column: number, startY: number, field: Field): number {
    let lowestY = startY;

    // 下方向に空きを探す
    for (let y = startY + 1; y < field.height; y++) {
      const position = Position.create(column, y);

      if (!field.isEmpty(position)) {
        break;
      }

      lowestY = y;
    }

    return lowestY;
  }

  /**
   * 指定位置のブロックが落下可能かを判定
   *
   * @param position - 判定対象の位置
   * @param field - フィールド
   * @returns 落下可能な場合true
   */
  canFall(position: Position, field: Field): boolean {
    const block = field.getBlock(position);
    if (block === null) {
      return false;
    }

    // 最下行のブロックは落下不可
    if (position.y === field.height - 1) {
      return false;
    }

    // 下の位置が空きかチェック
    const below = Position.create(position.x, position.y + 1);
    return field.isEmpty(below);
  }

  /**
   * 指定列のブロックを落下させる
   *
   * @param column - 列番号
   * @param field - フィールド
   * @returns ブロックが落下した場合true
   * @private
   */
  private processColumnFall(column: number, field: Field): boolean {
    let hasFall = false;

    // 下から2行目から上に向かってスキャン
    for (let y = field.height - 2; y >= 0; y--) {
      const position = Position.create(column, y);
      const block = field.getBlock(position);

      if (block === null) {
        continue;
      }

      // このブロックが落下可能な最下位置を見つける
      const lowestY = this.getLowestEmptyPosition(column, y, field);

      if (lowestY > y) {
        // ブロックを移動
        field.removeBlock(position);
        field.placeBlock(Position.create(column, lowestY), block);
        hasFall = true;
      }
    }

    return hasFall;
  }
}
