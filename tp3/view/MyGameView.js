import { MyRectangle } from "../primitives/MyRectangle.js";
import { CGFappearance } from "../../lib/CGF.js";
import { MyCylinder } from "../primitives/MyCylinder.js";
import { cordToArrayIdx, isFromTurn, lastMove, movePiece, PieceType} from "../checkers/CheckerState.js";
import { MyPieceMoveAnimation } from "../transformations/MyPieceMoveAnimation.js";

/**
 * @typedef {import('./CheckerState.js').PieceType} PieceType
 * @typedef {import('./CheckerState.js').CheckerMove} CheckerMove
 */

export class MyGameView {
  /**
   * @constructor
   *
   * @param {XMLscene} scene
   * @param {GameState} gameState
   */
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    scene.gameView = this;
    this.interactionHaltingAnimationQueue = new Map();
    this.scene.registerForUpdate('GameView', this.update.bind(this));
    this.build();
  }

  static positionToCord(pos) {
    return vec3.fromValues(pos.col + 0.5, -pos.row - 0.5, 0);
  }

  update(t) {
    const animationsToRemove = [];
    for (const [animationIdx, animationObj] of this.interactionHaltingAnimationQueue.entries()) {
      if (animationObj.done()) {
        animationsToRemove.push(animationIdx);
        continue;
      }
      animationObj.update(t);
    }
    animationsToRemove.forEach((animIdx) => this.interactionHaltingAnimationQueue.delete(animIdx));
  }

  build() {
    this.pickedCell = null;
    this.cells = [];

    // Cells
    for (let row = 0; row < 8; row++) {
      let rows = []
      for (let col = 0; col < 8; col++) {
        rows.push(new MyRectangle(this.scene, col, col + 1, -row - 1, -row))
      }
      this.cells.push(rows);
    }

    // Pieces
    this.pawn = new MyCylinder(this.scene, 0.3, 0.2, 0.4, 10, 10);
    this.king = new MyCylinder(this.scene, 0.3, 0.1, 0.8, 10, 10);

    // Materials
    this.materialWhiteCells = new CGFappearance(this.scene);
    this.materialWhiteCells.setAmbient(0.75, 0.7, 0.5, 1);
    this.materialWhiteCells.setDiffuse(0.75, 0.7, 0.5, 1);
    this.materialWhiteCells.setSpecular(0.75, 0.7, 0.5, 1);
    this.materialWhiteCells.setShininess(120);

    this.materialBlackCells = new CGFappearance(this.scene);
    this.materialBlackCells.setAmbient(0.3, 0.2, 0.1, 1);
    this.materialBlackCells.setDiffuse(0.3, 0.2, 0.1, 1);
    this.materialBlackCells.setSpecular(0.3, 0.2, 0.1, 1);
    this.materialBlackCells.setShininess(120);

    this.materialWhitePawns = new CGFappearance(this.scene);
    this.materialWhitePawns.setAmbient(0.8, 0.75, 0.6, 1);
    this.materialWhitePawns.setDiffuse(0.8, 0.75, 0.6, 1);
    this.materialWhitePawns.setSpecular(0.8, 0.75, 0.6, 1);
    this.materialWhitePawns.setShininess(120);

    this.materialBlackPawns = new CGFappearance(this.scene);
    this.materialBlackPawns.setAmbient(0.15, 0.1, 0.05, 1);
    this.materialBlackPawns.setDiffuse(0.15, 0.1, 0.05, 1);
    this.materialBlackPawns.setSpecular(0.15, 0.1, 0.05, 1);
    this.materialBlackPawns.setShininess(120);
  }

  /**
   * Checks if what cell has been picked and acts accordingly
   */
  checkPick() {
    if (this.scene.pickMode) {
      return;
    }

    if (!(this.scene.pickResults != null && this.scene.pickResults.length > 0)) {
      return;
    }

    for (let i = 0; i< this.scene.pickResults.length; i++) {
      let obj = this.scene.pickResults[i][0];
      if (!obj) continue;
      let customId = this.scene.pickResults[i][1];
      if (!this.pickedCell) {
        if (this.interactionHaltingAnimationQueue.size !== 0) {
          this.interactionHaltingAnimationQueue = new Map();
        }
        this.pickedCell = isFromTurn(this.gameState, customId) ? customId : null;
      } else {
        let result = movePiece(this.gameState, this.pickedCell, customId);
        console.log("Result:", result.success);
        this.gameState = result.gameState;
        if (result.success) {
          this.setupAnimation(lastMove(this.gameState));
        }
        this.pickedCell = null;
      }
      console.log("Picked object: " + obj + ", with pick id " + customId);
    }
    this.scene.pickResults.splice(0,this.scene.pickResults.length);
  }

  /**
   *
   * @param {CheckerMove} movement
   */
  setupAnimation(movement) {
    const pieceIdx = cordToArrayIdx(this.gameState, movement.finalPos);
    this.interactionHaltingAnimationQueue.set(pieceIdx, new MyPieceMoveAnimation(
      this.scene,
      movement,
    ));
  }

  displayBoard() {
    this.scene.clearPickRegistration();
    this.checkPick();
    let whiteIndices = [0, 2, 4, 6, 9, 11, 13, 15, 16, 18, 20, 22, 25, 27, 29, 31, 32, 34, 36,
      38, 41, 43, 45, 47, 48, 50, 52, 54, 57, 59, 61, 63, 64, 66, 68, 70, 73, 75, 77, 79];

    for (let row = 0; row < this.cells.length; row++) {
      for (let col = 0; col < this.cells[row].length; col++) {

        // Cells
        if (whiteIndices.includes(row * this.cells.length + col)) {
          this.materialWhiteCells.apply();
        } else {
          this.materialBlackCells.apply();
        }
        this.scene.registerForPick(row * this.cells.length + col, this.cells[row][col]);
        this.cells[row][col].display();

        // Pieces
        if (this.gameState.board[row][col].piece === PieceType.Empty) continue;
        if (this.gameState.board[row][col].piece === PieceType.Black) {
          this.materialBlackPawns.apply();
        } else if (this.gameState.board[row][col].piece === PieceType.White) {
          this.materialWhitePawns.apply();
        }
        this.scene.pushMatrix();
        const pieceIdx = cordToArrayIdx(this.gameState, {row, col});
        if (this.interactionHaltingAnimationQueue.has(pieceIdx)) {
          this.interactionHaltingAnimationQueue.get(pieceIdx).apply();
        } else {
          const cords = MyGameView.positionToCord({row, col});
          this.scene.translate(cords[0], cords[1], cords[2]);
        }
        this.pawn.display();
        this.scene.popMatrix();
      }
    }
  }
}
