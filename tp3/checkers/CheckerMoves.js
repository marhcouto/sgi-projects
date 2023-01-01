import {PieceType, enemyPieceColor, getPiece, lastRowForPlayer, turnPieceColor} from "./CheckerState.js";


// Object Definitions

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
  Move: Symbol("MoveTypeMove"),
  Capture: Symbol("MoveTypeCapture"),
  MoveAndUpgrade: Symbol("MoveTypeMoveAndUpgrade"),
  CaptureAndUpgrade: Symbol("MoveTypeCaptureAndCapture"),
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



// Public Functions

/**
 *
 * @param {GameState} gameState
 * @param {Position} piecePos
 * @param {PieceType} piece
 * @return {{nFoundCaptures, validMoves: CheckerMove[]}}
 */
export function generateValidMovesForPiece(gameState, piecePos, piece) {
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
 * @returns {{nFoundCaptures, moves: Map<string, CheckerMove[]>}}
 */
export function generateValidMoves(gameState) {
  const validPieces = turnPieceColor(gameState);
  const moves = new Map();

  let nFoundCaptures = 0;
  for (let row = 0; row < gameState.size; row++) {
    for (let col = 0; col < gameState.size; col++) {
      const cell = gameState.board[row][col];
      if (!validPieces.includes(cell.piece)) {
        continue;
      }
      const validMovesForPiece = generateValidMovesForPiece(gameState, { row, col }, cell.piece);
      if (validMovesForPiece.validMoves.length == 0) continue;
      nFoundCaptures += validMovesForPiece.nFoundCaptures;
      moves.set(
          JSON.stringify({row, col}),
          validMovesForPiece.validMoves,
      );
    }
  }

  if (nFoundCaptures === 0) {
    return {moves, nFoundCaptures};
  }

  const filteredMovesByCapture = new Map();
  for (const [orig, validMovesForOrig] of moves.entries()) {
    filteredMovesByCapture.set(
        orig,
        validMovesForOrig.filter((move) => move.moveType === MoveType.Capture || move.moveType === MoveType.CaptureAndUpgrade)
    )
  }

  return {
    moves: filteredMovesByCapture,
    nFoundCaptures: nFoundCaptures
  };
}



// Private Functions

/**
 * 
 * @param {Number} boardSize
 * @param {Position} initPos
 * @param {Direction} direction
 * @yields {Position}
 */
function* moveGenerator(boardSize, initPos, direction) {
  const transformationFunction = {
    [Direction.TopRight]: (row, col) => [row + 1, col + 1],
    [Direction.TopLeft]: (row, col) => [row + 1, col - 1],
    [Direction.BottomRight]: (row, col) => [row - 1, col + 1],
    [Direction.BottomLeft]: (row, col) => [row - 1, col - 1]
  }
  let [ row, col ] = transformationFunction[direction](initPos.row, initPos.col);

  while(row >= 0 && col >= 0 && row < boardSize && col < boardSize) {
    yield { row, col };
    const [newRow, newCol] = transformationFunction[direction](row, col);
    row = newRow;
    col = newCol;
  }
}

function moveResultedInUpgrade(gameState, initialPos, finalPos) {
  const piece = getPiece(gameState, initialPos);
  if (piece === PieceType.KingWhite || piece === PieceType.KingBlack) {
    return false;
  }
  return (
    finalPos.row === lastRowForPlayer(gameState)
  );
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
  const movGen = moveGenerator(gameState.size, piecePos, direction);
  const enemyPieces = enemyPieceColor(gameState);
  let nFoundCaptures = 0;

  const destination = movGen.next();
  if (!movGen.done && destination.value) {
    const piece = getPiece(gameState, destination.value);
    if (piece === PieceType.Empty) {
      validMoves.push({
        initPos: piecePos,
        finalPos: destination.value,
        moveType: moveResultedInUpgrade(gameState, piecePos, destination.value) ?
          MoveType.MoveAndUpgrade :
          MoveType.Move
      });
    } else if(enemyPieces.includes(piece)) {
      const captureMove = movGen.next();
      if (captureMove.value && (getPiece(gameState, captureMove.value) === PieceType.Empty)) {
        nFoundCaptures++;
        validMoves.push({
          initPos: piecePos,
          finalPos: captureMove.value,
          moveType: moveResultedInUpgrade(gameState, piecePos, captureMove.value) ?
            MoveType.CaptureAndUpgrade :
            MoveType.Capture
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
