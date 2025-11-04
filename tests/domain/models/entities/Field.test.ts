import { describe, test, expect } from 'vitest';
import { Field, FIELD_WIDTH, FIELD_HEIGHT } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('Field', () => {
  describe('create', () => {
    test('デフォルトサイズ(8x20)でフィールドを作成できる', () => {
      const field = Field.create();
      expect(field.width).toBe(FIELD_WIDTH);
      expect(field.height).toBe(FIELD_HEIGHT);
    });

    test('すべてのマスが空の状態で作成される', () => {
      const field = Field.create();
      for (let y = 0; y < FIELD_HEIGHT; y++) {
        for (let x = 0; x < FIELD_WIDTH; x++) {
          expect(field.isEmpty(Position.create(x, y))).toBe(true);
        }
      }
    });
  });

  describe('placeBlock', () => {
    test('指定位置にブロックを配置できる', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const block = Block.create(Color.BLUE);

      field.placeBlock(position, block);

      expect(field.getBlock(position)).toBe(block);
      expect(field.isEmpty(position)).toBe(false);
    });

    test('既にブロックがある位置に配置しようとするとエラー', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const block = Block.create(Color.BLUE);

      field.placeBlock(position, block);
      expect(() => field.placeBlock(position, block))
        .toThrow('Position already occupied');
    });

    test('無効な位置に配置しようとするとエラー', () => {
      const field = Field.create();
      const position = Position.create(10, 5); // 範囲外
      const block = Block.create(Color.BLUE);

      expect(() => field.placeBlock(position, block))
        .toThrow('Invalid position');
    });
  });

  describe('removeBlock', () => {
    test('指定位置のブロックを削除できる', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const block = Block.create(Color.BLUE);

      field.placeBlock(position, block);
      field.removeBlock(position);

      expect(field.isEmpty(position)).toBe(true);
    });

    test('空の位置を削除してもエラーにならない', () => {
      const field = Field.create();
      const position = Position.create(3, 5);

      expect(() => field.removeBlock(position)).not.toThrow();
    });
  });

  describe('getBlock', () => {
    test('指定位置のブロックを取得できる', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const block = Block.create(Color.RED);

      field.placeBlock(position, block);
      expect(field.getBlock(position)).toBe(block);
    });

    test('空の位置はnullを返す', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      expect(field.getBlock(position)).toBeNull();
    });

    test('範囲外の位置はnullを返す', () => {
      const field = Field.create();
      const position = Position.create(100, 100);
      expect(field.getBlock(position)).toBeNull();
    });
  });

  describe('isEmpty', () => {
    test('ブロックがない位置はtrueを返す', () => {
      const field = Field.create();
      expect(field.isEmpty(Position.create(0, 0))).toBe(true);
    });

    test('ブロックがある位置はfalseを返す', () => {
      const field = Field.create();
      const position = Position.create(0, 0);
      field.placeBlock(position, Block.create(Color.BLUE));
      expect(field.isEmpty(position)).toBe(false);
    });
  });

  describe('isValidPosition', () => {
    test('有効な位置はtrueを返す', () => {
      const field = Field.create();
      expect(field.isValidPosition(Position.create(0, 0))).toBe(true);
      expect(field.isValidPosition(Position.create(7, 19))).toBe(true);
    });

    test('範囲外の位置はfalseを返す', () => {
      const field = Field.create();
      // 上限を超える値のみテスト（Position.createは負の値を受け付けない）
      expect(field.isValidPosition(Position.create(8, 0))).toBe(false);
      expect(field.isValidPosition(Position.create(0, 20))).toBe(false);
      expect(field.isValidPosition(Position.create(10, 10))).toBe(false);
    });
  });

  describe('hasBlockInTopRow', () => {
    test('最上段にブロックがない場合はfalseを返す', () => {
      const field = Field.create();
      expect(field.hasBlockInTopRow()).toBe(false);
    });

    test('最上段にブロックがある場合はtrueを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
      expect(field.hasBlockInTopRow()).toBe(true);
    });

    test('最上段以外にブロックがあってもfalseを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 1), Block.create(Color.BLUE));
      expect(field.hasBlockInTopRow()).toBe(false);
    });
  });

  describe('clear', () => {
    test('フィールドをクリアできる', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));
      field.placeBlock(Position.create(1, 1), Block.create(Color.RED));

      field.clear();

      expect(field.isEmpty(Position.create(0, 0))).toBe(true);
      expect(field.isEmpty(Position.create(1, 1))).toBe(true);
    });
  });

  describe('grid getter', () => {
    test('グリッドのコピーを返す（不変性）', () => {
      const field = Field.create();
      field.placeBlock(Position.create(0, 0), Block.create(Color.BLUE));

      const grid1 = field.grid;
      const grid2 = field.grid;

      // 別のインスタンスである
      expect(grid1).not.toBe(grid2);
    });
  });
});
