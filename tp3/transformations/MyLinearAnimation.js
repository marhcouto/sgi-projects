import { MyAnimation } from "./MyAnimation.js";
import {linearMovement} from "./movements/LinearMovement.js";
import { MyGameView } from "../view/MyGameView.js";

export class MyLinearAnimation extends MyAnimation {
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
      1000,
    );
  }
}