import { MyAnimation } from "./MyAnimation.js";
import {MyGameView} from "../view/MyGameView.js";

const PERCENTAGE_MOVE_PER_UPDATE = 0.1;

export class MyPieceMoveAnimation extends MyAnimation {
  constructor(scene, movement) {
    super(scene);
    this.currentDisplacement = 0;
    this.displacementVector = vec3.fromValues(0, 0, 0);
    this.initCord = MyGameView.positionToCord(movement.initPos);
    vec3.sub(
      this.displacementVector,
      MyGameView.positionToCord(movement.finalPos),
      MyGameView.positionToCord(movement.initPos),
    );
  }

  update(_) {
    if (this.currentDisplacement < 1) {
      this.currentDisplacement += PERCENTAGE_MOVE_PER_UPDATE;
      if (this.currentDisplacement > 1) {
        this.currentDisplacement = 1;
      }
      return;
    }
  }

  apply() {
    return this.scene.translate(
      this.initCord[0] + this.displacementVector[0] * this.currentDisplacement,
      this.initCord[1] + this.displacementVector[1] * this.currentDisplacement,
      this.initCord[2] + this.displacementVector[2] * this.currentDisplacement,
    );
  }

  done() {
    return this.currentDisplacement >= 1;
  }
}