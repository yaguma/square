import { InputHandlerService } from '@application/services/InputHandlerService';
import { InputCommand } from '@application/value-objects/InputCommand';
import { EventListenerRecord } from '@presentation/types/EventListenerRecord';

/**
 * TouchControlRenderer - タッチコントロールUIのレンダラー
 *
 * @remarks
 * タッチ操作用のUIコントロールを生成し、イベント処理を行う
 * メモリリーク対策としてイベントリスナーを自動管理
 */
export class TouchControlRenderer {
  private container: HTMLElement;
  private buttons: Map<string, HTMLButtonElement>;
  private eventListeners: EventListenerRecord[];

  /**
   * コンストラクタ
   *
   * @param containerElement - コントロールを配置する親要素
   * @param inputHandlerService - 入力処理サービス
   * @param gameId - ゲームID
   * @throws {Error} containerElementがnullの場合
   */
  constructor(
    containerElement: HTMLElement | null,
    private inputHandlerService: InputHandlerService,
    private gameId: string
  ) {
    if (!containerElement) {
      throw new Error('TouchControlRenderer: containerElement is required');
    }

    this.container = containerElement;
    this.buttons = new Map<string, HTMLButtonElement>();
    this.eventListeners = [];
  }

  /**
   * タッチコントロールUIを生成してDOMに追加
   *
   * @remarks
   * UIの構造:
   * - 回転ボタン（左上）
   * - 方向ボタン（中央）
   * - 即落下ボタン（右下）
   */
  render(): void {
    try {
      // コンテナをクリア
      this.container.innerHTML = '';
      this.buttons.clear();

      // タッチコントロールのルート要素を作成
      const touchControls = this.createTouchControlsElement();

      // コンテナに追加
      this.container.appendChild(touchControls);

      // イベントリスナーを設定
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to render touch controls:', error);
      throw error;
    }
  }

  /**
   * タッチコントロールのDOM構造を作成
   *
   * @returns タッチコントロールのルート要素
   */
  private createTouchControlsElement(): HTMLElement {
    const touchControls = document.createElement('div');
    touchControls.className = 'touch-controls';
    touchControls.setAttribute('data-testid', 'touch-controls');

    // 回転ボタン
    const rotationButtons = this.createRotationButtons();
    touchControls.appendChild(rotationButtons);

    // 方向ボタン
    const directionButtons = this.createDirectionButtons();
    touchControls.appendChild(directionButtons);

    // 即落下ボタン
    const dropButton = this.createDropButton();
    touchControls.appendChild(dropButton);

    return touchControls;
  }

  /**
   * 回転ボタンを作成
   *
   * @returns 回転ボタンのコンテナ
   */
  private createRotationButtons(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'rotation-buttons';

    // 反時計回りボタン
    const ccwButton = this.createButton('rotate-ccw', '↺', 'rotation-ccw-btn');
    container.appendChild(ccwButton);

    // 時計回りボタン
    const cwButton = this.createButton('rotate-cw', '↻', 'rotation-cw-btn');
    container.appendChild(cwButton);

    return container;
  }

  /**
   * 方向ボタンを作成
   *
   * @returns 方向ボタンのコンテナ
   */
  private createDirectionButtons(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'direction-buttons';

    // 左ボタン
    const leftButton = this.createButton('left', '←', 'direction-left-btn');
    container.appendChild(leftButton);

    // 下ボタン
    const downButton = this.createButton('down', '↓', 'direction-down-btn');
    container.appendChild(downButton);

    // 右ボタン
    const rightButton = this.createButton('right', '→', 'direction-right-btn');
    container.appendChild(rightButton);

    return container;
  }

  /**
   * 即落下ボタンを作成
   *
   * @returns 即落下ボタンのコンテナ
   */
  private createDropButton(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'drop-button';

    const button = this.createButton('instant-drop', '▼ 即落下', 'drop-btn');
    container.appendChild(button);

    return container;
  }

  /**
   * ボタン要素を作成
   *
   * @param action - data-action属性の値
   * @param label - ボタンのラベル
   * @param testId - data-testid属性の値
   * @returns ボタン要素
   */
  private createButton(action: string, label: string, testId: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'touch-btn';
    button.setAttribute('data-action', action);
    button.setAttribute('data-testid', testId);
    button.textContent = label;
    button.type = 'button';

    // ボタンをマップに保存
    this.buttons.set(action, button);

    return button;
  }

  /**
   * 各ボタンにタッチイベントリスナーを設定
   *
   * @remarks
   * メモリリーク対策としてリスナーを記録
   */
  private setupEventListeners(): void {
    this.buttons.forEach((button, action) => {
      // touchstart: タッチ開始時
      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault(); // スクロール防止
        try {
          button.classList.add('active'); // 視覚フィードバック
          this.handleTouchInput(action);
        } catch (error) {
          console.error(`Touch start error for ${action}:`, error);
        }
      };

      // touchend: タッチ終了時
      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        button.classList.remove('active'); // 視覚フィードバック解除
      };

      // touchcancel: タッチキャンセル時
      const handleTouchCancel = (_e: TouchEvent) => {
        button.classList.remove('active'); // キャンセル時も解除
      };

      // マウスイベントもサポート（デバッグ用）
      const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        button.classList.add('active');
        this.handleTouchInput(action);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        button.classList.remove('active');
      };

      // イベントリスナーを登録（メモリリーク対策付き）
      this.addEventListener(button, 'touchstart', handleTouchStart as EventListener);
      this.addEventListener(button, 'touchend', handleTouchEnd as EventListener);
      this.addEventListener(button, 'touchcancel', handleTouchCancel as EventListener);
      this.addEventListener(button, 'mousedown', handleMouseDown as EventListener);
      this.addEventListener(button, 'mouseup', handleMouseUp as EventListener);
    });
  }

  /**
   * タッチ操作をInputCommandに変換してInputHandlerServiceに送信
   *
   * @param action - data-action属性の値
   */
  private handleTouchInput(action: string): void {
    try {
      const command = this.convertToInputCommand(action);
      this.inputHandlerService.handleInput(command, this.gameId);
    } catch (error) {
      console.error(`Failed to handle touch input for ${action}:`, error);
      // エラーでもゲームを継続（入力だけ無視）
    }
  }

  /**
   * タッチアクションをInputCommandに変換
   *
   * @param action - data-action属性の値
   * @returns InputCommand
   * @throws {Error} 未知のアクションの場合
   */
  private convertToInputCommand(action: string): InputCommand {
    switch (action) {
      case 'left':
        return InputCommand.MOVE_LEFT;
      case 'right':
        return InputCommand.MOVE_RIGHT;
      case 'down':
        return InputCommand.MOVE_DOWN;
      case 'rotate-cw':
        return InputCommand.ROTATE_CLOCKWISE;
      case 'rotate-ccw':
        return InputCommand.ROTATE_COUNTER_CLOCKWISE;
      case 'instant-drop':
        return InputCommand.INSTANT_DROP;
      default:
        throw new Error(`Unknown touch action: ${action}`);
    }
  }

  /**
   * イベントリスナーを登録し、メモリリーク対策のために記録
   *
   * @param element - 要素
   * @param event - イベント名
   * @param handler - ハンドラ
   */
  private addEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * タッチコントロールを表示
   */
  show(): void {
    this.container.style.display = 'flex';
  }

  /**
   * タッチコントロールを非表示
   */
  hide(): void {
    this.container.style.display = 'none';
  }

  /**
   * イベントリスナーを全て解除し、DOM要素を削除
   *
   * @remarks
   * メモリリーク対策として必ずコンポーネント破棄時に呼び出すこと
   */
  destroy(): void {
    try {
      // 全イベントリスナーを自動解放
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners = [];

      // ボタンマップをクリア
      this.buttons.clear();

      // DOM要素を削除
      this.container.innerHTML = '';
    } catch (error) {
      console.error('Failed to destroy touch controls:', error);
    }
  }
}
