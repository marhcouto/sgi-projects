import { MyCylinder } from "../../primitives/MyCylinder.js";
import { MyPatch } from "../../primitives/MyPatch.js";
import { degreeToRad } from "../../utils.js";
import {CGFappearance} from "../../../lib/CGF.js";
import {PieceType} from "../../checkers/CheckerState.js";

/**
 * @typedef {import('../checkers/CheckerState.js').PieceType} PieceType
 */

export const DEFAULT_PAWN_RADIUS = 0.3;
export const DEFAULT_PAWN_HEIGHT = 0.2;

export class MyPawn {

  constructor(scene, pawnHeight, pawnRadius) {
    this.scene = scene;

    this.build(pawnRadius, pawnHeight);
  }

  build(pawnRadius, pawnHeight) {
    if (!pawnHeight) {
      pawnHeight = DEFAULT_PAWN_HEIGHT;
    }
    if (!pawnRadius) {
      pawnRadius = DEFAULT_PAWN_RADIUS;
    }
    this.pawnOutsideBody = new MyCylinder(this.scene, pawnRadius, pawnRadius, pawnHeight, 15, 15);
    this.pawnTop = new MyPatch(this.scene, 1, 15, 3, 15, [
      [[-pawnRadius, 0, pawnHeight, 1],
        [-pawnRadius, (4/3) * pawnRadius, pawnHeight, 1],
        [pawnRadius, (4/3) * pawnRadius, pawnHeight, 1],
        [pawnRadius, 0, pawnHeight, 1]],

      [[-pawnRadius, 0, pawnHeight, 1],
        [0, 0, pawnHeight, 1],
        [0, 0, pawnHeight, 1],
        [pawnRadius, 0, pawnHeight, 1]],
    ]);


    const materialWhitePawns = new CGFappearance(this.scene);
    materialWhitePawns.setAmbient(0.8, 0.75, 0.6, 1);
    materialWhitePawns.setDiffuse(0.8, 0.75, 0.6, 1);
    materialWhitePawns.setSpecular(0.8, 0.75, 0.6, 1);
    materialWhitePawns.setShininess(120);

    const materialBlackPawns = new CGFappearance(this.scene);
    materialBlackPawns.setAmbient(0.15, 0.1, 0.05, 1);
    materialBlackPawns.setDiffuse(0.15, 0.1, 0.05, 1);
    materialBlackPawns.setSpecular(0.15, 0.1, 0.05, 1);
    materialBlackPawns.setShininess(120);

    this.pieceMaterials = {
      [PieceType.Black]: materialBlackPawns,
      [PieceType.KingBlack]: materialBlackPawns,
      [PieceType.White]: materialWhitePawns,
      [PieceType.KingWhite]: materialWhitePawns,
    }
  }

  /**
   * Returns the material for a pawn depending on pieceType
   * @param {PieceType} pieceType
   */
  retrieveMaterials(pieceType) {
    return this.pieceMaterials[pieceType];
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