import {MyAbsoluteAnimation} from "./MyAbsoluteAnimation.js";

export class MyConstantAnimation extends MyAbsoluteAnimation {
  constructor(scene, initialPosition, duration) {
    super(scene, duration ? duration : Number.MAX_SAFE_INTEGER);
    this.getX = (() => initialPosition[0]).bind(this);
    this.getY = (() => initialPosition[1]).bind(this);
    this.getZ = (() => initialPosition[2]).bind(this);
  }
}