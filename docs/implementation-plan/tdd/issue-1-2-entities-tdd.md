# [Phase 1-2] エンティティの実装（TDD）

## 概要

ドメイン層のエンティティ（Entity）をTDD（テスト駆動開発）で実装します。エンティティは一意の識別子を持ち、ライフサイクルを通じて状態が変化するオブジェクトです。

**TDDの原則**: 🔴 Red → 🟢 Green → 🔵 Refactor

## 参照ドキュメント

- `docs/design/entities-detailed-design.md`
- `docs/design/integration-design.md`

## 実装対象（全3つ）

### 実装順序（依存関係順）

1. **Field**（ゲームフィールド）- 他のエンティティの基盤
2. **FallingBlock**（落下ブロック）- Fieldに依存
3. **Game**（ゲーム）- Field, FallingBlockに依存

---

## 1. Field（ゲームフィールド）のTDD実装

### 🔴 Red: テストを先に書く（所要時間: 1時間）

**ファイル**: `tests/domain/models/entities/Field.test.ts`

```typescript
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
      expect(field.isValidPosition(Position.create(-1, 0))).toBe(false);
      expect(field.isValidPosition(Position.create(8, 0))).toBe(false);
      expect(field.isValidPosition(Position.create(0, 20))).toBe(false);
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
```

**実行**: `npm test Field.test.ts`
**期待結果**: すべてのテストが失敗 ❌

---

### 🟢 Green: 実装してテストを通す（所要時間: 2時間）

**ファイル**: `src/domain/models/entities/Field.ts`

詳細な実装は `docs/design/entities-detailed-design.md` の実装例を参照してください。

**実装のポイント**:
- `_grid`は2次元配列 `(Block | null)[][]`
- `placeBlock`ではバリデーションを実施
- 不変条件を守る

**実行**: `npm test Field.test.ts`
**期待結果**: すべてのテストが成功 ✅

---

### 🔵 Refactor: リファクタリング（所要時間: 30分）

- エラーメッセージの改善
- ヘルパーメソッドの抽出

**Fieldの完了**: ✅

---

## 2. FallingBlock（落下ブロック）のTDD実装

### 🔴 Red: テストを先に書く（所要時間: 1時間）

**ファイル**: `tests/domain/models/entities/FallingBlock.test.ts`

```typescript
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
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 2.5時間）

**ファイル**: `src/domain/models/entities/FallingBlock.ts`

詳細な実装は `docs/design/entities-detailed-design.md` を参照してください。

**実行**: テストが成功 ✅

**FallingBlockの完了**: ✅

---

## 3. Game（ゲーム）のTDD実装

### 重要な注意事項

**Phase 1-2での実装範囲（スタブ実装）**:
1. 基本的なゲーム状態管理
2. フレームカウントの管理
3. ブロックをフィールドに固定する基本処理
4. ゲームオーバー判定

**Phase 1-3で追加実装する範囲**:
- 消去可能な矩形の検索（BlockMatchingService）
- ブロック削除と連鎖処理（BlockRemovalService）
- 自由落下（BlockFallService）
- スコア加算

---

### 🔴 Red: テストを先に書く（所要時間: 1.5時間）

**ファイル**: `tests/domain/models/entities/Game.test.ts`

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
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
  });

  describe('enableFastFall and disableFastFall', () => {
    test('高速落下を有効化できる', () => {
      const game = Game.create('test-game-id');
      game.start();

      game.enableFastFall();
      // 内部的な落下速度が変更されていることを確認
      // （privateなので直接確認できないが、振る舞いで検証）
    });

    test('高速落下を無効化できる', () => {
      const game = Game.create('test-game-id');
      game.start();
      game.enableFastFall();

      game.disableFastFall();
      // 通常速度に戻ることを確認
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
  });

  describe('isGameOver', () => {
    test('最上段にブロックがあるとゲームオーバー', () => {
      const game = Game.create('test-game-id');
      game.start();

      // 最上段にブロックを配置（テスト用のヘルパーが必要）
      // この部分は実際の実装に応じて調整
    });
  });
});
```

**実行**: テストが失敗することを確認 ❌

---

### 🟢 Green: 実装（所要時間: 4時間）

**ファイル**: `src/domain/models/entities/Game.ts`

詳細な実装は `docs/design/entities-detailed-design.md` を参照してください。

**重要**: `landBlock()`メソッドは基本的な実装のみ行い、消去判定や連鎖処理は Phase 1-3 で実装します。

**実行**: テストが成功 ✅

**Gameの完了**: ✅（Phase 1-2の範囲）

---

## 完了条件

- [ ] Field, FallingBlock, Gameの3つのエンティティが実装されている
- [ ] すべてのメソッドが正しく動作する
- [ ] すべての単体テストが成功する（100% pass）
- [ ] テストカバレッジが85%以上
- [ ] TypeScriptのコンパイルエラーがない
- [ ] ESLintの警告がない
- [ ] JSDocドキュメントコメントが記載されている
- [ ] 不変条件がすべて守られている
- [ ] Game.landBlock()の完全な実装はPhase 1-3で行うことを明記

**注意**: `Game.landBlock()`の完全な実装はPhase 1-3（ドメインサービス）完了後に行います。

---

## TDDサイクル数

| エンティティ | サイクル数 | 所要時間 |
|------------|-----------|---------|
| Field | 3-4サイクル | 4時間 |
| FallingBlock | 3-4サイクル | 4時間 |
| Game（基本機能） | 4-5サイクル | 6時間 |
| **合計** | **10-13サイクル** | **14時間** |

**見積もり**: 5日（1日2-3時間の作業）

---

## 依存関係

**前提**:
- Issue 1.1: 値オブジェクトの実装（TDD）

**後続のタスク**:
- Issue 1.3: ドメインサービスの実装（TDD）

---

## 作業の進め方

### 1日目
- Fieldのテスト作成
- Fieldの実装

### 2日目
- Fieldのリファクタリング
- FallingBlockのテスト作成

### 3日目
- FallingBlockの実装とリファクタリング

### 4日目
- Gameのテスト作成
- Game の基本実装

### 5日目
- Gameの実装完了
- 全体のリファクタリング

---

## 参考資料

- [TDD実装計画](./README.md)
- [エンティティ詳細設計](../../design/entities-detailed-design.md)
- [統合設計書](../../design/integration-design.md)
