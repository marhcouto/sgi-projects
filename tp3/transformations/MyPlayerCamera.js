import { CGFcamera } from "../../lib/CGF.js";
import {MyCircularAnimation} from "./MyCircularAnimation.js";


/**
 * @enum
 * @readonly
 */
const CameraState = {
  MovingToWhite: Symbol("PlayerCameraStateMovingWhite"),
  MovingToBlack: Symbol("PlayerCameraStateMovingBlack"),
  BlackSide: Symbol("PlayerCameraStateBlack"),
  WhiteSide: Symbol("PlayerCameraStateMovingWhite"),
}
Object.freeze(CameraState);

export class MyPlayerCamera extends CGFcamera {
  constructor(scene, fov, near, far, target, radius, height) {
    super(fov, near, far, MyPlayerCamera.blackPlayerPosition(radius, height), target);
    this.scene = scene;
    this.state = CameraState.BlackSide;
    this.radius = radius;
    this.height = height;
    this.epoch = null;
    this.elapsedTime = 0;
    console.log(this.position);
  }

  static whitePlayerPosition(radius, height) {
    return vec3.fromValues(0, height, radius);
  }

  static blackPlayerPosition(radius, height) {
    return vec3.fromValues(0, height, -radius);
  }

  update(t) {
    if (!(this.state === CameraState.MovingToWhite || this.state === CameraState.MovingToBlack)) {
      return;
    }
    this.animation.update(t);

    const currentPosition = this.animation.currentPosition();
    if (this.animation.done() && this.state === CameraState.MovingToWhite) {
      this.setPosition(MyPlayerCamera.whitePlayerPosition(this.radius, this.height));
      this.state = CameraState.WhiteSide;
      return;
    }
    if (this.animation.done() && this.state === CameraState.MovingToBlack) {
      this.setPosition(MyPlayerCamera.blackPlayerPosition(this.radius, this.height));
      this.state = CameraState.BlackSide;
      return;
    }
    this.setPosition(currentPosition);
  }

  changeSide() {
    if (this.state === CameraState.BlackSide) {
      this.state = CameraState.MovingToWhite
      this.animation = new MyCircularAnimation(this.scene, 3000, Math.PI, 0, 10, 5);
    }
    if (this.state === CameraState.WhiteSide) {
      this.state = CameraState.MovingToBlack;
      this.animation = new MyCircularAnimation(this.scene, 3000, 0, Math.PI, 10, 5);
    }
  }
}