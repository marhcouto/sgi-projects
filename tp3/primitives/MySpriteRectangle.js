import {MyRectangle} from "./MyRectangle.js";

export class MySpriteRectangle extends MyRectangle {
  constructor(scene, x1, x2, y1, y2, nSprites) {
    super(scene, x1, x2, y1, y2);
    this.nSprites = nSprites;
    this.oldSprite = null;
  }

  updateSprite(index) {
    if (this.oldSprite != null && this.oldSprite === index) {
      return;
    }

    const start = index / this.nSprites;
    const end = start + 1 / this.nSprites;
    this.injectTexCoords([
      start, 1,
      end, 1,
      start, 0,
      end, 0
    ]);
  }
}