# Square ゲーム開発 Issue一覧

このディレクトリには、Squareゲーム開発の各タスクをIssueとして定義したファイルが含まれています。

## Issue一覧

### Phase 1: 基本実装
1. **[プロジェクトセットアップと基本構造の作成](01-project-setup.md)**
   - ファイル構成、Canvas初期化、ゲームループ
   - 依存: なし

2. **[ゲームフィールドの描画](02-game-field-rendering.md)**
   - グリッド描画、背景色、座標システム
   - 依存: #1

3. **[ブロック管理システムの実装](03-block-system.md)**
   - 4種類のブロックパターン、ネクストブロック管理
   - 依存: #2

### Phase 2: ゲームロジック
4. **[落下ブロックの制御](04-block-falling.md)**
   - 自動落下、衝突判定、接地判定
   - 依存: #3

5. **[キー入力処理の実装](05-input-control.md)**
   - 移動、回転、高速落下、即座落下
   - 依存: #4

6. **[消去判定システムの実装](06-block-clear.md)**
   - 矩形検出、消去処理
   - 依存: #4

7. **[自由落下処理の実装](07-gravity.md)**
   - 消去後の落下、連鎖処理
   - 依存: #6

### Phase 3: UI・スコア・ゲーム管理
8. **[スコアシステムの実装](08-score-system.md)**
   - スコア計算、表示
   - 依存: #6, #7

9. **[ゲームオーバー処理の実装](09-game-over.md)**
   - ゲームオーバー判定、画面表示
   - 依存: #4, #6, #8

10. **[UI要素の実装](10-ui-elements.md)**
    - スコア表示、ネクストブロック表示、ボタン
    - 依存: #3, #8

11. **[一時停止・リスタート機能の実装](11-pause-restart.md)**
    - 一時停止、リスタート
    - 依存: #4, #8, #10

## 推奨実装順序

```
Phase 1: #1 → #2 → #3
         ↓
Phase 2: #4 → #5
         ↓    ↓
         #6 → #7
         ↓
Phase 3: #8 → #9
         ↓
         #10 → #11
```

## GitHubでのIssue作成方法

これらのファイルを基にGitHub上でIssueを作成する場合：

### 方法1: 手動作成
1. GitHubリポジトリの「Issues」タブを開く
2. 「New Issue」をクリック
3. 各ファイルの内容をコピー&ペースト

### 方法2: GitHub CLI使用（推奨）
```bash
# 例: Issue #1を作成
gh issue create --title "プロジェクトセットアップと基本構造の作成" --body-file .github/issues/01-project-setup.md

# 全てのIssueを一括作成
for file in .github/issues/*.md; do
  if [ "$file" != ".github/issues/README.md" ]; then
    title=$(grep "^# Issue" "$file" | sed 's/^# Issue #[0-9]*: //')
    gh issue create --title "$title" --body-file "$file"
  fi
done
```

## ラベルの推奨設定

- `phase-1`: 基本実装
- `phase-2`: ゲームロジック
- `phase-3`: UI・管理機能
- `enhancement`: 新機能
- `bug`: バグ修正
- `documentation`: ドキュメント
