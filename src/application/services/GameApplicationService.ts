import { GameDto } from '../dto/GameDto';
import { GameRepository } from '@domain/repositories/GameRepository';
import { Game } from '@domain/models/entities/Game';
import { Field } from '@domain/models/entities/Field';
import { FallingBlock } from '@domain/models/entities/FallingBlock';
import { BlockPattern } from '@domain/models/value-objects/BlockPattern';
import { Position } from '@domain/models/value-objects/Position';

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

  private convertFallingBlockToDto(fallingBlock: FallingBlock) {
    return {
      pattern: this.convertBlockPatternToDto(fallingBlock.pattern),
      position: {
        x: fallingBlock.position.x,
        y: fallingBlock.position.y
      },
      rotation: fallingBlock.rotation
    };
  }

  private convertBlockPatternToDto(pattern: BlockPattern): string[][] {
    const blocks = pattern.blocks;
    const result: string[][] = [];

    for (let y = 0; y < 2; y++) {
      result[y] = [];
      for (let x = 0; x < 2; x++) {
        result[y][x] = blocks[y][x] ? blocks[y][x].color.type : 'empty';
      }
    }

    return result;
  }
}
