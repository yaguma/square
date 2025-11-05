import { describe, test, expect, beforeEach } from 'vitest';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { GameRepository } from '@domain/repositories/GameRepository';

describe('GameApplicationService', () => {
  let service: GameApplicationService;
  let repository: GameRepository;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
    service = new GameApplicationService(repository);
  });

  describe('startNewGame', () => {
    test('新しいゲームを開始できる', () => {
      const gameDto = service.startNewGame();

      expect(gameDto.gameId).toBeDefined();
      expect(typeof gameDto.gameId).toBe('string');
      expect(gameDto.state).toBe('playing');
      expect(gameDto.score).toBe(0);
      expect(gameDto.field).toBeDefined();
      expect(gameDto.field.length).toBe(20); // 高さ20
      expect(gameDto.field[0].length).toBe(8); // 幅8
      expect(gameDto.fallingBlock).not.toBeNull();
      expect(gameDto.nextBlock).toBeDefined();
    });

    test('DTOのフィールドが正しい構造である', () => {
      const gameDto = service.startNewGame();

      // フィールドの各セルはnullまたは文字列
      for (let y = 0; y < gameDto.field.length; y++) {
        for (let x = 0; x < gameDto.field[y].length; x++) {
          const cell = gameDto.field[y][x];
          expect(cell === null || typeof cell === 'string').toBe(true);
        }
      }
    });

    test('DTOの落下ブロックが正しい構造である', () => {
      const gameDto = service.startNewGame();

      expect(gameDto.fallingBlock).not.toBeNull();
      expect(gameDto.fallingBlock!.pattern).toBeDefined();
      expect(gameDto.fallingBlock!.pattern.length).toBe(2);
      expect(gameDto.fallingBlock!.pattern[0].length).toBe(2);
      expect(gameDto.fallingBlock!.position).toBeDefined();
      expect(typeof gameDto.fallingBlock!.position.x).toBe('number');
      expect(typeof gameDto.fallingBlock!.position.y).toBe('number');
      expect(typeof gameDto.fallingBlock!.rotation).toBe('number');
    });
  });

  describe('pauseGame', () => {
    test('ゲームを一時停止できる', () => {
      const gameDto = service.startNewGame();

      service.pauseGame(gameDto.gameId);

      const updatedDto = service.getGameState(gameDto.gameId);
      expect(updatedDto.state).toBe('paused');
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.pauseGame('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('resumeGame', () => {
    test('ゲームを再開できる', () => {
      const gameDto = service.startNewGame();
      service.pauseGame(gameDto.gameId);

      service.resumeGame(gameDto.gameId);

      const updatedDto = service.getGameState(gameDto.gameId);
      expect(updatedDto.state).toBe('playing');
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.resumeGame('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('restartGame', () => {
    test('ゲームをリスタートできる', () => {
      const gameDto = service.startNewGame();

      // 何回かフレームを更新してスコアやフレームカウントを変更
      for (let i = 0; i < 10; i++) {
        service.updateFrame(gameDto.gameId);
      }

      const restartedDto = service.restartGame(gameDto.gameId);

      expect(restartedDto.gameId).toBe(gameDto.gameId);
      expect(restartedDto.state).toBe('playing');
      expect(restartedDto.score).toBe(0);
      expect(restartedDto.fallingBlock).not.toBeNull();
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.restartGame('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('moveBlockLeft', () => {
    test('ブロックを左に移動できる', () => {
      const gameDto = service.startNewGame();
      const initialX = gameDto.fallingBlock!.position.x;

      service.moveBlockLeft(gameDto.gameId);

      const updatedDto = service.getGameState(gameDto.gameId);
      expect(updatedDto.fallingBlock!.position.x).toBe(initialX - 1);
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.moveBlockLeft('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('moveBlockRight', () => {
    test('ブロックを右に移動できる', () => {
      const gameDto = service.startNewGame();
      const initialX = gameDto.fallingBlock!.position.x;

      service.moveBlockRight(gameDto.gameId);

      const updatedDto = service.getGameState(gameDto.gameId);
      expect(updatedDto.fallingBlock!.position.x).toBe(initialX + 1);
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.moveBlockRight('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('rotateBlockClockwise', () => {
    test('ブロックを時計回りに回転できる', () => {
      const gameDto = service.startNewGame();
      const initialRotation = gameDto.fallingBlock!.rotation;

      service.rotateBlockClockwise(gameDto.gameId);

      const updatedDto = service.getGameState(gameDto.gameId);
      expect(updatedDto.fallingBlock!.rotation).toBe((initialRotation + 90) % 360);
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.rotateBlockClockwise('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('rotateBlockCounterClockwise', () => {
    test('ブロックを反時計回りに回転できる', () => {
      const gameDto = service.startNewGame();
      const initialRotation = gameDto.fallingBlock!.rotation;

      service.rotateBlockCounterClockwise(gameDto.gameId);

      const updatedDto = service.getGameState(gameDto.gameId);
      const expectedRotation = (initialRotation - 90 + 360) % 360;
      expect(updatedDto.fallingBlock!.rotation).toBe(expectedRotation);
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.rotateBlockCounterClockwise('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('accelerateFall', () => {
    test('高速落下を有効化できる', () => {
      const gameDto = service.startNewGame();

      // エラーがスローされないことを確認
      expect(() => service.accelerateFall(gameDto.gameId)).not.toThrow();

      const updatedDto = service.getGameState(gameDto.gameId);
      expect(updatedDto.state).toBe('playing');
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.accelerateFall('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('disableFastFall', () => {
    test('高速落下を無効化できる', () => {
      const gameDto = service.startNewGame();
      service.accelerateFall(gameDto.gameId);

      // エラーがスローされないことを確認
      expect(() => service.disableFastFall(gameDto.gameId)).not.toThrow();

      const updatedDto = service.getGameState(gameDto.gameId);
      expect(updatedDto.state).toBe('playing');
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.disableFastFall('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('dropInstantly', () => {
    test('即座に落下できる', () => {
      const gameDto = service.startNewGame();

      // エラーがスローされないことを確認
      expect(() => service.dropInstantly(gameDto.gameId)).not.toThrow();

      const updatedDto = service.getGameState(gameDto.gameId);
      // dropInstantly後、ブロックは固定されて新しいブロックが生成される
      expect(updatedDto.state).toBe('playing');
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.dropInstantly('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('updateFrame', () => {
    test('フレーム更新が正しく動作する', () => {
      const gameDto = service.startNewGame();

      const updatedDto = service.updateFrame(gameDto.gameId);

      expect(updatedDto).toBeDefined();
      expect(updatedDto.gameId).toBe(gameDto.gameId);
      expect(updatedDto.state).toBe('playing');
    });

    test('複数回フレーム更新してもエラーが出ない', () => {
      const gameDto = service.startNewGame();

      for (let i = 0; i < 100; i++) {
        expect(() => service.updateFrame(gameDto.gameId)).not.toThrow();
      }
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.updateFrame('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('getGameState', () => {
    test('ゲーム状態を取得できる', () => {
      const gameDto = service.startNewGame();

      const state = service.getGameState(gameDto.gameId);

      expect(state.gameId).toBe(gameDto.gameId);
      expect(state.state).toBe('playing');
      expect(state.score).toBeDefined();
      expect(state.field).toBeDefined();
      expect(state.fallingBlock).toBeDefined();
      expect(state.nextBlock).toBeDefined();
    });

    test('存在しないゲームIDでエラーがスローされる', () => {
      expect(() => service.getGameState('non-existent-id')).toThrow('Game not found');
    });
  });

  describe('DTO変換', () => {
    test('ブロックパターンが正しく文字列配列に変換される', () => {
      const gameDto = service.startNewGame();

      // nextBlockの検証
      expect(gameDto.nextBlock.length).toBe(2);
      expect(gameDto.nextBlock[0].length).toBe(2);

      // 各セルは色を表す文字列
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const cell = gameDto.nextBlock[y][x];
          expect(typeof cell).toBe('string');
          // 'blue', 'red', 'yellow', 'empty' のいずれか
          expect(['blue', 'red', 'yellow', 'empty']).toContain(cell);
        }
      }
    });

    test('フィールドが正しく変換される', () => {
      const gameDto = service.startNewGame();

      // フィールドは20行×8列
      expect(gameDto.field.length).toBe(20);
      gameDto.field.forEach(row => {
        expect(row.length).toBe(8);
      });
    });
  });
});
