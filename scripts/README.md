# GitHub Issue作成コマンド

## 一括作成

すべてのIssueを一括で作成する場合：

```bash
./scripts/create-issues.sh
```

## 個別作成

### Phase 1: ドメイン層の基盤

#### Issue 1-1: 値オブジェクトの実装

```bash
gh issue create \
  --title "[Phase 1-1] 値オブジェクトの実装" \
  --body-file docs/implementation-plan/phase1/issue-1-1-value-objects.md \
  --label "Phase 1" \
  --label "domain" \
  --label "priority: high"
```

#### Issue 1-2: エンティティの実装

```bash
gh issue create \
  --title "[Phase 1-2] エンティティの実装" \
  --body-file docs/implementation-plan/phase1/issue-1-2-entities.md \
  --label "Phase 1" \
  --label "domain" \
  --label "priority: high"
```

#### Issue 1-3: ドメインサービスの実装

```bash
gh issue create \
  --title "[Phase 1-3] ドメインサービスの実装" \
  --body-file docs/implementation-plan/phase1/issue-1-3-domain-services.md \
  --label "Phase 1" \
  --label "domain" \
  --label "priority: high"
```

---

### Phase 2: アプリケーション層とインフラ層

#### Issue 2-1: リポジトリの実装

```bash
gh issue create \
  --title "[Phase 2-1] リポジトリの実装" \
  --body-file docs/implementation-plan/phase2/issue-2-1-repositories.md \
  --label "Phase 2" \
  --label "infrastructure" \
  --label "priority: high"
```

#### Issue 2-2: アプリケーションサービスの実装

```bash
gh issue create \
  --title "[Phase 2-2] アプリケーションサービスの実装" \
  --body-file docs/implementation-plan/phase2/issue-2-2-application-services.md \
  --label "Phase 2" \
  --label "application" \
  --label "priority: high"
```

#### Issue 2-3: 入力処理とインフラの実装

```bash
gh issue create \
  --title "[Phase 2-3] 入力処理とインフラの実装" \
  --body-file docs/implementation-plan/phase2/issue-2-3-input-and-infrastructure.md \
  --label "Phase 2" \
  --label "application" \
  --label "infrastructure" \
  --label "priority: high"
```

---

### Phase 3: プレゼンテーション層

#### Issue 3-1: レンダラーの実装

```bash
gh issue create \
  --title "[Phase 3-1] レンダラーの実装" \
  --body-file docs/implementation-plan/phase3/issue-3-1-renderers.md \
  --label "Phase 3" \
  --label "presentation" \
  --label "priority: high"
```

#### Issue 3-2: コントローラーとUIの実装

```bash
gh issue create \
  --title "[Phase 3-2] コントローラーとUIの実装" \
  --body-file docs/implementation-plan/phase3/issue-3-2-controller-and-ui.md \
  --label "Phase 3" \
  --label "presentation" \
  --label "priority: high"
```

---

### Phase 4: 統合とテスト

#### Issue 4-1: 単体テストの実装

```bash
gh issue create \
  --title "[Phase 4-1] 単体テストの実装" \
  --body-file docs/implementation-plan/phase4/issue-4-1-unit-tests.md \
  --label "Phase 4" \
  --label "testing" \
  --label "priority: medium"
```

#### Issue 4-2: 統合テストと調整

```bash
gh issue create \
  --title "[Phase 4-2] 統合テストと調整" \
  --body-file docs/implementation-plan/phase4/issue-4-2-integration-tests.md \
  --label "Phase 4" \
  --label "testing" \
  --label "priority: medium"
```

#### Issue 4-3: ドキュメントと最終調整

```bash
gh issue create \
  --title "[Phase 4-3] ドキュメントと最終調整" \
  --body-file docs/implementation-plan/phase4/issue-4-3-documentation.md \
  --label "Phase 4" \
  --label "documentation" \
  --label "priority: low"
```

---

## ラベルについて

使用しているラベル：
- `Phase 1`, `Phase 2`, `Phase 3`, `Phase 4` - フェーズ
- `domain`, `application`, `infrastructure`, `presentation` - レイヤー
- `testing`, `documentation` - その他
- `priority: high`, `priority: medium`, `priority: low` - 優先度

これらのラベルが存在しない場合は、事前に作成してください：

```bash
# ラベル作成例
gh label create "Phase 1" --color "0E8A16" --description "ドメイン層の基盤"
gh label create "domain" --color "D93F0B" --description "ドメイン層"
gh label create "priority: high" --color "B60205" --description "優先度: 高"
```

---

## マイルストーンの設定（オプション）

マイルストーンを設定する場合は、`--milestone`オプションを追加：

```bash
gh issue create \
  --title "[Phase 1-1] 値オブジェクトの実装" \
  --body-file docs/implementation-plan/phase1/issue-1-1-value-objects.md \
  --label "Phase 1" \
  --label "domain" \
  --label "priority: high" \
  --milestone "Phase 1"
```

---

## 注意事項

- `--body-file`オプションは、Markdownファイルをそのままボディに使用します
- ラベルが存在しない場合、エラーになる可能性があります
- 必要に応じて`--assignee`オプションで担当者を指定できます
