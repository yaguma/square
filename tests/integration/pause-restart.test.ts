import { describe, test, expect, beforeEach } from 'vitest';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { GameApplicationService } from '@application/services/GameApplicationService';

/**
 * テスト定数
 */
const TEST_FRAMES = {
  SHORT: 10,    // 短時間のフレーム更新
  MEDIUM: 20,   // 中程度のフレーム更新
  MAX: 1000,    // ゲームオーバー確認の最大フレーム数
} as const;

/**
 * テストヘルパー関数: 指定回数フレームを更新
 */
function updateFrames(
  service: GameApplicationService,
  gameId: string,
  count: number
): void {
  for (let i = 0; i < count; i++) {
    service.updateFrame(gameId);
  }
}

/**
 * テストヘルパー関数: ゲームオーバーまたは最大フレーム数まで更新
 */
function updateUntilGameOverOrMax(
  service: GameApplicationService,
  gameId: string,
  maxFrames: number = TEST_FRAMES.MAX
): { state: string; frameCount: number } {
  let currentState = service.getGameState(gameId);
  let frameCount = 0;

  while (currentState.state === 'playing' && frameCount < maxFrames) {
    service.updateFrame(gameId);
    currentState = service.getGameState(gameId);
    frameCount++;
  }

  return { state: currentState.state, frameCount };
}

/**
 * 統合テスト: 一時停止とリスタート機能
 *
 * ゲームの一時停止、再開、リスタート機能が正しく動作することを確認する
 */
describe('Game Integration - Pause and Restart', () => {
  let repository: InMemoryGameRepository;
  let service: GameApplicationService;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
    service = new GameApplicationService(repository);
  });

  describe('一時停止機能', () => {
    test('ゲームを一時停止できる', () => {

      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // ゲームを一時停止
      service.pauseGame(gameId);

      // 一時停止状態になっている
      const pausedState = service.getGameState(gameId);
      expect(pausedState.state).toBe('paused');
      expect(pausedState.gameId).toBe(gameId);
    });

    test('一時停止中はフレーム更新してもゲーム状態が変化しない', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // 一時停止前のスコアとブロック位置を記録
      const beforePauseState = service.getGameState(gameId);
      const scoreBefore = beforePauseState.score;
      const blockBefore = beforePauseState.fallingBlock;

      // ゲームを一時停止
      service.pauseGame(gameId);

      // 一時停止中に複数フレーム更新
      updateFrames(service, gameId, TEST_FRAMES.SHORT);

      // ゲーム状態が変化していない
      const afterPauseState = service.getGameState(gameId);
      expect(afterPauseState.state).toBe('paused');
      expect(afterPauseState.score).toBe(scoreBefore);

      // ブロック位置も変わっていない（一時停止中は落下しない）
      if (blockBefore && afterPauseState.fallingBlock) {
        expect(afterPauseState.fallingBlock.position.x).toBe(blockBefore.position.x);
        expect(afterPauseState.fallingBlock.position.y).toBe(blockBefore.position.y);
      }
    });

    test('一時停止から再開できる', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // 一時停止
      service.pauseGame(gameId);
      expect(service.getGameState(gameId).state).toBe('paused');

      // 再開
      service.resumeGame(gameId);
      const resumedState = service.getGameState(gameId);
      expect(resumedState.state).toBe('playing');
    });

    test('再開後はフレーム更新でゲームが進行する', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // 一時停止して再開
      service.pauseGame(gameId);
      service.resumeGame(gameId);

      const beforeUpdate = service.getGameState(gameId);
      const blockYBefore = beforeUpdate.fallingBlock?.position.y ?? 0;

      // フレーム更新
      updateFrames(service, gameId, TEST_FRAMES.SHORT);

      // ゲームが進行している
      const afterUpdate = service.getGameState(gameId);
      expect(afterUpdate.state).toBe('playing');

      // ブロックが落下している、または新しいブロックが生成されている
      if (afterUpdate.fallingBlock) {
        const blockYAfter = afterUpdate.fallingBlock.position.y;
        expect(blockYAfter).toBeGreaterThanOrEqual(blockYBefore);
      }
    });

    test('複数回の一時停止と再開が正しく動作する', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // 1回目: 一時停止 → 再開
      service.pauseGame(gameId);
      expect(service.getGameState(gameId).state).toBe('paused');

      service.resumeGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');

      // フレーム更新
      service.updateFrame(gameId);

      // 2回目: 一時停止 → 再開
      service.pauseGame(gameId);
      expect(service.getGameState(gameId).state).toBe('paused');

      service.resumeGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');

      // 3回目: 一時停止 → 再開
      service.pauseGame(gameId);
      expect(service.getGameState(gameId).state).toBe('paused');

      service.resumeGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');
    });

    test('ゲームオーバー後は一時停止できない', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // ゲームを多数フレーム更新してゲームオーバーを試みる
      // （実際にゲームオーバーになるかは運次第）
      const result = updateUntilGameOverOrMax(service, gameId, TEST_FRAMES.MAX);

      // もしゲームオーバーになった場合、一時停止しても状態は変わらない
      if (result.state === 'gameover') {
        service.pauseGame(gameId);
        const afterPauseState = service.getGameState(gameId);
        expect(afterPauseState.state).toBe('gameover');
      }
    });
  });

  describe('リスタート機能', () => {
    test('ゲームをリスタートできる', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // いくつかフレームを更新してゲームを進行させる
      updateFrames(service, gameId, TEST_FRAMES.SHORT);

      // リスタート
      service.restartGame(gameId);

      // 新しいゲーム状態になっている
      const restartedState = service.getGameState(gameId);
      expect(restartedState.state).toBe('playing');
      expect(restartedState.score).toBe(0);
      expect(restartedState.fallingBlock).not.toBeNull();
    });

    test('リスタート後は新しいゲームとして動作する', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // ゲームを進行させる
      updateFrames(service, gameId, TEST_FRAMES.MEDIUM);

      const beforeRestartState = service.getGameState(gameId);
      const scoreBefore = beforeRestartState.score;

      // リスタート
      service.restartGame(gameId);

      // リスタート後のゲームを進行させる
      updateFrames(service, gameId, TEST_FRAMES.SHORT);

      const afterRestartState = service.getGameState(gameId);

      // 新しいゲームとして動作している
      expect(afterRestartState.state).toBe('playing');
      expect(afterRestartState.gameId).toBe(gameId); // 同じゲームIDを使用
    });

    test('一時停止中にリスタートできる', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // ゲームを一時停止
      service.pauseGame(gameId);
      expect(service.getGameState(gameId).state).toBe('paused');

      // リスタート
      service.restartGame(gameId);

      // 新しいゲームが開始されている（一時停止状態ではない）
      const restartedState = service.getGameState(gameId);
      expect(restartedState.state).toBe('playing');
      expect(restartedState.score).toBe(0);
    });

    test('ゲームオーバー後にリスタートできる', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // ゲームを多数フレーム更新してゲームオーバーを試みる
      const result = updateUntilGameOverOrMax(service, gameId, TEST_FRAMES.MAX);

      // ゲームオーバーになった場合、リスタートできる
      if (result.state === 'gameover') {
        service.restartGame(gameId);

        const restartedState = service.getGameState(gameId);
        expect(restartedState.state).toBe('playing');
        expect(restartedState.score).toBe(0);
      }
    });

    test('複数回のリスタートが正しく動作する', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // 1回目のリスタート
      updateFrames(service, gameId, TEST_FRAMES.SHORT);
      service.restartGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');
      expect(service.getGameState(gameId).score).toBe(0);

      // 2回目のリスタート
      updateFrames(service, gameId, TEST_FRAMES.SHORT);
      service.restartGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');
      expect(service.getGameState(gameId).score).toBe(0);

      // 3回目のリスタート
      updateFrames(service, gameId, TEST_FRAMES.SHORT);
      service.restartGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');
      expect(service.getGameState(gameId).score).toBe(0);
    });
  });

  describe('一時停止とリスタートの組み合わせ', () => {
    test('一時停止 → リスタート → 一時停止のシーケンスが正しく動作する', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // 一時停止
      service.pauseGame(gameId);
      expect(service.getGameState(gameId).state).toBe('paused');

      // リスタート（playing状態になる）
      service.restartGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');

      // 再度一時停止
      service.pauseGame(gameId);
      expect(service.getGameState(gameId).state).toBe('paused');

      // 再開
      service.resumeGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');
    });

    test('playing → pause → resume → restart → playing のフローが正しく動作する', () => {
      const gameDto = service.startNewGame();
      const gameId = gameDto.gameId;

      // Playing状態
      expect(service.getGameState(gameId).state).toBe('playing');

      // Pause
      service.pauseGame(gameId);
      expect(service.getGameState(gameId).state).toBe('paused');

      // Resume
      service.resumeGame(gameId);
      expect(service.getGameState(gameId).state).toBe('playing');

      // いくつかフレームを更新
      updateFrames(service, gameId, 5);

      // Restart
      service.restartGame(gameId);
      const finalState = service.getGameState(gameId);
      expect(finalState.state).toBe('playing');
      expect(finalState.score).toBe(0);
    });
  });
});
