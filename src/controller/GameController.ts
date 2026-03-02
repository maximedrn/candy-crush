import { StateMachine } from "@/controller/StateMachine";
import { Timeline } from "@/controller/Timeline";
import { GameModel } from "@/model/GameModel";
import { ControllerState, type Position } from "@/model/types";
import { GameView } from "@/view/GameView";

/**
 * The GameController class serves as the central coordinator for the game,
 * managing interactions between the GameModel and GameView. It handles user
 * input, updates the game state, and orchestrates animations through the
 * Timeline.
 */
class GameController {
  private model: GameModel;
  private view: GameView;
  private state: StateMachine;
  private timeline: Timeline;

  constructor() {
    this.model = new GameModel();
    this.view = new GameView("game", "score", "message");
    this.state = new StateMachine();
    this.timeline = new Timeline(this.model, this.view);
  }

  /**
   * Start the game by initializing the model and syncing the view.
   * Also binds user input after the initial render to ensure the
   * view is ready to handle interactions.
   *
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    this.model.initGame();
    await this.timeline.runResolveSequence();
    this.view.syncGrid(this.model.getSnapshot());

    // Bind input after initial render to ensure view is ready.
    this.view.bindInput((from: Position, to: Position) =>
      this.onDragSwap(from, to),
    );
  }

  /**
   * Handle a swap initiated by the user.
   *
   * @param {Position} from - The position of the candy being dragged.
   * @param {Position} to - The position of the target cell.
   * @returns {Promise<void>} - Resolves when the swap and all resulting
   * animations are complete.
   */
  private async onDragSwap(from: Position, to: Position): Promise<void> {
    if (this.state.isLocked()) return;
    if (!this.model.canSwap(from, to)) return;

    this.state.setState(ControllerState.Swapping);
    this.view.lock();

    // Run the swap and resolve sequences. If no matches, the swap will be
    // reverted.
    if (await this.timeline.runSwapSequence(from, to)) {
      this.state.setState(ControllerState.Resolving);
      await this.timeline.runResolveSequence();
    }

    // After all animations and logic are done, sync the view and check
    // end conditions.
    this.view.syncGrid(this.model.getSnapshot());
    this.checkEndConditions();
    this.view.unlock();
    this.state.setState(ControllerState.Idle);
  }

  /**
   * Check if the game has reached a victory or game over condition after
   * a move.
   *
   * @returns {void}
   */
  private checkEndConditions(): void {
    if (this.model.getSnapshot().score < 1000) return;
    this.view.showVictory();
  }
}

export { GameController };
