import {MySpriteRectangle} from "../../primitives/MySpriteRectangle.js";
import {CGFappearance, CGFtexture} from "../../../lib/CGF.js";
import {MyRectangle} from "../../primitives/MyRectangle.js";

export class MyTimer {
  constructor(scene, material) {
    this.scene = scene;
    this.gameStartingInstant = null;
    this.gameTime = 0;
    this.counterView = new MySpriteRectangle(this.scene, -0.5, 0.5, -1, 1, 10);
    this.dots = new MyRectangle(this.scene, -0.25, 0.25, -1, 1);
    this.frame = new MyRectangle(this.scene, -2.5, 2.5, -1.25, 1.25);

    this.frameMaterial = new CGFappearance(this.scene);
    this.frameMaterial.setAmbient(0.9, 0.9, 0.9, 1);
    this.frameMaterial.setDiffuse(0.9, 0.9, 0.9, 1);
    this.frameMaterial.setSpecular(0.9, 0.9, 0.9, 1);
    this.frameMaterial.setShininess(120);

    this.numbersTexture = new CGFtexture(scene, './images/numbers.png');
    this.dotsTexture = new CGFtexture(scene, './images/dots.png');
    this.material = material;
  }

  update(t) {
    if (this.gameStartingInstant == null) {
      this.gameStartingInstant = t;
      return;
    }

    this.gameTime = t - this.gameStartingInstant;
  }

  getTimeObj() {
    const timeInSeconds = Math.floor(this.gameTime / 1000);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds - (minutes * 60);
    return {
      secondUnits: seconds % 10,
      secondDozens: Math.floor(seconds / 10),
      minuteUnits: minutes % 10,
      minuteDozens: Math.floor(minutes / 10),
    }
  }

  display() {
    const currentTime = this.getTimeObj();
    this.material.setTexture(this.numbersTexture);
    this.material.apply();

    this.scene.pushMatrix();
    this.scene.translate(0.75, 0, 0);
    this.counterView.updateSprite(currentTime.secondDozens);
    this.counterView.display();
    this.scene.popMatrix();


    this.scene.pushMatrix();
    this.scene.translate(1.75, 0, 0);
    this.counterView.updateSprite(currentTime.secondUnits);
    this.counterView.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.75, 0, 0);
    this.counterView.updateSprite(currentTime.minuteUnits);
    this.counterView.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-1.75, 0, 0);
    this.counterView.updateSprite(currentTime.minuteDozens);
    this.counterView.display();
    this.scene.popMatrix();

    this.material.setTexture(this.dotsTexture);
    this.material.apply();
    this.dots.display();

    this.scene.pushMatrix();
    this.frameMaterial.apply();
    this.scene.translate(0, 0, -0.01);
    this.frame.display();
    this.scene.popMatrix();
  }
}