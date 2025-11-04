import { Block } from '@domain/models/value-objects/Block';
import { Position } from '@domain/models/value-objects/Position';

/**
 * フィールドの幅（横）
 */
export const FIELD_WIDTH = 8;

/**
 * フィールドの高さ（縦）
 */
export const FIELD_HEIGHT = 20;

/**
 * Field（ゲームフィールド）エンティティ
 *
 * ゲームフィールドの状態を管理するエンティティです。
 * 固定されたブロックの配置を保持し、ブロックの配置・削除・取得を提供します。
 *
 * @remarks
 * - フィールドのサイズは8x20固定
 * - グリッドの各要素はBlockまたはnull
 * - 無効な位置へのアクセスは許可されない
 */
export class Field {
  /**
   * Fieldインスタンスを生成するコンストラクタ
   *
   * @param _width - フィールドの幅
   * @param _height - フィールドの高さ
   * @param _grid - ブロック配置の2次元配列
   */
  private constructor(
    private readonly _width: number,
    private readonly _height: number,
    private _grid: (Block | null)[][]
  ) {}

  /**
   * Fieldインスタンスを生成するファクトリメソッド
   *
   * @param width - フィールドの幅（デフォルト: 8）
   * @param height - フィールドの高さ（デフォルト: 20）
   * @returns 空のフィールド
   *
   * @example
   * ```typescript
   * const field = Field.create();
   * ```
   */
  static create(width: number = FIELD_WIDTH, height: number = FIELD_HEIGHT): Field {
    const grid: (Block | null)[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = new Array(width).fill(null);
    }
    return new Field(width, height, grid);
  }

  /**
   * フィールドの幅を取得
   */
  get width(): number {
    return this._width;
  }

  /**
   * フィールドの高さを取得
   */
  get height(): number {
    return this._height;
  }

  /**
   * グリッドのコピーを取得
   *
   * @returns グリッドのコピー（不変性を保つため）
   */
  get grid(): (Block | null)[][] {
    return this._grid.map(row => [...row]);
  }

  /**
   * 指定位置にブロックを配置する
   *
   * @param position - 配置する座標
   * @param block - 配置するブロック
   * @throws 位置が無効な場合、またはブロックが既に存在する場合にエラー
   *
   * @example
   * ```typescript
   * field.placeBlock(Position.create(3, 5), Block.create(Color.BLUE));
   * ```
   */
  placeBlock(position: Position, block: Block): void {
    if (!this.isValidPosition(position)) {
      throw new Error(`Invalid position: ${position.toString()}`);
    }
    if (!this.isEmpty(position)) {
      throw new Error(`Position already occupied: ${position.toString()}`);
    }
    this._grid[position.y][position.x] = block;
  }

  /**
   * 指定位置のブロックを削除する
   *
   * @param position - 削除する座標
   * @throws 位置が無効な場合にエラー
   *
   * @example
   * ```typescript
   * field.removeBlock(Position.create(3, 5));
   * ```
   */
  removeBlock(position: Position): void {
    if (!this.isValidPosition(position)) {
      throw new Error(`Invalid position: ${position.toString()}`);
    }
    this._grid[position.y][position.x] = null;
  }

  /**
   * 指定位置のブロックを取得する
   *
   * @param position - 取得する座標
   * @returns ブロック、または存在しない場合null
   *
   * @example
   * ```typescript
   * const block = field.getBlock(Position.create(3, 5));
   * if (block !== null) {
   *   console.log(block.color);
   * }
   * ```
   */
  getBlock(position: Position): Block | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    return this._grid[position.y][position.x];
  }

  /**
   * 指定位置が空かどうかを判定
   *
   * @param position - 判定する座標
   * @returns 空の場合true
   *
   * @example
   * ```typescript
   * if (field.isEmpty(Position.create(3, 5))) {
   *   // ブロックを配置可能
   * }
   * ```
   */
  isEmpty(position: Position): boolean {
    return this.getBlock(position) === null;
  }

  /**
   * 指定位置がフィールド内かどうかを判定
   *
   * @param position - 判定する座標
   * @returns フィールド内の場合true
   *
   * @example
   * ```typescript
   * if (field.isValidPosition(Position.create(3, 5))) {
   *   // 有効な位置
   * }
   * ```
   */
  isValidPosition(position: Position): boolean {
    return position.isValid(this._width, this._height);
  }

  /**
   * フィールドをクリアし、全てのブロックを削除
   *
   * @example
   * ```typescript
   * field.clear();
   * ```
   */
  clear(): void {
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        this._grid[y][x] = null;
      }
    }
  }

  /**
   * 最上段（Y座標0）にブロックが存在するかを判定
   *
   * @returns 存在する場合true
   *
   * @remarks
   * ゲームオーバー判定に使用されます
   *
   * @example
   * ```typescript
   * if (field.hasBlockInTopRow()) {
   *   // ゲームオーバー
   * }
   * ```
   */
  hasBlockInTopRow(): boolean {
    for (let x = 0; x < this._width; x++) {
      if (this._grid[0][x] !== null) {
        return true;
      }
    }
    return false;
  }

  /**
   * フィールドのクローンを作成
   *
   * @returns 新しいFieldインスタンス
   */
  clone(): Field {
    const newField = Field.create(this._width, this._height);
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        if (this._grid[y][x] !== null) {
          newField.placeBlock(
            Position.create(x, y),
            this._grid[y][x]!
          );
        }
      }
    }
    return newField;
  }
}
