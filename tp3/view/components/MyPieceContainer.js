import {MyRectangle} from "../../primitives/MyRectangle.js";
import {CGFappearance} from "../../../lib/CGF.js";
import {MyPawn} from "./MyPawn.js";
import {PieceType} from "../../checkers/CheckerState.js";


/**
 * @typedef {import('../checkers/CheckerState.js').PieceType} PieceType
 */


export class MyPieceContainer {
    /**
     * @constructor
     *
     * @param {XMLscene} scene
     * @param {vec3} center
     */
    constructor(scene, center) {
        this.scene = scene;

        this.build(center);
    }

    /**
     * Returns random position within the container
     * @return {vec3}
     */
    _getRandomPosition() {
        let x = Math.random() - 0.5;
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 0.5;
        return vec3.fromValues(x, y, z);
    }

    /**
     * Returns a random PieceType
     * @return {PieceType}
     */
    _getRandomPawn() {
        let i = Math.floor(Math.random() * 2);
        return [PieceType.Black, PieceType.White][i];
    }


    /**
     * Build variables
     * @param {vec3} center
     */
    build(center) {

        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(0.25, 0.1, 0.05, 1);
        this.material.setDiffuse(0.25, 0.1, 0.05, 1);
        this.material.setSpecular(0.25, 0.1, 0.05, 1);
        this.material.setShininess(120);

        this.pawn = new MyPawn(this.scene);

        if (!center) {
            this.center = vec3.fromValues(-2, -4, 0);
        } else {
            this.center = center;
        }

        this.base = new MyRectangle(this.scene, -1,  1, -2, 2);
        this.side = new MyRectangle(this.scene, -1,  1, -0.25, 0.25)

        // Define pile of pawns
        this.pawns = [];
        for (let i = 0; i < 20; i++) {
            this.pawns.push({
                position: this._getRandomPosition(),
                pawnType: this._getRandomPawn()
            });
        }
    }

    /**
     * Displays the piece container
     */
    display() {
        this.material.apply();

        this.scene.pushMatrix();
        this.scene.translate(this.center[0], this.center[1], this.center[2]);

        // Base
        this.base.display();

        // Top
        // Inside
        this.scene.pushMatrix();
        this.scene.translate(0, 2, 0.25);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.side.display();
        this.scene.popMatrix();

        // Outside
        this.scene.pushMatrix();
        this.scene.translate(0, 2, 0.25);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.side.display();
        this.scene.popMatrix();

        // Bottom
        // Inside
        this.scene.pushMatrix();
        this.scene.translate(0, -2, 0.25);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.side.display();
        this.scene.popMatrix();

        // Outside
        this.scene.pushMatrix();
        this.scene.translate(0, -2, 0.25);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.side.display();
        this.scene.popMatrix();

        // Left
        // Inside
        this.scene.pushMatrix();
        this.scene.translate(-1, 0, 0.25);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(2, 1, 1);
        this.side.display();
        this.scene.popMatrix();

        // Outside
        this.scene.pushMatrix();
        this.scene.translate(-1, 0, 0.25);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(2, 1, 1);
        this.side.display();
        this.scene.popMatrix();

        // Right
        // Inside
        this.scene.pushMatrix();
        this.scene.translate(1, 0, 0.25);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(2, 1, 1);
        this.side.display();
        this.scene.popMatrix();

        // Outside
        this.scene.pushMatrix();
        this.scene.translate(1, 0, 0.25);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(2, 1, 1);
        this.side.display();
        this.scene.popMatrix();

        // Pawns
        for (let pawn of this.pawns) {
            this.scene.pushMatrix();
            this.scene.translate(pawn.position[0], pawn.position[1], pawn.position[2]);
            this.pawn.retrieveMaterials(pawn.pawnType).apply();
            this.pawn.display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}