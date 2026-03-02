/**
 * Manages the player's score in the game.
 */
class ScoreManager {
  private score: number = 0;

  /**
   * Add points to the current score. This method is called whenever the player
   * makes a successful match, with the number of points gained based on the
   * length of the match and any special conditions (e.g., combos).
   *
   * @param {number} points - The number of points to add to the current score.
   */
  public add(points: number): void {
    this.score += points;
  }

  /**
   * Reset the score to zero. This method is typically called when starting
   * a new game or when the player chooses to reset their progress.
   *
   * @returns {void}
   */
  public reset(): void {
    this.score = 0;
  }

  /**
   * Get the current score. This method can be used by the view to display the
   * player's score on the screen.
   *
   * @returns {number} - The current score.
   */
  public getScore(): number {
    return this.score;
  }
}

export { ScoreManager };
