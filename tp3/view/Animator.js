/**
 * @typedef {import('./CheckerState.js').PieceType} PieceType
 */

/**
 * @typedef {Object} BoardAnimationDetails
 * @property {PieceType} pieceType
 * @property { MyAnimation } animation
 */

export class Animator {
  constructor(automaticCleaning) {
    this.animationQueue = new Map();
    this.automaticCleaning = !!automaticCleaning;
  }

  /**
   *
   * @param {string} id
   * @param {MyAnimation} animation
   * @param {PieceType} pieceType
   * @return {Map<any, any>|*}
   */
  addAnimation(id, animationData) {
    if (this.animationQueue.has(id)) {
      return this.animationQueue.get(id).push(animationData);
    }
    return this.animationQueue.set(id, [animationData]);
  }

  update(t) {
    for (const [_, animationsForId] of this.animationQueue.entries()) {
      for (const [_, animationDetails] of animationsForId.entries()) {
        animationDetails.animation.update(t);
      }
    }

    if (this.automaticCleaning) {
      this.cleanDoneAnimations();
    }
  }

  cleanDoneAnimations() {
    const animationsDone = new Map();
    for (const [id, animationsForId] of this.animationQueue.entries()) {
      for (const [animIdx, animationDetails] of animationsForId.entries()) {
        if (animationDetails.animation.done()) {
          if (animationsDone.has(id)) {
            animationsDone.get(id).push(animIdx);
          } else {
            animationsDone.set(id, [animIdx]);
          }
        }
      }
    }

    for (const [animationId, doneAnimationsForId] of animationsDone.entries()) {
      const allAnimations = this.animationQueue.get(animationId);
      const runningAnimations = [];
      for (let i = 0; i < allAnimations.length; i++) {
        if (!doneAnimationsForId.includes(i)) {
          runningAnimations.push(allAnimations[i]);
        }
      }
      if (runningAnimations.length === 0) {
        this.animationQueue.delete(animationId);
      } else {
        this.animationQueue.set(animationId, runningAnimations);
      }
    }
  }

  /**
   *
   * @param {string} id
   * @return {BoardAnimationDetails[]}
   */
  getAnimationDetails(id) {
    if (!this.animationQueue.has(id)) {
      return [];
    }
    return this.animationQueue.get(id);
  }

  /**
   *
   * @param {string} id
   */
  clearAnimations(id) {
    this.animationQueue.delete(id);
  }
  hasAnimations() {
    return this.animationQueue.size !== 0;
  }
}
