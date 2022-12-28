import { MyRectangle } from "../primitives/MyRectangle.js";
import { CGFappearance } from "../../lib/CGF.js";
import {
  cordToArrayIdx, generateGameState,
  getCapturePosition, getPiece,
  isFromTurn,
  lastMove,
  movePiece,
  PieceType, undo
} from "../checkers/CheckerState.js";
import {
  MOVE_ANIMATION_DURATION,
  MyLinearAnimation
} from "../transformations/MyLinearAnimation.js";
import { MyBoardFrame } from "./components/MyBoardFrame.js";
import { DEFAULT_PAWN_HEIGHT, DEFAULT_PAWN_RADIUS, MyPawn } from "./components/MyPawn.js";
import { MoveType } from "../checkers/CheckerPiece.js";
import { MyPieceContainer } from "./components/MyPieceContainer.js";
import { MyScoreBoard } from "./components/MyScoreBoard.js";
import {
  MyComposedAnimation,
  upgradeCallbackFactory
} from "../transformations/MyComposedAnimation.js";
import { Animator } from "./Animator.js";
import { degreeToRad } from "../utils.js";
import { MyPlayerCamera } from "../transformations/MyPlayerCamera.js";
import { MyButton } from "./components/MyButton.js";
import { MyTimer } from "./components/MyTimer.js";

/**
 * @typedef {import('./CheckerState.js').PieceType} PieceType
 * @typedef {import('./CheckerState.js').CheckerMove} CheckerMove
 */

/**
 * @typedef {Object} animatedSubject
 * @property component
 * @property {MyAnimation} animation
 */

const SPOTLIGHT_CALLBACK_ID = 'SPOTLIGHT_CB';

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
    this.build();
  }

  setupLightsAndTransformation() {
    this.scene.lights[7].setAmbient(0.3, 0.3, 0.3, 1.0);
    this.scene.lights[7].setDiffuse(0.7, 0.7, 0.7, 1.0);
    this.scene.lights[7].setSpecular(1.0, 1.0, 1.0, 1.0);
    this.scene.lights[7].setSpotCutOff(0.5);
    this.scene.lights[7].setSpotExponent(0.1);

    this.boardTransformation = mat4.create();
    mat4.translate(this.boardTransformation, this.boardTransformation, vec3.fromValues(-4, 0, -4));
    mat4.rotateX(this.boardTransformation, this.boardTransformation, degreeToRad(-90));
  }

  static positionToCord(pos) {
    return vec3.fromValues(pos.col + 0.5, -pos.row - 0.5, 0);
  }

  update(t) {
    this.gameTimer.update(t);
    this.boardAnimator.update(t);
    if (!this.boardAnimator.hasAnimations() && this.onUnlockCallback) {
      this.onUnlockCallback();
    }

    this.nonBlockingAnimations.update(t);
    for (const [_, cb] of this.runningFunctions) {
      cb(t);
    }
  }

  build() {
    this.boardAnimator = new Animator(true);
    this.nonBlockingAnimations = new Animator();
    this.buttons = [];
    this.playerCamera = new MyPlayerCamera(this.scene, degreeToRad(75), 0.1, 500, vec3.create(), 5, 5);
    this.nonBlockingAnimations.addAnimation('playerCamera', {animation: this.playerCamera});
    this.runningFunctions = new Map();
    this.scene.registerForUpdate('GameView', this.update.bind(this));

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

    const numbersMaterial = new CGFappearance(this.scene);
    numbersMaterial.setAmbient(1, 1, 1, 1);
    numbersMaterial.setDiffuse(1, 1, 1, 1);
    numbersMaterial.setSpecular(1, 1, 1, 1);
    numbersMaterial.setShininess(120);

    // Score Board
    this.scoreBoard = new MyScoreBoard(this.scene, null, numbersMaterial);
    this.gameTimer = new MyTimer(this.scene, numbersMaterial);

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

    //Game controls
    this.controllsBack = new MyRectangle(this.scene, -0.75, 2, -4, 4);

    this.controllsBaseTransformations = mat4.create();
    mat4.translate(
      this.controllsBaseTransformations,
      this.controllsBaseTransformations,
      vec3.fromValues(0, 0, 0.125),
    )
    mat4.scale(
      this.controllsBaseTransformations,
      this.controllsBaseTransformations,
      vec3.fromValues(0.80, 0.80, 0.5),
    )
    mat4.rotateZ(
      this.controllsBaseTransformations,
      this.controllsBaseTransformations,
      degreeToRad(-90),
    )

    const changePlayerCameraSidePosition = mat4.create();
    mat4.translate(
      changePlayerCameraSidePosition,
      changePlayerCameraSidePosition,
      vec3.fromValues(1.25, 2.75, 0),
    );


    const undoButtonPosition = mat4.create();
    mat4.translate(
      undoButtonPosition,
      undoButtonPosition,
      vec3.fromValues(0, 2.75, 0),
    );

    const replayButtonPosition = mat4.create();
    mat4.translate(
      replayButtonPosition,
      replayButtonPosition,
      vec3.fromValues(1.25, -2.75, 0),
    )

    const resetButton = mat4.create();
    mat4.translate(
      resetButton,
      resetButton,
      vec3.fromValues(0, -2.75, 0),
    )

    //Buttons
    this.buttons.push(
      {
        component: new MyButton(
          this.scene,
          () => this.playerCamera.changeSide(),
          this.materialWhiteCells,
          "./images/turn-camera.png",
        ),
        position: changePlayerCameraSidePosition,
      },
      {
        component: new MyButton(
          this.scene,
          () => this.gameState = undo(this.gameState),
          this.materialWhiteCells,
          './images/undo.png'
        ),
        position: undoButtonPosition,
      },
      {
        component: new MyButton(
          this.scene,
          () => this.setupGameMovie(),
          this.materialWhiteCells,
          './images/replay.png'
        ),
        position: replayButtonPosition,
      },
      {
        component: new MyButton(
          this.scene,
          () => {
            this.gameState = generateGameState(this.gameState.size);
            this.build();
          },
          this.materialWhiteCells,
          './images/replay.png'
        ),
        position: resetButton,
      },
    );

    this.setupLightsAndTransformation();
  }

  setupGameMovie() {
    const moveSequence = this.gameState.moves;
    moveSequence.reverse();
    this.gameState = generateGameState(this.gameState.size);

    this.onUnlockCallback = () => {
      if (moveSequence.length === 0) {
        this.onUnlockCallback = null;
        return;
      }
      const curMove = moveSequence.pop();
      const origIdx = cordToArrayIdx(this.gameState, curMove.initPos);
      const destIdx = cordToArrayIdx(this.gameState, curMove.finalPos);
      this.executeMovementOrder(origIdx, destIdx);
    }
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
      const obj = this.scene.pickResults[i][0];
      if (!obj) continue;
      let customId = this.scene.pickResults[i][1];
      const buttonIndex = customId - 1000;
      if (buttonIndex >= 0) {
        console.log("Did click: ", buttonIndex);
        this.buttons[buttonIndex].component.callback();
        this.scene.pickResults.splice(0,this.scene.pickResults.length);
        return;
      }

      if (!this.pickedCell) {
        if (this.boardAnimator.hasAnimations()) return;
        this.pickedCell = isFromTurn(this.gameState, customId) ? customId : null;
      } else {
        this.executeMovementOrder(this.pickedCell, customId);
        this.pickedCell = null;
      }
      console.log("Picked object: " + obj + ", with pick id " + customId);
    }
    this.scene.pickResults.splice(0,this.scene.pickResults.length);
  }

  executeMovementOrder(origIdx, destIdx) {
    let result = movePiece(this.gameState, origIdx, destIdx);
    if (result.success) {
      const lastPieceMove = lastMove(result.gameState);
      this.setupAnimation(lastPieceMove);
    }
    this.gameState = result.gameState;

    return result.success;
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
    let moveAnimation;
    const mainAnimationIndex = cordToArrayIdx(this.gameState, movement.finalPos);
    const mainPieceType = getPiece(this.gameState, movement.initPos);
    const animationObj = {
      [MoveType.Move]: () => {
        moveAnimation = MyLinearAnimation.moveAnimationFactory(this.scene, movement);
        return [
          {
            idx: mainAnimationIndex,
            animation: moveAnimation,
            pieceType: mainPieceType
          }
        ]
      },
      [MoveType.Capture]: () => {
        const captureAnimation = MyComposedAnimation.captureAnimationFactory(
          this.scene,
          this.boardAnimator,
          movement,
          this.getCapturedPieceData(movement),
          null);
        moveAnimation = captureAnimation.capturerAnimation;
        return [
          {
            idx: mainAnimationIndex,
            animation: moveAnimation,
            pieceType: mainPieceType
          },
          {
            idx: cordToArrayIdx(this.gameState, getCapturePosition(movement)),
            animation: captureAnimation.capturedAnimation,
            pieceType: getPiece(this.gameState, getCapturePosition(movement)),
          },
      ]},
      [MoveType.MoveAndUpgrade]: () => {
        moveAnimation = MyLinearAnimation.moveAnimationFactory(this.scene, movement);
        return [
          {
            idx: mainAnimationIndex,
            animation: new MyComposedAnimation(
              moveAnimation,
              upgradeCallbackFactory(this.scene, this.boardAnimator, movement, mainAnimationIndex, mainPieceType, null)
            ),
            pieceType: mainPieceType,
          }
        ]
      },
      [MoveType.CaptureAndUpgrade]: () => {
        const capturedPiecePosition = getCapturePosition(movement);
        const captureAnimation = MyComposedAnimation.captureAnimationFactory(
          this.scene,
          this.boardAnimator,
          movement,
          this.getCapturedPieceData(movement),
          upgradeCallbackFactory(this.scene, this.boardAnimator, movement, mainAnimationIndex, mainPieceType, null)
        );
        moveAnimation = captureAnimation.capturerAnimation;
        return [
          {
            idx: mainAnimationIndex,
            animation: moveAnimation,
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

    for (const anim of animationObj[movement.moveType]()) {
      this.boardAnimator.addAnimation(anim.idx, {animation: anim.animation, pieceType: anim.pieceType});
    }

    this.runningFunctions.set(SPOTLIGHT_CALLBACK_ID, (_) => {
      const position = moveAnimation.currentPosition();
      vec3.transformMat4(position, position, this.boardTransformation);

      this.scene.lights[7].setPosition(position[0], position[1] + 2, position[2]);
      this.scene.lights[7].setSpotDirection(position[0], 0, position[2]);
      this.scene.lights[7].setVisible(true);
      this.scene.lights[7].enable();
    });
    setTimeout(() => {
      this.scene.lights[7].disable();
      this.runningFunctions.delete(SPOTLIGHT_CALLBACK_ID);
    }, MOVE_ANIMATION_DURATION);
  }

  /**
   * Displays the checkers board and its components
   */
  displayBoard() {
    this.scene.pushMatrix();
    this.scene.multMatrix(this.boardTransformation);
    this.scene.clearPickRegistration();
    this.checkPick();
    let whiteIndices = [0, 2, 4, 6, 9, 11, 13, 15, 16, 18, 20, 22, 25, 27, 29, 31, 32, 34, 36,
      38, 41, 43, 45, 47, 48, 50, 52, 54, 57, 59, 61, 63];

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
        if (this.boardAnimator.getAnimationDetails(pieceIdx).length !== 0) {
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

    this.scene.pushMatrix();
    this.scene.translate(9.5, -4.0, 0.5);
    this.scene.rotate(degreeToRad(-45), 0, 1, 0);

    this.scene.pushMatrix();
    this.scene.translate(0, 0, -0.02);
    this.controllsBack.display();
    this.scene.popMatrix();

    for (let i = 0; i < this.buttons.length; i++) {
      this.scene.registerForPick(i + 1000, this.buttons[i]);
      this.scene.pushMatrix();
      this.scene.multMatrix(this.buttons[i].position);
      this.scene.multMatrix(this.controllsBaseTransformations);
      this.buttons[i].component.display();
      this.scene.popMatrix();
    }

    this.scene.pushMatrix();
    this.scene.translate(1, 0, 0);
    this.scene.scale(0.35, 0.35, 1);
    this.scene.rotate(degreeToRad(-90), 0, 0, 1);
    this.gameTimer.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.scale(0.75, 0.75, 1);
    this.scoreBoard.display(this.gameState.score);
    this.scene.popMatrix();

    this.scene.popMatrix();
    this.scene.popMatrix();
  }

  displayAnimatedIndex(idx) {
    const animations = this.boardAnimator.getAnimationDetails(idx);
    animations.forEach((animationDetails) => {
      this.pieceModel[animationDetails.pieceType].retrieveMaterials(animationDetails.pieceType).apply();
      this.scene.pushMatrix();
      animationDetails.animation.apply();
      this.pieceModel[animationDetails.pieceType].display();
      this.scene.popMatrix();
    })
  }
}
