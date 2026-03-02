import { type Position } from "@/model/types";

/**
 * The InputHandler class is responsible for managing user input related to
 * dragging and swapping candies on the game grid. It listens for pointer
 * events on the game container, tracks the start and end positions of a drag
 * action, and invokes a callback function when a valid swap is detected.
 */
class InputHandler {
  private container: HTMLElement;
  private onSwap: (from: Position, to: Position) => void;
  private startPosition: Position | null = null;

  /**
   * Initialize the InputHandler by attaching event listeners to the
   * specified container element. The constructor takes the container
   * element and a callback function to call when a valid swap is detected.
   */
  constructor(
    container: HTMLElement,
    onSwap: (from: Position, to: Position) => void,
  ) {
    this.container = container;
    this.onSwap = onSwap;
    this.attach();
  }

  /**
   * Attach event listeners to the container element to handle pointer events
   * for dragging and swapping candies.
   *
   * @returns {void}
   */
  private attach(): void {
    this.container.addEventListener("pointerdown", (event: PointerEvent) => {
      const target: HTMLElement | null = event.target as HTMLElement | null;
      if (!target?.dataset?.row) return;

      this.startPosition = {
        row: Number(target.dataset.row),
        column: Number(target.dataset.col),
      };

      try {
        this.container.setPointerCapture(event.pointerId);
      } catch (error: unknown) {
        console.error("Failed to capture pointer:", event.pointerId, error);
      }
    });

    // Listen for pointer move events to detect dragging over adjacent cells.
    // If the user drags over an adjacent cell, trigger the swap callback and
    // reset the start position to prevent multiple swaps in one drag.
    this.container.addEventListener("pointermove", (event: PointerEvent) => {
      if (!this.startPosition) return;

      const element: HTMLElement | null = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;

      if (!element?.dataset?.row) return;

      const endPosition: Position = {
        row: Number(element.dataset.row),
        column: Number(element.dataset.col),
      };

      const distanceRow: number = Math.abs(
        endPosition.row - this.startPosition.row,
      );
      const distanceColumn: number = Math.abs(
        endPosition.column - this.startPosition.column,
      );

      // Only trigger swap if the user has dragged to an adjacent cell.
      if (distanceRow + distanceColumn === 1) {
        this.onSwap(this.startPosition, endPosition);
        this.startPosition = null;
      }
    });

    // Reset start position on pointer up or cancel to prevent
    // unintended swaps.
    this.container.addEventListener(
      "pointerup",
      () => (this.startPosition = null),
    );

    // Reset start position on pointer cancel to prevent unintended swaps.
    this.container.addEventListener(
      "pointercancel",
      () => (this.startPosition = null),
    );
  }
}

export { InputHandler };
