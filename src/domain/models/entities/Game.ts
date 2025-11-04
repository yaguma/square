import { Field } from './Field';
import { FallingBlock } from './FallingBlock';
import { BlockPattern } from '@domain/models/value-objects/BlockPattern';
import { GameState } from '@domain/models/value-objects/GameState';
import { Score } from '@domain/models/value-objects/Score';
import { BlockPatternGenerator } from '@domain/services/BlockPatternGenerator';
import { BlockMatchingService } from '@domain/services/BlockMatchingService';
import { BlockFallService } from '@domain/services/BlockFallService';
import { BlockRemovalService } from '@domain/services/BlockRemovalService';

/**
 * 通常落下速度（フレーム数）
 */
export const NORMAL_FALL_SPEED = 30;

/**
 * 高速落下速度（フレーム数）
 */
export const FAST_FALL_SPEED = 5;

/**
 * Game（ゲーム）エンティティ
 *
 * ゲーム全体のライフサイクルを管理するエンティティです。
 * ゲーム状態、フレーム更新処理、ゲームルールの適用を担当します。
 *
 * @remarks
 * 不変条件:
 * - gameIdは一意で不変
 * - stateは常にPlaying、Paused、GameOverのいずれか
 * - scoreは常に0以上
 * - frameCountは常に0以上
 * - 同時に落下できるブロックは1つのみ
 */
export class Game {
  /**
   * Gameインスタンスを生成するコンストラクタ
   *
   * @param _gameId - ゲームの一意識別子
   * @param _state - ゲームの状態
   * @param _field - ゲームフィールド
   * @param _fallingBlock - 現在落下中のブロック
   * @param _nextBlock - 次に落ちてくるブロック
   * @param _score - 現在のスコア
   * @param _frameCount - ゲーム開始からのフレーム数
   * @param _fallSpeed - 落下速度（フレーム数）
   * @param _isFastFalling - 高速落下中かどうか
   */
  private constructor(
    private readonly _gameId: string,
    private _state: GameState,
    private _field: Field,
    private _fallingBlock: FallingBlock | null,
    private _nextBlock: BlockPattern,
    private _score: Score,
    private _frameCount: number,
    private _fallSpeed: number,
    private _isFastFalling: boolean
  ) {}

  /**
   * Gameインスタンスを生成するファクトリメソッド
   *
   * @param gameId - ゲームの一意識別子（UUID推奨）
   * @returns 初期化されたゲーム
   *
   * @remarks
   * 初期状態:
   * - state: Playing
   * - field: 空のフィールド
   * - fallingBlock: null（start()で生成）
   * - score: 0
   * - frameCount: 0
   *
   * @example
   * ```typescript
   * const game = Game.create(crypto.randomUUID());
   * game.start();
   * ```
   */
  static create(gameId: string): Game {
    return new Game(
      gameId,
      GameState.Playing,
      Field.create(),
      null,
      BlockPatternGenerator.generate(), // 次のブロックを事前生成
      Score.zero(),
      0,
      NORMAL_FALL_SPEED,
      false
    );
  }

  /**
   * ゲームIDを取得
   */
  get gameId(): string {
    return this._gameId;
  }

  /**
   * ゲーム状態を取得
   */
  get state(): GameState {
    return this._state;
  }

  /**
   * フィールドを取得
   */
  get field(): Field {
    return this._field;
  }

  /**
   * 落下ブロックを取得
   */
  get fallingBlock(): FallingBlock | null {
    return this._fallingBlock;
  }

  /**
   * 次のブロックパターンを取得
   */
  get nextBlock(): BlockPattern {
    return this._nextBlock;
  }

  /**
   * スコアを取得
   */
  get score(): Score {
    return this._score;
  }

  /**
   * フレームカウントを取得
   */
  get frameCount(): number {
    return this._frameCount;
  }

  /**
   * ゲームを開始する
   *
   * @remarks
   * 副作用:
   * - 状態をPlayingに設定
   * - 最初の落下ブロックを生成
   * - 次のブロックを生成
   *
   * @example
   * ```typescript
   * game.start();
   * ```
   */
  start(): void {
    this._state = GameState.Playing;
    this._fallingBlock = FallingBlock.create(this._nextBlock);
    this._nextBlock = BlockPatternGenerator.generate();
  }

  /**
   * ゲームを一時停止する
   *
   * @remarks
   * 前提条件: 状態がPlaying
   */
  pause(): void {
    if (this._state === GameState.Playing) {
      this._state = GameState.Paused;
    }
  }

  /**
   * ゲームを再開する
   *
   * @remarks
   * 前提条件: 状態がPaused
   */
  resume(): void {
    if (this._state === GameState.Paused) {
      this._state = GameState.Playing;
    }
  }

  /**
   * ゲームをリセットして再開する
   *
   * @remarks
   * 副作用:
   * - フィールドをクリア
   * - スコアを0にリセット
   * - フレームカウントを0にリセット
   * - 新しいブロックを生成
   * - 状態をPlayingに設定
   */
  restart(): void {
    this._field.clear();
    this._score = Score.zero();
    this._frameCount = 0;
    this._isFastFalling = false;
    this._fallSpeed = NORMAL_FALL_SPEED;
    this._nextBlock = BlockPatternGenerator.generate();
    this._state = GameState.Playing;
    this.start();
  }

  /**
   * 1フレーム分のゲーム状態を更新する
   *
   * @remarks
   * 処理フロー:
   * 1. 状態がPlayingでない場合は何もしない
   * 2. フレームカウントを増加
   * 3. 落下ブロックがない場合、新しいブロックを生成
   * 4. 落下タイミングをチェック
   * 5. 落下可能なら下に移動
   * 6. 落下不可なら接地処理
   *
   * @example
   * ```typescript
   * // ゲームループ内で毎フレーム呼び出し
   * setInterval(() => {
   *   game.update();
   * }, 1000 / 30); // 30fps
   * ```
   */
  update(): void {
    if (this._state !== GameState.Playing) {
      return;
    }

    this._frameCount++;

    // 落下ブロックがない場合、新規生成
    if (this._fallingBlock === null) {
      this._fallingBlock = FallingBlock.create(this._nextBlock);
      this._nextBlock = BlockPatternGenerator.generate();

      // 生成直後に配置できない場合はゲームオーバー
      if (!this._fallingBlock.canMove('down', this._field) &&
          this._fallingBlock.position.y === 0) {
        // 初期位置で既に動けない場合
        const blocks = this._fallingBlock.getBlocks();
        let canPlace = true;
        for (const { position } of blocks) {
          if (!this._field.isEmpty(position)) {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) {
          this._state = GameState.GameOver;
          return;
        }
      }
    }

    // 落下タイミングのチェック
    if (this._frameCount % this._fallSpeed === 0) {
      if (this._fallingBlock.canMove('down', this._field)) {
        this._fallingBlock.moveDown();
      } else {
        // 接地処理
        this.landBlock();
      }
    }
  }

  /**
   * ブロックを接地させる（内部メソッド）
   *
   * @remarks
   * Phase 1-3 (Issue 1-3): 完全実装
   *   - ブロックをフィールドに固定
   *   - BlockMatchingServiceで消去判定
   *   - BlockRemovalServiceで削除と連鎖処理
   *   - スコア加算
   *   - ゲームオーバー判定
   */
  private landBlock(): void {
    if (this._fallingBlock === null) {
      return;
    }

    // 1. フィールドにブロックを固定
    const blocks = this._fallingBlock.getBlocks();
    blocks.forEach(({ block, position }) => {
      this._field.placeBlock(position, block);
    });

    // 2. 落下ブロックを削除
    this._fallingBlock = null;

    // 3. 消去処理（連鎖を含む）
    const blockMatchingService = new BlockMatchingService();
    const blockFallService = new BlockFallService();
    const blockRemovalService = new BlockRemovalService(blockFallService, blockMatchingService);
    const removedCount = blockRemovalService.processRemovalChain(this._field);

    // 4. スコア加算
    if (removedCount > 0) {
      this._score = this._score.add(removedCount);
    }

    // 5. ゲームオーバー判定
    if (this.isGameOver()) {
      this._state = GameState.GameOver;
    }
  }

  /**
   * 落下ブロックを左に移動
   *
   * @remarks
   * 前提条件:
   * - 状態がPlaying
   * - 落下ブロックが存在
   *
   * @example
   * ```typescript
   * game.moveFallingBlockLeft();
   * ```
   */
  moveFallingBlockLeft(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    if (this._fallingBlock.canMove('left', this._field)) {
      this._fallingBlock.moveLeft();
    }
  }

  /**
   * 落下ブロックを右に移動
   *
   * @remarks
   * 前提条件:
   * - 状態がPlaying
   * - 落下ブロックが存在
   */
  moveFallingBlockRight(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    if (this._fallingBlock.canMove('right', this._field)) {
      this._fallingBlock.moveRight();
    }
  }

  /**
   * 落下ブロックを時計回りに回転
   *
   * @remarks
   * 前提条件:
   * - 状態がPlaying
   * - 落下ブロックが存在
   */
  rotateFallingBlockClockwise(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    if (this._fallingBlock.canRotate('clockwise', this._field)) {
      this._fallingBlock.rotateClockwise();
    }
  }

  /**
   * 落下ブロックを反時計回りに回転
   *
   * @remarks
   * 前提条件:
   * - 状態がPlaying
   * - 落下ブロックが存在
   */
  rotateFallingBlockCounterClockwise(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    if (this._fallingBlock.canRotate('counterclockwise', this._field)) {
      this._fallingBlock.rotateCounterClockwise();
    }
  }

  /**
   * 高速落下を有効化
   *
   * @remarks
   * 副作用: _isFastFallingをtrueに設定、_fallSpeedを5に変更
   */
  enableFastFall(): void {
    this._isFastFalling = true;
    this._fallSpeed = FAST_FALL_SPEED;
  }

  /**
   * 高速落下を無効化
   *
   * @remarks
   * 副作用: _isFastFallingをfalseに設定、_fallSpeedを30に変更
   */
  disableFastFall(): void {
    this._isFastFalling = false;
    this._fallSpeed = NORMAL_FALL_SPEED;
  }

  /**
   * 落下ブロックを即座に接地位置まで移動
   *
   * @remarks
   * 処理:
   * - 落下可能な最下位置まで一気に移動
   * - 接地処理を実行
   *
   * @example
   * ```typescript
   * game.dropInstantly(); // スペースキー押下時
   * ```
   */
  dropInstantly(): void {
    if (this._state !== GameState.Playing || this._fallingBlock === null) {
      return;
    }

    while (this._fallingBlock.canMove('down', this._field)) {
      this._fallingBlock.moveDown();
    }

    this.landBlock();
  }

  /**
   * ゲームオーバー判定
   *
   * @returns ゲームオーバーの場合true
   *
   * @remarks
   * 判定条件:
   * - 最上段（Y座標0）にブロックが存在する
   */
  isGameOver(): boolean {
    return this._field.hasBlockInTopRow();
  }
}
