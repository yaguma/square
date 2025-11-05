import { GameState } from '@domain/models/value-objects/GameState';

export interface GameDto {
  gameId: string;
  state: GameState;
  score: number;
  field: (string | null)[][];
  fallingBlock: {
    pattern: string[][];
    position: { x: number; y: number };
    rotation: number;
  } | null;
  nextBlock: string[][];
}
