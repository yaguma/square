import { describe, test, expect } from 'vitest';
import { GameState } from '@domain/models/value-objects/GameState';

describe('GameState', () => {
  describe('値の確認', () => {
    test('Playingが定義されている', () => {
      expect(GameState.Playing).toBe('playing');
    });

    test('Pausedが定義されている', () => {
      expect(GameState.Paused).toBe('paused');
    });

    test('GameOverが定義されている', () => {
      expect(GameState.GameOver).toBe('gameOver');
    });
  });

  describe('型チェック', () => {
    test('GameState型の変数に値を代入できる', () => {
      let state: GameState;

      state = GameState.Playing;
      expect(state).toBe('playing');

      state = GameState.Paused;
      expect(state).toBe('paused');

      state = GameState.GameOver;
      expect(state).toBe('gameOver');
    });
  });

  describe('等価性', () => {
    test('同じ状態は等しい', () => {
      expect(GameState.Playing).toBe(GameState.Playing);
      expect(GameState.Paused).toBe(GameState.Paused);
      expect(GameState.GameOver).toBe(GameState.GameOver);
    });

    test('異なる状態は等しくない', () => {
      expect(GameState.Playing).not.toBe(GameState.Paused);
      expect(GameState.Playing).not.toBe(GameState.GameOver);
      expect(GameState.Paused).not.toBe(GameState.GameOver);
    });
  });
});
