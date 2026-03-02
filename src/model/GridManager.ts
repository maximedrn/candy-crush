import {
  type Candy,
  CandyColor,
  type CollapseMove,
  type CollapseResult,
  type Match,
  type Position,
  type Spawn,
  type SpawnResult,
} from "@/model/types";
import seedrandom from "seedrandom";
import { v4 } from "uuid";

class GridManager {
  public static readonly SIZE: number = 9;
  public static readonly COLORS: CandyColor[] = Object.values(CandyColor);

  private cells: (Candy | null)[][] = [];
  private random: () => number;

  /**
   * Initialize the grid manager with a seeded random number generator.
   * The seed allows for reproducible grid configurations, which can be
   * useful for testing and debugging. The grid is initialized with
   * random candies based on the provided seed.
   *
   * @param {number} seed - A number used to seed the random number
   * generator for reproducible grid configurations.
   */
  constructor(seed: number = Date.now()) {
    this.random = seedrandom(String(seed));
    this.init();
  }

  /**
   * Generate a random candy with a unique ID and a random color.
   *
   * @returns {Candy} - A randomly generated candy object.
   */
  private randomCandy(): Candy {
    const color: CandyColor =
      GridManager.COLORS[
        Math.floor(this.random() * GridManager.COLORS.length)
      ]!;
    return { id: v4(), color };
  }

  /**
   * Initialize the grid with random candies. This method fills the grid
   * with randomly generated candies based on the current random number
   * generator state. It is typically called at the start of a new game or
   * when resetting the grid.
   *
   * @returns {void}
   */
  public init(): void {
    this.cells = Array.from({ length: GridManager.SIZE }, () =>
      Array.from({ length: GridManager.SIZE }, () => this.randomCandy()),
    );
  }

  /**
   * Get the candy at a specific position on the grid.
   *
   * @param {Position} position - The position to get the candy from.
   * @returns {Candy | null} - The candy at the specified position, or null
   * if the cell is empty.
   */
  public get(position: Position): Candy | null {
    return this.cells[position.row][position.column];
  }

  /**
   * Set a candy at a specific position on the grid. This method updates the
   * grid state by placing the given candy at the specified position. It can
   * be used to add new candies, move existing candies, or clear cells by
   * setting them to null.
   *
   * @param {Position} position - The position to set the candy at.
   * @param {Candy | null} candy - The candy to place at the specified
   * position, or null to clear the cell.
   * @returns {void}
   */
  public set(position: Position, candy: Candy | null): void {
    this.cells[position.row][position.column] = candy;
  }

  /**
   * Swap the candies at two specified positions on the grid. This method
   * updates the grid state by exchanging the candies at the given positions.
   * It is typically used to perform user-initiated swaps during gameplay.
   *
   * @param {Position} a - The position of the first candy to swap.
   * @param {Position} b - The position of the second candy to swap.
   * @returns {void}
   */
  public swap(a: Position, b: Position): void {
    const temporary: Candy | null = this.get(a);
    this.set(a, this.get(b));
    this.set(b, temporary);
  }

  /**
   * Get the current state of the grid as a 2D array of candies. This method
   * provides a snapshot of the grid's current configuration, which can be
   * used for rendering the view or for other game logic purposes.
   *
   * @returns {(Candy | null)[][]} - A 2D array representing the current state
   * of the grid, where each cell contains a candy or null if it is empty.
   */
  public getGrid(): (Candy | null)[][] {
    return this.cells;
  }

  /**
   * Get the DOM element corresponding to a specific position on the grid.
   *
   * @param {Position} position - The position of the cell to retrieve.
   * @returns {Candy | null} - The candy at the specified position, or null
   * if the cell does not exist.
   */
  private getCell(row: number, col: number): Candy | null {
    return this.cells.at(row)?.at(col) ?? null;
  }

  /**
   * Detect matches in the grid. This method scans the grid for sequences of
   * three or more candies of the same color that are adjacent either
   * horizontally or vertically. It returns an array of match objects, each
   * describing a detected match.
   *
   * @returns {Match[]} - An array of match objects describing detected
   * matches.
   */
  public detectMatches(): Match[] {
    const matches: Match[] = [];

    /**
     * Scan a line in the grid for matches.
     *
     * @param {number} startRow - The starting row index for the scan.
     * @param {number} startColumn - The starting column index for the scan.
     * @param {number} deltaRow - The row increment for each step of the scan.
     * @param {number} deltaColumn - The column increment for each step of the
     * scan.
     * @returns {void}
     */
    const scanLine = (
      startRow: number,
      startColumn: number,
      deltaRow: number,
      deltaColumn: number,
    ): void => {
      let streak: Position[] = [];
      let currentColor: CandyColor | null = null;

      let row: number = startRow;
      let column: number = startColumn;

      // Scan along the line until we go out of bounds, tracking sequences of
      // candies of the same color. When we encounter a different color or
      // reach the end of the line, we check if the current streak is a valid
      // match (length >= 3) and add it to the matches array if so. Then we
      // start a new streak with the current candy.
      while (
        row >= 0 &&
        row < GridManager.SIZE &&
        column >= 0 &&
        column < GridManager.SIZE
      ) {
        const cell: Candy | null = this.getCell(row, column);

        if (cell && cell.color === currentColor) {
          streak.push({ row, column: column });
        } else {
          if (streak.length >= 3 && currentColor) {
            matches.push({
              positions: [...streak],
              color: currentColor,
              length: streak.length,
            });
          }

          streak = cell ? [{ row, column: column }] : [];
          currentColor = cell?.color ?? null;
        }

        row += deltaRow;
        column += deltaColumn;
      }

      if (streak.length >= 3 && currentColor) {
        matches.push({
          positions: [...streak],
          color: currentColor,
          length: streak.length,
        });
      }
    };

    for (let row: number = 0; row < GridManager.SIZE; row++)
      scanLine(row, 0, 0, 1);
    for (let column: number = 0; column < GridManager.SIZE; column++)
      scanLine(0, column, 1, 0);

    return matches;
  }

  /**
   * Remove the candies at the positions specified in the matches. This method
   * updates the grid state by setting the cells of the matched positions to
   * null, effectively removing the candies from the grid. It returns an array
   * of positions that were removed, which can be used for scoring or animation
   * purposes.
   *
   * @param {Match[]} matches - An array of match objects describing the
   * positions to remove.
   * @returns {Position[]} - An array of positions that were removed from the
   * grid.
   */
  public removeMatches(matches: Match[]): Position[] {
    const removed: Position[] = [];

    for (const match of matches) {
      for (const position of match.positions) {
        if (!this.get(position)) continue;
        this.set(position, null);
        removed.push(position);
      }
    }

    return removed;
  }

  /**
   * Compute the collapse of the grid after matches have been removed. This
   * method updates the grid state by moving candies down to fill empty spaces
   * and returns the movements of the candies during the collapse, as well as
   * the positions that were emptied. The collapse is performed column by
   * column, starting from the bottom row and moving upwards.
   *
   * @returns {CollapseResult} - An object containing the movements of the
   * candies during the collapse and the positions that were emptied.
   */
  public computeCollapse(): CollapseResult {
    const moves: CollapseMove[] = [];
    const emptied: Position[] = [];

    for (let column: number = 0; column < GridManager.SIZE; column++) {
      let emptyRow: number = GridManager.SIZE - 1;

      for (let row: number = GridManager.SIZE - 1; row >= 0; row--) {
        const candy: Candy | null = this.getCell(row, column);
        if (!candy) continue;

        if (row !== emptyRow) {
          this.set({ row: emptyRow, column: column }, candy);
          this.set({ row, column: column }, null);

          moves.push({
            candyId: candy.id,
            from: { row, column: column },
            to: { row: emptyRow, column: column },
          });
        }

        emptyRow--;
      }

      for (let row: number = emptyRow; row >= 0; row--)
        emptied.push({ row, column: column });
    }

    return { moves, emptied };
  }

  /**
   * Spawn new candies to fill the empty spaces on the grid after collapsing.
   * This method updates the grid state by generating new random candies for
   * any cells that are currently empty (null) and returns the new candies
   * along with their positions. It is typically called after the collapse step
   * to refill the grid.
   *
   * @returns {SpawnResult} - An object containing the new candies spawned and
   * their positions.
   */
  public spawn(): SpawnResult {
    const spawns: Spawn[] = [];

    for (let row: number = 0; row < GridManager.SIZE; row++) {
      for (let column: number = 0; column < GridManager.SIZE; column++) {
        if (this.getCell(row, column)) continue;
        const candy: Candy = this.randomCandy();
        this.set({ row, column }, candy);
        spawns.push({ candy, at: { row, column } });
      }
    }

    return { spawns };
  }
}

export { GridManager };
