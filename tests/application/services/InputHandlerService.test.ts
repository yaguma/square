import { describe, test, expect, beforeEach, vi } from 'vitest';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { GameRepository } from '@domain/repositories/GameRepository';

describe('InputHandlerService', () => {
  let service: InputHandlerService;
  let gameApplicationService: GameApplicationService;
  let repository: GameRepository;
  let gameId: string;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
    gameApplicationService = new GameApplicationService(repository);
    service = new InputHandlerService(gameApplicationService);

    // テスト用のゲームを開始
    const gameDto = gameApplicationService.startNewGame();
    gameId = gameDto.gameId;
  });

  describe('handleKeyDown', () => {
    test('ArrowLeftキーでブロックを左に移動', () => {
      const spy = vi.spyOn(gameApplicationService, 'moveBlockLeft');

      service.handleKeyDown('ArrowLeft', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('ArrowRightキーでブロックを右に移動', () => {
      const spy = vi.spyOn(gameApplicationService, 'moveBlockRight');

      service.handleKeyDown('ArrowRight', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('ArrowUpキーでブロックを時計回りに回転', () => {
      const spy = vi.spyOn(gameApplicationService, 'rotateBlockClockwise');

      service.handleKeyDown('ArrowUp', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('zキーでブロックを時計回りに回転', () => {
      const spy = vi.spyOn(gameApplicationService, 'rotateBlockClockwise');

      service.handleKeyDown('z', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('xキーでブロックを反時計回りに回転', () => {
      const spy = vi.spyOn(gameApplicationService, 'rotateBlockCounterClockwise');

      service.handleKeyDown('x', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('Controlキーでブロックを反時計回りに回転', () => {
      const spy = vi.spyOn(gameApplicationService, 'rotateBlockCounterClockwise');

      service.handleKeyDown('Control', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('ArrowDownキーで高速落下を有効化', () => {
      const spy = vi.spyOn(gameApplicationService, 'accelerateFall');

      service.handleKeyDown('ArrowDown', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('Spaceキーで即座落下', () => {
      const spy = vi.spyOn(gameApplicationService, 'dropInstantly');

      service.handleKeyDown(' ', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('pキーでゲームを一時停止', () => {
      const spy = vi.spyOn(gameApplicationService, 'pauseGame');

      service.handleKeyDown('p', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('pキーで一時停止中のゲームを再開', () => {
      // まず一時停止
      gameApplicationService.pauseGame(gameId);

      const spy = vi.spyOn(gameApplicationService, 'resumeGame');

      service.handleKeyDown('p', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('rキーでゲームをリスタート', () => {
      const spy = vi.spyOn(gameApplicationService, 'restartGame');

      service.handleKeyDown('r', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('未定義のキーは無視される', () => {
      const moveLeftSpy = vi.spyOn(gameApplicationService, 'moveBlockLeft');
      const moveRightSpy = vi.spyOn(gameApplicationService, 'moveBlockRight');

      service.handleKeyDown('a', gameId);

      expect(moveLeftSpy).not.toHaveBeenCalled();
      expect(moveRightSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleKeyUp', () => {
    test('ArrowDownキーの解放で高速落下を無効化', () => {
      const spy = vi.spyOn(gameApplicationService, 'disableFastFall');

      service.handleKeyUp('ArrowDown', gameId);

      expect(spy).toHaveBeenCalledWith(gameId);
    });

    test('その他のキーの解放は無視される', () => {
      const spy = vi.spyOn(gameApplicationService, 'disableFastFall');

      service.handleKeyUp('ArrowLeft', gameId);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('canAcceptInput', () => {
    test('初回の入力は常に受け付ける', () => {
      expect(service.canAcceptInput('left', 0)).toBe(true);
    });

    test('クールダウン期間内の入力は受け付けない', () => {
      service.canAcceptInput('left', 0);
      // updateLastInputFrameを呼ぶために実際に入力処理を行う必要がある
      // ここでは直接canAcceptInputを連続で呼ぶ
      expect(service.canAcceptInput('left', 1)).toBe(false);
      expect(service.canAcceptInput('left', 2)).toBe(false);
      expect(service.canAcceptInput('left', 3)).toBe(false);
    });

    test('クールダウン期間経過後は入力を受け付ける', () => {
      service.canAcceptInput('left', 0);

      // 4フレーム以上経過
      expect(service.canAcceptInput('left', 4)).toBe(true);
      expect(service.canAcceptInput('left', 10)).toBe(true);
    });

    test('異なるキーは独立して管理される', () => {
      service.canAcceptInput('left', 0);

      // 別のキーは受け付ける
      expect(service.canAcceptInput('right', 0)).toBe(true);
    });
  });
});
