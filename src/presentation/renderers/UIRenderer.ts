import { GameDto } from '@application/dto/GameDto';

const BACKGROUND_COLOR = '#2c3e50';

/**
 * UIRenderer
 *
 * スコア表示とネクストブロック表示を担当するクラス
 */
export class UIRenderer {
  private scoreElement: HTMLElement;
  private nextCanvas: HTMLCanvasElement;
  private nextCtx: CanvasRenderingContext2D;
  private gameOverElement: HTMLElement;

  /**
   * コンストラクタ
   * 必要なDOM要素を取得して保持する
   */
  constructor() {
    const scoreElement = document.getElementById('score');
    const nextCanvas = document.getElementById('next-canvas') as HTMLCanvasElement;
    const gameOverElement = document.getElementById('game-over');

    if (!scoreElement) {
      throw new Error('Score element not found');
    }

    if (!nextCanvas) {
      throw new Error('Next canvas element not found');
    }

    if (!gameOverElement) {
      throw new Error('Game over element not found');
    }

    const nextCtx = nextCanvas.getContext('2d');

    if (!nextCtx) {
      throw new Error('Failed to get next canvas context');
    }

    this.scoreElement = scoreElement;
    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCtx;
    this.gameOverElement = gameOverElement;
  }

  /**
   * UI要素を更新
   * @param gameDto - ゲームの状態
   */
  render(gameDto: GameDto): void {
    this.updateScore(gameDto.score);
    this.drawNextBlock(gameDto.nextBlock);
    this.showGameOver(gameDto.state === 'gameOver');
  }

  /**
   * スコアを更新
   * @param score - 現在のスコア
   */
  private updateScore(score: number): void {
    this.scoreElement.textContent = score.toString();
  }

  /**
   * ネクストブロックを描画
   * @param pattern - ネクストブロックのパターン
   */
  private drawNextBlock(pattern: string[][]): void {
    const blockSize = 30;

    // クリア
    this.nextCtx.fillStyle = BACKGROUND_COLOR;
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    // パターンを中央に描画
    const offsetX = (this.nextCanvas.width - blockSize * 2) / 2;
    const offsetY = (this.nextCanvas.height - blockSize * 2) / 2;

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorType = pattern[y][x];

        if (colorType && colorType !== 'empty') {
          const pixelX = offsetX + x * blockSize;
          const pixelY = offsetY + y * blockSize;

          this.nextCtx.fillStyle = this.getColorHex(colorType);
          this.nextCtx.fillRect(
            pixelX + 1,
            pixelY + 1,
            blockSize - 2,
            blockSize - 2
          );

          // ブロックの枠線
          this.nextCtx.strokeStyle = '#000';
          this.nextCtx.lineWidth = 1;
          this.nextCtx.strokeRect(
            pixelX + 1,
            pixelY + 1,
            blockSize - 2,
            blockSize - 2
          );

          // ハイライト
          this.nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          this.nextCtx.fillRect(
            pixelX + 2,
            pixelY + 2,
            blockSize - 4,
            (blockSize - 4) / 3
          );
        }
      }
    }
  }

  /**
   * ゲームオーバー表示の切り替え
   * @param show - 表示するかどうか
   */
  private showGameOver(show: boolean): void {
    if (show) {
      this.gameOverElement.classList.remove('hidden');
    } else {
      this.gameOverElement.classList.add('hidden');
    }
  }

  /**
   * 色文字列をHEXコードに変換
   * @param colorType - 色のタイプ（'blue', 'red', 'yellow'）
   * @returns HEXカラーコード
   */
  private getColorHex(colorType: string): string {
    const colors: { [key: string]: string } = {
      blue: '#3498db',
      red: '#e74c3c',
      yellow: '#f1c40f'
    };

    return colors[colorType] || '#000';
  }
}
