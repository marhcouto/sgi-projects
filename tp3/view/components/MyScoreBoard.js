import { MyRectangle } from "../../primitives/MyRectangle.js";
import { MySpriteRectangle } from "../../primitives/MySpriteRectangle.js";
import { CGFappearance, CGFtexture } from "../../../lib/CGF.js";

/**
 * @typedef {import('../../checkers/CheckerState.js').Score} Score
 */


export class MyScoreBoard {
    /**
     *
     * @param {XMLscene} scene
     * @param {vec3} center
     */
    constructor(scene, center) {

        this.scene = scene;
        this.build(center);
    }

    /**
     * Build variables
     * @param {vec3} coords
     */
    build(center) {

        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(0.9, 0.9, 0.9, 1);
        this.material.setDiffuse(0.9, 0.9, 0.9, 1);
        this.material.setSpecular(0.9, 0.9, 0.9, 1);
        this.material.setShininess(120);

        this.scoreSquareMaterials = [];

        this.smallSquareMaterial = new CGFappearance(this.scene);
        this.smallSquareMaterial.setAmbient(1, 1, 1, 1);
        this.smallSquareMaterial.setDiffuse(1, 1, 1, 1);
        this.smallSquareMaterial.setSpecular(1, 1, 1, 1);
        this.smallSquareMaterial.setShininess(120);
        const tex = new CGFtexture(this.scene, `./images/numbers.png`);
        this.smallSquareMaterial.setTexture(tex);

        this.rectangeFront = new MyRectangle(this.scene, -2, 2, -1, 1);
        this.smallSquare = new MySpriteRectangle(this.scene, -0.75, 0.75, -0.75, 0.75, 13);

        if (!center) {
            this.center = vec3.fromValues(10, -4, 0);
        } else {
            this.center = center;
        }
    }

    /**
     * Displays the score board
     * @param {Score} score
     */
    display(score) {

        this.scene.pushMatrix();
        this.scene.translate(this.center[0], this.center[1], this.center[2]);
        let angle = -Math.PI / 7 * 2;
        this.scene.translate(0, 0, Math.abs( Math.sin(angle)));
        this.scene.rotate(-Math.PI / 7 * 2, 0, 1, 0);

        // Big Rectangle
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.material.apply();
        this.rectangeFront.display();
        this.scene.popMatrix();

        // Score Squares
        this.smallSquareMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.01);
        this.scene.rotate(- Math.PI / 2, 0, 0, 1);
        this.scene.pushMatrix();
        this.scene.translate(-1, 0, 0);
        this.smallSquare.updateSprite(score.blacksScore);
        this.smallSquare.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(1, 0, 0);
        this.smallSquare.updateSprite(score.whitesScore);
        this.smallSquare.display();
        this.scene.popMatrix();
        this.scene.popMatrix();


        this.scene.popMatrix();

    }
}