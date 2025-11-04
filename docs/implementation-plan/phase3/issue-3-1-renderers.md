# [Phase 3-1] レンダラーの実装

## 概要

ゲーム画面とUIの描画を担当するレンダラーを実装します。

## 参照ドキュメント

- `docs/design/infrastructure-presentation-layers-detailed-design.md`

## 実装対象

### 1. CanvasRenderer

**ファイル**: `src/presentation/renderers/CanvasRenderer.ts`

**メソッド**:
- `constructor(canvas: HTMLCanvasElement, blockSize: number)`
- `render(gameDto: GameDto): void`

**プライベートメソッド**:
- `clear(): void`
- `drawGrid(): void`
- `drawField(field: (string | null)[][]): void`
- `drawFallingBlock(fallingBlock): void`
- `drawBlock(x: number, y: number, color: string): void`
- `drawGameOverOverlay(): void`
- `drawPausedOverlay(): void`
- `getColorHex(colorType: string): string`

**定数**:
```typescript
const COLORS = {
  blue: '#3498db',
  red: '#e74c3c',
  yellow: '#f1c40f'
};
const BACKGROUND_COLOR = '#2c3e50';
const GRID_COLOR = '#34495e';
```

### 2. UIRenderer

**ファイル**: `src/presentation/renderers/UIRenderer.ts`

**メソッド**:
- `constructor()`
- `render(gameDto: GameDto): void`

**プライベートメソッド**:
- `updateScore(score: number): void`
- `drawNextBlock(pattern: string[][]): void`
- `showGameOver(show: boolean): void`

## テスト

**テストファイル**:
- `tests/presentation/renderers/CanvasRenderer.test.ts`（可能な範囲で）
- `tests/presentation/renderers/UIRenderer.test.ts`（可能な範囲で）

**注意**: DOM操作を含むため、テストは限定的になる可能性があります。

## 完了条件

- [ ] CanvasRendererが実装されている
- [ ] UIRendererが実装されている
- [ ] ゲーム画面が正しく描画される
- [ ] スコアとネクストブロックが正しく表示される
- [ ] ゲームオーバー/一時停止のオーバーレイが正しく表示される

## 見積もり

**工数**: 3-4日

## 依存関係

**前提**: Issue 2.2（GameDto）

**後続**: Issue 3.2
