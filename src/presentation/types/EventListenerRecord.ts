/**
 * EventListenerRecord - イベントリスナーの登録記録
 *
 * @remarks
 * メモリリーク対策としてイベントリスナーの登録情報を保持
 * destroy時に確実にリスナーを解除するために使用
 */
export interface EventListenerRecord {
  /** イベントリスナーが登録されている要素 */
  element: HTMLElement;

  /** イベント名（'click', 'touchstart'等） */
  event: string;

  /** イベントハンドラ関数 */
  handler: EventListener;
}
