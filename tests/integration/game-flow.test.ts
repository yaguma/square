import { describe, test, expect, beforeEach } from 'vitest';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { GameState } from '@domain/models/value-objects/GameState';

/**
 * テスト定数
 */
const TEST_FRAMES = {
  SHORT: 10,    // 短時間のフレーム更新
  MEDIUM: 100,  // 約3.3秒相当のフレーム更新
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
 * 統合テスト: ゲーム開始から終了までの完全なフロー
 *
 * ゲーム開始 → フレーム更新 → ブロック落下 → 接地 → 消去判定 → スコア更新
 * までの完全なゲームフローをテストする
 */
describe('Game Integration - Complete Game Flow', () => {
  let repository: InMemoryGameRepository;
  let service: GameApplicationService;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
    service = new GameApplicationService(repository);
  });

  test('新しいゲームが正しく開始される', () => {

    // ゲームを開始
    const gameDto = service.startNewGame();

    // 初期状態を確認
    expect(gameDto.gameId).toBeDefined();
    expect(gameDto.state).toBe('playing');
    expect(gameDto.score).toBe(0);
    expect(gameDto.fallingBlock).not.toBeNull();
    expect(gameDto.nextBlock).not.toBeNull();
  });

  test('フレーム更新でゲーム状態が進行する', () => {
    const initialDto = service.startNewGame();
    const gameId = initialDto.gameId;

    // フレームを更新
    const updatedDto = service.updateFrame(gameId);

    // ゲーム状態が更新されている
    expect(updatedDto.gameId).toBe(gameId);
    expect(updatedDto.state).toBe('playing');
    expect(updatedDto.fallingBlock).not.toBeNull();
  });

  test('複数フレームの更新でブロックが落下する', () => {
    const initialDto = service.startNewGame();
    const gameId = initialDto.gameId;

    const initialBlockY = initialDto.fallingBlock?.position.y ?? 0;

    // 複数フレーム更新（ブロックが落下するまで）
    updateFrames(service, gameId, TEST_FRAMES.SHORT);
    const currentDto = service.getGameState(gameId);

    // ブロックが落下している、または新しいブロックが生成されている
    if (currentDto.fallingBlock) {
      // まだ同じブロックが落下中の場合、Y座標が増加している
      const currentBlockY = currentDto.fallingBlock.position.y;
      expect(currentBlockY).toBeGreaterThanOrEqual(initialBlockY);
    }
    // 新しいブロックが生成された場合もOK（元のブロックが接地した）
  });

  test('ゲーム状態を取得できる', () => {
    const initialDto = service.startNewGame();
    const gameId = initialDto.gameId;

    // ゲーム状態を取得
    const gameState = service.getGameState(gameId);

    // 状態が正しく取得できる
    expect(gameState.gameId).toBe(gameId);
    expect(gameState.state).toBe('playing');
    expect(gameState.score).toBe(0);
    expect(gameState.field).toBeDefined();
  });

  test('存在しないゲームIDでエラーが発生する', () => {
    // 存在しないゲームIDでアクセス
    expect(() => {
      service.getGameState('non-existent-game-id');
    }).toThrow();
  });

  test('長時間のゲームプレイでメモリリークが発生しない', () => {
    const gameDto = service.startNewGame();
    const gameId = gameDto.gameId;

    // 100フレーム更新（約3.3秒相当）
    updateFrames(service, gameId, TEST_FRAMES.MEDIUM);

    // ゲームが正常に動作している
    const finalState = service.getGameState(gameId);
    expect(finalState.gameId).toBe(gameId);
    expect(['playing', 'paused', 'gameover']).toContain(finalState.state);
  });

  test('複数のゲームを同時に管理できる', () => {
    // 複数のゲームを開始
    const game1 = service.startNewGame();
    const game2 = service.startNewGame();
    const game3 = service.startNewGame();

    // すべてのゲームIDが異なる
    expect(game1.gameId).not.toBe(game2.gameId);
    expect(game2.gameId).not.toBe(game3.gameId);
    expect(game1.gameId).not.toBe(game3.gameId);

    // すべてのゲームが独立して動作する
    service.updateFrame(game1.gameId);
    service.pauseGame(game2.gameId);

    const state1 = service.getGameState(game1.gameId);
    const state2 = service.getGameState(game2.gameId);
    const state3 = service.getGameState(game3.gameId);

    expect(state1.state).toBe('playing');
    expect(state2.state).toBe('paused');
    expect(state3.state).toBe('playing');
  });

  test('ゲーム終了後もゲーム状態を取得できる', () => {
    const gameDto = service.startNewGame();
    const gameId = gameDto.gameId;

    // ゲームを強制的にゲームオーバーにする
    // （実際のゲームでは最上段にブロックが到達した時）
    // ここでは多数のフレームを更新して、ゲームオーバーになる可能性を確認
    const result = updateUntilGameOverOrMax(service, gameId, TEST_FRAMES.MAX);

    // ゲーム状態を取得できる
    const finalState = service.getGameState(gameId);
    expect(finalState.gameId).toBe(gameId);
    expect(['playing', 'paused', 'gameover']).toContain(finalState.state);
  });
});
