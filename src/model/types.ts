enum CandyColor {
  Red = "red",
  Blue = "blue",
  Green = "green",
  Yellow = "yellow",
  Orange = "orange",
  Purple = "purple",
}

enum GameState {
  Playing,
  Victory,
  GameOver,
}

interface Position {
  row: number;
  column: number;
}

interface Candy {
  id: string;
  color: CandyColor;
}

interface Match {
  positions: Position[];
  color: CandyColor;
  length: number;
}

interface RemovalResult {
  removed: Position[];
  pointsGained: number;
}

interface CollapseMove {
  candyId: string;
  from: Position;
  to: Position;
}

interface CollapseResult {
  moves: CollapseMove[];
  emptied: Position[];
}

interface Spawn {
  candy: Candy;
  at: Position;
}

interface SpawnResult {
  spawns: Spawn[];
}

interface GameSnapshot {
  grid: (Candy | null)[][];
  score: number;
  gameState: GameState;
}

enum ControllerState {
  Idle,
  Selecting,
  Swapping,
  SwapBack,
  Resolving,
}

export {
  CandyColor,
  ControllerState,
  GameState,
  type Candy,
  type CollapseMove,
  type CollapseResult,
  type GameSnapshot,
  type Match,
  type Position,
  type RemovalResult,
  type Spawn,
  type SpawnResult,
};
