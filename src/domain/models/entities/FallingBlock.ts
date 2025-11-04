import { BlockPattern, Rotation } from '@domain/models/value-objects/BlockPattern';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Field } from './Field';

/**
 * Direction - 移動方向
 */
export type Direction = 'left' | 'right' | 'down';

/**
 * RotationDirection - 回転方向
 */
export type RotationDirection = 'clockwise' | 'counterclockwise';

/**
 * BlockWithPosition - ブロックと座標のペア
 */
export interface BlockWithPosition {
  block: Block;
  position: Position;
}

/**
 * FallingBlock（落下ブロック）エンティティ
 *
 * 現在落下中のブロックの状態を管理するエンティティです。
 * ブロックの移動、回転、配置可否判定などを提供します。
 *
 * @remarks
 * - パターンは常に有効なBlockPattern
 * - 回転は常に0, 90, 180, 270度のいずれか
 * - 位置は常に有効なPosition
 */
export class FallingBlock {
  /**
   * FallingBlockインスタンスを生成するコンストラクタ
   *
   * @param _pattern - ブロックパターン
   * @param _position - 現在位置（左上の座標）
   * @param _rotation - 回転状態（0, 90, 180, 270度）
   */
  private constructor(
    private readonly _pattern: BlockPattern,
    private _position: Position,
    private _rotation: Rotation
  ) {}

  /**
   * FallingBlockインスタンスを生成するファクトリメソッド
   *
   * @param pattern - ブロックパターン
   * @param position - 初期位置（省略時はフィールド中央上部）
   * @returns FallingBlock
   *
   * @example
   * ```typescript
   * const fallingBlock = FallingBlock.create(
   *   pattern,
   *   Position.create(3, 0)
   * );
   * ```
   */
  static create(pattern: BlockPattern, position?: Position): FallingBlock {
    const defaultPosition = Position.create(3, 0); // フィールド中央上部
    return new FallingBlock(pattern, position || defaultPosition, 0);
  }

  /**
   * ブロックパターンを取得
   */
  get pattern(): BlockPattern {
    return this._pattern;
  }

  /**
   * 現在位置を取得
   */
  get position(): Position {
    return this._position;
  }

  /**
   * 回転状態を取得
   */
  get rotation(): Rotation {
    return this._rotation;
  }

  /**
   * ブロックを左に1マス移動
   *
   * @example
   * ```typescript
   * if (fallingBlock.canMove('left', field)) {
   *   fallingBlock.moveLeft();
   * }
   * ```
   */
  moveLeft(): void {
    this._position = Position.create(this._position.x - 1, this._position.y);
  }

  /**
   * ブロックを右に1マス移動
   */
  moveRight(): void {
    this._position = Position.create(this._position.x + 1, this._position.y);
  }

  /**
   * ブロックを下に1マス移動
   */
  moveDown(): void {
    this._position = Position.create(this._position.x, this._position.y + 1);
  }

  /**
   * ブロックを時計回りに90度回転
   *
   * @example
   * ```typescript
   * if (fallingBlock.canRotate('clockwise', field)) {
   *   fallingBlock.rotateClockwise();
   * }
   * ```
   */
  rotateClockwise(): void {
    this._rotation = ((this._rotation + 90) % 360) as Rotation;
  }

  /**
   * ブロックを反時計回りに90度回転
   */
  rotateCounterClockwise(): void {
    this._rotation = ((this._rotation - 90 + 360) % 360) as Rotation;
  }

  /**
   * 指定方向に移動可能かを判定
   *
   * @param direction - 移動方向（'left', 'right', 'down'）
   * @param field - ゲームフィールド
   * @returns 移動可能な場合true
   *
   * @remarks
   * 判定条件:
   * - フィールドの範囲内
   * - 移動先にブロックがない
   *
   * @example
   * ```typescript
   * if (fallingBlock.canMove('down', field)) {
   *   fallingBlock.moveDown();
   * } else {
   *   // 接地
   * }
   * ```
   */
  canMove(direction: Direction, field: Field): boolean {
    let newX: number;
    let newY: number;

    switch (direction) {
      case 'left':
        newX = this._position.x - 1;
        newY = this._position.y;
        break;
      case 'right':
        newX = this._position.x + 1;
        newY = this._position.y;
        break;
      case 'down':
        newX = this._position.x;
        newY = this._position.y + 1;
        break;
    }

    // 負の座標になる場合はfalseを返す
    if (newX < 0 || newY < 0) {
      return false;
    }

    const newPosition = Position.create(newX, newY);
    return this.canPlaceAt(newPosition, this._rotation, field);
  }

  /**
   * 指定方向に回転可能かを判定
   *
   * @param direction - 回転方向（'clockwise', 'counterclockwise'）
   * @param field - ゲームフィールド
   * @returns 回転可能な場合true
   *
   * @remarks
   * 判定条件:
   * - 回転後の位置がフィールドの範囲内
   * - 回転後の位置にブロックがない
   */
  canRotate(direction: RotationDirection, field: Field): boolean {
    let newRotation: Rotation;

    if (direction === 'clockwise') {
      newRotation = ((this._rotation + 90) % 360) as Rotation;
    } else {
      newRotation = ((this._rotation - 90 + 360) % 360) as Rotation;
    }

    return this.canPlaceAt(this._position, newRotation, field);
  }

  /**
   * 指定位置・回転でブロックを配置可能かを判定（内部メソッド）
   *
   * @param position - 配置位置
   * @param rotation - 回転角度
   * @param field - ゲームフィールド
   * @returns 配置可能な場合true
   */
  private canPlaceAt(position: Position, rotation: Rotation, field: Field): boolean {
    const rotatedBlocks = this._pattern.rotate(rotation);

    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const block = rotatedBlocks[y][x];
        if (block !== null) {
          const absPos = Position.create(position.x + x, position.y + y);

          if (!field.isValidPosition(absPos)) {
            return false;
          }

          if (!field.isEmpty(absPos)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * 落下ブロックを構成する各ブロックの絶対座標を取得
   *
   * @returns ブロックと座標のペアの配列
   *
   * @remarks
   * 描画、衝突判定に使用されます
   *
   * @example
   * ```typescript
   * const blocks = fallingBlock.getBlocks();
   * blocks.forEach(({ block, position }) => {
   *   field.placeBlock(position, block);
   * });
   * ```
   */
  getBlocks(): BlockWithPosition[] {
    const blocks: BlockWithPosition[] = [];
    const rotatedBlocks = this._pattern.rotate(this._rotation);

    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const block = rotatedBlocks[y][x];
        if (block !== null) {
          blocks.push({
            block: block,
            position: Position.create(this._position.x + x, this._position.y + y)
          });
        }
      }
    }

    return blocks;
  }

  /**
   * 位置を設定
   *
   * @param position - 新しい位置
   */
  setPosition(position: Position): void {
    this._position = position;
  }

  /**
   * 回転を設定
   *
   * @param rotation - 新しい回転角度
   */
  setRotation(rotation: Rotation): void {
    this._rotation = rotation;
  }
}
