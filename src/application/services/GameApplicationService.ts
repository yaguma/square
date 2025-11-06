import { GameDto } from '../dto/GameDto';
import { GameRepository } from '@domain/repositories/GameRepository';
import { Game } from '@domain/models/entities/Game';
import { Field } from '@domain/models/entities/Field';
import { FallingBlock } from '@domain/models/entities/FallingBlock';
import { BlockPattern } from '@domain/models/value-objects/BlockPattern';
import { Block } from '@domain/models/value-objects/Block';
import { Position } from '@domain/models/value-objects/Position';

/**
 * ブロックパターンのサイズ（2x2マス）
 */
const BLOCK_PATTERN_SIZE = 2;

export class GameApplicationService {
  constructor(
    private gameRepository: GameRepository
  ) {}

  startNewGame(): GameDto {
    const gameId = crypto.randomUUID();
    const game = Game.create(gameId);

    game.start();

    this.gameRepository.save(game);

    return this.toDto(game);
  }

  pauseGame(gameId: string): void {
    const game = this.getGame(gameId);
    game.pause();
    this.gameRepository.save(game);
  }

  resumeGame(gameId: string): void {
    const game = this.getGame(gameId);
    game.resume();
    this.gameRepository.save(game);
  }

  restartGame(gameId: string): GameDto {
    const game = this.getGame(gameId);
    game.restart();
    this.gameRepository.save(game);
    return this.toDto(game);
  }

  moveBlockLeft(gameId: string): void {
    const game = this.getGame(gameId);
    game.moveFallingBlockLeft();
    this.gameRepository.save(game);
  }

  moveBlockRight(gameId: string): void {
    const game = this.getGame(gameId);
    game.moveFallingBlockRight();
    this.gameRepository.save(game);
  }

  rotateBlockClockwise(gameId: string): void {
    const game = this.getGame(gameId);
    game.rotateFallingBlockClockwise();
    this.gameRepository.save(game);
  }

  rotateBlockCounterClockwise(gameId: string): void {
    const game = this.getGame(gameId);
    game.rotateFallingBlockCounterClockwise();
    this.gameRepository.save(game);
  }

  accelerateFall(gameId: string): void {
    const game = this.getGame(gameId);
    game.enableFastFall();
    this.gameRepository.save(game);
  }

  disableFastFall(gameId: string): void {
    const game = this.getGame(gameId);
    game.disableFastFall();
    this.gameRepository.save(game);
  }

  dropInstantly(gameId: string): void {
    const game = this.getGame(gameId);
    game.dropInstantly();
    this.gameRepository.save(game);
  }

  updateFrame(gameId: string): GameDto {
    const game = this.getGame(gameId);
    game.update();
    this.gameRepository.save(game);
    return this.toDto(game);
  }

  getGameState(gameId: string): GameDto {
    const game = this.getGame(gameId);
    return this.toDto(game);
  }

  private getGame(gameId: string): Game {
    const game = this.gameRepository.findById(gameId);

    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    return game;
  }

  private toDto(game: Game): GameDto {
    return {
      gameId: game.gameId,
      state: game.state,
      score: game.score.value,
      field: this.convertFieldToDto(game.field),
      fallingBlock: game.fallingBlock
        ? this.convertFallingBlockToDto(game.fallingBlock)
        : null,
      nextBlock: this.convertBlockPatternToDto(game.nextBlock)
    };
  }

  private convertFieldToDto(field: Field): (string | null)[][] {
    const grid: (string | null)[][] = [];

    for (let y = 0; y < field.height; y++) {
      grid[y] = [];
      for (let x = 0; x < field.width; x++) {
        const block = field.getBlock(Position.create(x, y));
        grid[y][x] = block ? block.color.type : null;
      }
    }

    return grid;
  }

  private convertFallingBlockToDto(
    fallingBlock: FallingBlock
  ): NonNullable<GameDto['fallingBlock']> {
    return {
      // 回転を適用したパターンを使用（不具合2の修正）
      pattern: this.convertRotatedBlocksToDto(fallingBlock.rotatedBlocks),
      position: {
        x: fallingBlock.position.x,
        y: fallingBlock.position.y
      },
      rotation: fallingBlock.rotation // 互換性のため残す
    };
  }

  private convertBlockPatternToDto(pattern: BlockPattern): string[][] {
    const blocks = pattern.blocks;
    const result: string[][] = [];

    for (let y = 0; y < BLOCK_PATTERN_SIZE; y++) {
      result[y] = [];
      for (let x = 0; x < BLOCK_PATTERN_SIZE; x++) {
        result[y][x] = blocks[y][x] ? blocks[y][x].color.type : 'empty';
      }
    }

    return result;
  }

  /**
   * 回転適用済みのブロック配列をDTO用の文字列配列に変換
   *
   * @param blocks - 回転適用済みの2x2ブロック配列
   * @returns 色タイプまたは'empty'の2x2文字列配列
   *
   * @remarks
   * BlockPattern.rotate() が返す (Block | null)[][] を
   * 描画用の string[][] に変換します。
   */
  private convertRotatedBlocksToDto(blocks: (Block | null)[][]): string[][] {
    const result: string[][] = [];

    for (let y = 0; y < BLOCK_PATTERN_SIZE; y++) {
      result[y] = [];
      for (let x = 0; x < BLOCK_PATTERN_SIZE; x++) {
        result[y][x] = blocks[y][x] ? blocks[y][x]!.color.type : 'empty';
      }
    }

    return result;
  }
}
