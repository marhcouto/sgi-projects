import { MyAnimation } from "./MyAnimation.js";
import { linearMovement } from "./movements/LinearMovement.js";
import { parabolicMovement } from "./movements/ParabolicMovement.js";

export class MyCaptureAnimation extends MyAnimation {
  constructor(scene, initialDelay, initialCoordinates, finalCoordinates, animationDuration) {
    super(scene);
    this.epoch = null;
    this.elapsedTime = 0;
    this.duration = animationDuration;
    this.initialDelay = initialDelay;

    this.xFn = linearMovement(initialCoordinates[0], finalCoordinates[0], animationDuration);
    this.yFn = linearMovement(initialCoordinates[1], finalCoordinates[1], animationDuration);
    this.zFn = parabolicMovement(initialCoordinates[2], finalCoordinates[2], animationDuration, 10);
  }

  update(t) {
    if (!this.epoch) {
      this.epoch = t;
      return;
    }
    this.elapsedTime = t - this.epoch;
  }

  done() {
    return this.elapsedTime >= this.duration;
  }

  apply() {
    const t = this.elapsedTime >= this.initialDelay ? this.elapsedTime - this.initialDelay : 0;
    this.scene.translate(
      this.xFn(t),
      this.yFn(t),
      this.zFn(t),
    );
  }
}