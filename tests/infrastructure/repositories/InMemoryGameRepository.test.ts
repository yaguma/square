import { describe, test, expect, beforeEach } from 'vitest';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { GameRepository } from '@domain/repositories/GameRepository';
import { Game } from '@domain/models/entities/Game';

describe('InMemoryGameRepository', () => {
  let repository: GameRepository;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
  });

  describe('save', () => {
    test('ゲームを保存できる', () => {
      // Arrange
      const game = Game.create('test-game-1');

      // Act
      repository.save(game);

      // Assert
      const found = repository.findById('test-game-1');
      expect(found).not.toBeNull();
      expect(found?.gameId).toBe('test-game-1');
    });

    test('同じIDのゲームを保存すると上書きされる', () => {
      // Arrange
      const game1 = Game.create('test-game-1');
      const game2 = Game.create('test-game-1');

      // Act
      repository.save(game1);
      repository.save(game2);

      // Assert
      const found = repository.findById('test-game-1');
      expect(found).not.toBeNull();
      expect(found).toBe(game2); // 最新のゲームが取得される
    });

    test('複数のゲームを保存できる', () => {
      // Arrange
      const game1 = Game.create('test-game-1');
      const game2 = Game.create('test-game-2');
      const game3 = Game.create('test-game-3');

      // Act
      repository.save(game1);
      repository.save(game2);
      repository.save(game3);

      // Assert
      expect(repository.findById('test-game-1')).toBe(game1);
      expect(repository.findById('test-game-2')).toBe(game2);
      expect(repository.findById('test-game-3')).toBe(game3);
    });
  });

  describe('findById', () => {
    test('保存されたゲームを取得できる', () => {
      // Arrange
      const game = Game.create('test-game-1');
      repository.save(game);

      // Act
      const found = repository.findById('test-game-1');

      // Assert
      expect(found).not.toBeNull();
      expect(found?.gameId).toBe('test-game-1');
    });

    test('存在しないゲームIDでnullが返る', () => {
      // Act
      const found = repository.findById('non-existent-game');

      // Assert
      expect(found).toBeNull();
    });

    test('空のリポジトリでnullが返る', () => {
      // Act
      const found = repository.findById('test-game-1');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('delete', () => {
    test('ゲームを削除できる', () => {
      // Arrange
      const game = Game.create('test-game-1');
      repository.save(game);

      // Act
      repository.delete('test-game-1');

      // Assert
      const found = repository.findById('test-game-1');
      expect(found).toBeNull();
    });

    test('存在しないゲームIDを削除してもエラーにならない', () => {
      // Act & Assert
      expect(() => repository.delete('non-existent-game')).not.toThrow();
    });

    test('削除後も他のゲームは残る', () => {
      // Arrange
      const game1 = Game.create('test-game-1');
      const game2 = Game.create('test-game-2');
      repository.save(game1);
      repository.save(game2);

      // Act
      repository.delete('test-game-1');

      // Assert
      expect(repository.findById('test-game-1')).toBeNull();
      expect(repository.findById('test-game-2')).toBe(game2);
    });
  });

  describe('clear (テスト用メソッド)', () => {
    test('すべてのゲームをクリアできる', () => {
      // Arrange
      const game1 = Game.create('test-game-1');
      const game2 = Game.create('test-game-2');
      repository.save(game1);
      repository.save(game2);

      // Act
      (repository as InMemoryGameRepository).clear();

      // Assert
      expect(repository.findById('test-game-1')).toBeNull();
      expect(repository.findById('test-game-2')).toBeNull();
    });

    test('空のリポジトリでクリアしてもエラーにならない', () => {
      // Act & Assert
      expect(() => (repository as InMemoryGameRepository).clear()).not.toThrow();
    });
  });
});
