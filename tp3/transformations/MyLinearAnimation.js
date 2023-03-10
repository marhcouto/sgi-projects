import {linearMovement} from "./movements/LinearMovement.js";
import { MyGameView } from "../view/MyGameView.js";
import {MyAbsoluteAnimation} from "./MyAbsoluteAnimation.js";

export const MOVE_ANIMATION_DURATION = 1000;

export class MyLinearAnimation extends MyAbsoluteAnimation {
  constructor(scene, initialCoordinates, finalCoordinates, animationDuration) {
    super(scene, animationDuration);
    this.getX = linearMovement(initialCoordinates[0], finalCoordinates[0], animationDuration).bind(this);
    this.getY = linearMovement(initialCoordinates[1], finalCoordinates[1], animationDuration).bind(this);
    this.getZ = ((_) => 0).bind(this);
  }

  static moveAnimationFactory(scene, movement) {
    return new MyLinearAnimation(
      scene,
      MyGameView.positionToCord(movement.initPos),
      MyGameView.positionToCord(movement.finalPos),
      MOVE_ANIMATION_DURATION,
    );
  }
}