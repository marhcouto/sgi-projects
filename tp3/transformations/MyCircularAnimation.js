import {MyAnimation} from "./MyAnimation.js";

export class MyCircularAnimation extends MyAnimation {
  constructor(scene, animationDuration, initialAng, finalAng, radius, height) {
    super(scene, animationDuration, radius);
    this.radius = radius;
    this.initialAng = initialAng;
    this.finalAng = finalAng;

    this.getX = ((t) => this.radius * Math.sin(this.currentAngle(t))).bind(this);
    this.getY = ((_) => height).bind(this);
    this.getZ = ((t) => this.radius * Math.cos(this.currentAngle(t))).bind(this);
  }

  currentAngle(t) {
    const angleDelta = Math.abs(this.finalAng - this.initialAng);
    const signedAngle = this.finalAng > this.initialAng ? angleDelta : -angleDelta;
    return this.initialAng + signedAngle * (t / this.duration);
  }
}