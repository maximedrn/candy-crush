import type {
  Candy,
  CollapseMove,
  CollapseResult,
  GameSnapshot,
  Match,
  Position,
  SpawnResult,
} from "@/model/types";
import { InputHandler } from "@/view/InputHandler";

/**
 * The GameView class is responsible for rendering the game state to the user
 * and handling all visual aspects of the game. It provides methods to update
 * the grid display, show score changes, and animate various game actions such
 * as swaps, removals, collapses, and spawns. The GameView interacts with the
 * DOM to reflect the current state of the game and provides feedback to the
 * player through animations and messages.
 */
class GameView {
  private container: HTMLElement;
  private scoreElement: HTMLElement;
  private messageElement: HTMLElement;

  /**
   * Initialize the GameView by selecting the necessary DOM elements and
   * setting up the grid container. The constructor takes the IDs of the
   * container for the game grid, the score display, and the message display
   * as parameters.
   */
  constructor(containerId: string, scoreId: string, messageId: string) {
    this.container = document.getElementById(containerId)!;
    this.scoreElement = document.getElementById(scoreId)!;
    this.messageElement = document.getElementById(messageId)!;
    this.container.classList.add("grid");
  }

  /**
   * Bind user input for swapping candies. This method sets up the necessary
   * event listeners to detect drag-and-drop actions on the grid cells. When
   * a swap is initiated by the user, the provided callback function is called
   * with the positions of the candies being swapped.
   *
   * @param {function} onSwap - The callback function to call when a swap is
   * initiated by the user. It receives the positions of the two candies being
   * swapped as parameters.
   * @returns {void}
   */
  public bindInput(onSwap: (from: Position, to: Position) => void): void {
    new InputHandler(this.container, (from: Position, to: Position) =>
      onSwap(from, to),
    );
  }

  /**
   * Get the DOM element corresponding to a specific position on the grid.
   *
   * @param {Position} poition - The position of the cell to retrieve.
   * @returns {HTMLElement | null} - The DOM element corresponding to the
   * specified position, or null if the cell does not exist.
   */
  private getCell(position: Position): HTMLElement | null {
    return this.container.querySelector(
      `[data-row="${position.row}"][data-col="${position.column}"]`,
    ) as HTMLElement | null;
  }

  /**
   * Sync the grid display with the current game state. This method takes a
   * snapshot of the game state, which includes the grid configuration and the
   * current score, and updates the DOM to reflect this state. It clears the
   * existing grid and re-renders it based on the provided snapshot.
   *
   * @param {GameSnapshot} snapshot - The snapshot of the game state to sync
   * with the view. It includes the grid configuration and the current score.
   * @returns {void}
   */
  public syncGrid(snapshot: GameSnapshot): void {
    // Clear existing grid.
    this.container.innerHTML = "";

    snapshot.grid.forEach((row: (Candy | null)[], rowIndex: number) => {
      row.forEach((candy: Candy | null, candyIndex: number) => {
        const cell: HTMLDivElement = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = rowIndex.toString();
        cell.dataset.col = candyIndex.toString();

        if (candy) cell.classList.add(candy.color);
        this.container.appendChild(cell);
      });
    });

    this.updateScore(snapshot.score);
  }

  /**
   * Update the score display with the current score. This method is called
   * whenever the player's score changes, allowing the view to reflect the
   * updated score on the screen.
   *
   * @param {number} score - The current score to display.
   * @returns {void}
   */
  public updateScore(score: number): void {
    this.scoreElement.textContent = `Score: ${score}`;
  }

  /**
   * Show a victory message to the player.
   *
   * @returns {void}
   */
  public showVictory(): void {
    this.messageElement.textContent = "🎉 Victory!";
  }

  /**
   * Show a game over message to the player.
   *
   * @returns {void}
   */
  public showGameOver(): void {
    this.messageElement.textContent = "💀 Game Over";
  }

  /**
   * Lock the view to prevent user interactions.
   *
   * @returns {void}
   */
  public lock(): void {
    this.container.style.pointerEvents = "none";
  }

  /**
   * Unlock the view to allow user interactions.
   *
   * @returns {void}
   */
  public unlock(): void {
    this.container.style.pointerEvents = "auto";
  }

  /**
   * Animate a translation of a cell from one position to another. This method
   * applies a CSS transform to the specified element to create a smooth
   * movement effect. It returns a promise that resolves when the animation is
   * complete, allowing for synchronization with other game actions.
   *
   * @param {HTMLElement} element - The DOM element to animate.
   * @param {number} distanceX - The distance to translate in the X direction.
   * @param {number} distanceY - The distance to translate in the Y direction.
   * @param {number} duration - The duration of the animation in milliseconds.
   * @param {string} easing - The CSS easing function to use for the animation.
   * @returns {Promise<void>} - Resolves when the animation is complete.
   */
  private animateTranslation(
    element: HTMLElement,
    distanceX: number,
    distanceY: number,
    duration: number = 200,
    easing: string = "ease",
  ): Promise<void> {
    return new Promise((resolve) => {
      element.style.transition = `transform ${duration}ms ${easing}`;

      requestAnimationFrame(() => {
        element.style.transform = `translate(${distanceX}px, ${distanceY}px)`;
      });

      element.addEventListener(
        "transitionend",
        () => {
          element.style.transform = "";
          resolve();
        },
        { once: true },
      );
    });
  }

  /**
   * Animate a swap between two positions on the grid. This method visually
   * represents the swap action initiated by the user. It calculates the
   * necessary translations for the involved cells and applies CSS transitions
   * to create a smooth animation effect.
   *
   * @param {Position} a - The position of the first candy being swapped.
   * @param {Position} b - The position of the second candy being swapped.
   * @returns {Promise<void>} - Resolves when the animation is complete.
   */
  public async animateSwap(a: Position, b: Position): Promise<void> {
    const elementA: HTMLElement | null = this.getCell(a);
    const elementB: HTMLElement | null = this.getCell(b);
    if (!elementA || !elementB) return;

    const rectA: DOMRect = elementA.getBoundingClientRect();
    const rectB: DOMRect = elementB.getBoundingClientRect();

    const distanceX: number = rectB.left - rectA.left;
    const distanceY: number = rectB.top - rectA.top;

    await Promise.all([
      this.animateTranslation(elementA, distanceX, distanceY),
      this.animateTranslation(elementB, -distanceX, -distanceY),
    ]);
  }

  /**
   * Animate a swap back between two positions on the grid.
   *
   * @param {Position} a - The position of the first candy being swapped back.
   * @param {Position} b - The position of the second candy being swapped back.
   * @returns {Promise<void>} - Resolves when the animation is complete.
   */
  public async animateSwapBack(a: Position, b: Position): Promise<void> {
    const elementA: HTMLElement | null = this.getCell(a);
    const elementB: HTMLElement | null = this.getCell(b);
    if (!elementA || !elementB) return;

    const rectA: DOMRect = elementA.getBoundingClientRect();
    const rectB: DOMRect = elementB.getBoundingClientRect();

    const dx: number = rectB.left - rectA.left;
    const dy: number = rectB.top - rectA.top;

    await Promise.all([
      this.animateTranslation(elementA, dx, dy, 150),
      this.animateTranslation(elementB, -dx, -dy, 150),
    ]);
  }

  /**
   * Animate the removal of matched candies from the grid.
   *
   * @param {Match[]} matches - An array of Match objects representing the
   * candies to be removed. Each Match object contains the positions of the
   * matched candies.
   * @returns {Promise<void>} - Resolves when the animation is complete.
   */
  public async animateRemove(matches: Match[]): Promise<void> {
    const animations: Promise<void>[] = [];

    for (const match of matches) {
      for (const position of match.positions) {
        const element: HTMLElement | null = this.getCell(position);
        if (!element) continue;

        const duration: number = 300;
        const animation: Promise<void> = new Promise<void>((resolve) => {
          element.style.transition = "none";
          element.style.transform = "scale(1)";
          element.getBoundingClientRect();

          element.style.transition = `transform ${duration}ms ease`;
          element.style.transform = "scale(0)";

          setTimeout(resolve, duration);
        });

        animations.push(animation);
      }
    }

    await Promise.all(animations);
  }

  /**
   * Animate the collapse of the grid after matches have been removed.
   *
   * @param {CollapseResult} collapse - The result of the collapse operation,
   * containing the moves that need to be animated.
   * @returns {Promise<void>} - Resolves when all animations are complete.
   */
  public async animateCollapse(collapse: CollapseResult): Promise<void> {
    const animations: Promise<void>[] = [];

    for (const move of collapse.moves) {
      const fromElement = this.getCell(move.from);
      if (!fromElement) continue;

      const fromRect: DOMRect = fromElement.getBoundingClientRect();

      const distanceY: number =
        (move.to.row - move.from.row) * fromRect.height;

      fromElement.style.transition = "transform 0.25s ease-in";
      fromElement.style.transform = `translateY(${distanceY}px)`;
      fromElement.getBoundingClientRect();

      animations.push(
        this.animateTranslation(fromElement, 0, distanceY, 250, "ease-in"),
      );
    }

    await Promise.all(animations);

    // Reset transform.
    collapse.moves.forEach((move: CollapseMove) => {
      const element: HTMLElement | null = this.getCell(move.from);
      if (!element) return;
      element.style.transform = "";
    });
  }

  /**
   * Animate the spawning of new candies on the grid. This method visually
   * represents the appearance of new candies after a collapse. It positions
   * the new candy elements above the grid and animates them falling into
   * place, creating a smooth transition effect as they enter the game area.
   *
   * @param {SpawnResult} result - The result of the spawn operation,
   * containing the positions and details of the new candies to be spawned.
   * @returns {Promise<void>} - Resolves when all animations are complete.
   */
  public async animateSpawn(result: SpawnResult): Promise<void> {
    const animations: Promise<void>[] = [];

    for (const spawn of result.spawns) {
      const element: HTMLElement | null = this.getCell(spawn.at);
      if (!element) continue;

      const rect: DOMRect = element.getBoundingClientRect();
      const offset: number = rect.height * 2;

      element.style.transition = "none";
      element.style.transform = `translateY(-${offset}px)`;
      element.getBoundingClientRect();

      animations.push(this.animateTranslation(element, 0, 0, 300, "ease-out"));
    }

    await Promise.all(animations);
  }
}

export { GameView };
