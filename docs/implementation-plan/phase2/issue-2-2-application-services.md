# [Phase 2-2] アプリケーションサービスの実装

## 概要

ゲームのユースケースを実行するアプリケーションサービスを実装します。

## 参照ドキュメント

- `docs/design/application-layer-detailed-design.md`
- `docs/design/integration-design.md`

## 実装対象

### 1. GameDto

**ファイル**: `src/application/dto/GameDto.ts`

```typescript
export interface GameDto {
  gameId: string;
  state: 'playing' | 'paused' | 'gameOver';
  score: number;
  field: (string | null)[][];
  fallingBlock: {
    pattern: string[][];
    position: { x: number; y: number };
    rotation: number;
  } | null;
  nextBlock: string[][];
}
```

### 2. GameApplicationService

**ファイル**: `src/application/services/GameApplicationService.ts`

**主要メソッド**:
- `startNewGame(): GameDto`
- `pauseGame(gameId: string): void`
- `resumeGame(gameId: string): void`
- `restartGame(gameId: string): GameDto`
- `moveBlockLeft(gameId: string): void`
- `moveBlockRight(gameId: string): void`
- `rotateBlockClockwise(gameId: string): void`
- `rotateBlockCounterClockwise(gameId: string): void`
- `accelerateFall(gameId: string): void`
- `disableFastFall(gameId: string): void`
- `dropInstantly(gameId: string): void`
- `updateFrame(gameId: string): GameDto`
- `getGameState(gameId: string): GameDto`

**プライベートメソッド**:
- `toDto(game: Game): GameDto` - DTOへの変換
- `convertFieldToDto(field: Field): (string | null)[][]`
- `convertFallingBlockToDto(fallingBlock: FallingBlock): {}`
- `convertBlockPatternToDto(pattern: BlockPattern): string[][]`

## テスト

**ファイル**: `tests/application/services/GameApplicationService.test.ts`

**テストケース**:
- 新しいゲームを開始できる
- ゲームを一時停止できる
- ゲームを再開できる
- ブロックを移動できる
- ブロックを回転できる
- フレーム更新が正しく動作する
- DTOへの変換が正しく動作する

## 完了条件

- [ ] GameDtoが定義されている
- [ ] GameApplicationServiceが実装されている
- [ ] すべてのメソッドが正しく動作する
- [ ] すべてのテストが成功する
- [ ] DTOへの変換が正しく動作する

## 見積もり

**工数**: 3-4日

## 依存関係

**前提**:
- Issue 2.1（リポジトリ）
- Issue 1.3（ドメインサービス）

**後続**: Issue 2.3, Issue 3.1
