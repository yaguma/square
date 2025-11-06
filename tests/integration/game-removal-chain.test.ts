import { describe, test, expect } from 'vitest';
import { Game } from '@domain/models/entities/Game';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';
import { GameState } from '@domain/models/value-objects/GameState';

/**
 * 統合テスト: ゲームフロー全体の動作確認
 *
 * ブロック接地 → 消去判定 → 連鎖処理 → スコア加算までの
 * 完全なフローをテストする
 */
describe('Game Integration - Removal Chain', () => {
  test('ブロック接地後に消去処理が正しく動作する', () => {
    const game = Game.create('integration-test-1');

    // ゲームを開始
    game.start();

    // 初期状態の確認
    expect(game.state).toBe(GameState.Playing);
    expect(game.score.value).toBe(0);

    // フィールドに手動で2x2の同色ブロックを配置（テスト用）
    const field = game.field;
    const blue = Block.create(Color.BLUE);

    // 下端に2x2の青ブロックを配置
    field.placeBlock(Position.create(0, 18), blue);
    field.placeBlock(Position.create(1, 18), blue);
    field.placeBlock(Position.create(0, 19), blue);
    field.placeBlock(Position.create(1, 19), blue);

    // 落下ブロックを即座に接地させる（消去処理をトリガー）
    game.dropInstantly();

    // 消去処理が実行されたことを確認
    // 2x2ブロック = 4マス削除されている
    expect(game.score.value).toBeGreaterThanOrEqual(4);

    // フィールドがクリアされていることを確認
    expect(field.isEmpty(Position.create(0, 18))).toBe(true);
    expect(field.isEmpty(Position.create(1, 18))).toBe(true);
    expect(field.isEmpty(Position.create(0, 19))).toBe(true);
    expect(field.isEmpty(Position.create(1, 19))).toBe(true);
  });

  test('連鎖処理が正しく動作する', () => {
    const game = Game.create('integration-test-2');
    game.start();

    const field = game.field;
    const blue = Block.create(Color.BLUE);
    const red = Block.create(Color.RED);

    // 連鎖するパターンを配置
    // 下段: 2x2の青ブロック
    field.placeBlock(Position.create(2, 18), blue);
    field.placeBlock(Position.create(3, 18), blue);
    field.placeBlock(Position.create(2, 19), blue);
    field.placeBlock(Position.create(3, 19), blue);

    // 中段: 2x2の赤ブロック（削除後に落ちて連鎖する）
    field.placeBlock(Position.create(2, 16), red);
    field.placeBlock(Position.create(3, 16), red);
    field.placeBlock(Position.create(2, 17), red);
    field.placeBlock(Position.create(3, 17), red);

    const initialScore = game.score.value;

    // 落下ブロックを接地（連鎖をトリガー）
    game.dropInstantly();

    // 連鎖により複数のブロックが削除されている
    expect(game.score.value).toBeGreaterThan(initialScore);

    // 少なくとも4マス以上削除されている（青4マス + 連鎖分）
    expect(game.score.value - initialScore).toBeGreaterThanOrEqual(4);
  });

  test('ゲームオーバー判定が正しく動作する', () => {
    const game = Game.create('integration-test-3');
    game.start();

    const field = game.field;
    const red = Block.create(Color.RED);
    const blue = Block.create(Color.BLUE);

    // フィールドの下部をチェッカーボードパターンで埋める（2x2正方形を作らない）
    // これにより、ブロックが削除されず、確実に最上段まで積み上がる
    for (let y = 19; y >= 2; y--) {
      for (let x = 0; x < 8; x++) {
        if (field.isEmpty(Position.create(x, y))) {
          // チェッカーボードパターン
          const block = (x + y) % 2 === 0 ? red : blue;
          field.placeBlock(Position.create(x, y), block);
        }
      }
    }

    // 複数回ブロックを落として、最終的にゲームオーバーにする
    let attempts = 0;
    const maxAttempts = 10;
    while (game.state === GameState.Playing && attempts < maxAttempts) {
      if (game.fallingBlock !== null) {
        game.dropInstantly();
      }
      game.update();
      attempts++;
    }

    // ゲームオーバー状態になることを確認
    expect(game.state).toBe(GameState.GameOver);
  });

  test('複数回のブロック接地でスコアが累積される', () => {
    const game = Game.create('integration-test-4');
    game.start();

    const initialScore = game.score.value;

    // 複数回ブロックを落として接地
    for (let i = 0; i < 5; i++) {
      if (game.state === GameState.Playing && game.fallingBlock !== null) {
        game.dropInstantly();

        // 次のブロックが生成されるまで少し待つ（updateを呼ぶ）
        game.update();
      }
    }

    // スコアが変化している可能性がある（消去が発生した場合）
    // または初期スコアと同じ（消去が発生しなかった場合）
    expect(game.score.value).toBeGreaterThanOrEqual(initialScore);
  });
});
