import { MyRectangle } from "../../primitives/MyRectangle.js";
import {degreeToRad} from "../../utils.js";
import {CGFtexture} from "../../../lib/CGF.js";

export class MyButton {
  constructor(scene, callback, material, texturePath) {
    this.scene = scene;
    this.front = new MyRectangle(scene, -1, 1, -0.5, 0.5);
    this.biggerSide = new MyRectangle(scene, -1, 1, 0, 0.25);
    this.smallSide = new MyRectangle(scene, -0.5, 0.5, 0, 0.25);
    this.callback = callback;

    this.material = material;
    this.texture = new CGFtexture(this.scene, texturePath);
  }

  display() {
    // Front side
    this.material.setTexture(this.texture);
    this.material.apply();
    this.front.display();
    this.material.setTexture(null);

    this.material.apply();

    // Top side
    this.scene.pushMatrix();
    this.scene.translate(0, 0.5, 0);
    this.scene.rotate(degreeToRad(-90), 1, 0, 0);
    this.biggerSide.display();
    this.scene.popMatrix();

    // Bottom side
    this.scene.pushMatrix();
    this.scene.translate(0, -0.5, -0.25);
    this.scene.rotate(degreeToRad(90), 1, 0, 0);
    this.biggerSide.display();
    this.scene.popMatrix();

    // Right side
    this.scene.pushMatrix();
    this.scene.translate(1, 0, -0.25);
    this.scene.rotate(degreeToRad(90), 0, 1, 0);
    this.scene.rotate(degreeToRad(90), 0, 0, 1);
    this.smallSide.display();
    this.scene.popMatrix();

    // Left side
    this.scene.pushMatrix();
    this.scene.translate(-1, 0, 0);
    this.scene.rotate(degreeToRad(-90), 0, 1, 0);
    this.scene.rotate(degreeToRad(90), 0, 0, 1);
    this.smallSide.display();
    this.scene.popMatrix();
  }
}