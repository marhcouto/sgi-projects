import {MySpriteRectangle} from "../../primitives/MySpriteRectangle.js";

export class MyTimer {
  constructor(scene) {
    this.scene = scene;
    this.gameStartingInstant = null;
    this.gameTime = 0;
    this.counterView = new MySpriteRectangle(this.scene, -0.5, 0.5, 1, 1, 10);
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
    return {
      seconds: timeInSeconds - (minutes * 60),
      minutes: minutes
    }
  }

  display() {
    console.log(this.getTimeObj());
  }
}