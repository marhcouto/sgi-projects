import { MyCylinder } from "../../primitives/MyCylinder.js";


export class MyPawn {
    constructor(scene) {
      this.pawnBody = new MyCylinder(scene, 0.3, 0.2, 0.4, 10, 10);
    }

    display() {
      this.pawnBody.display();
    }
}