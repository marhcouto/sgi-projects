/**
 * MyAnimation
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyAnimation {
  constructor(scene, animationDuration) {
    this.scene = scene;
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
}