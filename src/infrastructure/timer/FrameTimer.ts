/**
 * FrameTimer - ゲームループのタイミング制御
 *
 * @remarks
 * 指定されたFPSでコールバック関数を定期的に実行するタイマー
 */
export class FrameTimer {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private _isRunning: boolean = false;

  /**
   * タイマーを開始
   *
   * @param callback - 毎フレーム呼び出される関数
   * @param fps - フレームレート（デフォルト: 30）
   */
  start(callback: () => void, fps: number = 30): void {
    if (this._isRunning) {
      return;
    }

    const interval = 1000 / fps;

    this.intervalId = setInterval(() => {
      callback();
    }, interval);

    this._isRunning = true;
  }

  /**
   * タイマーを停止
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this._isRunning = false;
    }
  }

  /**
   * タイマーが実行中かどうかを取得
   */
  get isRunning(): boolean {
    return this._isRunning;
  }
}
