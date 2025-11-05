import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';

/**
 * CollisionDetectionService - 衝突判定サービス
 *
 * @remarks
 * - Stateless（状態を持たない）
 * - Pure Function（副作用なし）
 */
export class CollisionDetectionService {
  /**
   * 指定位置にブロックパターンを配置できるかを判定
   *
   * @param position - 配置位置（左上）
   * @param blocks - 2x2のブロック配列
   * @param field - フィールド
   * @returns 配置可能な場合true
   */
  canPlaceBlock(
    position: Position,
    blocks: (Block | null)[][],
    field: Field
  ): boolean {
    if (this.isOutOfBounds(position, blocks, field.width, field.height)) {
      return false;
    }

    if (this.isColliding(position, blocks, field)) {
      return false;
    }

    return true;
  }

  /**
   * 他のブロックと衝突しているかを判定
   *
   * @param position - 配置位置（左上）
   * @param blocks - 2x2のブロック配列
   * @param field - フィールド
   * @returns 衝突している場合true
   */
  isColliding(
    position: Position,
    blocks: (Block | null)[][],
    field: Field
  ): boolean {
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x] !== null) {
          const absPos = Position.create(position.x + x, position.y + y);
          if (!field.isEmpty(absPos)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * フィールドの範囲外にはみ出しているかを判定
   *
   * @param position - 配置位置（左上）
   * @param blocks - 2x2のブロック配列
   * @param fieldWidth - フィールドの幅
   * @param fieldHeight - フィールドの高さ
   * @returns 範囲外の場合true
   */
  isOutOfBounds(
    position: Position,
    blocks: (Block | null)[][],
    fieldWidth: number,
    fieldHeight: number
  ): boolean {
    for (let y = 0; y < blocks.length; y++) {
      for (let x = 0; x < blocks[y].length; x++) {
        if (blocks[y][x] !== null) {
          const absX = position.x + x;
          const absY = position.y + y;

          if (absX < 0 || absX >= fieldWidth || absY < 0 || absY >= fieldHeight) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
