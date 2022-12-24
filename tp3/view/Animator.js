/**
 * @typedef {import('./CheckerState.js').PieceType} PieceType
 */

/**
 * @typedef {Object} BoardAnimationDetails
 * @property {PieceType} pieceType
 * @property { MyAnimation } animation
 */

export class Animator {
  constructor() {
    this.boardAnimationQueue = new Map()
  }

  /**
   *
   * @param {string} id
   * @param {MyAnimation} animation
   * @param {PieceType} pieceType
   * @return {Map<any, any>|*}
   */
  addBoardAnimation(id, animation, pieceType) {
    if (this.boardAnimationQueue.has(id)) {
      return this.boardAnimationQueue.get(id).push({ animation, pieceType });
    }
    return this.boardAnimationQueue.set(id, [{ animation, pieceType }]);
  }

  update(t) {
    const animationsDone = new Map();
    for (const [id, animationsForId] of this.boardAnimationQueue.entries()) {
      for (const [animIdx, animationDetails] of animationsForId.entries()) {
        if (animationDetails.animation.done()) {
          if (animationsDone.has(id)) {
            animationsDone.get(id).push(animIdx);
          } else {
            animationsDone.set(id, [ animIdx ]);
          }
        }
        animationDetails.animation.update(t);
      }
    }

    for (const [animationId, doneAnimationsForId] of animationsDone.entries()) {
      const allAnimations = this.boardAnimationQueue.get(animationId);
      const runningAnimations = [];
      for (let i = 0; i < allAnimations.length; i++) {
        if (!doneAnimationsForId.includes(i)) {
          runningAnimations.push(allAnimations[i]);
        }
      }
      if (runningAnimations.length === 0) {
        this.boardAnimationQueue.delete(animationId);
      } else {
        this.boardAnimationQueue.set(animationId, runningAnimations);
      }
    }
  }

  /**
   *
   * @param {string} id
   * @return {BoardAnimationDetails[]}
   */
  getBoardAnimationDetails(id) {
    if (!this.boardAnimationQueue.has(id)) {
      return [];
    }
    return this.boardAnimationQueue.get(id);
  }

  /**
   *
   * @param {string} id
   */
  clearAnimations(id) {
    this.boardAnimationQueue.delete(id);
  }
  hasBoardAnimations() {
    return this.boardAnimationQueue.size !== 0;
  }
}
