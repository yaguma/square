import { CanvasSize } from './CanvasSize';

/**
 * BlockSize - 1ブロック分のピクセル数を表す値オブジェクト
 *
 * @remarks
 * ゲームフィールドの1ブロック（1マス）のピクセル数を表現します。
 * デバイスタイプに応じて適切なサイズ範囲を持ちます。
 *
 * DDD観点:
 * - 不変（Immutable）
 * - 等価性は値で判定
 * - ブロックサイズからCanvasサイズへの変換をカプセル化
 * - デバイスごとの有効範囲を制約として定義
 *
 * 制約:
 * - デスクトップ: 20px〜40px
 * - モバイル: 15px〜30px
 * - 全般の最小: 15px、最大: 40px
 */
export class BlockSize {
  /**
   * ブロックサイズの絶対最小値（ピクセル）
   */
  private static readonly ABSOLUTE_MIN_SIZE = 15;

  /**
   * ブロックサイズの絶対最大値（ピクセル）
   */
  private static readonly ABSOLUTE_MAX_SIZE = 40;

  /**
   * モバイル用の最小ブロックサイズ（ピクセル）
   */
  private static readonly MOBILE_MIN_SIZE = 15;

  /**
   * モバイル用の最大ブロックサイズ（ピクセル）
   */
  private static readonly MOBILE_MAX_SIZE = 30;

  /**
   * デスクトップ用の最小ブロックサイズ（ピクセル）
   */
  private static readonly DESKTOP_MIN_SIZE = 20;

  /**
   * デスクトップ用の最大ブロックサイズ（ピクセル）
   */
  private static readonly DESKTOP_MAX_SIZE = 40;

  private constructor(private readonly _size: number) {}

  /**
   * BlockSizeインスタンスを生成
   *
   * @param size - ブロックサイズ（ピクセル、15〜40の整数）
   * @returns BlockSize
   * @throws sizeが整数でない場合、または有効範囲外の場合
   */
  static create(size: number): BlockSize {
    if (!Number.isInteger(size)) {
      throw new Error('BlockSize must be an integer');
    }
    if (size < BlockSize.ABSOLUTE_MIN_SIZE || size > BlockSize.ABSOLUTE_MAX_SIZE) {
      throw new Error(
        `BlockSize must be between ${BlockSize.ABSOLUTE_MIN_SIZE} and ${BlockSize.ABSOLUTE_MAX_SIZE} pixels`
      );
    }
    return new BlockSize(size);
  }

  /**
   * ブロックサイズ（ピクセル）を取得
   */
  get size(): number {
    return this._size;
  }

  /**
   * Canvas全体のサイズを計算
   *
   * @param fieldWidth - フィールドの幅（ブロック数）
   * @param fieldHeight - フィールドの高さ（ブロック数）
   * @returns CanvasSize
   */
  toCanvasSize(fieldWidth: number, fieldHeight: number): CanvasSize {
    const width = this._size * fieldWidth;
    const height = this._size * fieldHeight;
    return CanvasSize.create(width, height);
  }

  /**
   * 有効な範囲内かを判定
   *
   * @returns 絶対最小値〜絶対最大値の範囲内の場合true
   */
  isValid(): boolean {
    return (
      this._size >= BlockSize.ABSOLUTE_MIN_SIZE &&
      this._size <= BlockSize.ABSOLUTE_MAX_SIZE
    );
  }

  /**
   * モバイル用の有効な範囲内かを判定
   *
   * @returns モバイルの推奨範囲（15〜30px）内の場合true
   */
  isValidForMobile(): boolean {
    return (
      this._size >= BlockSize.MOBILE_MIN_SIZE &&
      this._size <= BlockSize.MOBILE_MAX_SIZE
    );
  }

  /**
   * デスクトップ用の有効な範囲内かを判定
   *
   * @returns デスクトップの推奨範囲（20〜40px）内の場合true
   */
  isValidForDesktop(): boolean {
    return (
      this._size >= BlockSize.DESKTOP_MIN_SIZE &&
      this._size <= BlockSize.DESKTOP_MAX_SIZE
    );
  }

  /**
   * 等価性を判定
   *
   * @param other - 比較対象のBlockSize
   * @returns 等しい場合true
   */
  equals(other: BlockSize): boolean {
    return this._size === other._size;
  }

  /**
   * 文字列表現を返す
   *
   * @returns 文字列表現
   */
  toString(): string {
    return `BlockSize(${this._size}px)`;
  }

  /**
   * モバイル用の最小ブロックサイズを取得
   */
  static get mobileMinSize(): number {
    return BlockSize.MOBILE_MIN_SIZE;
  }

  /**
   * モバイル用の最大ブロックサイズを取得
   */
  static get mobileMaxSize(): number {
    return BlockSize.MOBILE_MAX_SIZE;
  }

  /**
   * デスクトップ用の最小ブロックサイズを取得
   */
  static get desktopMinSize(): number {
    return BlockSize.DESKTOP_MIN_SIZE;
  }

  /**
   * デスクトップ用の最大ブロックサイズを取得
   */
  static get desktopMaxSize(): number {
    return BlockSize.DESKTOP_MAX_SIZE;
  }
}
