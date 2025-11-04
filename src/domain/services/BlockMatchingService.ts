import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Rectangle } from '@domain/models/value-objects/Rectangle';
import { Color } from '@domain/models/value-objects/Color';

/**
 * BlockMatchingService - 消去判定サービス
 *
 * @remarks
 * - Stateless（状態を持たない）
 * - Pure Function（副作用なし）
 */
export class BlockMatchingService {
  /**
   * フィールド内のすべての消去可能な矩形を検索
   *
   * @param field - 検索対象のフィールド
   * @returns 消去可能な矩形の配列（2x2以上）
   */
  findMatchingRectangles(field: Field): Rectangle[] {
    const rectangles: Rectangle[] = [];

    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        const position = Position.create(x, y);
        const block = field.getBlock(position);

        if (block === null) {
          continue;
        }

        // この位置を起点とする全ての矩形を検出
        const rectsAtPos = this.getAllRectanglesAt(position, field);
        rectangles.push(...rectsAtPos);
      }
    }

    // 重複を排除
    return this.removeDuplicates(rectangles);
  }

  /**
   * 指定位置を左上とするすべての矩形を検出
   *
   * @param position - 起点となる位置
   * @param field - フィールド
   * @returns 検出された矩形の配列
   * @private
   */
  private getAllRectanglesAt(position: Position, field: Field): Rectangle[] {
    const rectangles: Rectangle[] = [];
    const block = field.getBlock(position);

    if (block === null) {
      return rectangles;
    }

    const color = block.color;

    // 右方向に連続する同色ブロックの最大幅を計算
    let maxWidth = 1;
    while (maxWidth < field.width - position.x) {
      const checkPos = Position.create(position.x + maxWidth, position.y);
      const checkBlock = field.getBlock(checkPos);

      if (checkBlock === null || !checkBlock.color.equals(color)) {
        break;
      }
      maxWidth++;
    }

    // 各幅について、下方向の高さを計算
    for (let width = 2; width <= maxWidth; width++) {
      let height = 1;

      // 下方向に連続する同色の行を探す
      while (height < field.height - position.y) {
        let allMatch = true;

        // この行の全てのブロックが同色かチェック
        for (let dx = 0; dx < width; dx++) {
          const checkPos = Position.create(position.x + dx, position.y + height);
          const checkBlock = field.getBlock(checkPos);

          if (checkBlock === null || !checkBlock.color.equals(color)) {
            allMatch = false;
            break;
          }
        }

        if (!allMatch) {
          break;
        }

        height++;
      }

      // 2x2以上の矩形を登録
      if (height >= 2) {
        rectangles.push(Rectangle.create(position, width, height));
      }
    }

    return rectangles;
  }

  /**
   * 重複する矩形を排除
   *
   * @param rectangles - 矩形の配列
   * @returns 重複を排除した矩形の配列
   * @private
   */
  private removeDuplicates(rectangles: Rectangle[]): Rectangle[] {
    const unique: Rectangle[] = [];

    for (const rect of rectangles) {
      let isDuplicate = false;

      for (const existing of unique) {
        if (this.isContained(rect, existing)) {
          isDuplicate = true;
          break;
        }

        if (this.isContained(existing, rect)) {
          // 既存の矩形より大きい場合、置き換え
          const index = unique.indexOf(existing);
          unique.splice(index, 1);
          break;
        }
      }

      if (!isDuplicate) {
        unique.push(rect);
      }
    }

    return unique;
  }

  /**
   * 矩形innerがouterに完全に含まれているかを判定
   *
   * @param inner - 内側の矩形
   * @param outer - 外側の矩形
   * @returns 含まれている場合true
   * @private
   */
  private isContained(inner: Rectangle, outer: Rectangle): boolean {
    const innerPositions = inner.getPositions();
    const outerPositions = outer.getPositions();

    return innerPositions.every(pos =>
      outerPositions.some(outerPos => pos.equals(outerPos))
    );
  }

  /**
   * 指定された位置配列が、指定色の矩形を形成しているかを判定
   *
   * @param positions - 位置の配列
   * @param color - 期待される色
   * @param field - フィールド
   * @returns 矩形を形成している場合true
   */
  isRectangle(positions: Position[], color: Color, field: Field): boolean {
    for (const position of positions) {
      const block = field.getBlock(position);

      if (block === null || !block.color.equals(color)) {
        return false;
      }
    }

    return true;
  }
}
