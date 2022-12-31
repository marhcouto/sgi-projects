import { MyRectangle } from "../primitives/MyRectangle.js";
import {CGFappearance, CGFtexture} from "../../lib/CGF.js";
import {
  getPieceChoiceError,
  cordToArrayIdx, GameStatus, generateGameState,
  getCapturePosition, getGameStatus, getPiece,
  lastMove,
  movePiece, PieceChoiceError,
  PieceType, undo, getDestinationChoiceError, DestinationChoiceError, getMove
} from "../checkers/CheckerState.js";
import {
  MOVE_ANIMATION_DURATION,
  MyLinearAnimation
} from "../transformations/MyLinearAnimation.js";
import { MyBoardFrame } from "./components/MyBoardFrame.js";
import { DEFAULT_PAWN_HEIGHT, DEFAULT_PAWN_RADIUS, MyPawn } from "./components/MyPawn.js";
import { MoveType } from "../checkers/CheckerMoves.js";
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
import {MyTriangle} from "../primitives/MyTriangle.js";

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

  setupTransformation() {
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

  buildMaterials() {
    // Materials
    this.cherryMaterial = new CGFappearance(this.scene);
    this.cherryMaterial.setAmbient(0.418, 0.213, 0.295, 1);
    this.cherryMaterial.setDiffuse(0.616, 0.376, 0.302, 1);
    this.cherryMaterial.setSpecular(0.826, 0.665, 0.615, 1);
    this.cherryMaterial.setShininess(80);
    this.cherryMaterial.setTexture(new CGFtexture(
      this.scene,
      './images/cherry.jpg'
    ));

    this.frameMaterial = new CGFappearance(this.scene);
    this.frameMaterial.setAmbient(0.2, 0.2, 0.2, 1);
    this.frameMaterial.setDiffuse(0.384, 0.275, 0.180, 1);
    this.frameMaterial.setSpecular(0.944, 0.784, 0.646, 1);
    this.frameMaterial.setShininess(120);
    this.frameMaterial.setTexture(new CGFtexture(
      this.scene,
      './images/frame-wood.jpg'
    ));

    // Materials
    this.buttonMaterial = this.materialWhiteCells = new CGFappearance(this.scene);
    this.buttonMaterial.setAmbient(0.4, 0.4, 0.4, 1);
    this.buttonMaterial.setDiffuse(1.0, 1.0, 1.0, 1);
    this.buttonMaterial.setSpecular(0.50, 0.50, 0.50, 1);
    this.buttonMaterial.setShininess(80);
    this.buttonMaterial.setTexture(new CGFtexture(
      this.scene,
      './images/white-marble.jpg'
    ));

    this.materialWhiteCells = new CGFappearance(this.scene);
    this.materialWhiteCells.setAmbient(0.4, 0.4, 0.4, 1);
    this.materialWhiteCells.setDiffuse(1.0, 1.0, 1.0, 1);
    this.materialWhiteCells.setSpecular(0.50, 0.50, 0.50, 1);
    this.materialWhiteCells.setShininess(90);
    this.materialWhiteCells.setTexture(new CGFtexture(
      this.scene,
      './images/white-marble.jpg'
    ))

    this.materialBlackCells = new CGFappearance(this.scene);
    this.materialBlackCells.setAmbient(0.3, 0.3, 0.3, 1);
    this.materialBlackCells.setDiffuse(0.3, 0.3, 0.3, 1);
    this.materialBlackCells.setSpecular(0.5, 0.5, 0.5, 1);
    this.materialBlackCells.setShininess(90);
    this.materialBlackCells.setTexture(new CGFtexture(
      this.scene,
      './images/black-marble.jpg'
    ))

    this.materialSelectedPawns = new CGFappearance(this.scene);
    this.materialSelectedPawns.setAmbient(0.15, 0.8, 0.55, 1);
    this.materialSelectedPawns.setDiffuse(0.15, 0.8, 0.55, 1);
    this.materialSelectedPawns.setSpecular(0.15, 0.8, 0.55, 1);
    this.materialSelectedPawns.setShininess(120);
  }

  build() {
    this.buildMaterials();
    this.boardAnimator = new Animator(true);
    this.nonBlockingAnimations = new Animator();
    this.buttons = [];
    this.playerCamera = new MyPlayerCamera(this.scene, degreeToRad(75), 0.1, 500, vec3.create(), 5, 5);
    this.nonBlockingAnimations.addAnimation('playerCamera', {animation: this.playerCamera});
    this.runningFunctions = new Map();
    this.scene.registerForUpdate('GameView', this.update.bind(this));

    this.pickedCellId = null;
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
          this.buttonMaterial,
          "./images/turn-camera.png",
        ),
        position: changePlayerCameraSidePosition,
      },
      {
        component: new MyButton(
          this.scene,
          () => this.gameState = undo(this.gameState),
          this.buttonMaterial,
          './images/undo.png'
        ),
        position: undoButtonPosition,
      },
      {
        component: new MyButton(
          this.scene,
          () => this.setupGameMovie(),
          this.buttonMaterial,
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
          this.buttonMaterial,
          './images/reset.png'
        ),
        position: resetButton,
      },
    );

    this.leftControlSide = new MyTriangle(this.scene,
      0, 4, 0,
      1.94454, 4, 1.94454,
      1.94454, 4, 0
    );
    this.leftControlSide.updateTexCoords(1, 1);

    this.rightControlSide = new MyTriangle(this.scene,
      0, -4, 0,
      1.94454, -4, 0,
      1.94454, -4, 1.94454,
    );
    this.rightControlSide.updateTexCoords(1, 1);

    this.controlsBackSide = new MyRectangle(this.scene, -4, 4, 0, 1.94454);
    this.controlsBackSide.updateTexCoords(1, 1);

    this.setupTransformation();
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
      this.executeMovementOrder(curMove);
    }
  }

  /**
   * Checks what cell has been picked and acts accordingly
   */
  checkPick() {
    if (this.scene.pickMode) {
      return;
    }

    if (!(this.scene.pickResults != null && this.scene.pickResults.length > 0)) {
      return;
    }

    if (this.boardAnimator.hasAnimations()) return;

    for (let i = 0; i< this.scene.pickResults.length; i++) {
      const obj = this.scene.pickResults[i][0];
      if (!obj) continue;
      let customId = this.scene.pickResults[i][1];
      const buttonIndex = customId - 1000;
      if (buttonIndex >= 0) {
        this.buttons[buttonIndex].component.callback();
        this.scene.pickResults.splice(0,this.scene.pickResults.length);
        return;
      }

      // No play if victory
      if (getGameStatus(this.gameState) === GameStatus.victoryBlacks || getGameStatus(this.gameState) === GameStatus.victoryWhites) {
        return;
      }

      this.boardInteraction(customId);
    }
    this.scene.pickResults.splice(0,this.scene.pickResults.length);

    // Check for win
    if (getGameStatus(this.gameState) === GameStatus.victoryBlacks) {
      alert(GameStatus.victoryBlacks);
    } else if (getGameStatus(this.gameState) === GameStatus.victoryWhites) {
      alert(GameStatus.victoryWhites);
    }
  }

  boardInteraction(customId) {
    if (!this.pickedCellId) { // Pick Piece
      let pickResult = getPieceChoiceError(this.gameState, customId);
      if (pickResult.error === PieceChoiceError.wrongTurn) alert(pickResult.error);
      if (pickResult.pos !== null) {
        this.pickedCellId = customId;
        this.pickedPiecePos = pickResult.pos;
      }
    } else { // Pick Destination
      let pickResult = getDestinationChoiceError(this.gameState, customId);
      if (pickResult.error !== null || pickResult.pos === null) {
        alert(pickResult.error);
        this.pickedCellId = null;
        this.pickedPiecePos = null;
        return;
      }
      let moveResult = getMove(this.gameState, this.pickedPiecePos, pickResult.pos);
      if (moveResult.moveError !== null) {
        alert(moveResult.moveError);
        this.pickedCellId = null;
        this.pickedPiecePos = null;
        return;
      }

      // Move Piece
      this.executeMovementOrder(moveResult.checkerMove);
      this.pickedCellId = null;
    }
  }

  /**
   * @param {CheckerMove} move
   * @returns {*}
   */
  executeMovementOrder(move) {
    let newGameState = movePiece(this.gameState, move);
    const lastPieceMove = lastMove(newGameState);
    this.setupAnimation(lastPieceMove);
    this.gameState = newGameState;
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

    this.setupSpotlight();
    this.runningFunctions.set(SPOTLIGHT_CALLBACK_ID, (_) => {
      const position = moveAnimation.currentPosition();
      vec3.transformMat4(position, position, this.boardTransformation);

      this.scene.lights[7].setPosition(position[0], position[1] + 2, position[2], 1.0);
      this.scene.lights[7].setSpotDirection(position[0], 0, position[2]);
      this.scene.lights[7].setVisible(true);
      this.scene.lights[7].enable();
    });
    setTimeout(() => {
      this.scene.lights[7].disable();
      this.runningFunctions.delete(SPOTLIGHT_CALLBACK_ID);
    }, MOVE_ANIMATION_DURATION);
  }

  setupSpotlight() {
    this.scene.lights[7].setAmbient(0, 0, 0, 1.0);
    this.scene.lights[7].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.scene.lights[7].setSpecular(0.7, 0.7, 0.7, 1.0);
    this.scene.lights[7].setSpotCutOff(20);
    this.scene.lights[7].setSpotExponent(0.1);
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
        if (row * this.cells.length + col === this.pickedCellId) { // Selected piece different material
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

    this.scene.registerForPick(-1, null);
    this.frameMaterial.apply();
    this.frame.display();

    //Draws the piece container
    this.cherryMaterial.apply();
    this.pieceContainer.display();

    //Setups general transformations for controls
    this.scene.pushMatrix();
    this.scene.translate(9, -4.0, 0);

    this.scene.pushMatrix();
    this.scene.rotate(degreeToRad(-45), 0, 1, 0);
    this.scene.translate(0.75, 0, 0);

    //Back of the controls
    this.scene.pushMatrix();
    this.scene.translate(0, 0, -0.02);
    this.cherryMaterial.apply();
    this.controllsBack.display();
    this.scene.popMatrix();

    //Buttons
    for (let i = 0; i < this.buttons.length; i++) {
      this.scene.registerForPick(i + 1000, this.buttons[i]);
      this.scene.pushMatrix();
      this.scene.multMatrix(this.buttons[i].position);
      this.scene.multMatrix(this.controllsBaseTransformations);
      this.buttons[i].component.display();
      this.scene.popMatrix();
    }
    this.scene.registerForPick(-1, null);

    //Timer
    this.scene.pushMatrix();
    this.scene.translate(1, 0, 0);
    this.scene.scale(0.35, 0.35, 1);
    this.scene.rotate(degreeToRad(-90), 0, 0, 1);
    this.gameTimer.display();
    this.scene.popMatrix();

    // Score
    this.scene.pushMatrix();
    this.scene.scale(0.75, 0.75, 1);
    this.scoreBoard.display(this.gameState.score);
    this.scene.popMatrix();

    // Rotation Matrix Stack
    this.scene.popMatrix();

    this.cherryMaterial.apply();
    this.leftControlSide.display();
    this.rightControlSide.display();

    this.scene.pushMatrix();
    this.scene.translate(1.94454, 0, 0);
    this.scene.rotate(degreeToRad(90), 0, 1, 0);
    this.scene.rotate(degreeToRad(90), 0, 0, 1);
    this.controlsBackSide.display();
    this.scene.popMatrix();

    //Control stack
    this.scene.popMatrix();

    //Board rotation
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
