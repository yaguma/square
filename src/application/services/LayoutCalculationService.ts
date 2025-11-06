import { ViewportSize } from '@application/value-objects/ViewportSize';
import { BlockSize } from '@application/value-objects/BlockSize';
import { CanvasSize } from '@application/value-objects/CanvasSize';
import { FIELD_WIDTH, FIELD_HEIGHT } from '@domain/models/entities/Field';

/**
 * LayoutCalculationService - レイアウト計算サービス
 *
 * @remarks
 * 画面サイズに応じた最適なレイアウト計算のビジネスルールを提供します。
 *
 * DDD観点:
 * - Application層のサービスとして配置
 * - ブロックサイズの計算ルール（15-30px、20-40px）はビジネスルール
 * - UIから独立してテスト可能
 * - ブレークポイントやサイズ制約はドメイン知識
 *
 * 責務:
 * - ビューポートサイズからブロックサイズを計算
 * - ブロックサイズからCanvasサイズを計算
 * - タッチコントロールの表示判定
 */
export class LayoutCalculationService {
  /**
   * ビューポートサイズからブロックサイズを計算
   *
   * @param viewport - ビューポートサイズ
   * @returns 計算されたブロックサイズ
   *
   * @remarks
   * アルゴリズム:
   * 1. デバイスタイプ（モバイル/デスクトップ）を判定
   * 2. 最大Canvas幅を決定（モバイル: 画面幅の90%、デスクトップ: 最大400px）
   * 3. ブロックサイズ = 最大Canvas幅 / フィールド幅
   * 4. デバイスごとの制約内に収める（モバイル: 15-30px、デスクトップ: 20-40px）
   */
  calculateBlockSize(viewport: ViewportSize): BlockSize {
    const isMobile = viewport.isMobile();

    // モバイルは画面幅の90%、デスクトップは最大400pxまたは画面幅の40%
    const maxCanvasWidth = isMobile
      ? viewport.width * 0.9
      : Math.min(400, viewport.width * 0.4);

    // フィールド幅で割ってブロックサイズを計算
    const rawBlockSize = Math.floor(maxCanvasWidth / FIELD_WIDTH);

    // デバイスごとの制約を適用
    const minSize = isMobile ? BlockSize.mobileMinSize : BlockSize.desktopMinSize;
    const maxSize = isMobile ? BlockSize.mobileMaxSize : BlockSize.desktopMaxSize;

    const constrainedSize = Math.max(minSize, Math.min(maxSize, rawBlockSize));

    return BlockSize.create(constrainedSize);
  }

  /**
   * ブロックサイズからCanvas全体のサイズを計算
   *
   * @param blockSize - ブロックサイズ
   * @returns 計算されたCanvasサイズ
   *
   * @remarks
   * Canvas幅 = ブロックサイズ × フィールド幅
   * Canvas高さ = ブロックサイズ × フィールド高さ
   */
  calculateCanvasSize(blockSize: BlockSize): CanvasSize {
    const width = blockSize.size * FIELD_WIDTH;
    const height = blockSize.size * FIELD_HEIGHT;

    return CanvasSize.create(width, height);
  }

  /**
   * タッチコントロールを表示すべきか判定
   *
   * @param viewport - ビューポートサイズ
   * @returns モバイルサイズ（幅 < 768px）の場合true
   *
   * @remarks
   * ビジネスルール:
   * - モバイル（幅 < 768px）: タッチコントロールを表示
   * - デスクトップ（幅 >= 768px）: タッチコントロールを非表示
   */
  shouldShowTouchControls(viewport: ViewportSize): boolean {
    return viewport.isMobile();
  }

  /**
   * フィールド幅を取得（テスト用）
   */
  get fieldWidth(): number {
    return FIELD_WIDTH;
  }

  /**
   * フィールド高さを取得（テスト用）
   */
  get fieldHeight(): number {
    return FIELD_HEIGHT;
  }
}
