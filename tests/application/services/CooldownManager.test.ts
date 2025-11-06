import { describe, test, expect, beforeEach } from 'vitest';
import { CooldownManager } from '@application/services/CooldownManager';
import { InputCommand } from '@application/value-objects/InputCommand';

describe('CooldownManager', () => {
  let manager: CooldownManager;

  beforeEach(() => {
    manager = new CooldownManager();
  });

  describe('canExecute', () => {
    test('初回の入力は常に実行可能', () => {
      const currentTime = 1000;

      expect(manager.canExecute(InputCommand.MOVE_LEFT, currentTime)).toBe(true);
      expect(manager.canExecute(InputCommand.MOVE_RIGHT, currentTime)).toBe(true);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, currentTime)).toBe(true);
      expect(manager.canExecute(InputCommand.INSTANT_DROP, currentTime)).toBe(true);
    });

    test('MOVE_LEFTは133ms以内の連続実行を防ぐ', () => {
      const baseTime = 1000;

      // 初回実行
      expect(manager.canExecute(InputCommand.MOVE_LEFT, baseTime)).toBe(true);
      manager.markExecuted(InputCommand.MOVE_LEFT, baseTime);

      // 100ms後（クールダウン中）
      expect(manager.canExecute(InputCommand.MOVE_LEFT, baseTime + 100)).toBe(false);

      // 132ms後（まだクールダウン中）
      expect(manager.canExecute(InputCommand.MOVE_LEFT, baseTime + 132)).toBe(false);

      // 133ms後（クールダウン完了）
      expect(manager.canExecute(InputCommand.MOVE_LEFT, baseTime + 133)).toBe(true);

      // 200ms後（十分に経過）
      expect(manager.canExecute(InputCommand.MOVE_LEFT, baseTime + 200)).toBe(true);
    });

    test('MOVE_RIGHTは133ms以内の連続実行を防ぐ', () => {
      const baseTime = 1000;

      expect(manager.canExecute(InputCommand.MOVE_RIGHT, baseTime)).toBe(true);
      manager.markExecuted(InputCommand.MOVE_RIGHT, baseTime);

      expect(manager.canExecute(InputCommand.MOVE_RIGHT, baseTime + 100)).toBe(false);
      expect(manager.canExecute(InputCommand.MOVE_RIGHT, baseTime + 133)).toBe(true);
    });

    test('ROTATE_CLOCKWISEは200ms以内の連続実行を防ぐ', () => {
      const baseTime = 1000;

      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, baseTime)).toBe(true);
      manager.markExecuted(InputCommand.ROTATE_CLOCKWISE, baseTime);

      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, baseTime + 100)).toBe(false);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, baseTime + 199)).toBe(false);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, baseTime + 200)).toBe(true);
    });

    test('ROTATE_COUNTER_CLOCKWISEは200ms以内の連続実行を防ぐ', () => {
      const baseTime = 1000;

      expect(manager.canExecute(InputCommand.ROTATE_COUNTER_CLOCKWISE, baseTime)).toBe(true);
      manager.markExecuted(InputCommand.ROTATE_COUNTER_CLOCKWISE, baseTime);

      expect(manager.canExecute(InputCommand.ROTATE_COUNTER_CLOCKWISE, baseTime + 100)).toBe(false);
      expect(manager.canExecute(InputCommand.ROTATE_COUNTER_CLOCKWISE, baseTime + 200)).toBe(true);
    });

    test('INSTANT_DROPはクールダウンなし（即座に実行可能）', () => {
      const baseTime = 1000;

      expect(manager.canExecute(InputCommand.INSTANT_DROP, baseTime)).toBe(true);
      manager.markExecuted(InputCommand.INSTANT_DROP, baseTime);

      // すぐに再実行可能
      expect(manager.canExecute(InputCommand.INSTANT_DROP, baseTime)).toBe(true);
      expect(manager.canExecute(InputCommand.INSTANT_DROP, baseTime + 1)).toBe(true);
    });

    test('MOVE_DOWNはクールダウンなし（押し続け対応）', () => {
      const baseTime = 1000;

      expect(manager.canExecute(InputCommand.MOVE_DOWN, baseTime)).toBe(true);
      manager.markExecuted(InputCommand.MOVE_DOWN, baseTime);

      // すぐに再実行可能
      expect(manager.canExecute(InputCommand.MOVE_DOWN, baseTime)).toBe(true);
    });

    test('PAUSEはクールダウンなし', () => {
      const baseTime = 1000;

      expect(manager.canExecute(InputCommand.PAUSE, baseTime)).toBe(true);
      manager.markExecuted(InputCommand.PAUSE, baseTime);

      expect(manager.canExecute(InputCommand.PAUSE, baseTime)).toBe(true);
    });

    test('RESETはクールダウンなし', () => {
      const baseTime = 1000;

      expect(manager.canExecute(InputCommand.RESET, baseTime)).toBe(true);
      manager.markExecuted(InputCommand.RESET, baseTime);

      expect(manager.canExecute(InputCommand.RESET, baseTime)).toBe(true);
    });

    test('異なるコマンドは独立して管理される', () => {
      const baseTime = 1000;

      // MOVE_LEFTを実行
      manager.markExecuted(InputCommand.MOVE_LEFT, baseTime);

      // 他のコマンドは影響を受けない
      expect(manager.canExecute(InputCommand.MOVE_RIGHT, baseTime)).toBe(true);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, baseTime)).toBe(true);
      expect(manager.canExecute(InputCommand.INSTANT_DROP, baseTime)).toBe(true);

      // MOVE_LEFTだけがクールダウン中
      expect(manager.canExecute(InputCommand.MOVE_LEFT, baseTime + 100)).toBe(false);
    });
  });

  describe('markExecuted', () => {
    test('実行時刻を正しく記録する', () => {
      const time1 = 1000;
      const time2 = 2000;

      manager.markExecuted(InputCommand.MOVE_LEFT, time1);
      expect(manager.getLastExecutionTime(InputCommand.MOVE_LEFT)).toBe(time1);

      manager.markExecuted(InputCommand.MOVE_LEFT, time2);
      expect(manager.getLastExecutionTime(InputCommand.MOVE_LEFT)).toBe(time2);
    });

    test('複数のコマンドを独立して記録する', () => {
      const time1 = 1000;
      const time2 = 2000;

      manager.markExecuted(InputCommand.MOVE_LEFT, time1);
      manager.markExecuted(InputCommand.MOVE_RIGHT, time2);

      expect(manager.getLastExecutionTime(InputCommand.MOVE_LEFT)).toBe(time1);
      expect(manager.getLastExecutionTime(InputCommand.MOVE_RIGHT)).toBe(time2);
    });
  });

  describe('reset', () => {
    test('全てのクールダウンをリセットする', () => {
      const baseTime = 1000;

      // 複数のコマンドを実行
      manager.markExecuted(InputCommand.MOVE_LEFT, baseTime);
      manager.markExecuted(InputCommand.MOVE_RIGHT, baseTime);
      manager.markExecuted(InputCommand.ROTATE_CLOCKWISE, baseTime);

      // リセット前はクールダウン中
      expect(manager.canExecute(InputCommand.MOVE_LEFT, baseTime + 100)).toBe(false);

      // リセット
      manager.reset();

      // リセット後は全て実行可能
      expect(manager.canExecute(InputCommand.MOVE_LEFT, baseTime + 100)).toBe(true);
      expect(manager.canExecute(InputCommand.MOVE_RIGHT, baseTime + 100)).toBe(true);
      expect(manager.canExecute(InputCommand.ROTATE_CLOCKWISE, baseTime + 100)).toBe(true);

      // 実行時刻も未定義になる
      expect(manager.getLastExecutionTime(InputCommand.MOVE_LEFT)).toBeUndefined();
    });
  });

  describe('getCooldownDuration', () => {
    test('各コマンドの正しいクールダウン時間を返す', () => {
      expect(manager.getCooldownDuration(InputCommand.MOVE_LEFT)).toBe(133);
      expect(manager.getCooldownDuration(InputCommand.MOVE_RIGHT)).toBe(133);
      expect(manager.getCooldownDuration(InputCommand.ROTATE_CLOCKWISE)).toBe(200);
      expect(manager.getCooldownDuration(InputCommand.ROTATE_COUNTER_CLOCKWISE)).toBe(200);
      expect(manager.getCooldownDuration(InputCommand.INSTANT_DROP)).toBe(0);
      expect(manager.getCooldownDuration(InputCommand.MOVE_DOWN)).toBe(0);
      expect(manager.getCooldownDuration(InputCommand.PAUSE)).toBe(0);
      expect(manager.getCooldownDuration(InputCommand.RESET)).toBe(0);
    });
  });

  describe('getLastExecutionTime', () => {
    test('未実行のコマンドはundefinedを返す', () => {
      expect(manager.getLastExecutionTime(InputCommand.MOVE_LEFT)).toBeUndefined();
    });

    test('実行済みのコマンドは実行時刻を返す', () => {
      const time = 12345;
      manager.markExecuted(InputCommand.MOVE_LEFT, time);

      expect(manager.getLastExecutionTime(InputCommand.MOVE_LEFT)).toBe(time);
    });
  });
});
