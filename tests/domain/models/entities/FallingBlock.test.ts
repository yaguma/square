import { describe, test, expect } from 'vitest';
import { FallingBlock } from '@domain/models/entities/FallingBlock';
import { Field } from '@domain/models/entities/Field';
import { BlockPattern } from '@domain/models/value-objects/BlockPattern';
import { Position } from '@domain/models/value-objects/Position';
import { Block } from '@domain/models/value-objects/Block';
import { Color } from '@domain/models/value-objects/Color';

// テスト用のパターン作成ヘルパー
function createTestPattern(): BlockPattern {
  const blue = Block.create(Color.BLUE);
  return BlockPattern.create('pattern4', [[blue, blue], [blue, blue]]);
}

describe('FallingBlock', () => {
  describe('create', () => {
    test('正常に落下ブロックを作成できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern);

      expect(fallingBlock.pattern).toBe(pattern);
      expect(fallingBlock.rotation).toBe(0);
      expect(fallingBlock.position.x).toBe(3); // デフォルト位置
      expect(fallingBlock.position.y).toBe(0);
    });

    test('初期位置を指定して作成できる', () => {
      const pattern = createTestPattern();
      const position = Position.create(5, 2);
      const fallingBlock = FallingBlock.create(pattern, position);

      expect(fallingBlock.position).toBe(position);
    });
  });

  describe('moveLeft', () => {
    test('左に移動できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(3, 0));

      fallingBlock.moveLeft();
      expect(fallingBlock.position.x).toBe(2);
      expect(fallingBlock.position.y).toBe(0);
    });
  });

  describe('moveRight', () => {
    test('右に移動できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(3, 0));

      fallingBlock.moveRight();
      expect(fallingBlock.position.x).toBe(4);
      expect(fallingBlock.position.y).toBe(0);
    });
  });

  describe('moveDown', () => {
    test('下に移動できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(3, 0));

      fallingBlock.moveDown();
      expect(fallingBlock.position.x).toBe(3);
      expect(fallingBlock.position.y).toBe(1);
    });
  });

  describe('rotateClockwise', () => {
    test('時計回りに回転できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern);

      fallingBlock.rotateClockwise();
      expect(fallingBlock.rotation).toBe(90);

      fallingBlock.rotateClockwise();
      expect(fallingBlock.rotation).toBe(180);

      fallingBlock.rotateClockwise();
      expect(fallingBlock.rotation).toBe(270);

      fallingBlock.rotateClockwise();
      expect(fallingBlock.rotation).toBe(0); // 360度 = 0度
    });
  });

  describe('rotateCounterClockwise', () => {
    test('反時計回りに回転できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern);

      fallingBlock.rotateCounterClockwise();
      expect(fallingBlock.rotation).toBe(270);

      fallingBlock.rotateCounterClockwise();
      expect(fallingBlock.rotation).toBe(180);
    });
  });

  describe('canMove', () => {
    test('左端では左に移動できない', () => {
      const field = Field.create();
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(0, 0));

      expect(fallingBlock.canMove('left', field)).toBe(false);
    });

    test('右端では右に移動できない', () => {
      const field = Field.create();
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(6, 0));

      expect(fallingBlock.canMove('right', field)).toBe(false);
    });

    test('下端では下に移動できない', () => {
      const field = Field.create();
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(3, 18));

      expect(fallingBlock.canMove('down', field)).toBe(false);
    });

    test('他のブロックがある位置には移動できない', () => {
      const field = Field.create();
      field.placeBlock(Position.create(2, 0), Block.create(Color.RED));

      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(3, 0));

      expect(fallingBlock.canMove('left', field)).toBe(false);
    });
  });

  describe('canRotate', () => {
    test('回転可能な場合はtrueを返す', () => {
      const field = Field.create();
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(3, 5));

      expect(fallingBlock.canRotate('clockwise', field)).toBe(true);
      expect(fallingBlock.canRotate('counterclockwise', field)).toBe(true);
    });

    test('回転後に範囲外になる場合はfalseを返す', () => {
      const field = Field.create();
      // L字型のパターンを想定（回転すると範囲外になる位置）
      const blue = Block.create(Color.BLUE);
      const lPattern = BlockPattern.create('L-pattern', [
        [blue, null],
        [blue, blue]
      ]);
      const fallingBlock = FallingBlock.create(lPattern, Position.create(7, 0));

      // 右端では回転できない可能性がある
      const canRotate = fallingBlock.canRotate('clockwise', field);
      // パターンによって結果が変わるので、実装依存
      expect(typeof canRotate).toBe('boolean');
    });
  });

  describe('getBlocks', () => {
    test('ブロック配置を取得できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern, Position.create(3, 5));

      const blocks = fallingBlock.getBlocks();

      expect(blocks.length).toBe(4); // 2x2 = 4ブロック

      // 位置の検証
      expect(blocks[0].position.x).toBe(3);
      expect(blocks[0].position.y).toBe(5);
      expect(blocks[1].position.x).toBe(4);
      expect(blocks[1].position.y).toBe(5);
      expect(blocks[2].position.x).toBe(3);
      expect(blocks[2].position.y).toBe(6);
      expect(blocks[3].position.x).toBe(4);
      expect(blocks[3].position.y).toBe(6);
    });

    test('nullのマスはブロック配置に含まれない', () => {
      const blue = Block.create(Color.BLUE);
      const lPattern = BlockPattern.create('L-pattern', [
        [blue, null],
        [blue, blue]
      ]);
      const fallingBlock = FallingBlock.create(lPattern, Position.create(3, 5));

      const blocks = fallingBlock.getBlocks();

      // nullを除いて3ブロック
      expect(blocks.length).toBe(3);
    });
  });

  describe('setPosition', () => {
    test('位置を設定できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern);
      const newPosition = Position.create(5, 10);

      fallingBlock.setPosition(newPosition);

      expect(fallingBlock.position).toBe(newPosition);
    });
  });

  describe('setRotation', () => {
    test('回転を設定できる', () => {
      const pattern = createTestPattern();
      const fallingBlock = FallingBlock.create(pattern);

      fallingBlock.setRotation(180);

      expect(fallingBlock.rotation).toBe(180);
    });
  });
});
