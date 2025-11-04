# Square - ドメイン駆動設計 仕様書

## 1. ドメインモデル概要

Squareは、同じ色のブロックを矩形に揃えて消す落ちものパズルゲームです。このドメインモデルは、ゲームのコアロジックを表現し、技術的な実装詳細から独立した形で設計されています。

## 2. ユビキタス言語

ドメインの専門用語を定義し、チーム全体で共通の言語を使用します。

| 用語 | 説明 |
|------|------|
| **ゲームフィールド** | 8x20マスのグリッド空間。ブロックが配置される領域 |
| **落下ブロック** | 上から落ちてくる2x2マスのブロック群 |
| **固定ブロック** | フィールドに固定されたブロック |
| **ブロック** | 単一の色を持つ1x1マスの最小単位 |
| **ブロックパターン** | 落下ブロックの色配置（4, 3x1, 2x2, 2x1x1） |
| **消去判定** | 同じ色で4マス以上の矩形が形成されているかの判定 |
| **自由落下** | ブロック消去後、上にあるブロックが重力で落ちる処理 |
| **連鎖** | 自由落下後に再度消去が発生すること |
| **接地** | 落下ブロックが下に移動できなくなり固定される状態 |
| **回転** | 落下ブロックを90度回転させる操作 |
| **即座落下** | 落下ブロックを一瞬で接地位置まで移動させる操作 |

## 3. エンティティ（Entity）

### 3.1 Game（ゲーム）

**責務**: ゲーム全体のライフサイクルと状態を管理する

**属性**:
- `gameId: string` - ゲームの一意識別子
- `state: GameState` - ゲームの状態（Playing, Paused, GameOver）
- `field: Field` - ゲームフィールド
- `fallingBlock: FallingBlock | null` - 現在落下中のブロック
- `nextBlock: BlockPattern` - 次に落ちてくるブロックパターン
- `score: Score` - 現在のスコア
- `frameCount: number` - ゲーム開始からのフレーム数

**振る舞い**:
- `start()`: ゲームを開始する
- `pause()`: ゲームを一時停止する
- `resume()`: ゲームを再開する
- `restart()`: ゲームをリセットして再開する
- `update()`: 1フレーム分のゲーム状態を更新する
- `isGameOver(): boolean`: ゲームオーバー判定

### 3.2 Field（ゲームフィールド）

**責務**: ゲームフィールドの状態とブロック配置を管理する

**属性**:
- `width: number` - フィールドの幅（8マス）
- `height: number` - フィールドの高さ（20マス）
- `grid: (Block | null)[][]` - ブロック配置の2次元配列

**振る舞い**:
- `placeBlock(position: Position, block: Block): void` - 指定位置にブロックを配置
- `removeBlock(position: Position): void` - 指定位置のブロックを削除
- `getBlock(position: Position): Block | null` - 指定位置のブロックを取得
- `isEmpty(position: Position): boolean` - 指定位置が空かどうか
- `isValidPosition(position: Position): boolean` - 指定位置がフィールド内かどうか
- `clear()`: フィールドをクリアする

### 3.3 FallingBlock（落下ブロック）

**責務**: 現在落下中のブロックの状態と移動を管理する

**属性**:
- `pattern: BlockPattern` - ブロックパターン
- `position: Position` - 現在位置（左上の座標）
- `rotation: Rotation` - 回転状態（0, 90, 180, 270度）

**振る舞い**:
- `moveLeft()`: 左に移動
- `moveRight()`: 右に移動
- `moveDown()`: 下に移動
- `rotateClockwise()`: 右回転（時計回り）
- `rotateCounterClockwise()`: 左回転（反時計回り）
- `canMove(direction: Direction, field: Field): boolean` - 移動可能かどうか
- `canRotate(rotationDirection: RotationDirection, field: Field): boolean` - 回転可能かどうか
- `getBlocks(): BlockWithPosition[]` - 各ブロックの絶対座標を取得

## 4. 値オブジェクト（Value Object）

### 4.1 Position（座標）

**属性**:
- `x: number` - X座標（0-7）
- `y: number` - Y座標（0-19）

**振る舞い**:
- `equals(other: Position): boolean` - 座標が等しいか
- `add(other: Position): Position` - 座標を加算
- `isValid(width: number, height: number): boolean` - 座標が有効範囲内か

### 4.2 Color（色）

**属性**:
- `type: ColorType` - 色の種類（Blue, Red, Yellow）
- `hexCode: string` - 16進数カラーコード

**振る舞い**:
- `equals(other: Color): boolean` - 色が等しいか

**定数**:
- `BLUE: Color` - `#3498db`
- `RED: Color` - `#e74c3c`
- `YELLOW: Color` - `#f1c40f`

### 4.3 Block（ブロック）

**属性**:
- `color: Color` - ブロックの色

**振る舞い**:
- `equals(other: Block): boolean` - ブロックが等しいか
- `isSameColor(other: Block): boolean` - 同じ色かどうか

### 4.4 BlockPattern（ブロックパターン）

**属性**:
- `patternType: PatternType` - パターンの種類（Pattern4, Pattern3x1, Pattern2x2, Pattern2x1x1）
- `blocks: Block[][]` - 2x2の色配置

**振る舞い**:
- `rotate(rotation: Rotation): Block[][]` - 回転後の配置を取得
- `getBlockAt(x: number, y: number, rotation: Rotation): Block` - 指定位置のブロックを取得

**ファクトリメソッド**:
- `createRandom(): BlockPattern` - ランダムなパターンを生成

### 4.5 Score（スコア）

**属性**:
- `value: number` - スコアの値

**振る舞い**:
- `add(points: number): Score` - スコアを加算
- `reset(): Score` - スコアをリセット

### 4.6 Rectangle（矩形）

**属性**:
- `topLeft: Position` - 左上座標
- `width: number` - 幅
- `height: number` - 高さ

**振る舞い**:
- `contains(position: Position): boolean` - 指定位置を含むか
- `getPositions(): Position[]` - 矩形内の全座標を取得
- `area(): number` - 面積を取得

### 4.7 GameState（ゲーム状態）

**列挙型**:
- `Playing` - プレイ中
- `Paused` - 一時停止
- `GameOver` - ゲームオーバー

## 5. 集約（Aggregate）

### 5.1 GameAggregate

**集約ルート**: `Game`

**集約内エンティティ**:
- `Game` (ルート)
- `Field`
- `FallingBlock`

**集約内値オブジェクト**:
- `Score`
- `BlockPattern`
- `Position`
- `Block`
- `Color`

**不変条件**:
- フィールドのサイズは常に8x20
- スコアは常に0以上
- 落下ブロックは0個または1個存在する
- 落下ブロックが存在する場合、必ず有効な位置に存在する
- 同時に落下できるブロックは1つのみ
- ゲーム状態はPlaying、Paused、GameOverのいずれか

**境界の理由**:
これらのオブジェクトは1つの一貫性境界として管理される必要があります。落下ブロックの移動、ブロックの消去、スコアの更新は、すべてゲームの一貫性を保つために協調して行われる必要があります。

## 6. ドメインサービス（Domain Service）

### 6.1 BlockMatchingService（消去判定サービス）

**責務**: ブロックの消去判定ロジックを提供する

**メソッド**:
- `findMatchingRectangles(field: Field): Rectangle[]` - 消去可能な矩形を全て検索
- `isRectangle(positions: Position[], color: Color, field: Field): boolean` - 指定位置が同色の矩形を形成しているか
- `canFormSquare(position: Position, color: Color, field: Field): boolean` - 指定位置から矩形が形成できるか

**アルゴリズム**:
1. フィールド全体をスキャン
2. 各ブロックを起点として、右方向と下方向に同じ色が連続する数を計算
3. 2x2以上の矩形を検出
4. 重複を排除して返却

### 6.2 BlockFallService（落下処理サービス）

**責務**: ブロックの自由落下処理を提供する

**メソッド**:
- `applyGravity(field: Field): boolean` - 重力を適用してブロックを落下させる。落下が発生した場合trueを返す
- `getLowestEmptyPosition(column: number, startY: number, field: Field): number` - 指定列の最も下の空き位置を取得
- `canFall(position: Position, field: Field): boolean` - 指定位置のブロックが落下可能か

**アルゴリズム**:
1. 下から2行目から上に向かってスキャン
2. 各ブロックについて、下に空きがあるかチェック
3. 空きがある場合、可能な限り下に移動
4. すべてのブロックを処理するまで繰り返す

### 6.3 BlockRemovalService（ブロック削除サービス）

**責務**: ブロックの削除処理とスコア計算を提供する

**メソッド**:
- `removeBlocks(rectangles: Rectangle[], field: Field): number` - 指定矩形のブロックを削除し、削除マス数を返す
- `processRemovalChain(field: Field): number` - 連鎖も含めた削除処理を実行し、総削除マス数を返す

**処理フロー**:
1. 矩形内のブロックを全て削除
2. 削除マス数を計算
3. 自由落下を適用
4. 再度消去判定（連鎖）
5. 連鎖がなくなるまで繰り返す

### 6.4 CollisionDetectionService（衝突判定サービス）

**責務**: ブロックの衝突判定を提供する

**メソッド**:
- `canPlaceBlock(position: Position, blocks: Block[][], field: Field): boolean` - 指定位置にブロックパターンを配置できるか
- `isColliding(position: Position, blocks: Block[][], field: Field): boolean` - 衝突しているか
- `isOutOfBounds(position: Position, blocks: Block[][], fieldWidth: number, fieldHeight: number): boolean` - フィールド外にはみ出しているか

### 6.5 BlockPatternGeneratorService（ブロックパターン生成サービス）

**責務**: ブロックパターンのランダム生成を提供する

**メソッド**:
- `generate(): BlockPattern` - ランダムなブロックパターンを生成
- `generatePattern4(): BlockPattern` - パターン4を生成
- `generatePattern3x1(): BlockPattern` - パターン3x1を生成
- `generatePattern2x2(): BlockPattern` - パターン2x2を生成
- `generatePattern2x1x1(): BlockPattern` - パターン2x1x1を生成

**生成ルール**:
- 各パターンの出現確率は均等（25%ずつ）
- 色はBlue、Red、Yellowからランダムに選択
- パターン3x1は4つの配置パターンからランダムに選択
- パターン2x2は横並び、縦並び、斜め配置からランダムに選択

## 7. アプリケーションサービス（Application Service）

### 7.1 GameApplicationService

**責務**: ゲームのユースケースを実行する

**メソッド**:
- `startNewGame(): GameDto` - 新しいゲームを開始
- `pauseGame(gameId: string): void` - ゲームを一時停止
- `resumeGame(gameId: string): void` - ゲームを再開
- `restartGame(gameId: string): GameDto` - ゲームを再開
- `moveBlockLeft(gameId: string): void` - ブロックを左に移動
- `moveBlockRight(gameId: string): void` - ブロックを右に移動
- `rotateBlockClockwise(gameId: string): void` - ブロックを右回転
- `rotateBlockCounterClockwise(gameId: string): void` - ブロックを左回転
- `accelerateFall(gameId: string): void` - 高速落下を有効化
- `dropInstantly(gameId: string): void` - 即座落下を実行
- `updateFrame(gameId: string): GameDto` - 1フレーム分のゲーム状態を更新

### 7.2 InputHandlerService

**責務**: ユーザー入力を処理する

**メソッド**:
- `handleKeyDown(key: string, gameId: string): void` - キー押下イベントを処理
- `handleKeyUp(key: string, gameId: string): void` - キー解放イベントを処理
- `canAcceptInput(key: string, frameCount: number): boolean` - 入力を受け付けるか（連続入力待ち）

**入力マッピング**:
- 左右キー → 横移動（4フレーム待ち）
- 上キー / Zキー → 右回転
- Xキー / Ctrlキー → 左回転
- 下キー → 高速落下
- スペースキー → 即座落下
- Pキー → 一時停止/再開
- Rキー → リスタート

## 8. ドメインイベント（Domain Event）

### 8.1 BlockLandedEvent（ブロック接地イベント）

**発生タイミング**: 落下ブロックが接地した時

**属性**:
- `gameId: string`
- `landedBlock: FallingBlock`
- `occurredAt: Date`

### 8.2 BlocksRemovedEvent（ブロック削除イベント）

**発生タイミング**: ブロックが消去された時

**属性**:
- `gameId: string`
- `removedRectangles: Rectangle[]`
- `earnedScore: number`
- `isChain: boolean` - 連鎖かどうか
- `occurredAt: Date`

### 8.3 GameOverEvent（ゲームオーバーイベント）

**発生タイミング**: ゲームオーバーになった時

**属性**:
- `gameId: string`
- `finalScore: number`
- `occurredAt: Date`

### 8.4 GameStartedEvent（ゲーム開始イベント）

**発生タイミング**: ゲームが開始された時

**属性**:
- `gameId: string`
- `occurredAt: Date`

## 9. リポジトリ（Repository）

### 9.1 GameRepository（インターフェース）

**責務**: ゲームの永続化（将来的な拡張用）

**メソッド**:
- `save(game: Game): void` - ゲームを保存
- `findById(gameId: string): Game | null` - ゲームを取得
- `delete(gameId: string): void` - ゲームを削除

**注意**: 初期実装ではインメモリリポジトリとして実装し、将来的にLocalStorageやサーバーへの保存に対応できるようにする。

## 10. データ転送オブジェクト（DTO）

### 10.1 GameDto

```typescript
{
  gameId: string;
  state: 'playing' | 'paused' | 'gameOver';
  score: number;
  field: (string | null)[][]; // 色の文字列表現
  fallingBlock: {
    pattern: (string)[][];
    position: { x: number; y: number };
    rotation: number;
  } | null;
  nextBlock: (string)[][];
}
```

## 11. レイヤーアーキテクチャ

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   (UI, Canvas Rendering)            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Application Layer                 │
│   (Application Services)            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Domain Layer                      │
│   (Entities, Value Objects,         │
│    Domain Services, Aggregates)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Infrastructure Layer              │
│   (Repository Implementations,      │
│    Frame Timer, Random Generator)   │
└─────────────────────────────────────┘
```

### 依存関係のルール

1. **Presentation Layer** → Application Layer（アプリケーションサービスを呼び出す）
2. **Application Layer** → Domain Layer（ドメインオブジェクトを使用）
3. **Domain Layer** → どのレイヤーにも依存しない（純粋なビジネスロジック）
4. **Infrastructure Layer** → Domain Layer（インターフェースを実装）

## 12. 実装上の注意事項

### 12.1 不変性の保持

- 値オブジェクトは不変（Immutable）として実装する
- 状態変更は新しいインスタンスを返すようにする
- 例: `score.add(10)` は新しいScoreオブジェクトを返す

### 12.2 ドメインロジックの配置

- ビジネスルールはドメイン層に集約する
- UIや技術的な詳細はプレゼンテーション層とインフラ層に分離する
- ドメインサービスは複数のエンティティにまたがるロジックを扱う

### 12.3 テスタビリティ

- ドメイン層は外部依存がないため、単体テストが容易
- アプリケーションサービスはモックを使用してテスト可能
- 各レイヤーを独立してテストできる構造

### 12.4 拡張性

- 新しいブロックパターンの追加が容易
- 消去ルールの変更に柔軟に対応
- 異なる描画エンジンへの切り替えが可能
- スコアリングロジックの変更が容易

## 13. ゲームループの処理フロー

```
┌─────────────────────────────────────────┐
│ 1. 入力処理                              │
│    - キー入力の受付                      │
│    - 連続入力待ちのチェック              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. ゲーム状態更新                        │
│    - フレームカウントの増加              │
│    - 落下タイミングのチェック            │
│    - 落下ブロックの移動                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. 接地判定                              │
│    - 落下ブロックが接地したか            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. ブロック固定                          │
│    - フィールドにブロックを配置          │
│    - BlockLandedEventを発行              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 5. 消去判定                              │
│    - BlockMatchingServiceで矩形を検索    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 6. ブロック削除                          │
│    - BlockRemovalServiceで削除           │
│    - スコア加算                          │
│    - BlocksRemovedEventを発行            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 7. 自由落下                              │
│    - BlockFallServiceで落下処理          │
│    - 再度消去判定（連鎖処理）            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 8. ゲームオーバー判定                    │
│    - 最上段にブロックがあるか            │
│    - GameOverEventを発行                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 9. 次のブロック生成                      │
│    - BlockPatternGeneratorServiceで生成  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 10. 描画                                 │
│     - Canvas APIで描画                   │
└─────────────────────────────────────────┘
```

## 14. まとめ

このドメイン駆動設計仕様書は、Squareゲームのビジネスロジックを技術的な実装詳細から分離し、保守性と拡張性の高いアーキテクチャを提供します。

### 主要な設計原則

1. **単一責任の原則**: 各オブジェクトは明確に定義された単一の責務を持つ
2. **関心の分離**: ドメインロジック、アプリケーションロジック、プレゼンテーションロジックを分離
3. **依存性逆転の原則**: ドメイン層は他の層に依存せず、インターフェースを介して協調
4. **不変性**: 値オブジェクトの不変性により、予期しない副作用を防ぐ
5. **集約の整合性**: 集約ルートを通じて整合性を保証

この設計に基づいて実装することで、テスト可能で保守しやすく、将来的な機能追加にも柔軟に対応できるコードベースを構築できます。
