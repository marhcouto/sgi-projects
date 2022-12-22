import {MyRectangle} from "../../primitives/MyRectangle.js";
import {degreeToRad} from "../../utils.js";

export class MyBoardFrame {
  constructor(scene) {
    this.scene = scene;
    this.sideFrame = new MyRectangle(this.scene, 0, 8, 0, 1);
    this.verticalFrame = new MyRectangle(this.scene, -1, 9, 0, 1);
  }

  display() {
    this.scene.pushMatrix();
    this.scene.translate(0, -8, 0);
    this.scene.rotate(degreeToRad(90), 0, 0, 1);
    this.sideFrame.display();
    this.scene.popMatrix()

    this.scene.pushMatrix();
    this.scene.translate(9, -8, 0);
    this.scene.rotate(degreeToRad(90), 0, 0, 1);
    this.sideFrame.display();
    this.scene.popMatrix()

    this.scene.pushMatrix();
    this.scene.translate(0, -9, 0);
    this.verticalFrame.display();
    this.scene.popMatrix();

    this.verticalFrame.display();
  }
}