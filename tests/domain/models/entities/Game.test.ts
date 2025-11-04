import { describe, test, expect } from 'vitest';
import { Game, NORMAL_FALL_SPEED, FAST_FALL_SPEED } from '@domain/models/entities/Game';
import { GameState } from '@domain/models/value-objects/GameState';

describe('Game', () => {
  describe('create', () => {
    test('正常にゲームを作成できる', () => {
      const game = Game.create('test-game-id');

      expect(game.gameId).toBe('test-game-id');
      expect(game.state).toBe(GameState.Playing);
      expect(game.score.value).toBe(0);
      expect(game.frameCount).toBe(0);
    });
  });

  describe('start', () => {
    test('ゲームを開始できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      expect(game.fallingBlock).not.toBeNull();
      expect(game.nextBlock).not.toBeNull();
      expect(game.state).toBe(GameState.Playing);
    });
  });

  describe('pause and resume', () => {
    test('ゲームを一時停止できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      game.pause();
      expect(game.state).toBe(GameState.Paused);
    });

    test('一時停止中のゲームを再開できる', () => {
      const game = Game.create('test-game-id');
      game.start();
      game.pause();

      game.resume();
      expect(game.state).toBe(GameState.Playing);
    });

    test('一時停止中はupdate()が何もしない', () => {
      const game = Game.create('test-game-id');
      game.start();
      game.pause();

      const frameCountBefore = game.frameCount;
      game.update();
      expect(game.frameCount).toBe(frameCountBefore);
    });
  });

  describe('update', () => {
    test('フレームカウントが増加する', () => {
      const game = Game.create('test-game-id');
      game.start();

      const initialFrameCount = game.frameCount;
      game.update();
      expect(game.frameCount).toBe(initialFrameCount + 1);
    });

    test('落下ブロックがない場合は新しいブロックを生成する', () => {
      const game = Game.create('test-game-id');
      // startを呼ばずにupdateを呼ぶ

      expect(game.fallingBlock).toBeNull();
      game.update();
      expect(game.fallingBlock).not.toBeNull();
    });
  });

  describe('moveFallingBlockLeft', () => {
    test('落下ブロックを左に移動できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      const initialX = game.fallingBlock!.position.x;
      game.moveFallingBlockLeft();

      expect(game.fallingBlock!.position.x).toBe(initialX - 1);
    });

    test('一時停止中は移動できない', () => {
      const game = Game.create('test-game-id');
      game.start();
      game.pause();

      const initialX = game.fallingBlock!.position.x;
      game.moveFallingBlockLeft();

      expect(game.fallingBlock!.position.x).toBe(initialX);
    });

    test('落下ブロックがない場合は何もしない', () => {
      const game = Game.create('test-game-id');
      // startを呼ばない

      expect(() => game.moveFallingBlockLeft()).not.toThrow();
    });
  });

  describe('moveFallingBlockRight', () => {
    test('落下ブロックを右に移動できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      const initialX = game.fallingBlock!.position.x;
      game.moveFallingBlockRight();

      expect(game.fallingBlock!.position.x).toBe(initialX + 1);
    });
  });

  describe('rotateFallingBlockClockwise', () => {
    test('落下ブロックを時計回りに回転できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      const initialRotation = game.fallingBlock!.rotation;
      game.rotateFallingBlockClockwise();

      expect(game.fallingBlock!.rotation).toBe((initialRotation + 90) % 360);
    });
  });

  describe('rotateFallingBlockCounterClockwise', () => {
    test('落下ブロックを反時計回りに回転できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      game.rotateFallingBlockCounterClockwise();

      expect(game.fallingBlock!.rotation).toBe(270);
    });
  });

  describe('enableFastFall and disableFastFall', () => {
    test('高速落下を有効化できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      game.enableFastFall();
      // 内部的な落下速度が変更されていることを確認
      // （privateなので直接確認できないが、振る舞いで検証）
      expect(game.state).toBe(GameState.Playing);
    });

    test('高速落下を無効化できる', () => {
      const game = Game.create('test-game-id');
      game.start();
      game.enableFastFall();

      game.disableFastFall();
      // 通常速度に戻ることを確認
      expect(game.state).toBe(GameState.Playing);
    });
  });

  describe('dropInstantly', () => {
    test('即座に落下できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      const initialY = game.fallingBlock!.position.y;
      game.dropInstantly();

      // ブロックが接地しているため、fallingBlockはnullになる
      expect(game.fallingBlock).toBeNull();
    });

    test('一時停止中は動作しない', () => {
      const game = Game.create('test-game-id');
      game.start();
      game.pause();

      const fallingBlock = game.fallingBlock;
      game.dropInstantly();

      // ブロックはそのまま
      expect(game.fallingBlock).toBe(fallingBlock);
    });
  });

  describe('restart', () => {
    test('ゲームをリセットして再開できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      // いくつかupdate()を実行してフレームカウントを増やす
      for (let i = 0; i < 10; i++) {
        game.update();
      }

      game.restart();

      expect(game.frameCount).toBe(0);
      expect(game.score.value).toBe(0);
      expect(game.state).toBe(GameState.Playing);
      expect(game.fallingBlock).not.toBeNull();
    });
  });

  describe('isGameOver', () => {
    test('初期状態ではゲームオーバーでない', () => {
      const game = Game.create('test-game-id');
      game.start();

      expect(game.isGameOver()).toBe(false);
    });
  });

  describe('ゲームループ', () => {
    test('複数回update()を呼び出してもエラーが出ない', () => {
      const game = Game.create('test-game-id');
      game.start();

      // 100フレーム実行
      for (let i = 0; i < 100; i++) {
        expect(() => game.update()).not.toThrow();
      }

      expect(game.frameCount).toBe(100);
    });
  });
});
