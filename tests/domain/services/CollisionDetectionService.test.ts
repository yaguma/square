import { describe, test, expect } from 'vitest';
import { CollisionDetectionService } from '@domain/services/CollisionDetectionService';
import { Field } from '@domain/models/entities/Field';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

describe('CollisionDetectionService', () => {
  const service = new CollisionDetectionService();

  describe('canPlaceBlock', () => {
    test('空のフィールドには配置できる', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]];

      const result = service.canPlaceBlock(position, blocks, field);
      expect(result).toBe(true);
    });

    test('範囲外には配置できない', () => {
      const field = Field.create();
      const position = Position.create(7, 0); // 右端
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]]; // 2x2なので範囲外に出る

      const result = service.canPlaceBlock(position, blocks, field);
      expect(result).toBe(false);
    });

    test('既存のブロックがある位置には配置できない', () => {
      const field = Field.create();
      field.placeBlock(Position.create(3, 5), Block.create(Color.RED));

      const position = Position.create(2, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [null, null]];

      const result = service.canPlaceBlock(position, blocks, field);
      expect(result).toBe(false); // (3,5)に衝突
    });

    test('nullのブロックは衝突判定に含まれない', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, null], [null, null]]; // 1つだけブロック

      const result = service.canPlaceBlock(position, blocks, field);
      expect(result).toBe(true);
    });
  });

  describe('isColliding', () => {
    test('他のブロックと衝突している場合はtrueを返す', () => {
      const field = Field.create();
      field.placeBlock(Position.create(3, 5), Block.create(Color.RED));

      const position = Position.create(3, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, null], [null, null]];

      const result = service.isColliding(position, blocks, field);
      expect(result).toBe(true);
    });

    test('衝突していない場合はfalseを返す', () => {
      const field = Field.create();
      const position = Position.create(3, 5);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, null], [null, null]];

      const result = service.isColliding(position, blocks, field);
      expect(result).toBe(false);
    });
  });

  describe('isOutOfBounds', () => {
    test('範囲内の場合はfalseを返す', () => {
      const position = Position.create(0, 0);
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]];

      const result = service.isOutOfBounds(position, blocks, 8, 20);
      expect(result).toBe(false);
    });

    test('範囲外の場合はtrueを返す', () => {
      const position = Position.create(7, 0); // 右端
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]];

      const result = service.isOutOfBounds(position, blocks, 8, 20);
      expect(result).toBe(true); // x=7,8で範囲外
    });

    test('下端を超える場合はtrueを返す', () => {
      const position = Position.create(0, 19); // 下端
      const blue = Block.create(Color.BLUE);
      const blocks = [[blue, blue], [blue, blue]];

      const result = service.isOutOfBounds(position, blocks, 8, 20);
      expect(result).toBe(true); // y=19,20で範囲外
    });
  });
});
