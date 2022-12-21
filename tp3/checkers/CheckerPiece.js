import { PieceType, enemyPieceColor, getPiece } from "./CheckerState.js";

/**
 * @typedef {import('./CheckerState.js').GameState} GameState
 * @typedef {import('./CheckerState.js').Position} Position
 * @typedef {import('./CheckerState.js').PieceType} PieceType
 * @typedef {import('./CheckerState.js').CellColor} CellColor
 * @typedef {import('./CheckerState.js').CheckerCell} CheckerCell
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
  TopRight: Symbol("DirectionTopRight"),
  TopLeft: Symbol("DirectionTopLeft"),
  BottomRight: Symbol("DirectionBottomRight"),
  BottomLeft: Symbol("DirectionBottomLeft")
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
 * @return {{nFoundCaptures, validMoves: CheckerMove[]}}
 */
export function generateValidMoves(gameState, piecePos, piece) {
  switch(piece) {
    case PieceType.Black:
      return generateValidMovesForDirections(
          gameState,
          piecePos,
          [Direction.TopRight, Direction.TopLeft]
      );
    case PieceType.White:
      return generateValidMovesForDirections(
          gameState,
          piecePos,
          [Direction.BottomRight, Direction.BottomLeft]
      );
    case PieceType.KingWhite:
    case PieceType.KingBlack:
      return generateValidMovesForDirections(
          gameState,
          piecePos,
          Object.values(Direction)
      );
  }
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} piecePos
 * @param {Direction} direction
 * @param {Boolean | undefined} justCaptures
 * @return {{nFoundCaptures, validMoves: CheckerMove[]}}
 */
function generateValidMovesInDirection(gameState, piecePos, direction) {
  const validMoves = [];
  const movGen = moveGenerator(gameState, piecePos, direction);
  const enemyPieces = enemyPieceColor(gameState);
  let nFoundCaptures = 0;

  const directionMove = movGen.next();
  if (!movGen.done && directionMove.value) {
    const piece = getPiece(gameState, directionMove.value);
    if (piece === PieceType.Empty) {
      validMoves.push({
        initPos: piecePos,
        finalPos: directionMove.value,
        moveType: MoveType.Move
      });
    } else if(enemyPieces.includes(piece)) {
      const captureMove = movGen.next();
      if (captureMove.value) {
        nFoundCaptures++;
        validMoves.push({
          initPos: piecePos,
          finalPos: captureMove.value,
          moveType: MoveType.Capture
        })
      }
    }
  }

  return {validMoves, nFoundCaptures};
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} piecePos
 * @param {Direction[]} directionList
 * @return {{nFoundCaptures, validMoves: CheckerMove[]}}
 */
function generateValidMovesForDirections(gameState, piecePos, directionList) {
  const validMoves = [];
  let nFoundCaptures = 0;

  for (const direction of directionList) {
    const validMovesForDirection =
        generateValidMovesInDirection(gameState, piecePos, direction);
    validMoves.push(...validMovesForDirection.validMoves);
    nFoundCaptures += validMovesForDirection.nFoundCaptures;
  }

  return {validMoves, nFoundCaptures};
}
