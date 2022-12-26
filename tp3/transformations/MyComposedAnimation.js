import { MyAnimation } from "./MyAnimation.js";
import { coplanarCylindersColliding } from "../utils.js";
import { DEFAULT_PAWN_HEIGHT, DEFAULT_PAWN_RADIUS } from "../view/components/MyPawn.js";
import { MyParabolicAnimation } from "./MyParabolicAnimation.js";
import { MyGameView} from "../view/MyGameView.js";
import { PIECE_CONTAINER_POSITION } from "../view/components/MyPieceContainer.js";
import {MyLinearAnimation} from "./MyLinearAnimation.js";
import {MyConstantAnimation} from "./MyConstantAnimation.js";

/**
 * @typedef {import('../checkers/CheckerState.js').PieceType} PieceType
 */

/**
 *
 * @typedef {Object} CapturedPieceData
 * @property {Number[]} coords
 * @property {Number} idx
 * @property {PieceType} type
 */

export const captureAnimationCallbackFactory = (
  scene,
  animator,
  capturedPieceData,
  afterCollisionCb
) => {
  const captureCb = (_, curAnim) => {
    if (coplanarCylindersColliding(curAnim.currentPosition(), capturedPieceData.coords, DEFAULT_PAWN_RADIUS)) {
      animator.clearAnimations(capturedPieceData.idx);
      animator.addAnimation(
        capturedPieceData.idx,
        {
          animation: new MyParabolicAnimation(
            scene,
            vec3.add(vec3.create(), capturedPieceData.coords, vec3.fromValues(0, 0, DEFAULT_PAWN_HEIGHT)),
            PIECE_CONTAINER_POSITION,
            3000,
          ),
          pieceType: capturedPieceData.type
        },
      )
      return afterCollisionCb;
    }
    return captureCb;
  }
  return captureCb;
};

export const upgradeCallbackFactory = (scene, animator, movement, mainAnimationIndex, mainPieceType, afterUpgradeCb) => {

  const upgradeCb = (_, currentAnimation) => {
    if (currentAnimation.done()) {
      animator.clearAnimations(mainAnimationIndex);
      animator.addAnimation(
        mainAnimationIndex,
        {
          animation: new MyParabolicAnimation(
            scene,
            PIECE_CONTAINER_POSITION,
            vec3.add(vec3.create(), MyGameView.positionToCord(movement.finalPos), vec3.fromValues(0, 0, DEFAULT_PAWN_HEIGHT)),
            3000
          ),
          pieceType: mainPieceType,
        },
      );
      animator.addAnimation(
        mainAnimationIndex,
        {
          animation: new MyConstantAnimation(
            scene,
            MyGameView.positionToCord(movement.finalPos),
            3000
          ),
          pieceType: mainPieceType
        }
      );
      return afterUpgradeCb;
    }
    return upgradeCb;
  }
  return upgradeCb;
}

export class MyComposedAnimation extends MyAnimation {
  constructor(animation, composeCb) {
    super();;
    this.animation = animation;
    this.composeCb = composeCb;
  }

  update(t) {
    this.animation.update(t);
    this.composeCb = this.composeCb == null ? null : this.composeCb(t, this.animation);
  }

  apply() {
    return this.animation.apply();
  }

  getX(t) {
    return this.animation.getX(t);
  }

  getY(t) {
    return this.animation.getY(t);
  }

  getZ(t) {
    return this.animation.getZ(t);
  }

  done() {
    return this.animation.done();
  }

  static captureAnimationFactory(scene, animator, movement, capturedPieceData, afterCollisionCb) {
    return {
      capturedAnimation: new MyConstantAnimation(scene, capturedPieceData.coords),
      capturerAnimation: new MyComposedAnimation(
        MyLinearAnimation.moveAnimationFactory(scene, movement),
        captureAnimationCallbackFactory(scene, animator, capturedPieceData, afterCollisionCb)
      )
    };
  }
}
