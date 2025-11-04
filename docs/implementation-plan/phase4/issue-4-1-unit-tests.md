# [Phase 4-1] 単体テストの実装

## 概要

すべてのコンポーネントの単体テストを実装し、コードカバレッジを確保します。

## 参照ドキュメント

- 各詳細設計書のテストセクション

## 実装対象

### ドメイン層のテスト

**値オブジェクト**:
- Position.test.ts
- Color.test.ts
- Block.test.ts
- BlockPattern.test.ts
- Score.test.ts
- Rectangle.test.ts
- GameState.test.ts

**エンティティ**:
- Field.test.ts
- FallingBlock.test.ts
- Game.test.ts

**ドメインサービス**:
- BlockMatchingService.test.ts
- BlockFallService.test.ts
- BlockRemovalService.test.ts
- CollisionDetectionService.test.ts
- BlockPatternGeneratorService.test.ts

### アプリケーション層のテスト

- GameApplicationService.test.ts
- InputHandlerService.test.ts

### インフラ層のテスト

- InMemoryGameRepository.test.ts
- FrameTimer.test.ts
- RandomGenerator.test.ts

### プレゼンテーション層のテスト

- CanvasRenderer.test.ts（可能な範囲で）
- UIRenderer.test.ts（可能な範囲で）

## テスト設定

**Vitest設定**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation')
    }
  }
});
```

## 完了条件

- [ ] すべてのコンポーネントに単体テストがある
- [ ] すべてのテストが成功する
- [ ] コードカバレッジが80%以上
- [ ] テストレポートが生成される
- [ ] CIで自動実行される（オプション）

## 見積もり

**工数**: 3-4日

## 依存関係

**前提**: Phase 1, 2, 3の完了

**後続**: Issue 4.2
