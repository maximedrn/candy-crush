import { ControllerState } from "@/model/types";

/**
 * The StateMachine class manages the current state of the game controller,
 * providing methods to set and query the state. It also includes a helper
 * method to determine if the controller is in a locked state, which is used
 * to prevent user interactions during animations or other non-interactive
 * phases.
 */
class StateMachine {
  private state: ControllerState = ControllerState.Idle;

  /**
   * Set the current state of the controller.
   *
   * @param {ControllerState} state - The new state to set.
   * @returns {void}
   */
  public setState(state: ControllerState): void {
    this.state = state;
  }

  /**
   * Get the current state of the controller.
   *
   * @returns {ControllerState} - The current state.
   */
  public get getState(): ControllerState {
    return this.state;
  }

  /**
   * Determine if the controller is in a locked state, which prevents user
   * interactions. The controller is considered locked if it is not in the
   * Idle state.
   *
   * @returns {boolean} - True if the controller is locked, false otherwise.
   */
  public isLocked(): boolean {
    return this.state !== ControllerState.Idle;
  }
}

export { StateMachine };
