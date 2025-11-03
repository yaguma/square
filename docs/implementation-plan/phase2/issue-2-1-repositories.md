# [Phase 2-1] リポジトリの実装

## 概要

ゲームの永続化を担当するリポジトリを実装します。

## 参照ドキュメント

- `docs/design/infrastructure-presentation-layers-detailed-design.md`
- `docs/design/integration-design.md`

## 実装対象

### 1. GameRepository（インターフェース）

**ファイル**: `src/domain/repositories/GameRepository.ts`

**メソッド**:
```typescript
export interface GameRepository {
  save(game: Game): void;
  findById(gameId: string): Game | null;
  delete(gameId: string): void;
}
```

### 2. InMemoryGameRepository（実装）

**ファイル**: `src/infrastructure/repositories/InMemoryGameRepository.ts`

**実装**:
```typescript
export class InMemoryGameRepository implements GameRepository {
  private games: Map<string, Game> = new Map();

  save(game: Game): void {
    this.games.set(game.gameId, game);
  }

  findById(gameId: string): Game | null {
    return this.games.get(gameId) || null;
  }

  delete(gameId: string): void {
    this.games.delete(gameId);
  }

  clear(): void {
    this.games.clear();
  }
}
```

## テスト

**ファイル**: `tests/infrastructure/repositories/InMemoryGameRepository.test.ts`

**テストケース**:
- ゲームを保存できる
- ゲームを取得できる
- 存在しないゲームIDでnullが返る
- ゲームを削除できる

## 完了条件

- [ ] GameRepositoryインターフェースが定義されている
- [ ] InMemoryGameRepositoryが実装されている
- [ ] すべてのテストが成功する
- [ ] TypeScriptのコンパイルエラーがない

## 見積もり

**工数**: 1日

## 依存関係

**前提**: Issue 1.2（Gameエンティティ）

**後続**: Issue 2.2（GameApplicationService）
