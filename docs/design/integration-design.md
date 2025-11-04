# Square - 統合設計書

## 1. ドキュメント構成

このドキュメントは、Square落ちものパズルゲームの統合設計書です。以下のドキュメントと合わせて参照してください：

1. **ddd-specification.md** - ドメイン駆動設計の仕様書
2. **detailed-design-plan.md** - 詳細設計計画書
3. **value-objects-detailed-design.md** - 値オブジェクトの詳細設計
4. **entities-detailed-design.md** - エンティティの詳細設計
5. **domain-services-detailed-design.md** - ドメインサービスの詳細設計
6. **application-layer-detailed-design.md** - アプリケーション層の詳細設計
7. **infrastructure-presentation-layers-detailed-design.md** - インフラ層・プレゼンテーション層の詳細設計
8. **integration-design.md** (本ドキュメント) - 統合設計書

## 2. アーキテクチャ概要

### 2.1 レイヤードアーキテクチャ

```
┌─────────────────────────────────────────┐
│   Presentation Layer                    │
│   - CanvasRenderer                      │
│   - UIRenderer                          │
│   - GameController                      │
│   - HTML/CSS                            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Application Layer                     │
│   - GameApplicationService              │
│   - InputHandlerService                 │
│   - GameDto                             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Domain Layer                          │
│   ┌─────────────────────────────────┐   │
│   │ Entities                        │   │
│   │ - Game                          │   │
│   │ - Field                         │   │
│   │ - FallingBlock                  │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │ Value Objects                   │   │
│   │ - Position, Color, Block        │   │
│   │ - BlockPattern, Score           │   │
│   │ - Rectangle, GameState          │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │ Domain Services                 │   │
│   │ - BlockMatchingService          │   │
│   │ - BlockFallService              │   │
│   │ - BlockRemovalService           │   │
│   │ - CollisionDetectionService     │   │
│   │ - BlockPatternGeneratorService  │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Infrastructure Layer                  │
│   - InMemoryGameRepository              │
│   - FrameTimer                          │
│   - RandomGenerator                     │
└─────────────────────────────────────────┘
```

### 2.2 依存関係のルール

1. **Presentation → Application**: プレゼンテーション層はアプリケーション層を呼び出す
2. **Application → Domain**: アプリケーション層はドメイン層を使用
3. **Domain → なし**: ドメイン層は他の層に依存しない（純粋なビジネスロジック）
4. **Infrastructure → Domain**: インフラ層はドメイン層のインターフェースを実装

## 3. コンポーネント一覧

### 3.1 ドメイン層

#### 3.1.1 値オブジェクト

| クラス | 責務 | ファイルパス |
|--------|------|--------------|
| `Position` | 2次元座標を表現 | `src/domain/models/value-objects/Position.ts` |
| `Color` | ブロックの色を表現 | `src/domain/models/value-objects/Color.ts` |
| `Block` | 単一ブロック（1x1マス）を表現 | `src/domain/models/value-objects/Block.ts` |
| `BlockPattern` | 落下ブロックパターン（2x2マス）を表現 | `src/domain/models/value-objects/BlockPattern.ts` |
| `Score` | ゲームスコアを表現 | `src/domain/models/value-objects/Score.ts` |
| `Rectangle` | 矩形領域を表現 | `src/domain/models/value-objects/Rectangle.ts` |
| `GameState` | ゲームの状態を表現 | `src/domain/models/value-objects/GameState.ts` |

#### 3.1.2 エンティティ

| クラス | 責務 | ファイルパス |
|--------|------|--------------|
| `Field` | ゲームフィールドの状態を管理 | `src/domain/models/entities/Field.ts` |
| `FallingBlock` | 現在落下中のブロックの状態を管理 | `src/domain/models/entities/FallingBlock.ts` |
| `Game` | ゲーム全体のライフサイクルを管理 | `src/domain/models/entities/Game.ts` |

#### 3.1.3 ドメインサービス

| クラス | 責務 | ファイルパス |
|--------|------|--------------|
| `BlockMatchingService` | ブロックの消去判定 | `src/domain/services/BlockMatchingService.ts` |
| `BlockFallService` | ブロックの自由落下処理 | `src/domain/services/BlockFallService.ts` |
| `BlockRemovalService` | ブロックの削除とスコア計算 | `src/domain/services/BlockRemovalService.ts` |
| `CollisionDetectionService` | 衝突判定 | `src/domain/services/CollisionDetectionService.ts` |
| `BlockPatternGeneratorService` | ブロックパターンの生成 | `src/domain/services/BlockPatternGeneratorService.ts` |

### 3.2 アプリケーション層

| クラス/型 | 責務 | ファイルパス |
|-----------|------|--------------|
| `GameApplicationService` | ゲームのユースケースを実行 | `src/application/services/GameApplicationService.ts` |
| `InputHandlerService` | ユーザー入力の処理 | `src/application/services/InputHandlerService.ts` |
| `GameDto` | データ転送オブジェクト | `src/application/dto/GameDto.ts` |

### 3.3 インフラ層

| クラス | 責務 | ファイルパス |
|--------|------|--------------|
| `InMemoryGameRepository` | ゲームの永続化（インメモリ） | `src/infrastructure/repositories/InMemoryGameRepository.ts` |
| `FrameTimer` | ゲームループのタイミング制御 | `src/infrastructure/timer/FrameTimer.ts` |
| `RandomGenerator` | ランダム値生成の抽象化 | `src/infrastructure/random/RandomGenerator.ts` |

### 3.4 プレゼンテーション層

| クラス | 責務 | ファイルパス |
|--------|------|--------------|
| `CanvasRenderer` | ゲーム画面の描画 | `src/presentation/renderers/CanvasRenderer.ts` |
| `UIRenderer` | UI要素の更新 | `src/presentation/renderers/UIRenderer.ts` |
| `GameController` | ゲーム全体の制御 | `src/presentation/controllers/GameController.ts` |

## 4. 主要なデータフロー

### 4.1 ゲーム開始フロー

```
User (ブラウザ)
  │
  │ 1. ページロード
  ├─────────────────────────────────┐
  │                                 ↓
  │                           main.ts (エントリーポイント)
  │                                 │
  │                                 │ 2. 依存関係の組み立て
  │                                 ├───→ InMemoryGameRepository
  │                                 ├───→ BlockPatternGeneratorService
  │                                 ├───→ GameApplicationService
  │                                 ├───→ InputHandlerService
  │                                 ├───→ CanvasRenderer
  │                                 ├───→ UIRenderer
  │                                 └───→ GameController
  │                                 │
  │                                 │ 3. ゲーム開始
  │                                 ↓
  │                           GameController.start()
  │                                 │
  │                                 │ 4. 新規ゲーム作成
  │                                 ↓
  │                    GameApplicationService.startNewGame()
  │                                 │
  │                                 │ 5. ドメインオブジェクト生成
  │                                 ↓
  │                           Game.create() → Game.start()
  │                                 │
  │                                 │ 6. リポジトリに保存
  │                                 ↓
  │                    GameRepository.save(game)
  │                                 │
  │                                 │ 7. DTOに変換
  │                                 ↓
  │                           toDto(game) → GameDto
  │                                 │
  │                                 │ 8. 初回描画
  │                                 ↓
  │                    CanvasRenderer.render(gameDto)
  │                    UIRenderer.render(gameDto)
  │                                 │
  │                                 │ 9. ゲームループ開始
  │                                 ↓
  │                    FrameTimer.start(gameLoop, 30fps)
  │
  │ 10. 画面に表示
  ↓
User (ゲーム画面)
```

### 4.2 ユーザー入力フロー

```
User
  │
  │ 1. キー押下（例: ArrowLeft）
  ├────────────────────────────────┐
  │                                ↓
  │                    window.addEventListener('keydown')
  │                                │
  │                                ↓
  │                    GameController (イベント受信)
  │                                │
  │                                │ 2. 入力処理に委譲
  │                                ↓
  │                    InputHandlerService.handleKeyDown(key, gameId)
  │                                │
  │                                │ 3. キーマッピングに基づき処理
  │                                │ (ArrowLeft → moveBlockLeft)
  │                                ↓
  │                    GameApplicationService.moveBlockLeft(gameId)
  │                                │
  │                                │ 4. リポジトリからゲーム取得
  │                                ↓
  │                    GameRepository.findById(gameId)
  │                                │
  │                                │ 5. ドメインロジック実行
  │                                ↓
  │                    Game.moveFallingBlockLeft()
  │                                │
  │                                │ 6. 移動可否判定
  │                                ↓
  │                    FallingBlock.canMove('left', field)
  │                                │
  │                                │ 7. 移動実行
  │                                ↓
  │                    FallingBlock.moveLeft()
  │                                │
  │                                │ 8. リポジトリに保存
  │                                ↓
  │                    GameRepository.save(game)
  │
  │ 9. 次のフレームで描画に反映
  ↓
User (画面更新)
```

### 4.3 フレーム更新フロー

```
FrameTimer (30fps)
  │
  │ 1. 1/30秒ごとにコールバック呼び出し
  ├────────────────────────────────┐
  │                                ↓
  │                    GameController.gameLoop()
  │                                │
  │                                │ 2. ゲーム状態更新
  │                                ↓
  │                    GameApplicationService.updateFrame(gameId)
  │                                │
  │                                │ 3. リポジトリからゲーム取得
  │                                ↓
  │                    GameRepository.findById(gameId)
  │                                │
  │                                │ 4. ゲーム更新
  │                                ↓
  │                    Game.update()
  │                                │
  │                                ├─→ フレームカウント増加
  │                                │
  │                                ├─→ 落下タイミングチェック
  │                                │   (frameCount % fallSpeed === 0)
  │                                │
  │                                ├─→ 落下可能なら下に移動
  │                                │   FallingBlock.moveDown()
  │                                │
  │                                └─→ 落下不可なら接地処理
  │                                    ├─→ フィールドにブロック固定
  │                                    ├─→ 消去判定
  │                                    │   BlockMatchingService.findMatchingRectangles()
  │                                    ├─→ ブロック削除
  │                                    │   BlockRemovalService.processRemovalChain()
  │                                    ├─→ スコア加算
  │                                    ├─→ ゲームオーバー判定
  │                                    └─→ 次のブロック生成
  │                                │
  │                                │ 5. リポジトリに保存
  │                                ↓
  │                    GameRepository.save(game)
  │                                │
  │                                │ 6. DTOに変換
  │                                ↓
  │                    toDto(game) → GameDto
  │                                │
  │                                │ 7. 描画
  │                                ↓
  │                    GameController.render(gameDto)
  │                                │
  │                                ├─→ CanvasRenderer.render(gameDto)
  │                                │   ├─→ clear()
  │                                │   ├─→ drawGrid()
  │                                │   ├─→ drawField()
  │                                │   └─→ drawFallingBlock()
  │                                │
  │                                └─→ UIRenderer.render(gameDto)
  │                                    ├─→ updateScore()
  │                                    ├─→ drawNextBlock()
  │                                    └─→ showGameOver()
  │
  │ 8. 画面更新
  ↓
User (画面表示)
```

### 4.4 ブロック消去と連鎖フロー

```
Game.landBlock()
  │
  │ 1. フィールドにブロック固定
  ├─→ Field.placeBlock() × 4マス
  │
  │ 2. 消去可能な矩形を検索
  ├─→ BlockMatchingService.findMatchingRectangles(field)
  │   │
  │   ├─→ フィールド全体をスキャン
  │   ├─→ 各ブロックを起点に矩形を検出
  │   └─→ Rectangle[] を返却
  │
  │ 3. 矩形がある場合、削除処理開始
  ├─→ BlockRemovalService.processRemovalChain(field)
  │   │
  │   │ ▼ 連鎖ループ開始
  │   │
  │   ├─→ 【消去フェーズ】
  │   │   BlockRemovalService.removeBlocks(rectangles, field)
  │   │   ├─→ 矩形内のブロックを全て削除
  │   │   └─→ 削除マス数をカウント
  │   │
  │   ├─→ 【落下フェーズ】
  │   │   BlockFallService.applyGravity(field)
  │   │   ├─→ 各列を下から処理
  │   │   ├─→ 空きスペースにブロックを移動
  │   │   └─→ 落下が完了するまで繰り返し
  │   │
  │   ├─→ 【再判定フェーズ】
  │   │   BlockMatchingService.findMatchingRectangles(field)
  │   │   └─→ 新たな消去可能な矩形を検索
  │   │
  │   │ ▲ 連鎖ループ終了（矩形がなくなるまで）
  │   │
  │   └─→ 総削除マス数を返却
  │
  │ 4. スコア加算
  ├─→ Score.add(removedCount)
  │
  │ 5. ゲームオーバー判定
  ├─→ Game.isGameOver()
  │   └─→ Field.hasBlockInTopRow()
  │
  │ 6. 次のブロック生成
  └─→ BlockPatternGeneratorService.generate()
```

## 5. エントリーポイント実装

### 5.1 main.ts

```typescript
import { GameApplicationService } from '@application/services/GameApplicationService';
import { InputHandlerService } from '@application/services/InputHandlerService';
import { InMemoryGameRepository } from '@infrastructure/repositories/InMemoryGameRepository';
import { BlockPatternGeneratorService } from '@domain/services/BlockPatternGeneratorService';
import { BlockMatchingService } from '@domain/services/BlockMatchingService';
import { BlockFallService } from '@domain/services/BlockFallService';
import { BlockRemovalService } from '@domain/services/BlockRemovalService';
import { CanvasRenderer } from '@presentation/renderers/CanvasRenderer';
import { UIRenderer } from '@presentation/renderers/UIRenderer';
import { GameController } from '@presentation/controllers/GameController';

// 依存関係の組み立て
function bootstrap(): GameController {
  // インフラ層
  const gameRepository = new InMemoryGameRepository();

  // ドメインサービス
  const blockPatternGenerator = new BlockPatternGeneratorService();
  const blockMatchingService = new BlockMatchingService();
  const blockFallService = new BlockFallService();
  const blockRemovalService = new BlockRemovalService(
    blockMatchingService,
    blockFallService
  );

  // アプリケーション層
  const gameApplicationService = new GameApplicationService(
    gameRepository,
    blockPatternGenerator,
    blockMatchingService,
    blockRemovalService
  );

  const inputHandlerService = new InputHandlerService(gameApplicationService);

  // プレゼンテーション層
  const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const canvasRenderer = new CanvasRenderer(gameCanvas, 30);
  const uiRenderer = new UIRenderer();

  const gameController = new GameController(
    gameApplicationService,
    inputHandlerService,
    canvasRenderer,
    uiRenderer
  );

  return gameController;
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
  const gameController = bootstrap();
  gameController.start();
});
```

## 6. 実装順序

### Phase 1: ドメイン層の基盤（優先度: 最高）

#### 週1: 値オブジェクト
- [ ] Position
- [ ] Color
- [ ] Block
- [ ] BlockPattern
- [ ] Score
- [ ] Rectangle
- [ ] GameState

#### 週2: エンティティ
- [ ] Field
- [ ] FallingBlock
- [ ] Game（基本機能のみ）

#### 週3: ドメインサービス
- [ ] CollisionDetectionService
- [ ] BlockPatternGeneratorService
- [ ] BlockMatchingService
- [ ] BlockFallService
- [ ] BlockRemovalService

### Phase 2: アプリケーション層とインフラ層（優先度: 高）

#### 週4: リポジトリとアプリケーションサービス
- [ ] GameRepository（インターフェース）
- [ ] InMemoryGameRepository
- [ ] GameApplicationService
- [ ] GameDto

#### 週5: 入力処理とインフラ
- [ ] InputHandlerService
- [ ] FrameTimer
- [ ] RandomGenerator

### Phase 3: プレゼンテーション層（優先度: 高）

#### 週6: レンダラー
- [ ] CanvasRenderer
- [ ] UIRenderer

#### 週7: コントローラーとUI
- [ ] GameController
- [ ] HTML/CSS
- [ ] main.ts（エントリーポイント）

### Phase 4: 統合とテスト（優先度: 中）

#### 週8-9: 単体テスト
- [ ] ドメイン層のテスト
- [ ] アプリケーション層のテスト

#### 週10: 統合テストと調整
- [ ] ゲームフローの統合テスト
- [ ] バグフィックス
- [ ] パフォーマンス最適化

## 7. テスト戦略

### 7.1 単体テスト

**対象**: ドメイン層、アプリケーション層

**ツール**: Vitest

**カバレッジ目標**: 80%以上

**優先順位**:
1. 値オブジェクト（Position, Color, Block, etc.）
2. ドメインサービス（BlockMatchingService, etc.）
3. エンティティ（Game, Field, FallingBlock）
4. アプリケーションサービス

### 7.2 統合テスト

**対象**: 複数の層にまたがる処理

**テストケース例**:
- ゲーム開始から終了までのフロー
- ブロック消去と連鎖の処理
- ゲームオーバー判定

### 7.3 E2Eテスト

**対象**: ユーザーシナリオ

**テストケース例**:
- ゲームをプレイして2x2の矩形を消す
- ゲームオーバーまでプレイする
- 一時停止とリスタート

## 8. パフォーマンス目標

| 項目 | 目標値 |
|------|--------|
| フレームレート | 30fps（安定動作） |
| フレーム処理時間 | < 16ms |
| メモリ使用量 | < 50MB |
| 初回ロード時間 | < 2秒 |

## 9. 拡張性

### 9.1 将来的な拡張案

- **難易度設定**: 落下速度の調整
- **ハイスコア機能**: LocalStorageでの保存
- **サウンド効果**: 操作音、消去音
- **アニメーション**: ブロック消去時のエフェクト
- **マルチプレイヤー**: WebSocketでリアルタイム対戦

### 9.2 技術的な拡張案

- **状態管理ライブラリ**: Redux/Zustandの導入
- **WebGL**: Canvas2Dから3D描画への移行
- **Web Workers**: ゲームロジックをバックグラウンドで実行
- **PWA**: オフライン対応、インストール可能

## 10. まとめ

この統合設計書は、Squareゲームの全体像を把握し、各コンポーネントがどのように連携するかを理解するためのガイドです。

各詳細設計書と合わせて参照することで、実装時に必要な情報を素早く見つけることができます。

### 設計の特徴

1. **レイヤードアーキテクチャ**: 関心の分離により、保守性と拡張性を確保
2. **ドメイン駆動設計**: ビジネスロジックをドメイン層に集約
3. **依存性逆転の原則**: インターフェースを介した疎結合
4. **不変性**: 値オブジェクトの不変性による予期しない副作用の防止
5. **テスタビリティ**: 各層を独立してテスト可能

この設計により、高品質で保守性の高いゲームを構築できます。
