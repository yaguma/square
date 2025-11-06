/**
 * ViewportSize - ビューポートサイズを表す値オブジェクト
 *
 * @remarks
 * ブラウザの表示領域（ビューポート）のサイズを表現します。
 *
 * DDD観点:
 * - 不変（Immutable）
 * - 等価性は値で判定
 * - デバイスタイプの判定ロジックをカプセル化
 * - ブレークポイント（768px）による判定を提供
 *
 * 制約:
 * - width, heightは0以上の整数
 * - ブレークポイント: 768px（モバイル/デスクトップの境界）
 */
export class ViewportSize {
  /**
   * モバイル/デスクトップを判定するブレークポイント（ピクセル）
   */
  private static readonly MOBILE_BREAKPOINT = 768;

  private constructor(
    private readonly _width: number,
    private readonly _height: number
  ) {}

  /**
   * ViewportSizeインスタンスを生成
   *
   * @param width - ビューポート幅（ピクセル、0以上の整数）
   * @param height - ビューポート高さ（ピクセル、0以上の整数）
   * @returns ViewportSize
   * @throws width, heightが整数でない場合、または負の値の場合
   */
  static create(width: number, height: number): ViewportSize {
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      throw new Error('ViewportSize dimensions must be integers');
    }
    if (width < 0 || height < 0) {
      throw new Error('ViewportSize dimensions must be non-negative');
    }
    return new ViewportSize(width, height);
  }

  /**
   * ビューポート幅を取得
   */
  get width(): number {
    return this._width;
  }

  /**
   * ビューポート高さを取得
   */
  get height(): number {
    return this._height;
  }

  /**
   * モバイルサイズかを判定
   *
   * @returns 幅が768px未満の場合true
   */
  isMobile(): boolean {
    return this._width < ViewportSize.MOBILE_BREAKPOINT;
  }

  /**
   * デスクトップサイズかを判定
   *
   * @returns 幅が768px以上の場合true
   */
  isDesktop(): boolean {
    return this._width >= ViewportSize.MOBILE_BREAKPOINT;
  }

  /**
   * 等価性を判定
   *
   * @param other - 比較対象のViewportSize
   * @returns 等しい場合true
   */
  equals(other: ViewportSize): boolean {
    return this._width === other._width && this._height === other._height;
  }

  /**
   * 文字列表現を返す
   *
   * @returns 文字列表現
   */
  toString(): string {
    const deviceType = this.isMobile() ? 'Mobile' : 'Desktop';
    return `ViewportSize(${this._width}x${this._height}, ${deviceType})`;
  }
}
