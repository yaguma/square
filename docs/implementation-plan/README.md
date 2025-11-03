# 実装計画とIssue一覧

このドキュメントは、Squareゲームの実装計画と、作成すべきGitHub Issueの一覧です。

## 実装フェーズ概要

| フェーズ | 内容 | 見積もり | 優先度 |
|---------|------|----------|--------|
| Phase 1 | ドメイン層の基盤 | 2-3週間 | 最高 |
| Phase 2 | アプリケーション層とインフラ層 | 2週間 | 高 |
| Phase 3 | プレゼンテーション層 | 2週間 | 高 |
| Phase 4 | 統合とテスト | 2-3週間 | 中 |

## Phase 1: ドメイン層の基盤

### Issue 1.1: 値オブジェクトの実装

**タイトル**: `[Phase 1-1] 値オブジェクトの実装`

**ラベル**: `Phase 1`, `domain`, `priority: high`

**見積もり**: 2-3日

**説明**: [詳細](./phase1/issue-1-1-value-objects.md)を参照

**成果物**:
- Position, Color, Block, BlockPattern, Score, Rectangle, GameState の7つの値オブジェクト
- 各値オブジェクトの単体テスト

---

### Issue 1.2: エンティティの実装

**タイトル**: `[Phase 1-2] エンティティの実装`

**ラベル**: `Phase 1`, `domain`, `priority: high`

**見積もり**: 3-4日

**説明**: [詳細](./phase1/issue-1-2-entities.md)を参照

**依存**: Issue 1.1

**成果物**:
- Field, FallingBlock, Game の3つのエンティティ
- 各エンティティの単体テスト

---

### Issue 1.3: ドメインサービスの実装

**タイトル**: `[Phase 1-3] ドメインサービスの実装`

**ラベル**: `Phase 1`, `domain`, `priority: high`

**見積もり**: 4-5日

**説明**: [詳細](./phase1/issue-1-3-domain-services.md)を参照

**依存**: Issue 1.2

**成果物**:
- BlockMatchingService, BlockFallService, BlockRemovalService, CollisionDetectionService, BlockPatternGeneratorService の5つのドメインサービス
- 各ドメインサービスの単体テスト

---

## Phase 2: アプリケーション層とインフラ層

### Issue 2.1: リポジトリの実装

**タイトル**: `[Phase 2-1] リポジトリの実装`

**ラベル**: `Phase 2`, `infrastructure`, `priority: high`

**見積もり**: 1日

**説明**: [詳細](./phase2/issue-2-1-repositories.md)を参照

**依存**: Issue 1.2

**成果物**:
- GameRepository インターフェース
- InMemoryGameRepository 実装
- リポジトリの単体テスト

---

### Issue 2.2: アプリケーションサービスの実装

**タイトル**: `[Phase 2-2] アプリケーションサービスの実装`

**ラベル**: `Phase 2`, `application`, `priority: high`

**見積もり**: 3-4日

**説明**: [詳細](./phase2/issue-2-2-application-services.md)を参照

**依存**: Issue 2.1, Issue 1.3

**成果物**:
- GameApplicationService
- GameDto
- アプリケーションサービスの単体テスト

---

### Issue 2.3: 入力処理とインフラの実装

**タイトル**: `[Phase 2-3] 入力処理とインフラの実装`

**ラベル**: `Phase 2`, `application`, `infrastructure`, `priority: high`

**見積もり**: 2日

**説明**: [詳細](./phase2/issue-2-3-input-and-infrastructure.md)を参照

**依存**: Issue 2.2

**成果物**:
- InputHandlerService
- FrameTimer
- RandomGenerator
- 単体テスト

---

## Phase 3: プレゼンテーション層

### Issue 3.1: レンダラーの実装

**タイトル**: `[Phase 3-1] レンダラーの実装`

**ラベル**: `Phase 3`, `presentation`, `priority: high`

**見積もり**: 3-4日

**説明**: [詳細](./phase3/issue-3-1-renderers.md)を参照

**依存**: Issue 2.2

**成果物**:
- CanvasRenderer
- UIRenderer
- レンダラーの単体テスト（可能な範囲で）

---

### Issue 3.2: コントローラーとUIの実装

**タイトル**: `[Phase 3-2] コントローラーとUIの実装`

**ラベル**: `Phase 3`, `presentation`, `priority: high`

**見積もり**: 2-3日

**説明**: [詳細](./phase3/issue-3-2-controller-and-ui.md)を参照

**依存**: Issue 3.1, Issue 2.3

**成果物**:
- GameController
- HTML/CSS
- main.ts（エントリーポイント）

---

## Phase 4: 統合とテスト

### Issue 4.1: 単体テストの実装

**タイトル**: `[Phase 4-1] 単体テストの実装`

**ラベル**: `Phase 4`, `testing`, `priority: medium`

**見積もり**: 3-4日

**説明**: [詳細](./phase4/issue-4-1-unit-tests.md)を参照

**依存**: Phase 1, 2, 3の完了

**成果物**:
- すべてのコンポーネントの単体テスト
- コードカバレッジレポート（目標: 80%以上）

---

### Issue 4.2: 統合テストと調整

**タイトル**: `[Phase 4-2] 統合テストと調整`

**ラベル**: `Phase 4`, `testing`, `priority: medium`

**見積もり**: 3-5日

**説明**: [詳細](./phase4/issue-4-2-integration-tests.md)を参照

**依存**: Issue 4.1

**成果物**:
- 統合テスト
- E2Eテスト
- バグフィックス
- パフォーマンス最適化
- UI/UXの調整

---

### Issue 4.3: ドキュメントと最終調整

**タイトル**: `[Phase 4-3] ドキュメントと最終調整`

**ラベル**: `Phase 4`, `documentation`, `priority: low`

**見積もり**: 1-2日

**説明**: [詳細](./phase4/issue-4-3-documentation.md)を参照

**依存**: Issue 4.2

**成果物**:
- APIドキュメント
- ユーザーガイド
- 開発者向けドキュメント
- README更新
- デプロイ準備

---

## Issueの作成方法

各Issueの詳細は、対応するMarkdownファイルに記載されています。

GitHub Issueを作成する際は、以下の手順で行ってください：

1. GitHub repositoryの「Issues」タブを開く
2. 「New issue」をクリック
3. 各Issueファイルの内容をコピー＆ペースト
4. 適切なラベルを設定
5. マイルストーンを設定（オプション）
6. Assigneeを設定（オプション）

## 進捗管理

各Issueの完了条件を満たしたら、チェックボックスにチェックを入れてください。

Phase 1が完了したら、Phase 2に進むことができます。

## 推奨される作業フロー

1. **ブランチ作成**: 各Issueごとに新しいブランチを作成
   - 例: `feature/phase1-1-value-objects`

2. **実装**: 設計書を参照しながら実装

3. **テスト**: 単体テストを作成し、すべて成功することを確認

4. **レビュー**: セルフレビューまたはチームレビュー

5. **マージ**: mainブランチにマージ

6. **次のIssue**: 依存関係を確認して次のIssueに進む

## 参考資料

- [DDD仕様書](../design/ddd-specification.md)
- [詳細設計計画書](../design/detailed-design-plan.md)
- [統合設計書](../design/integration-design.md)
- [値オブジェクト詳細設計](../design/value-objects-detailed-design.md)
- [エンティティ詳細設計](../design/entities-detailed-design.md)
- [ドメインサービス詳細設計](../design/domain-services-detailed-design.md)
- [アプリケーション層詳細設計](../design/application-layer-detailed-design.md)
- [インフラ層・プレゼンテーション層詳細設計](../design/infrastructure-presentation-layers-detailed-design.md)
