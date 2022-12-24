import { MyRectangle } from "../primitives/MyRectangle.js";
import { CGFappearance } from "../../lib/CGF.js";
import {
  cordToArrayIdx,
  getCapturePosition, getPiece,
  isFromTurn,
  lastMove,
  movePiece,
  PieceType
} from "../checkers/CheckerState.js";
import { MyLinearAnimation } from "../transformations/MyLinearAnimation.js";
import { MyBoardFrame } from "./components/MyBoardFrame.js";
import { DEFAULT_PAWN_HEIGHT, DEFAULT_PAWN_RADIUS, MyPawn } from "./components/MyPawn.js";
import { MoveType } from "../checkers/CheckerPiece.js";
import { MyPieceContainer } from "./components/MyPieceContainer.js";
import { MyScoreBoard } from "./components/MyScoreBoard.js";
import {
  MyComposedAnimation,
  upgradeCallbackFactory
} from "../transformations/MyComposedAnimation.js";
import {Animator} from "./Animator.js";

/**
 * @typedef {import('./CheckerState.js').PieceType} PieceType
 * @typedef {import('./CheckerState.js').CheckerMove} CheckerMove
 */

/**
 * @typedef {Object} animatedSubject
 * @property component
 * @property {MyAnimation} animation
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
    this.animator = new Animator();
    this.scene.registerForUpdate('GameView', this.update.bind(this));
    this.build();
  }

  static positionToCord(pos) {
    return vec3.fromValues(pos.col + 0.5, -pos.row - 0.5, 0);
  }

  update(t) {
    this.animator.update(t);
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
    const pawn = new MyPawn(this.scene);
    const king = new MyPawn(this.scene, DEFAULT_PAWN_HEIGHT * 2, DEFAULT_PAWN_RADIUS);
    this.pieceModel = Object.freeze({
      [PieceType.KingBlack]: king,
      [PieceType.KingWhite]: king,
      [PieceType.Black]: pawn,
      [PieceType.White]: pawn,
    });


    //Board Frame
    this.frame = new MyBoardFrame(this.scene);

    // Piece Container
    this.pieceContainer = new MyPieceContainer(this.scene, null);

    // Score Board
    this.scoreBoard = new MyScoreBoard(this.scene, null);

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

    this.materialSelectedPawns = new CGFappearance(this.scene);
    this.materialSelectedPawns.setAmbient(0.15, 0.8, 0.55, 1);
    this.materialSelectedPawns.setDiffuse(0.15, 0.8, 0.55, 1);
    this.materialSelectedPawns.setSpecular(0.15, 0.8, 0.55, 1);
    this.materialSelectedPawns.setShininess(120);
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
        if (this.animator.hasBoardAnimations()) return;
        this.pickedCell = isFromTurn(this.gameState, customId) ? customId : null;
      } else {
        let result = movePiece(this.gameState, this.pickedCell, customId);
        console.log("Result:", result.success);
        if (result.success) {
          const lastPieceMove = lastMove(result.gameState);
          this.setupAnimation(lastPieceMove);
        }
        this.gameState = result.gameState;
        this.pickedCell = null;
      }
      console.log("Picked object: " + obj + ", with pick id " + customId);
    }
    this.scene.pickResults.splice(0,this.scene.pickResults.length);
  }

  getCapturedPieceData(movement) {
    const capturedPiecePosition = getCapturePosition(movement);
    const capturedPieceCoordinates = MyGameView.positionToCord(capturedPiecePosition);
    const capturedPieceIndex = cordToArrayIdx(this.gameState, capturedPiecePosition);
    return {
      idx: capturedPieceIndex,
      coords: capturedPieceCoordinates,
      type: getPiece(this.gameState, capturedPiecePosition)
    }
  }

  /**
   *
   * @param {CheckerMove} movement
   */
  setupAnimation(movement) {
    const mainAnimationIndex = cordToArrayIdx(this.gameState, movement.finalPos);
    const mainPieceType = getPiece(this.gameState, movement.initPos);
    const animationObj = {
      [MoveType.Move]: () => [{ idx: mainAnimationIndex, animation: MyLinearAnimation.moveAnimationFactory(this.scene, movement), pieceType: mainPieceType }],
      [MoveType.Capture]: () => {
        const captureAnimation = MyComposedAnimation.captureAnimationFactory(
          this.scene,
          this.animator,
          movement,
          this.getCapturedPieceData(movement),
          null);
        console.log(cordToArrayIdx(this.gameState, getCapturePosition(movement)));
        return [
          {
            idx: mainAnimationIndex,
            animation: captureAnimation.capturerAnimation,
            pieceType: mainPieceType
          },
          {
            idx: cordToArrayIdx(this.gameState, getCapturePosition(movement)),
            animation: captureAnimation.capturedAnimation,
            pieceType: getPiece(this.gameState, getCapturePosition(movement)),
          },
      ]},
      [MoveType.MoveAndUpgrade]: () => {
        return [
          {
            idx: mainAnimationIndex,
            animation: new MyComposedAnimation(
              MyLinearAnimation.moveAnimationFactory(this.scene, movement),
              upgradeCallbackFactory(this.scene, this.animator, movement, mainAnimationIndex, mainPieceType, null)
            ),
            pieceType: mainPieceType,
          }
        ]
      },
      [MoveType.CaptureAndUpgrade]: () => {
        const capturedPiecePosition = getCapturePosition(movement);
        const captureAnimation = MyComposedAnimation.captureAnimationFactory(
          this.scene,
          this.animator,
          movement,
          this.getCapturedPieceData(movement),
          upgradeCallbackFactory(this.scene, this.animator, movement, mainAnimationIndex, mainPieceType, null)
        );
        console.log(captureAnimation);
        return [
          {
            idx: mainAnimationIndex,
            animation: captureAnimation.capturerAnimation,
            pieceType: mainPieceType
          },
          {
            idx: cordToArrayIdx(this.gameState, capturedPiecePosition),
            animation: captureAnimation.capturedAnimation,
            pieceType: getPiece(this.gameState, capturedPiecePosition),
          },
        ]
      }
    }

    console.log(movement.moveType);
    for (const anim of animationObj[movement.moveType]()) {
      this.animator.addBoardAnimation(anim.idx, anim.animation, anim.pieceType);
    }
  }


  /**
   * Displays the checkers board and its components
   */
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
        const pieceIdx = cordToArrayIdx(this.gameState, {row, col});
        if (this.animator.getBoardAnimationDetails(pieceIdx).length !== 0) {
          this.displayAnimatedIndex(pieceIdx);
          continue;
        }

        const piece = getPiece(this.gameState, {row, col});

        if (piece === PieceType.Empty) continue;
        if (row * this.cells.length + col === this.pickedCell) { // Selected piece different material
          this.materialSelectedPawns.apply();
        } else {
          this.pieceModel[piece].retrieveMaterials(piece).apply();
        }

        this.scene.pushMatrix();
        const cords = MyGameView.positionToCord({row, col});
        this.scene.translate(cords[0], cords[1], cords[2]);
        this.pieceModel[piece].display();
        this.scene.popMatrix();
      }
    }
    this.frame.display();
    this.pieceContainer.display();
    this.scoreBoard.display(this.gameState.score);
  }

  displayAnimatedIndex(idx) {
    const animations = this.animator.getBoardAnimationDetails(idx);
    animations.forEach((animationDetails) => {
      this.pieceModel[animationDetails.pieceType].retrieveMaterials(animationDetails.pieceType).apply();
      this.scene.pushMatrix();
      animationDetails.animation.apply();
      this.pieceModel[animationDetails.pieceType].display();
      this.scene.popMatrix();
    })
  }
}
