# TDD実装計画

このディレクトリには、TDD（テスト駆動開発）アプローチに基づいた実装計画とIssue定義が含まれています。

## TDDの基本サイクル

```
1. 🔴 Red   : テストを書いて、失敗することを確認
2. 🟢 Green : テストが通る最小限の実装
3. 🔵 Refactor: リファクタリング
```

## Phase概要

| Phase | 内容 | 見積もり | TDDサイクル数 |
|-------|------|---------|--------------|
| Phase 1-1 | 値オブジェクト | 4日 | 8-9サイクル |
| Phase 1-2 | エンティティ | 5日 | 10-13サイクル |
| Phase 1-3 | ドメインサービス | 6日 | 11-16サイクル |
| **Phase 1 小計** | **ドメイン層** | **3週間** | **29-38サイクル** |
| Phase 2 | アプリケーション層とインフラ層 | 2週間 | - |
| Phase 3 | プレゼンテーション層 | 2週間 | - |
| Phase 4 | 統合とテスト | 2-3週間 | - |

## Issue一覧

### Phase 1: ドメイン層の基盤

- **[Phase 1-1] 値オブジェクトの実装（TDD）** - [issue-1-1-value-objects-tdd.md](./issue-1-1-value-objects-tdd.md)
- **[Phase 1-2] エンティティの実装（TDD）** - [issue-1-2-entities-tdd.md](./issue-1-2-entities-tdd.md)
- **[Phase 1-3] ドメインサービスの実装（TDD）** - [issue-1-3-domain-services-tdd.md](./issue-1-3-domain-services-tdd.md)

### Phase 2: アプリケーション層とインフラ層

- **[Phase 2-1] リポジトリの実装（TDD）** - [issue-2-1-repositories-tdd.md](./issue-2-1-repositories-tdd.md)
- **[Phase 2-2] アプリケーションサービスの実装（TDD）** - [issue-2-2-application-services-tdd.md](./issue-2-2-application-services-tdd.md)
- **[Phase 2-3] 入力処理とインフラの実装（TDD）** - [issue-2-3-input-and-infrastructure-tdd.md](./issue-2-3-input-and-infrastructure-tdd.md)

### Phase 3: プレゼンテーション層

- **[Phase 3-1] レンダラーの実装（TDD）** - [issue-3-1-renderers-tdd.md](./issue-3-1-renderers-tdd.md)
- **[Phase 3-2] コントローラーとUIの実装（TDD）** - [issue-3-2-controller-and-ui-tdd.md](./issue-3-2-controller-and-ui-tdd.md)

### Phase 4: 統合とテスト

- **[Phase 4-1] テストカバレッジの充実** - [issue-4-1-test-coverage.md](./issue-4-1-test-coverage.md)
- **[Phase 4-2] 統合テストと調整** - [issue-4-2-integration-tests.md](./issue-4-2-integration-tests.md)
- **[Phase 4-3] E2Eテストとドキュメント** - [issue-4-3-e2e-and-docs.md](./issue-4-3-e2e-and-docs.md)

## TDDのベストプラクティス

### 1. 小さなステップで進める

各テストケースは1つの振る舞いのみをテストします。

### 2. テストの命名規則

```typescript
test('[対象メソッド]は[条件]の場合に[期待する結果]', () => {
  // ...
});
```

### 3. AAA（Arrange-Act-Assert）パターン

```typescript
test('座標を加算できる', () => {
  // Arrange: テストの準備
  const pos1 = Position.create(1, 2);
  const pos2 = Position.create(3, 4);

  // Act: 実行
  const result = pos1.add(pos2);

  // Assert: 検証
  expect(result.x).toBe(4);
  expect(result.y).toBe(6);
});
```

### 4. 境界値のテスト

- 0, 1, -1, 最大値、最小値
- null, undefined
- 空配列、空文字列

## GitHub Issue作成方法

### スクリプトを使用（推奨）

```bash
./scripts/create-issues-tdd.sh
```

### 手動作成

各Issueファイルの内容をGitHub Issueとして作成してください。

## 参考資料

- [DDD仕様書](../../design/ddd-specification.md)
- [詳細設計計画書](../../design/detailed-design-plan.md)
- [値オブジェクト詳細設計](../../design/value-objects-detailed-design.md)
- [エンティティ詳細設計](../../design/entities-detailed-design.md)
- [ドメインサービス詳細設計](../../design/domain-services-detailed-design.md)
