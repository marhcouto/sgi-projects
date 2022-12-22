import { MyCylinder } from "../../primitives/MyCylinder.js";
import { MyPatch } from "../../primitives/MyPatch.js";
import { degreeToRad } from "../../utils.js";


export class MyPawn {
    constructor(scene, pawnHeight, pawnRadius) {
      this.scene = scene;
      if (!pawnHeight) {
        pawnHeight = 0.2
      }
      if (!pawnRadius) {
        pawnRadius = 0.3
      }
      this.pawnOutsideBody = new MyCylinder(scene, pawnRadius, pawnRadius, pawnHeight, 15, 15);
      this.pawnTop = new MyPatch(scene, 1, 15, 3, 15, [
        [[-pawnRadius, 0, pawnHeight, 1],
        [-pawnRadius, (4/3) * pawnRadius, pawnHeight, 1],
        [pawnRadius, (4/3) * pawnRadius, pawnHeight, 1],
        [pawnRadius, 0, pawnHeight, 1]],

        [[-pawnRadius, 0, pawnHeight, 1],
        [0, 0, pawnHeight, 1],
        [0, 0, pawnHeight, 1],
        [pawnRadius, 0, pawnHeight, 1]],
      ]);
    }

    display() {
      this.pawnOutsideBody.display();
      this.pawnTop.display();
      this.scene.pushMatrix();
      this.scene.rotate(degreeToRad(180), 0, 0, 1);
      this.pawnTop.display();
      this.scene.popMatrix();
    }
}