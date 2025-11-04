import { describe, test, expect } from 'vitest';
import { Score } from '@domain/models/value-objects/Score';

describe('Score', () => {
  describe('create', () => {
    test('正常にスコアを作成できる', () => {
      const score = Score.create(100);
      expect(score.value).toBe(100);
    });

    test('0のスコアを作成できる', () => {
      const score = Score.create(0);
      expect(score.value).toBe(0);
    });

    test('大きな値のスコアを作成できる', () => {
      const score = Score.create(999999);
      expect(score.value).toBe(999999);
    });

    test('負の値でエラーをスローする', () => {
      expect(() => Score.create(-1)).toThrow('Score must be a non-negative integer');
    });

    test('小数でエラーをスローする', () => {
      expect(() => Score.create(10.5)).toThrow('Score must be a non-negative integer');
    });

    test('負の小数でエラーをスローする', () => {
      expect(() => Score.create(-10.5)).toThrow('Score must be a non-negative integer');
    });
  });

  describe('zero', () => {
    test('0のスコアを生成できる', () => {
      const score = Score.zero();
      expect(score.value).toBe(0);
    });
  });

  describe('add', () => {
    test('スコアを加算できる', () => {
      const score = Score.create(100);
      const newScore = score.add(50);
      expect(newScore.value).toBe(150);
    });

    test('元のオブジェクトは変更されない（不変性）', () => {
      const score = Score.create(100);
      score.add(50);
      expect(score.value).toBe(100);
    });

    test('0を加算できる', () => {
      const score = Score.create(100);
      const newScore = score.add(0);
      expect(newScore.value).toBe(100);
    });

    test('大きな値を加算できる', () => {
      const score = Score.create(100);
      const newScore = score.add(9900);
      expect(newScore.value).toBe(10000);
    });

    test('負の値を加算するとエラーをスローする', () => {
      const score = Score.create(100);
      expect(() => score.add(-10)).toThrow('Score must be a non-negative integer');
    });

    test('小数を加算するとエラーをスローする', () => {
      const score = Score.create(100);
      expect(() => score.add(10.5)).toThrow('Score must be a non-negative integer');
    });
  });

  describe('equals', () => {
    test('同じ値の場合にtrueを返す', () => {
      const score1 = Score.create(100);
      const score2 = Score.create(100);
      expect(score1.equals(score2)).toBe(true);
    });

    test('異なる値の場合にfalseを返す', () => {
      const score1 = Score.create(100);
      const score2 = Score.create(200);
      expect(score1.equals(score2)).toBe(false);
    });

    test('0のスコアを比較できる', () => {
      const score1 = Score.zero();
      const score2 = Score.create(0);
      expect(score1.equals(score2)).toBe(true);
    });
  });

  describe('toString', () => {
    test('文字列表現を返す', () => {
      const score = Score.create(12345);
      expect(score.toString()).toBe('Score(12345)');
    });

    test('0の文字列表現を返す', () => {
      const score = Score.zero();
      expect(score.toString()).toBe('Score(0)');
    });
  });
});
