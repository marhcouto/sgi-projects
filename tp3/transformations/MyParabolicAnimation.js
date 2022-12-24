import { MyAnimation } from "./MyAnimation.js";
import { linearMovement } from "./movements/LinearMovement.js";
import { parabolicMovement } from "./movements/ParabolicMovement.js";

export class MyParabolicAnimation extends MyAnimation {
  constructor(scene, initialCoordinates, finalCoordinates, animationDuration) {
    super(scene, animationDuration);

    this.getX = linearMovement(initialCoordinates[0], finalCoordinates[0], animationDuration).bind(this);
    this.getY = linearMovement(initialCoordinates[1], finalCoordinates[1], animationDuration).bind(this);
    this.getZ = parabolicMovement(initialCoordinates[2], finalCoordinates[2], animationDuration, 10).bind(this);
  }
}