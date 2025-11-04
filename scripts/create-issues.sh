#!/bin/bash

# Square - 実装計画に基づくGitHub Issue作成スクリプト

echo "Creating GitHub Issues for Square implementation plan..."

# Phase 1: ドメイン層の基盤

echo "Creating Phase 1 issues..."

gh issue create \
  --title "[Phase 1-1] 値オブジェクトの実装" \
  --body-file docs/implementation-plan/phase1/issue-1-1-value-objects.md \
  --label "Phase 1" \
  --label "domain" \
  --label "priority: high"

gh issue create \
  --title "[Phase 1-2] エンティティの実装" \
  --body-file docs/implementation-plan/phase1/issue-1-2-entities.md \
  --label "Phase 1" \
  --label "domain" \
  --label "priority: high"

gh issue create \
  --title "[Phase 1-3] ドメインサービスの実装" \
  --body-file docs/implementation-plan/phase1/issue-1-3-domain-services.md \
  --label "Phase 1" \
  --label "domain" \
  --label "priority: high"

# Phase 2: アプリケーション層とインフラ層

echo "Creating Phase 2 issues..."

gh issue create \
  --title "[Phase 2-1] リポジトリの実装" \
  --body-file docs/implementation-plan/phase2/issue-2-1-repositories.md \
  --label "Phase 2" \
  --label "infrastructure" \
  --label "priority: high"

gh issue create \
  --title "[Phase 2-2] アプリケーションサービスの実装" \
  --body-file docs/implementation-plan/phase2/issue-2-2-application-services.md \
  --label "Phase 2" \
  --label "application" \
  --label "priority: high"

gh issue create \
  --title "[Phase 2-3] 入力処理とインフラの実装" \
  --body-file docs/implementation-plan/phase2/issue-2-3-input-and-infrastructure.md \
  --label "Phase 2" \
  --label "application" \
  --label "infrastructure" \
  --label "priority: high"

# Phase 3: プレゼンテーション層

echo "Creating Phase 3 issues..."

gh issue create \
  --title "[Phase 3-1] レンダラーの実装" \
  --body-file docs/implementation-plan/phase3/issue-3-1-renderers.md \
  --label "Phase 3" \
  --label "presentation" \
  --label "priority: high"

gh issue create \
  --title "[Phase 3-2] コントローラーとUIの実装" \
  --body-file docs/implementation-plan/phase3/issue-3-2-controller-and-ui.md \
  --label "Phase 3" \
  --label "presentation" \
  --label "priority: high"

# Phase 4: 統合とテスト

echo "Creating Phase 4 issues..."

gh issue create \
  --title "[Phase 4-1] 単体テストの実装" \
  --body-file docs/implementation-plan/phase4/issue-4-1-unit-tests.md \
  --label "Phase 4" \
  --label "testing" \
  --label "priority: medium"

gh issue create \
  --title "[Phase 4-2] 統合テストと調整" \
  --body-file docs/implementation-plan/phase4/issue-4-2-integration-tests.md \
  --label "Phase 4" \
  --label "testing" \
  --label "priority: medium"

gh issue create \
  --title "[Phase 4-3] ドキュメントと最終調整" \
  --body-file docs/implementation-plan/phase4/issue-4-3-documentation.md \
  --label "Phase 4" \
  --label "documentation" \
  --label "priority: low"

echo "All issues created successfully!"
