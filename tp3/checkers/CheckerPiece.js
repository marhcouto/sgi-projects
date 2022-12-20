import { PieceType } from "./CheckerCell.js";
import { enemyPieceColor, getPiece } from "./CheckerState.js";

/**
 * @typedef {import('./CheckerState.js').GameState} GameState
 * @typedef {import('./CheckerState.js').Position} Position
 * @typedef {import('./CheckerCell.js').PieceType} PieceType
 * @typedef {import('./CheckerCell.js').CellColor} CellColor
 */

/**
 * @typedef {Object} CheckerMove
 * @property {Position} initPos
 * @property {Position} finalPos
 * @property {MoveType} moveType
 */

/**
 * Enum for valid move types
 * @readonly
 * @enum {Symbol<string>}
 */
export const MoveType = Object.freeze({
  Move: Symbol("Move"),
  Capture: Symbol("Capture"),
});
Object.freeze(MoveType);

/**
 * Enum for valid directions
 * @readonly
 * @enum {Symbol<string>}
 */
export const Direction = {
  TopRight: Symbol("TopRight"),
  TopLeft: Symbol("TopLeft"),
  BottomRight: Symbol("BottomRight"),
  BottomLeft: Symbol("BottomLeft")
};
Object.freeze(Direction);

/**
 * 
 * @param {GameState} gameState
 * @param {Position} initPos
 * @param {Direction} direction
 * @yields {Position}
 */
function* moveGenerator(gameState, initPos, direction) {
  const transformationFunction = {
    [Direction.TopRight]: (row, col) => [row + 1, col + 1],
    [Direction.TopLeft]: (row, col) => [row + 1, col - 1],
    [Direction.BottomRight]: (row, col) => [row - 1, col + 1],
    [Direction.BottomLeft]: (row, col) => [row - 1, col - 1]
  }
  let [ row, col ] = transformationFunction[direction](initPos.row, initPos.col);

  while(row >= 0 && col >= 0 && row < gameState.size && col < gameState.size) {
    yield { row, col };
    const [newRow, newCol] = transformationFunction[direction](row, col);
    row = newRow;
    col = newCol;
  }
}

/**
 * 
 * @param {GameState} gameState 
 * @param {Position} piecePos 
 * @param {PieceType} piece 
 * @returns 
 */
export const generateValidMoves = (gameState, piecePos, piece) =>{
  switch(piece) {
    case PieceType.Black:
      return generateValidMovesForBlack(gameState, piecePos);
    case PieceType.White:
      return generateValidMovesForWhite(gameState, piecePos);
    case PieceType.KingWhite:
    case PieceType.KingBlack:
      return generateValidMovesForKing(gameState, piecePos);
  }
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} piecePos
 * @param {Direction} direction
 * @return {CheckerMove[]}
 */
const generateValidMovesInDirection = (gameState, piecePos, direction) => {
  const validMoves = [];
  let hasGoneThroughDiffColor = false;
  const mvGen = moveGenerator(gameState, piecePos, direction);
  for (const {row, col} of mvGen) {
    if (getPiece(gameState, {row: piecePos.row + 1, col: piecePos.col + 1}) === PieceType.Empty) {
      validMoves.push({
        initPos: piecePos,
        finalPos: {
          row,
          col,
        },
        moveType: !hasGoneThroughDiffColor ? MoveType.Move : MoveType.Capture,
      });
    }

    if (getPiece(gameState, {row: piecePos.row + 1, col: piecePos.col + 1}) === enemyPieceColor(gameState)) {
      hasGoneThroughDiffColor = true;
    }

    if (getPiece(gameState, {row: piecePos.row + 1, col: piecePos.col + 1}) === turnPieceColor()) {
      break;
    }
  }
  return validMoves;
}


/**
 *
 * @param {GameState} gameState
 * @param {Position} piecePos
 * @return {CheckerMove[]}
 */
function generateValidMovesForWhite(gameState, piecePos) {
  return [
    ...generateValidMovesForNormal(gameState, piecePos, Direction.BottomRight),
    ...generateValidMovesForNormal(gameState, piecePos, Direction.BottomLeft),
  ]
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} piecePos
 * @return {CheckerMove[]}
 */
function generateValidMovesForBlack(gameState, piecePos) {
  return [
    ...generateValidMovesForNormal(gameState, piecePos, Direction.TopRight),
    ...generateValidMovesForNormal(gameState, piecePos, Direction.TopLeft),
  ]
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} piecePos
 * @param {Direction} direction
 * @return {CheckerMove[]}
 */
function generateValidMovesForNormal(gameState, piecePos, direction) {
  const validMoves = [];
  const movGen = moveGenerator(gameState, piecePos, direction);
  const enemyPieces = enemyPieceColor(gameState);

  const directionMove = movGen.next();
  if (!movGen.done && directionMove.value) {
    const piece = getPiece(gameState, directionMove.value);
    if (!piece) {
      console.log(directionMove.value);
    }
    if (piece === PieceType.Empty) {
      validMoves.push({
        initPos: piecePos,
        finalPos: directionMove.value,
        moveType: MoveType.Move
      });
    } else if(enemyPieces.includes(piece)) {
      const captureMove = movGen.next();
      if (captureMove.value) {
        validMoves.push({
          initPos: piecePos,
          finalPos: captureMove.value,
          moveType: MoveType.Capture
        })
      }
    }
  }

  /**
   *
   * @param {GameState} gameState
   * @param {Position} piecePos
   * @param {Direction} direction
   * @return {CheckerMove[]}
   */
  const generateValidMovesForKing = (board, piecePos) => {
    const validMoves = [];

    for (const direction in Direction) {
      validMoves.push(...generateValidMovesInDirection(board, piecePos, Direction[direction]));
    }
  }

  return validMoves;
}
