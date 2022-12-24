import { MyAnimation } from "./MyAnimation.js";

export class MyConstantAnimation extends MyAnimation {
  constructor(scene, initialPosition, duration) {
    super(scene, duration ? duration : Number.MAX_SAFE_INTEGER);
    this.getX = (() => initialPosition[0]).bind(this);
    this.getY = (() => initialPosition[1]).bind(this);
    this.getZ = (() => initialPosition[2]).bind(this);
  }
}