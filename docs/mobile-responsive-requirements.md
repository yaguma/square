# モバイル対応（レスポンシブUI）要件定義書

**作成日**: 2025-11-05
**プロジェクト**: Square（テトリス風ゲーム）
**対象**: モバイル端末対応機能追加

---

## 1. プロジェクト概要

### 1.1 現状分析
現在のSquareプロジェクトは以下の状態：

- **アーキテクチャ**: Clean Architecture + DDD
- **技術スタック**: Vanilla TypeScript + HTML Canvas + Vite
- **入力方式**: キーボード入力のみ
- **画面サイズ**: 固定サイズ（Canvas: 240x600px, ブロック: 30px）
- **レスポンシブ対応**: なし（`max-width: 800px`のみ）

### 1.2 課題
- ✗ スマートフォンでは画面からはみ出る可能性
- ✗ タッチ操作に対応していない
- ✗ 縦長画面に最適化されていない
- ✗ Canvasサイズとブロックサイズが固定

---

## 2. 目的と目標

### 2.1 目的
スマートフォンユーザーが快適にゲームをプレイできるようにする。

### 2.2 目標
1. **画面適応**: スマホの縦長画面（9:16〜9:21）で全要素が収まる
2. **操作性**: タッチ操作用のUIコントロールを提供
3. **互換性**: PC（キーボード）とモバイル（タッチ）の両方で動作
4. **パフォーマンス**: 既存のパフォーマンスを維持（30fps）

---

## 3. 機能要件

### 3.1 レスポンシブレイアウト

#### 3.1.1 画面サイズ対応
| ブレークポイント | 画面幅 | 対象デバイス | レイアウト |
|----------------|--------|------------|-----------|
| デスクトップ | ≥768px | PC/タブレット横 | 現在のレイアウト（横並び） |
| モバイル | <768px | スマートフォン | 縦並び最適化 |

#### 3.1.2 Canvasの動的スケーリング
- **計算ロジック**:
  ```
  viewportWidth = window.innerWidth
  maxCanvasWidth = viewportWidth * 0.9 (90%使用)
  blockSize = Math.floor(maxCanvasWidth / FIELD_WIDTH)
  canvasWidth = blockSize * FIELD_WIDTH
  canvasHeight = blockSize * FIELD_HEIGHT
  ```
- **制約**:
  - デスクトップ: ブロックサイズ 20px〜40px
  - モバイル: ブロックサイズ 15px〜30px
  - 最小キャンバス幅: 200px
  - 最大キャンバス幅: 400px

#### 3.1.3 レイアウト変更（モバイル時）

**変更前（デスクトップ）**:
```
[Header]
[Score Panel | Next Block] [Game Canvas]
[Controls]
[Instructions]
```

**変更後（モバイル）**:
```
[Header]
[Score Panel | Next Block]
[Game Canvas]
[Touch Controls] ← 新規追加
[Controls (Pause/Reset)]
[Instructions] ← 折りたたみ可能
```

### 3.2 タッチ操作UI

#### 3.2.1 コントロールボタン配置

**レイアウト構成**:
```
    [↻回転L]     [↻回転R]

[←左]  [↓下]  [→右]

         [▼即落下]
```

#### 3.2.2 ボタン仕様

| ボタン | 機能 | サイズ | アイコン/ラベル |
|-------|------|-------|---------------|
| 左移動 | ArrowLeft相当 | 60x60px | `←` |
| 右移動 | ArrowRight相当 | 60x60px | `→` |
| 下移動（ソフトドロップ） | ArrowDown相当 | 60x60px | `↓` |
| 即座落下（ハードドロップ） | Space相当 | 180x50px | `▼ 即落下` |
| 時計回り回転 | ArrowUp/Z相当 | 70x70px | `↻` |
| 反時計回り回転 | X/Ctrl相当 | 70x70px | `↺` |

#### 3.2.3 ボタンインタラクション
- **タッチフィードバック**:
  - `touchstart`: ボタン色変更（視覚フィードバック）
  - `touchend`: 色を戻す
  - 触覚フィードバックは将来的に検討

- **連続入力制御**:
  - 左右移動: 既存のクールダウン133msを維持
  - 下移動: ホールド対応（押し続けると継続的に下降）
  - 回転: 連続タップ防止（200msクールダウン）

- **誤タップ防止**:
  - ボタン間マージン: 10px以上
  - ボタン外タッチは無視

#### 3.2.4 表示制御
- **デスクトップ**: タッチコントロール非表示（`display: none`）
- **モバイル**: タッチコントロール表示
- **切り替え条件**: ブレークポイント 768px

### 3.3 既存機能の維持

#### 3.3.1 キーボード操作
- PC環境では引き続きキーボード操作を優先
- タッチUIとキーボードの同時使用も可能（デバッグ用）

#### 3.3.2 ゲームロジック
- ゲームロジック（衝突判定、ライン消去、スコア計算等）は変更なし
- 既存のテストが全てパスすること

---

## 4. 非機能要件

### 4.1 パフォーマンス
- フレームレート: 30fps維持
- タッチイベント応答時間: <50ms
- レンダリング遅延: なし

### 4.2 ユーザビリティ
- ボタンタップ成功率: >95%（適切なボタンサイズ）
- 操作説明の明確化（モバイル用の説明追加）
- 画面回転対応: 縦向き固定推奨（将来的に横向き対応も検討）

### 4.3 互換性
- **ブラウザ**: Chrome, Safari, Firefox最新版
- **OS**: iOS 14+, Android 10+
- **画面サイズ**: 320px〜428px幅（一般的なスマホ）

### 4.4 保守性
- Clean Architectureの構造を維持
- 既存のコードへの影響を最小限に

---

## 5. 技術的実装方針

### 5.1 アーキテクチャ層への影響

#### 5.1.1 Presentation層（変更あり）
- **新規追加**: `TouchControlRenderer.ts`
  - タッチUIの描画とイベントハンドリング
  - DOM要素の作成と管理

- **変更**: `CanvasRenderer.ts`
  - ブロックサイズを動的計算に対応
  - コンストラクタでブロックサイズを受け取る

- **変更**: `GameController.ts`
  - TouchControlRendererの初期化と統合
  - リサイズイベントハンドリング追加

#### 5.1.2 Application層（変更あり）
- **変更**: `InputHandlerService.ts`
  - タッチイベントからのコマンド受付
  - 既存のキーボード処理との統合

#### 5.1.3 Domain層（変更なし）
- ゲームロジックは一切変更なし

#### 5.1.4 Infrastructure層（変更なし）
- リポジトリ、タイマー等は変更なし

### 5.2 CSSアプローチ

#### 5.2.1 メディアクエリ
```css
/* デスクトップ */
@media (min-width: 768px) {
  .touch-controls { display: none; }
  .game-container { flex-direction: row; }
}

/* モバイル */
@media (max-width: 767px) {
  .touch-controls { display: flex; }
  .game-container { flex-direction: column; }
  .instructions { /* 折りたたみ */ }
}
```

#### 5.2.2 フレキシブルレイアウト
- Flexboxを使用した柔軟なレイアウト
- `gap`プロパティで適切な余白確保

### 5.3 イベント処理

#### 5.3.1 タッチイベント
- `touchstart`: ボタン押下開始
- `touchend`: ボタン押下終了
- `touchcancel`: タッチキャンセル（画面外に移動等）
- **注意**: `preventDefault()`でスクロール防止

#### 5.3.2 リサイズイベント
- `window.addEventListener('resize', ...)`
- デバウンス処理（250ms）で過剰な再計算を防止

---

## 6. 実装ステップ

### Phase 1: レスポンシブレイアウト基盤
1. CSSメディアクエリの追加
2. CanvasRendererの動的サイズ対応
3. リサイズハンドリングの実装
4. モバイルレイアウトの調整

### Phase 2: タッチUI実装
1. TouchControlRendererクラスの作成
2. タッチボタンのHTML/CSS実装
3. タッチイベントハンドリング
4. InputHandlerServiceへの統合

### Phase 3: 調整と最適化
1. ボタンサイズとレイアウトの微調整
2. 視覚フィードバックの改善
3. パフォーマンステスト
4. クロスブラウザテスト

### Phase 4: ドキュメントとテスト
1. モバイル操作説明の追加
2. ユニットテストの追加
3. 統合テスト（タッチ操作シミュレーション）
4. ユーザーマニュアル更新

---

## 7. 成果物

### 7.1 コード
- [ ] `src/presentation/renderers/TouchControlRenderer.ts` (新規)
- [ ] `src/presentation/controllers/GameController.ts` (変更)
- [ ] `src/presentation/renderers/CanvasRenderer.ts` (変更)
- [ ] `src/application/services/InputHandlerService.ts` (変更)
- [ ] `public/styles.css` (変更)

### 7.2 ドキュメント
- [ ] 本要件定義書
- [ ] モバイル対応実装ガイド
- [ ] ユーザー向け操作説明（モバイル版）

### 7.3 テスト
- [ ] タッチイベントのユニットテスト
- [ ] レスポンシブレイアウトのE2Eテスト
- [ ] 既存テストの全パス確認

---

## 8. テスト要件

### 8.1 ユニットテスト
- TouchControlRendererの各メソッド
- タッチイベントハンドラー
- 動的サイズ計算ロジック

### 8.2 統合テスト
- タッチ操作→InputHandlerService→Game更新の流れ
- リサイズ時のCanvas再描画

### 8.3 手動テスト
| テストケース | 確認内容 | 対象デバイス |
|------------|---------|-------------|
| 基本操作 | 左右移動、回転、落下が正常動作 | iPhone, Android |
| レイアウト | 全要素が画面内に収まる | 各画面サイズ |
| 視覚FB | ボタンタップ時の色変化 | 全デバイス |
| 混在操作 | キーボードとタッチの併用 | PC（デバッグ） |
| パフォーマンス | 30fps維持、遅延なし | 低性能端末含む |

### 8.4 互換性テスト
- **iOS**: Safari（iPhone 12以降）
- **Android**: Chrome（Pixel, Galaxy）
- **デスクトップ**: Chrome, Firefox, Safari

---

## 9. リスクと対策

### 9.1 リスク
| リスク | 影響度 | 対策 |
|-------|-------|------|
| タッチ遅延 | 高 | タッチイベント最適化、デバウンス調整 |
| 小画面での操作性 | 中 | ボタンサイズ確保、レイアウト調整 |
| 既存機能破壊 | 高 | 既存テスト全実行、段階的実装 |
| ブラウザ互換性 | 中 | Polyfill検討、クロスブラウザテスト |

### 9.2 制約事項
- Canvas APIの制限（一部古いブラウザでは性能低下）
- タッチイベントの標準化が完全でない
- 画面回転時のレイアウト崩れ可能性

---

## 10. スケジュール（参考）

| Phase | 作業内容 | 想定工数 |
|-------|---------|---------|
| Phase 1 | レスポンシブレイアウト | 4-6時間 |
| Phase 2 | タッチUI実装 | 6-8時間 |
| Phase 3 | 調整と最適化 | 3-4時間 |
| Phase 4 | テストとドキュメント | 3-4時間 |
| **合計** | | **16-22時間** |

---

## 11. 承認

| 役割 | 氏名 | 承認日 |
|-----|------|-------|
| 作成者 | ずんだもん（Claude） | 2025-11-05 |
| レビュアー | - | - |
| 承認者 | - | - |

---

## 付録A: 参考UI図

### モバイルレイアウト（縦向き）
```
┌─────────────────────┐
│   Square (Header)   │
├─────────────────────┤
│ Score: 1000  Next:  │
│              ┌───┐  │
│              │▓▓ │  │
│              │▓▓ │  │
│              └───┘  │
├─────────────────────┤
│                     │
│   ┌─────────────┐   │
│   │             │   │
│   │   Canvas    │   │
│   │   (Game     │   │
│   │    Field)   │   │
│   │             │   │
│   │             │   │
│   │             │   │
│   └─────────────┘   │
│                     │
├─────────────────────┤
│  Touch Controls:    │
│   [↻]       [↺]     │
│                     │
│  [←]  [↓]  [→]      │
│                     │
│    [▼ 即落下]        │
├─────────────────────┤
│ [Pause] [Reset]     │
├─────────────────────┤
│ ▼ 操作説明...       │
└─────────────────────┘
```

### タッチコントロール詳細
```
    [70x70]  [70x70]
    ↺ 回転L  ↻ 回転R

[60x60] [60x60] [60x60]
←  左   ↓  下   →  右

     [180x50]
    ▼ 即落下
```

---

## 付録B: コード例（概要）

### B.1 動的Canvas サイズ計算
```typescript
function calculateCanvasSize(): { width: number; height: number; blockSize: number } {
  const viewportWidth = window.innerWidth;
  const isMobile = viewportWidth < 768;

  const maxWidth = isMobile
    ? viewportWidth * 0.9
    : Math.min(400, viewportWidth * 0.4);

  const blockSize = Math.floor(maxWidth / FIELD_WIDTH);
  const constrainedBlockSize = Math.max(
    isMobile ? 15 : 20,
    Math.min(isMobile ? 30 : 40, blockSize)
  );

  return {
    width: constrainedBlockSize * FIELD_WIDTH,
    height: constrainedBlockSize * FIELD_HEIGHT,
    blockSize: constrainedBlockSize
  };
}
```

### B.2 タッチイベントハンドリング
```typescript
class TouchControlRenderer {
  private setupEventListeners(): void {
    this.buttons.left.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleInput('left');
      this.buttons.left.classList.add('active');
    });

    this.buttons.left.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.buttons.left.classList.remove('active');
    });
    // ... 他のボタンも同様
  }

  private handleInput(action: string): void {
    this.inputHandler.handleTouchInput(action);
  }
}
```

---

**この要件定義書は、プロジェクトの方針や技術的状況に応じて更新される可能性があります。**
