/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchControlRenderer } from '@presentation/renderers/TouchControlRenderer';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { InputCommand } from '@application/value-objects/InputCommand';

describe('TouchControlRenderer', () => {
  let container: HTMLElement;
  let mockInputHandler: InputHandlerService;
  let renderer: TouchControlRenderer;
  const gameId = 'test-game-id';

  beforeEach(() => {
    // コンテナ要素を作成
    container = document.createElement('div');
    container.id = 'touch-controls-container';
    document.body.appendChild(container);

    // モックInputHandlerServiceを作成
    mockInputHandler = {
      handleInput: vi.fn(),
      handleInputRelease: vi.fn(),
    } as any;

    renderer = new TouchControlRenderer(container, mockInputHandler, gameId);
  });

  afterEach(() => {
    renderer.destroy();
    document.body.removeChild(container);
  });

  describe('コンストラクタ', () => {
    it('正常に初期化できる', () => {
      expect(renderer).toBeDefined();
    });

    it('containerElementがnullの場合エラーをスロー', () => {
      expect(() => {
        new TouchControlRenderer(null, mockInputHandler, gameId);
      }).toThrow('TouchControlRenderer: containerElement is required');
    });
  });

  describe('render()', () => {
    it('タッチコントロールUIを生成する', () => {
      renderer.render();

      const touchControls = container.querySelector('.touch-controls');
      expect(touchControls).toBeTruthy();
    });

    it('全てのボタンが生成される', () => {
      renderer.render();

      expect(container.querySelector('[data-action="left"]')).toBeTruthy();
      expect(container.querySelector('[data-action="right"]')).toBeTruthy();
      expect(container.querySelector('[data-action="down"]')).toBeTruthy();
      expect(container.querySelector('[data-action="rotate-cw"]')).toBeTruthy();
      expect(container.querySelector('[data-action="rotate-ccw"]')).toBeTruthy();
      expect(container.querySelector('[data-action="instant-drop"]')).toBeTruthy();
    });

    it('ボタンにdata-testid属性が設定される', () => {
      renderer.render();

      expect(container.querySelector('[data-testid="direction-left-btn"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="direction-right-btn"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="direction-down-btn"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="rotation-cw-btn"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="rotation-ccw-btn"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="drop-btn"]')).toBeTruthy();
    });

    it('ボタンにdata-action属性が設定される', () => {
      renderer.render();

      const leftBtn = container.querySelector('[data-testid="direction-left-btn"]') as HTMLButtonElement;
      expect(leftBtn?.getAttribute('data-action')).toBe('left');

      const rightBtn = container.querySelector('[data-testid="direction-right-btn"]') as HTMLButtonElement;
      expect(rightBtn?.getAttribute('data-action')).toBe('right');
    });

    it('適切なクラス名が設定される', () => {
      renderer.render();

      const touchControls = container.querySelector('.touch-controls');
      expect(touchControls).toBeTruthy();

      const rotationButtons = container.querySelector('.rotation-buttons');
      expect(rotationButtons).toBeTruthy();

      const directionButtons = container.querySelector('.direction-buttons');
      expect(directionButtons).toBeTruthy();

      const dropButton = container.querySelector('.drop-button');
      expect(dropButton).toBeTruthy();

      const btns = container.querySelectorAll('.touch-btn');
      expect(btns.length).toBe(6);
    });
  });

  describe('イベント処理', () => {
    it('マウスダウンでInputHandlerService.handleInputが呼ばれる', () => {
      renderer.render();

      const leftBtn = container.querySelector('[data-action="left"]') as HTMLButtonElement;
      leftBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(InputCommand.MOVE_LEFT, gameId);
    });

    it('各ボタンが正しいInputCommandに変換される - left', () => {
      renderer.render();

      const btn = container.querySelector('[data-action="left"]') as HTMLButtonElement;
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(InputCommand.MOVE_LEFT, gameId);
    });

    it('各ボタンが正しいInputCommandに変換される - right', () => {
      renderer.render();

      const btn = container.querySelector('[data-action="right"]') as HTMLButtonElement;
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(InputCommand.MOVE_RIGHT, gameId);
    });

    it('各ボタンが正しいInputCommandに変換される - down', () => {
      renderer.render();

      const btn = container.querySelector('[data-action="down"]') as HTMLButtonElement;
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(InputCommand.MOVE_DOWN, gameId);
    });

    it('各ボタンが正しいInputCommandに変換される - rotate-cw', () => {
      renderer.render();

      const btn = container.querySelector('[data-action="rotate-cw"]') as HTMLButtonElement;
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(InputCommand.ROTATE_CLOCKWISE, gameId);
    });

    it('各ボタンが正しいInputCommandに変換される - rotate-ccw', () => {
      renderer.render();

      const btn = container.querySelector('[data-action="rotate-ccw"]') as HTMLButtonElement;
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(InputCommand.ROTATE_COUNTER_CLOCKWISE, gameId);
    });

    it('各ボタンが正しいInputCommandに変換される - instant-drop', () => {
      renderer.render();

      const btn = container.querySelector('[data-action="instant-drop"]') as HTMLButtonElement;
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(mockInputHandler.handleInput).toHaveBeenCalledWith(InputCommand.INSTANT_DROP, gameId);
    });

    it('activeクラスがmousedown時に追加される', () => {
      renderer.render();

      const btn = container.querySelector('[data-action="left"]') as HTMLButtonElement;
      expect(btn.classList.contains('active')).toBe(false);

      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      expect(btn.classList.contains('active')).toBe(true);
    });

    it('activeクラスがmouseup時に削除される', () => {
      renderer.render();

      const btn = container.querySelector('[data-action="left"]') as HTMLButtonElement;

      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      expect(btn.classList.contains('active')).toBe(true);

      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      expect(btn.classList.contains('active')).toBe(false);
    });
  });

  describe('show() / hide()', () => {
    it('show()でdisplay: flexになる', () => {
      renderer.render();
      renderer.show();

      const touchControls = container.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls.style.display).toBe('flex');
    });

    it('hide()でdisplay: noneになる', () => {
      renderer.render();
      renderer.hide();

      const touchControls = container.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls.style.display).toBe('none');
    });

    it('初期状態はdisplay: noneではない（show/hide制御前）', () => {
      renderer.render();
      // renderした直後はdisplay設定されていない（CSSで制御）
      const touchControls = container.querySelector('.touch-controls') as HTMLElement;
      expect(touchControls.style.display).toBe('');
    });
  });

  describe('destroy()', () => {
    it('DOM要素が削除される', () => {
      renderer.render();

      const initialChildCount = container.children.length;
      expect(initialChildCount).toBeGreaterThan(0);

      renderer.destroy();

      expect(container.children.length).toBe(0);
      expect(container.innerHTML).toBe('');
    });

    it('エラーが発生しても正常に処理される', () => {
      renderer.render();

      // destroyが例外を投げないことを確認
      expect(() => renderer.destroy()).not.toThrow();
    });
  });
});
