#!/bin/bash

# Square - TDD実装計画に基づくGitHub Issue作成スクリプト

set -e

echo "========================================="
echo "  Square - TDD GitHub Issues 作成"
echo "========================================="
echo ""

# Phase 1: ドメイン層の基盤（TDD）

echo "📝 Phase 1: ドメイン層の基盤（TDD）"
echo ""

echo "[1/3] Phase 1-1: 値オブジェクトの実装（TDD）"
gh issue create \
  --title "[Phase 1-1] 値オブジェクトの実装（TDD）" \
  --body-file docs/implementation-plan/tdd/issue-1-1-value-objects-tdd.md \
  --label "Phase 1" \
  --label "domain" \
  --label "TDD" \
  --label "priority: high"

echo "✅ Issue 1-1 作成完了"
echo ""

echo "[2/3] Phase 1-2: エンティティの実装（TDD）"
gh issue create \
  --title "[Phase 1-2] エンティティの実装（TDD）" \
  --body-file docs/implementation-plan/tdd/issue-1-2-entities-tdd.md \
  --label "Phase 1" \
  --label "domain" \
  --label "TDD" \
  --label "priority: high"

echo "✅ Issue 1-2 作成完了"
echo ""

echo "[3/3] Phase 1-3: ドメインサービスの実装（TDD）"
gh issue create \
  --title "[Phase 1-3] ドメインサービスの実装（TDD）" \
  --body-file docs/implementation-plan/tdd/issue-1-3-domain-services-tdd.md \
  --label "Phase 1" \
  --label "domain" \
  --label "TDD" \
  --label "priority: high"

echo "✅ Issue 1-3 作成完了"
echo ""

echo "========================================="
echo "  Phase 1の3つのIssueが作成されました！"
echo "========================================="
echo ""
echo "次のステップ："
echo "1. GitHub上で各Issueを確認"
echo "2. Issue 1-1から順次実装を開始"
echo "3. TDDサイクル（Red→Green→Refactor）を徹底"
echo ""
echo "TDD実装計画の詳細："
echo "  docs/implementation-plan/tdd/README.md"
echo ""
