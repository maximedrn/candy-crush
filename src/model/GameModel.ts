import { GridManager } from "@/model/GridManager";
import { ScoreManager } from "@/model/ScoreManager";
import {
  type CollapseResult,
  type GameSnapshot,
  GameState,
  type Match,
  type Position,
  type RemovalResult,
  type SpawnResult,
} from "@/model/types";

/**
 * The GameModel class encapsulates the core game logic and state management
 * for the candy-matching game. It manages the game grid, score, and overall
 * game state, providing methods to initialize the game, apply and revert
 * swaps, find matches, remove matched candies, collapse the grid, and spawn
 * new candies.
 */
class GameModel {
  private grid: GridManager;
  private score: ScoreManager;
  private gameState: GameState = GameState.Playing;

  constructor(seed?: number) {
    this.grid = new GridManager(seed);
    this.score = new ScoreManager();
  }

  /**
   * Initialize the game by filling the grid with candies and resetting
   * the score. The game state is set to Playing, allowing user
   * interactions to begin.
   */
  public initGame(): void {
    this.grid.init();
    this.score.reset();
    this.gameState = GameState.Playing;
  }

  /**
   * Determine if a swap between two positions is valid. A valid swap must be
   * between adjacent cells (horizontally or vertically) and within the bounds
   * of the grid.
   *
   * @param {Position} a - The position of the first candy.
   * @param {Position} b - The position of the second candy.
   * @returns {boolean} - True if the swap is valid, false otherwise.
   */
  public canSwap(a: Position, b: Position): boolean {
    const distanceRow: number = Math.abs(a.row - b.row);
    const distanceColumn: number = Math.abs(a.column - b.column);
    return distanceRow + distanceColumn === 1;
  }

  /**
   * Apply a swap between two positions on the grid. This method assumes that
   * the swap has already been validated using canSwap. It updates the grid
   * state to reflect the swap.
   *
   * @param {Position} a - The position of the first candy being swapped.
   * @param {Position} b - The position of the second candy being swapped.
   * @returns {void}
   */
  public applySwap(a: Position, b: Position): void {
    this.grid.swap(a, b);
  }

  /**
   * Revert a previously applied swap between two positions on the grid. This
   * method is used when a swap does not result in any matches, allowing the
   * game to return to its previous state.
   *
   * @param {Position} a - The position of the first candy being swapped back.
   * @param {Position} b - The position of the second candy being swapped back.
   * @returns {void}
   */
  public revertSwap(a: Position, b: Position): void {
    this.grid.swap(a, b);
  }

  /**
   * Find all matches currently present on the grid. A match is defined as a
   * sequence of three or more candies of the same color, either horizontally
   * or vertically. The method returns an array of Match objects, each
   * containing the positions and color of the matched candies.
   *
   * @returns {Match[]} - An array of Match objects representing all current
   * matches on the grid.
   */
  public findMatches(): Match[] {
    return this.grid.detectMatches();
  }

  /**
   * Remove the candies involved in the given matches from the grid and update
   * the score accordingly. The method calculates the points gained based on
   * the number of candies removed and emits an event to notify listeners of
   * the removal.
   *
   * @param {Match[]} matches - An array of Match objects representing the
   * matches to be removed.
   * @returns {RemovalResult} - An object containing the positions of the
   * removed candies and the points gained from their removal.
   */
  public removeMatches(matches: Match[]): RemovalResult {
    const removed: Position[] = this.grid.removeMatches(matches);
    this.score.add(removed.length);
    return { removed, pointsGained: removed.length };
  }

  /**
   * Collapse the grid after matches have been removed.
   *
   * @returns {CollapseResult} - An object containing the movements of the
   * candies during the collapse and the positions that were emptied.
   */
  public collapseGrid(): CollapseResult {
    return this.grid.computeCollapse();
  }

  /**
   * Spawn new candies to fill the empty spaces on the grid after collapsing.
   *
   * @returns {SpawnResult} - An object containing the new candies spawned and
   * their positions.
   */
  public spawnCandies(): SpawnResult {
    return this.grid.spawn();
  }

  /**
   * Return a snapshot of the current game state.
   *
   * @returns {GameSnapshot} - A snapshot of the current game state.
   */
  public getSnapshot(): GameSnapshot {
    return {
      grid: this.grid.getGrid(),
      score: this.score.getScore(),
      gameState: this.gameState,
    };
  }
}

export { GameModel };
