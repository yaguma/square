import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { FrameTimer } from '@infrastructure/timer/FrameTimer';

describe('FrameTimer', () => {
  let timer: FrameTimer;

  beforeEach(() => {
    vi.useFakeTimers();
    timer = new FrameTimer();
  });

  afterEach(() => {
    timer.stop();
    vi.restoreAllMocks();
  });

  describe('start', () => {
    test('タイマーを開始できる', () => {
      const callback = vi.fn();

      timer.start(callback, 30);

      expect(timer.isRunning).toBe(true);
    });

    test('指定したFPSでコールバックが呼ばれる', () => {
      const callback = vi.fn();
      const fps = 30;
      const interval = 1000 / fps; // 約33.33ms

      timer.start(callback, fps);

      // 1フレーム分進める
      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(1);

      // さらに2フレーム分進める
      vi.advanceTimersByTime(interval * 2);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    test('FPSを指定しない場合はデフォルト30FPSになる', () => {
      const callback = vi.fn();
      const defaultFps = 30;
      const interval = 1000 / defaultFps;

      timer.start(callback);

      vi.advanceTimersByTime(interval);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('すでに実行中の場合は再度開始できない', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      timer.start(callback1, 30);
      timer.start(callback2, 30);

      vi.advanceTimersByTime(1000 / 30);

      // 最初のコールバックだけが呼ばれる
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    test('タイマーを停止できる', () => {
      const callback = vi.fn();

      timer.start(callback, 30);
      timer.stop();

      expect(timer.isRunning).toBe(false);

      // 停止後はコールバックが呼ばれない
      vi.advanceTimersByTime(1000);
      expect(callback).not.toHaveBeenCalled();
    });

    test('停止していない状態でstopを呼んでも問題ない', () => {
      expect(() => timer.stop()).not.toThrow();
    });

    test('停止後に再度開始できる', () => {
      const callback = vi.fn();

      timer.start(callback, 30);
      timer.stop();
      timer.start(callback, 30);

      expect(timer.isRunning).toBe(true);

      vi.advanceTimersByTime(1000 / 30);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('isRunning', () => {
    test('初期状態ではfalse', () => {
      expect(timer.isRunning).toBe(false);
    });

    test('start後はtrue', () => {
      const callback = vi.fn();

      timer.start(callback, 30);

      expect(timer.isRunning).toBe(true);
    });

    test('stop後はfalse', () => {
      const callback = vi.fn();

      timer.start(callback, 30);
      timer.stop();

      expect(timer.isRunning).toBe(false);
    });
  });
});
