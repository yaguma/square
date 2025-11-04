# [Phase 2-3] 入力処理とインフラの実装

## 概要

ユーザー入力の処理とインフラストラクチャ（タイマー、ランダム生成）を実装します。

## 参照ドキュメント

- `docs/design/application-layer-detailed-design.md`
- `docs/design/infrastructure-presentation-layers-detailed-design.md`

## 実装対象

### 1. InputHandlerService

**ファイル**: `src/application/services/InputHandlerService.ts`

**メソッド**:
- `handleKeyDown(key: string, gameId: string): void`
- `handleKeyUp(key: string, gameId: string): void`
- `canAcceptInput(key: string, frameCount: number): boolean`

**キーマッピング**:
- ArrowLeft/ArrowRight: 移動
- ArrowUp/z: 右回転
- x/Control: 左回転
- ArrowDown: 高速落下
- Space: 即座落下
- p: 一時停止/再開
- r: リスタート

### 2. FrameTimer

**ファイル**: `src/infrastructure/timer/FrameTimer.ts`

**メソッド**:
- `start(callback: () => void, fps: number): void`
- `stop(): void`
- `get isRunning(): boolean`

### 3. RandomGenerator

**ファイル**: `src/infrastructure/random/RandomGenerator.ts`

**インターフェース**:
```typescript
export interface RandomGenerator {
  nextInt(max: number): number;
  nextFloat(): number;
}
```

**実装**:
- MathRandomGenerator（本番用）
- MockRandomGenerator（テスト用）

## テスト

**テストファイル**:
- `tests/application/services/InputHandlerService.test.ts`
- `tests/infrastructure/timer/FrameTimer.test.ts`
- `tests/infrastructure/random/RandomGenerator.test.ts`

## 完了条件

- [ ] InputHandlerServiceが実装されている
- [ ] FrameTimerが実装されている
- [ ] RandomGeneratorが実装されている
- [ ] すべてのテストが成功する

## 見積もり

**工数**: 2日

## 依存関係

**前提**: Issue 2.2

**後続**: Issue 3.2
