export interface GameDto {
  gameId: string;
  state: 'playing' | 'paused' | 'gameOver';
  score: number;
  field: (string | null)[][];
  fallingBlock: {
    pattern: string[][];
    position: { x: number; y: number };
    rotation: number;
  } | null;
  nextBlock: string[][];
}
