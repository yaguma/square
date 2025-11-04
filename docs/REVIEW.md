# ドキュメントレビュー結果

**レビュー日**: 2025-11-04
**レビュー対象**: 詳細設計書および実装計画書

---

## 📊 良い点

### 1. アーキテクチャ設計の明確性
- レイヤードアーキテクチャ（ドメイン、アプリケーション、インフラ、プレゼンテーション）が明確に定義されている
- 依存関係のルールが適切に設定されている（ドメイン層は他の層に依存しない）

### 2. DDDの原則の遵守
- 値オブジェクトの不変性が徹底されている
- エンティティとのアイデンティティの違いが明確
- ドメインサービスがステートレスで設計されている
- 集約の境界が適切に定義されている

### 3. 詳細な設計書
- 各クラスのメソッド、属性、責務が詳細に記述されている
- 実装例のコードが豊富で理解しやすい
- テストケースの例が具体的

### 4. 実装計画の構造
- フェーズ分けが適切（Phase 1-4）
- 依存関係に基づいた実装順序が明確
- 各Issueに完了条件が設定されている

### 5. テスト戦略
- 単体テスト、統合テスト、E2Eテストの各レベルで計画されている
- カバレッジ目標（80%）が設定されている

---

## ⚠️ 改善が必要な点

### 1. メソッド名の不統一

**問題点**: `decelerateFall` vs `disableFastFall`

- **設計書**: `disableFastFall()` と記載
- **実装計画**: `decelerateFall()` と記載

**推奨**: `disableFastFall()`に統一（意図が明確）

**修正箇所**:
- `docs/design/application-layer-detailed-design.md`
- `docs/implementation-plan/phase2/issue-2-2-application-services.md`

---

### 2. ドメインイベントの実装が不明確

**問題点**:
- DDD仕様書では4つのドメインイベントが定義されているが、実装計画に含まれていない

**推奨**:
- 初期実装では省略し、「将来的な拡張」として記載する
- または、Phase 4に追加実装として組み込む

**対応案**:
Phase 5として「拡張機能」のセクションを追加し、ドメインイベントを含める

---

### 3. BlockPatternの回転ロジックの曖昧性

**問題点**:
- `BlockPattern.rotate()`の実装例で、`null`の扱いが不明確

**推奨**:
- BlockPatternは常に4マス全てに`Block`が存在する設計に変更
- パターン定義を明確化

**修正案**:
```typescript
// Pattern3x1の場合、4つ目のマスにも必ずブロックを配置
// 例: 3つが青、1つが赤
const pattern3x1 = BlockPattern.create('pattern3x1', [
  [blue, blue],
  [blue, red]  // nullではなく別色のブロック
]);
```

---

### 4. Game.landBlock()の実装タイミングの矛盾

**問題点**:
- 複数の箇所で実装タイミングの記載が異なる

**推奨**:
- **Issue 1-2**: `landBlock()`のスタブ実装のみ（基本的なブロック固定処理）
- **Issue 1-3**: 完全な実装（消去判定、連鎖処理を含む）

**修正箇所**:
- `docs/design/entities-detailed-design.md`
- `docs/implementation-plan/phase1/issue-1-2-entities.md`

---

### 5. テストカバレッジの対象範囲が不明確

**問題点**:
- 「コードカバレッジ80%以上」とあるが、対象範囲が不明

**推奨**:
以下のカバレッジ目標を設定：
- ドメイン層: 90%以上
- アプリケーション層: 85%以上
- インフラ層: 70%以上
- プレゼンテーション層: 50%以上（DOM操作は除外）

---

### 6. RandomGeneratorの活用が不十分

**問題点**:
- `BlockPatternGeneratorService`が`Math.random()`を直接使用する実装例になっている

**推奨**:
依存性注入を使用：
```typescript
export class BlockPatternGeneratorService {
  constructor(private randomGenerator: RandomGenerator) {}

  private getRandomColor(): Color {
    const colors = [Color.BLUE, Color.RED, Color.YELLOW];
    const index = this.randomGenerator.nextInt(colors.length);
    return colors[index];
  }
}
```

**修正箇所**:
- `docs/design/domain-services-detailed-design.md`
- `docs/implementation-plan/phase1/issue-1-3-domain-services.md`

---

### 7. Field.clone()メソッドの必要性

**問題点**:
- `Field.clone()`メソッドが定義されているが、使用場面が不明

**推奨**:
- 使用場面を明示する
- または、不要であれば削除する

**検討**: 現状では不要と思われるため、削除を推奨

---

## 🚨 重大な問題点

### 1. Gameエンティティの不変条件の違反リスク

**問題点**:
DDD仕様書の不変条件と実装が矛盾している

**不変条件（ddd-specification.md）**:
```
- 落下ブロックがある場合、必ず有効な位置に存在する
- 同時に落下できるブロックは1つのみ
```

**実装（entities-detailed-design.md）**:
```typescript
if (this._fallingBlock === null) {
  this._fallingBlock = FallingBlock.create(this._nextBlock);
}
```

**推奨修正**:
不変条件を以下に変更：
```
- 落下ブロックは0個または1個存在する
- 落下ブロックが存在する場合、必ず有効な位置に存在する
- 同時に落下できるブロックは1つのみ
```

**修正箇所**:
- `docs/design/ddd-specification.md` (185行目付近)

---

### 2. FallingBlock.canPlaceAt()とCollisionDetectionServiceの重複

**問題点**:
- `FallingBlock`内に`canPlaceAt()`プライベートメソッドがある
- `CollisionDetectionService.canPlaceBlock()`と機能が重複している

**推奨**:
`FallingBlock`が`CollisionDetectionService`に依存する設計に変更：

```typescript
export class FallingBlock {
  constructor(
    private readonly _pattern: BlockPattern,
    private _position: Position,
    private _rotation: Rotation,
    private collisionDetectionService: CollisionDetectionService
  ) {}

  canMove(direction: Direction, field: Field): boolean {
    let newPosition: Position;
    // ...
    return this.collisionDetectionService.canPlaceBlock(
      newPosition,
      this._pattern.rotate(this._rotation),
      field
    );
  }
}
```

**修正箇所**:
- `docs/design/entities-detailed-design.md`
- `docs/implementation-plan/phase1/issue-1-2-entities.md`

---

### 3. スコア計算ロジックの詳細が不明

**問題点**:
- 現在の設計では「削除マス数」のみがスコアになる
- 連鎖ボーナスなどの詳細が不明

**現在の実装**:
```typescript
const removedCount = blockRemovalService.processRemovalChain(this._field);
if (removedCount > 0) {
  this._score = this._score.add(removedCount);
}
```

**推奨**:
要件書を確認し、以下のいずれかを選択：
1. **シンプル版**: 削除マス数のみ（現状維持）
2. **拡張版**: 連鎖ボーナスを追加

要件書（requirements.md）には「連鎖は発生するが、ボーナス得点はなし」と記載されているため、**現状維持（シンプル版）が正しい**。

**対応**: 問題なし（要件書通り）

---

## 💡 推奨事項

### 1. Phase間のレビューポイントの設定

各Phaseの完了時に以下を確認：
- 実装されたコードが設計書と一致しているか
- すべてのテストが成功しているか
- 次のPhaseへの依存関係が満たされているか

### 2. 統合テストの詳細化

Phase 4の統合テストで以下のシナリオを追加：
- ブロック消去と連鎖が正しく動作するか
- ゲームオーバー判定が正しく動作するか
- 高速落下と即座落下が正しく動作するか

### 3. ドキュメントの一元管理

設計書が8ファイルに分かれているため、変更時の整合性維持が困難になる可能性がある。

**推奨**:
- 主要な設計決定を`integration-design.md`に集約
- 各詳細設計書への参照を明記
- 変更履歴を記録する

### 4. 見積もりの精度向上

**推奨**:
- 実装開始後、実績を記録して見積もりの精度を向上させる
- バッファを明示的に設定（例: 基本見積もり + 20%のバッファ）

### 5. パフォーマンス目標の具体化

統合設計書に「フレーム処理時間 < 16ms」とあるが、測定方法が不明。

**推奨**:
- パフォーマンス測定方法を明示
- プロファイリングツールの使用計画を追加
- Chrome DevToolsのPerformanceタブを使用

### 6. ドメインイベントの実装判断

**推奨**:
初期実装では省略し、Phase 5（将来の拡張）として記載

---

## 修正優先度

### 高優先度（実装前に修正が必要）

1. **Gameエンティティの不変条件の見直し**
   - `docs/design/ddd-specification.md`を修正

2. **BlockPattern.rotate()のnullの扱いの明確化**
   - `docs/design/value-objects-detailed-design.md`を修正

3. **Game.landBlock()の実装タイミングの統一**
   - `docs/design/entities-detailed-design.md`を修正
   - `docs/implementation-plan/phase1/issue-1-2-entities.md`を修正

### 中優先度（Phase 1開始前に修正を推奨）

4. **メソッド名の統一**
   - `decelerateFall` → `disableFastFall`に統一

5. **RandomGeneratorとドメインサービスの統合**
   - `BlockPatternGeneratorService`のコンストラクタに注入

### 低優先度（実装中または完了後に対応可能）

6. **ドメインイベントの実装判断**
7. **テストカバレッジの対象範囲の明確化**
8. **パフォーマンス測定方法の具体化**

---

## 全体評価

### 評価: A（優秀）

設計書と実装計画は全体的に高品質で、実装可能なレベルに達しています。DDDの原則に従った設計が行われており、レイヤードアーキテクチャも明確です。

指摘された問題点は比較的軽微で、修正も容易です。高優先度の3つの問題を修正すれば、実装を開始できる状態になります。

### 次のステップ

1. **高優先度の問題を修正** - 1-2時間
2. **修正内容をコミット** - 10分
3. **Phase 1の実装を開始** - Issue 1-1から着手

---

**レビュー担当**: Claude
**レビュー完了日**: 2025-11-04
