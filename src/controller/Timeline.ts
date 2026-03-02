import { type GameModel } from "@/model/GameModel";
import {
  type CollapseResult,
  type Match,
  type Position,
  type SpawnResult,
} from "@/model/types";
import { type GameView } from "@/view/GameView";

/**
 * The Timeline class is responsible for orchestrating the sequence of
 * animations that occur after a user action, such as a swap. It interacts
 * with the GameModel to update the game state and with the GameView to
 * trigger the appropriate animations. The Timeline ensures that all
 * animations are completed before allowing further user interactions,
 * maintaining a smooth and coherent game experience.
 */
class Timeline {
  constructor(
    private model: GameModel,
    private view: GameView,
  ) {}

  /**
   * Run the sequence of animations for a swap action. This includes animating
   * the swap, checking for matches, and reverting the swap if no matches are
   * found. The method returns a boolean indicating whether the swap resulted
   * in a match.
   *
   * @param {Position} a - The position of the first candy being swapped.
   * @param {Position} b - The position of the second candy being swapped.
   * @returns {Promise<boolean>} - Resolves to true if the swap resulted in a
   * match, false otherwise.
   */
  public async runSwapSequence(a: Position, b: Position): Promise<boolean> {
    await this.view.animateSwap(a, b);
    this.model.applySwap(a, b);
    this.view.syncGrid(this.model.getSnapshot());

    // Check for matches. If no matches, the swap will be reverted.
    if (this.model.findMatches().length) return true;

    await this.view.animateSwapBack(a, b);
    this.model.revertSwap(a, b);
    return false;
  }

  /**
   * Run the sequence of animations for resolving matches. This includes
   * animating the removal of matched candies, collapsing the grid, and
   * spawning new candies. The method continues to run until there are no more
   * matches to resolve.
   *
   * @returns {Promise<void>} - Resolves when all animations are complete and
   * there are no more matches to resolve.
   */
  public async runResolveSequence(): Promise<void> {
    while (true) {
      const matches: Match[] = this.model.findMatches();
      if (!matches.length) break;

      // Remove matches and sync view before animating to ensure the correct
      // grid state is reflected during the animation.
      this.model.removeMatches(matches);
      this.view.syncGrid(this.model.getSnapshot());
      await this.view.animateRemove(matches);

      // Collapse grid and sync view before animating to ensure the correct
      // grid state is reflected during the animation.
      const collapse: CollapseResult = this.model.collapseGrid();
      await this.view.animateCollapse(collapse);
      this.view.syncGrid(this.model.getSnapshot());

      // Spawn new candies and sync view before animating to ensure the correct
      // grid state is reflected during the animation.
      const spawn: SpawnResult = this.model.spawnCandies();
      this.view.syncGrid(this.model.getSnapshot());
      await this.view.animateSpawn(spawn);

      // After all animations are done, sync the view to reflect the final
      // state before checking for new matches.
      this.view.syncGrid(this.model.getSnapshot());
    }
  }
}

export { Timeline };
