import {MyRectangle} from "../../primitives/MyRectangle.js";
import {degreeToRad} from "../../utils.js";

export class MyBoardFrame {
  constructor(scene) {
    this.scene = scene;
    //this.sideFrame = new MyRectangle(this.scene, 0, 8, 0, 1);
    //this.verticalFrame = new MyRectangle(this.scene, -1, 9, 0, 1);
    this.frameRectangle = new MyRectangle(this.scene, -0.5, 0.5, -0.5, 0.5);
  }

  display() {
    this.scene.pushMatrix();
    this.scene.translate(-1, 0, 0);
    this.scene.scale(10, 1, 1);
    this.scene.translate(0.5, 0.5, 0);
    this.scene.rotate(degreeToRad(-90), 0, 0, 1);
    this.frameRectangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-1, -9, 0);
    this.scene.scale(10, 1, 1);
    this.scene.translate(0.5, 0.5, 0);
    this.scene.rotate(degreeToRad(-90), 0, 0, 1);
    this.frameRectangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.scale(1, 8, 1);
    this.scene.translate(-0.5, -0.5, 0);
    this.frameRectangle.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(9, 0, 0);
    this.scene.scale(1, 8, 1);
    this.scene.translate(-0.5, -0.5, 0);
    this.frameRectangle.display();
    this.scene.popMatrix();
  }
}