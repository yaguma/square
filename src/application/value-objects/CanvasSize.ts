/**
 * CanvasSize - Canvas要素のサイズを表す値オブジェクト
 *
 * @remarks
 * HTML CanvasElementの幅と高さをピクセル単位で表現します。
 *
 * DDD観点:
 * - 不変（Immutable）
 * - 等価性は値で判定
 * - Canvasサイズの制約をカプセル化
 *
 * 制約:
 * - 最小: 200x500px（最小限のプレイ可能サイズ）
 * - 最大: 400x1000px（画面占有を考慮した最大サイズ）
 * - width, heightは正の整数
 */
export class CanvasSize {
  /**
   * Canvas幅の最小値（ピクセル）
   */
  private static readonly MIN_WIDTH = 200;

  /**
   * Canvas幅の最大値（ピクセル）
   */
  private static readonly MAX_WIDTH = 400;

  /**
   * Canvas高さの最小値（ピクセル）
   */
  private static readonly MIN_HEIGHT = 500;

  /**
   * Canvas高さの最大値（ピクセル）
   */
  private static readonly MAX_HEIGHT = 1000;

  private constructor(
    private readonly _width: number,
    private readonly _height: number
  ) {}

  /**
   * CanvasSizeインスタンスを生成
   *
   * @param width - Canvas幅（ピクセル、200〜400の整数）
   * @param height - Canvas高さ（ピクセル、500〜1000の整数）
   * @returns CanvasSize
   * @throws width, heightが整数でない場合、または有効範囲外の場合
   */
  static create(width: number, height: number): CanvasSize {
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      throw new Error('CanvasSize dimensions must be integers');
    }
    if (width < CanvasSize.MIN_WIDTH || width > CanvasSize.MAX_WIDTH) {
      throw new Error(
        `CanvasSize width must be between ${CanvasSize.MIN_WIDTH} and ${CanvasSize.MAX_WIDTH} pixels`
      );
    }
    if (height < CanvasSize.MIN_HEIGHT || height > CanvasSize.MAX_HEIGHT) {
      throw new Error(
        `CanvasSize height must be between ${CanvasSize.MIN_HEIGHT} and ${CanvasSize.MAX_HEIGHT} pixels`
      );
    }
    return new CanvasSize(width, height);
  }

  /**
   * Canvas幅を取得
   */
  get width(): number {
    return this._width;
  }

  /**
   * Canvas高さを取得
   */
  get height(): number {
    return this._height;
  }

  /**
   * 有効な範囲内かを判定
   *
   * @returns 制約を満たす場合true
   */
  isValid(): boolean {
    return (
      this._width >= CanvasSize.MIN_WIDTH &&
      this._width <= CanvasSize.MAX_WIDTH &&
      this._height >= CanvasSize.MIN_HEIGHT &&
      this._height <= CanvasSize.MAX_HEIGHT
    );
  }

  /**
   * 等価性を判定
   *
   * @param other - 比較対象のCanvasSize
   * @returns 等しい場合true
   */
  equals(other: CanvasSize): boolean {
    return this._width === other._width && this._height === other._height;
  }

  /**
   * アスペクト比を計算
   *
   * @returns アスペクト比（幅/高さ）
   */
  getAspectRatio(): number {
    return this._width / this._height;
  }

  /**
   * 文字列表現を返す
   *
   * @returns 文字列表現
   */
  toString(): string {
    return `CanvasSize(${this._width}x${this._height}px)`;
  }

  /**
   * 最小Canvas幅を取得
   */
  static get minWidth(): number {
    return CanvasSize.MIN_WIDTH;
  }

  /**
   * 最大Canvas幅を取得
   */
  static get maxWidth(): number {
    return CanvasSize.MAX_WIDTH;
  }

  /**
   * 最小Canvas高さを取得
   */
  static get minHeight(): number {
    return CanvasSize.MIN_HEIGHT;
  }

  /**
   * 最大Canvas高さを取得
   */
  static get maxHeight(): number {
    return CanvasSize.MAX_HEIGHT;
  }
}
