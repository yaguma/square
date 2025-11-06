import { GameDto } from '@application/dto/GameDto';

const BACKGROUND_COLOR = '#2c3e50';
const GRID_COLOR = '#34495e';

/**
 * CanvasRenderer
 *
 * ゲームフィールドとブロックの描画を担当するクラス
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private blockSize: number;

  /**
   * コンストラクタ
   * @param canvas - 描画対象のHTMLCanvasElement
   * @param blockSize - 1ブロックのサイズ（ピクセル）
   */
  constructor(
    private canvas: HTMLCanvasElement,
    blockSize: number = 30
  ) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    this.ctx = ctx;
    this.blockSize = blockSize;

    // キャンバスサイズを設定（8x20マス）
    // Phase 2以降は外部から設定することも可能
    this.resizeCanvas();
  }

  /**
   * ブロックサイズを更新してCanvasをリサイズ
   *
   * @param newBlockSize - 新しいブロックサイズ
   */
  updateBlockSize(newBlockSize: number): void {
    if (newBlockSize <= 0) {
      console.warn('Invalid block size, ignoring update');
      return;
    }

    this.blockSize = newBlockSize;
    this.resizeCanvas();
  }

  /**
   * 現在のブロックサイズを取得
   *
   * @returns 現在のブロックサイズ
   */
  getBlockSize(): number {
    return this.blockSize;
  }

  /**
   * Canvasのサイズを現在のblockSizeで再計算
   */
  private resizeCanvas(): void {
    this.canvas.width = this.blockSize * 8;
    this.canvas.height = this.blockSize * 20;
  }

  /**
   * ゲーム状態を描画
   * @param gameDto - ゲームの状態
   */
  render(gameDto: GameDto): void {
    this.clear();
    this.drawGrid();
    this.drawField(gameDto.field);

    if (gameDto.fallingBlock) {
      this.drawFallingBlock(gameDto.fallingBlock);
    }

    // ゲームオーバー時のオーバーレイ
    if (gameDto.state === 'gameOver') {
      this.drawGameOverOverlay();
    }

    // 一時停止時のオーバーレイ
    if (gameDto.state === 'paused') {
      this.drawPausedOverlay();
    }
  }

  /**
   * キャンバスをクリア
   */
  private clear(): void {
    this.ctx.fillStyle = BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * グリッド線を描画
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = GRID_COLOR;
    this.ctx.lineWidth = 1;

    // 縦線
    for (let x = 0; x <= 8; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.blockSize, 0);
      this.ctx.lineTo(x * this.blockSize, this.canvas.height);
      this.ctx.stroke();
    }

    // 横線
    for (let y = 0; y <= 20; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.blockSize);
      this.ctx.lineTo(this.canvas.width, y * this.blockSize);
      this.ctx.stroke();
    }
  }

  /**
   * フィールドのブロックを描画
   * @param field - フィールドの状態
   */
  private drawField(field: (string | null)[][]): void {
    for (let y = 0; y < field.length; y++) {
      for (let x = 0; x < field[y].length; x++) {
        const colorType = field[y][x];

        if (colorType) {
          this.drawBlock(x, y, this.getColorHex(colorType));
        }
      }
    }
  }

  /**
   * 落下ブロックを描画
   * @param fallingBlock - 落下中のブロック情報
   */
  private drawFallingBlock(fallingBlock: {
    pattern: string[][];
    position: { x: number; y: number };
    rotation: number;
  }): void {
    const { pattern, position } = fallingBlock;

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        const colorType = pattern[y][x];

        if (colorType && colorType !== 'empty') {
          const absX = position.x + x;
          const absY = position.y + y;

          this.drawBlock(absX, absY, this.getColorHex(colorType));
        }
      }
    }
  }

  /**
   * 単一のブロックを描画
   * @param x - X座標（マス目）
   * @param y - Y座標（マス目）
   * @param color - ブロックの色
   */
  private drawBlock(x: number, y: number, color: string): void {
    const pixelX = x * this.blockSize;
    const pixelY = y * this.blockSize;

    // ブロックの塗りつぶし
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      pixelX + 1,
      pixelY + 1,
      this.blockSize - 2,
      this.blockSize - 2
    );

    // ブロックの枠線（立体感）
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      pixelX + 1,
      pixelY + 1,
      this.blockSize - 2,
      this.blockSize - 2
    );

    // ハイライト
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(
      pixelX + 2,
      pixelY + 2,
      this.blockSize - 4,
      (this.blockSize - 4) / 3
    );
  }

  /**
   * ゲームオーバーのオーバーレイを描画
   */
  private drawGameOverOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'GAME OVER',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  /**
   * 一時停止のオーバーレイを描画
   */
  private drawPausedOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'PAUSED',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
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
