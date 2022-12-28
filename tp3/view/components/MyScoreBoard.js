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
    constructor(scene, center, numberMaterial) {

        this.scene = scene;
        this.smallSquareMaterial = numberMaterial;
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

        this.scoreTexture = new CGFtexture(this.scene, './images/scores.png');

        this.rectangeFront = new MyRectangle(this.scene, -1.75, 1.75, -0.85, 0.85);
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
        // Big Rectangle
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.material.apply();
        this.rectangeFront.display();
        this.scene.popMatrix();

        // Score Squares
        this.smallSquareMaterial.setTexture(this.scoreTexture);
        this.smallSquareMaterial.apply();
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.01);
        this.scene.rotate(- Math.PI / 2, 0, 0, 1);
        this.scene.pushMatrix();
        this.scene.translate(-0.85, 0, 0);
        this.smallSquare.updateSprite(score.blacksScore);
        this.smallSquare.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.translate(0.85, 0, 0);
        this.smallSquare.updateSprite(score.whitesScore);
        this.smallSquare.display();
        this.scene.popMatrix();
        this.scene.popMatrix();

        this.smallSquareMaterial.setTexture(null);
    }
}