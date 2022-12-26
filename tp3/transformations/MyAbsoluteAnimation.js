import { MyAnimation } from "./MyAnimation.js";

export class MyAbsoluteAnimation extends MyAnimation {
  constructor(scene, animationDuration) {
    super(scene);
    this.duration = animationDuration;
    this.epoch = null;
    this.elapsedTime = 0;
  }

  update(t) {
    if (!this.epoch) {
      this.epoch = t;
      this.elapsedTime = 0;
      return;
    }
    this.elapsedTime = t - this.epoch;
  }

  done() {
    return this.elapsedTime >= this.duration;
  }

  getX(t) {
    throw new Error("Specific animation must implement getX()");
  }

  getY(t) {
    throw new Error("Specific animation must implement getY()");
  }

  getZ(t) {
    throw new Error("Specific animation must implement getZ()");
  }

  apply() {
    this.scene.translate(...this.currentPosition());
  }

  currentPosition() {
    if (this.elapsedTime > this.duration) {
      this.elapsedTime = this.duration;
    }
    return vec3.fromValues(
      this.getX(this.elapsedTime),
      this.getY(this.elapsedTime),
      this.getZ(this.elapsedTime),
    )
  }
}