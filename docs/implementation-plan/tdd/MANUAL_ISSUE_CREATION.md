# GitHub Issue 手動作成ガイド

このドキュメントは、TDD実装計画のGitHub Issueを手動で作成する手順を説明します。

## 前提条件

- GitHubリポジトリへのアクセス権限があること
- 作成対象: Phase 1の3つのIssue

---

## Issue 1: [Phase 1-1] 値オブジェクトの実装（TDD）

### 手順

1. GitHubリポジトリの「Issues」タブを開く
2. 「New issue」ボタンをクリック
3. 以下の情報を入力：

**Title（タイトル）**:
```
[Phase 1-1] 値オブジェクトの実装（TDD）
```

**Body（本文）**:
```markdown
[docs/implementation-plan/tdd/issue-1-1-value-objects-tdd.md の内容をコピー]
```

**Labels（ラベル）**:
- `Phase 1`
- `domain`
- `TDD`
- `priority: high`

**Assignees（担当者）**:
- （必要に応じて設定）

**Milestone（マイルストーン）**:
- `Phase 1: ドメイン層の基盤`（オプション）

4. 「Create issue」をクリック

---

## Issue 2: [Phase 1-2] エンティティの実装（TDD）

### 手順

1. GitHubリポジトリの「Issues」タブを開く
2. 「New issue」ボタンをクリック
3. 以下の情報を入力：

**Title（タイトル）**:
```
[Phase 1-2] エンティティの実装（TDD）
```

**Body（本文）**:
```markdown
[docs/implementation-plan/tdd/issue-1-2-entities-tdd.md の内容をコピー]
```

**Labels（ラベル）**:
- `Phase 1`
- `domain`
- `TDD`
- `priority: high`

**Dependencies（依存関係）**:
- 本文に記載: "Issue 1.1: 値オブジェクトの実装（TDD）"

4. 「Create issue」をクリック

---

## Issue 3: [Phase 1-3] ドメインサービスの実装（TDD）

### 手順

1. GitHubリポジトリの「Issues」タブを開く
2. 「New issue」ボタンをクリック
3. 以下の情報を入力：

**Title（タイトル）**:
```
[Phase 1-3] ドメインサービスの実装（TDD）
```

**Body（本文）**:
```markdown
[docs/implementation-plan/tdd/issue-1-3-domain-services-tdd.md の内容をコピー]
```

**Labels（ラベル）**:
- `Phase 1`
- `domain`
- `TDD`
- `priority: high`

**Dependencies（依存関係）**:
- 本文に記載: "Issue 1.1, Issue 1.2"

4. 「Create issue」をクリック

---

## ラベルの作成（初回のみ）

Phase 1の実装を開始する前に、以下のラベルを作成してください：

### 必須ラベル

| ラベル名 | 色 | 説明 |
|---------|-----|------|
| `Phase 1` | `#0052CC` | Phase 1: ドメイン層の基盤 |
| `Phase 2` | `#0052CC` | Phase 2: アプリケーション層とインフラ層 |
| `Phase 3` | `#0052CC` | Phase 3: プレゼンテーション層 |
| `Phase 4` | `#0052CC` | Phase 4: 統合とテスト |
| `domain` | `#5319E7` | ドメイン層 |
| `application` | `#1D76DB` | アプリケーション層 |
| `infrastructure` | `#0E8A16` | インフラ層 |
| `presentation` | `#FBCA04` | プレゼンテーション層 |
| `TDD` | `#D93F0B` | TDD（テスト駆動開発） |
| `priority: high` | `#D73A4A` | 優先度: 高 |
| `priority: medium` | `#FBCA04` | 優先度: 中 |
| `priority: low` | `#0E8A16` | 優先度: 低 |
| `testing` | `#BFD4F2` | テスト |
| `documentation` | `#0075CA` | ドキュメント |

### ラベル作成手順

1. リポジトリの「Issues」タブを開く
2. 「Labels」をクリック
3. 「New label」をクリック
4. 上記の表に従ってラベルを作成

---

## Issue作成後の確認事項

各Issueを作成後、以下を確認してください：

### チェックリスト

- [ ] タイトルが正しく設定されている
- [ ] 本文が完全にコピーされている
- [ ] すべての必須ラベルが設定されている
- [ ] 依存関係が明記されている
- [ ] Issue番号を控える（後続のIssueで参照するため）

### 推奨される追加設定

- **プロジェクトボード**: Phase 1用のプロジェクトボードを作成し、Issueを追加
- **マイルストーン**: Phase 1マイルストーンを作成し、期限を設定
- **テンプレート**: 今後のためにIssueテンプレートを作成

---

## 実装の開始

すべてのIssueを作成したら、以下の順序で実装を開始してください：

### 推奨される作業フロー

1. **Issue 1-1から開始**
   - Position, Color, Block, Score, Rectangle, GameState, BlockPatternの順で実装
   - 各値オブジェクトでRed-Green-Refactorサイクルを徹底

2. **Issue 1-2に進む**（Issue 1-1完了後）
   - Field, FallingBlock, Gameの順で実装
   - Phase 1-2の範囲で実装（Game.landBlock()は基本実装のみ）

3. **Issue 1-3に進む**（Issue 1-2完了後）
   - CollisionDetectionService, BlockPatternGeneratorService, BlockMatchingService, BlockFallService, BlockRemovalServiceの順で実装
   - Game.landBlock()の完全実装を追加

---

## 進捗管理

各Issueの完了条件を満たしたら、以下を実施：

1. Issueにコメントを追加（実装結果、テスト結果など）
2. Issueをクローズ
3. 次のIssueに進む

### 進捗報告のテンプレート

```markdown
## 実装完了報告

### 実装した内容
- Position, Color, Block, Score, Rectangle, GameState, BlockPatternの7つの値オブジェクト

### テスト結果
- すべてのテストが成功: 45/45 passed ✅
- コードカバレッジ: 95%

### 所要時間
- 見積もり: 4日
- 実績: 3.5日

### 次のステップ
- Issue 1-2（エンティティの実装）に進む

### メモ
- BlockPatternの回転ロジックで若干苦戦したが、テストのおかげで早期に問題を発見できた
```

---

## トラブルシューティング

### Issue作成時のよくある問題

**Q: Markdownのフォーマットが崩れる**
A: GitHubのMarkdownプレビューを使用して、フォーマットを確認してください。

**Q: ラベルが見つからない**
A: ラベルが未作成の場合は、上記の「ラベルの作成」セクションを参照してください。

**Q: 依存関係をどう表現する？**
A: Issue本文に依存関係を明記し、必要に応じてGitHub Projectsのdependenciesフィールドを使用してください。

---

## 参考資料

- [TDD実装計画](./README.md)
- [DDD仕様書](../../design/ddd-specification.md)
- [値オブジェクト詳細設計](../../design/value-objects-detailed-design.md)
- [エンティティ詳細設計](../../design/entities-detailed-design.md)
- [ドメインサービス詳細設計](../../design/domain-services-detailed-design.md)

---

## 自動化（オプション）

GitHub CLI（gh）がインストールされている場合は、以下のコマンドで自動作成できます：

```bash
./scripts/create-issues-tdd.sh
```

**注意**: GitHub CLIが利用できない環境では、このドキュメントに従って手動で作成してください。
