import { CheckerCell, CellColor, PieceType } from "./CheckerCell.js";
import {generateValidMoves as generateValidMovesForPiece} from "./CheckerPiece.js";


// Datatypes

/**
 * @typedef {import('./CheckerPiece.js').CheckerMove} CheckerMove
 */

/**
 * Enum for valid player turns
 * @readonly
 * @enum {Symbol<string>}
 */
export const PlayerTurn = {
  Black: Symbol("Black"),
  White: Symbol("White")
};
Object.freeze(PlayerTurn);



/**
 * @typedef {Object} Score
 * @property {Number} blacksScore
 * @property {Number} whitesScore
 */

/**
 * @typedef {Object} GameState
 * @property {Number} size
 * @property {Score} score
 * @property {PlayerTurn} turn
 * @property {CheckerCell[][]} board
 * @property {Map<string, CheckerMove[]>} [validMoves]
 * @property {Number} numberOfCells
 * @property {CheckerMove[]} moves
 */

/**
 * @typedef {Object} Position
 * @property {Number} row
 * @property {Number} col
 */


// Main Functions

/**
 * Generate a board that respects GameState interface
 * @param {Number} size
 * @returns {GameState}
 */
export function generateGameState(size) {
  if (!size) {
    size = 8;
  }

  const board = [];
  for (let i = 0; i < size; i++) {
    board.push([]);
    for (let j = 0; j < size; j++) {
      let cell = PieceType.Empty;
      if (i < 3) {
        cell = PieceType.Black;
      } else if (i > 4) {
        cell = PieceType.White;
      }

      if ((i % 2) !== (j % 2)) {
        board[i].push(new CheckerCell(CellColor.Black, cell));
      } else {
        board[i].push(new CheckerCell(CellColor.White, PieceType.Empty));
      }
    }
  }

  const initialState = {
    size: size,
    score: {
      whitesScore: 0,
      blacksScore: 0
    },
    turn: PlayerTurn.Black,
    board: board,
    numberOfCells: size * size - 1,
    moves: []
  }
  initialState.validMoves = generateValidMoves(initialState);
  return initialState;
}

/**
 *
 * @param {GameState} gameState
 * @param {Number} orig
 * @param {Number} dest
 * @return {{success: boolean, gameState}}
 */
export function movePiece(gameState, orig, dest) {
  if (!orig || !(typeof orig === 'number')) {
    throw new Error("Can't move piece with invalid orig");
  }
  if (!dest || !(typeof dest === 'number')) {
    throw new Error("Can't move piece with invalid dest");
  }
  if (orig > gameState.numberOfCells) {
    return {
      success: false,
      gameState: gameState,
    };
  }
  if (dest > gameState.numberOfCells) {
    return {
      success: false,
      gameState: gameState,
    };
  }

  const origPos = arrayIdxToCord(orig);
  const destPos = arrayIdxToCord(dest);
  const movement = findMovementEvent(gameState, origPos, destPos);
  if (!movement) {
    return {
      success: false,
      gameState: gameState,
    };
  }

  const newGameState = copy(gameState);
  newGameState.turn = gameState.turn === PlayerTurn.White ? PlayerTurn.Black : PlayerTurn.White;
  newGameState.validMoves = generateValidMoves(gameState);
  replacePiece(newGameState, origPos, PieceType.Empty);

  let newPiece = gameState.turn === PlayerTurn.Black ? PieceType.Black : PlayerTurn.White;
  if (destPos.row === lastRowForPlayer(gameState)) {
    newPiece = gameState.turn === PlayerTurn.Black ? PieceType.KingBlack : PieceType.KingWhite;
  }
  replacePiece(newGameState, destPos, newPiece);

  newGameState.moves.push(movement);

  return {
    success: true,
    gameState: newGameState
  };
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} pos
 * @return {PieceType | null}
 */
export function getPiece(gameState, pos) {
  const validPosition = pos.row >= 0 &&
      pos.col >= 0 &&
      pos.row < gameState.size &&
      pos.col < gameState.size;
  if (!validPosition) {
    return null;
  }
  return gameState.board[pos.row][pos.col].piece;
}

/**
 *
 * @param {GameState} gameState
 * @return {(Symbol<string>)[]}
 */
export function enemyPieceColor(gameState) {
  return gameState.turn === PlayerTurn.Black ?
      [PieceType.White, PieceType.KingWhite] :
      [PieceType.KingBlack, PieceType.Black];
}

/**
 *
 * @param {GameState} gameState
 * @return {(Symbol<string>)[]}
 */
export function turnPieceColor(gameState) {
  return gameState.turn === PlayerTurn.Black ?
      [PieceType.KingBlack, PieceType.Black] :
      [PieceType.KingWhite, PieceType.White];
}


// Auxiliary Functions

/**
 *
 * @param {GameState} gameState
 * @returns {Map<string, CheckerMove[]>}
 */
function generateValidMoves(gameState) {
  const validPieces = turnPieceColor(gameState);
  const validMoves = new Map();
  for (let row = 0; row < gameState.size; row++) {
    for (let col = 0; col < gameState.size; col++) {
      const cell = gameState.board[row][col];
      if (!validPieces.includes(cell.piece)) {
        continue;
      }
      validMoves.set(
          JSON.stringify({row, col}),
          generateValidMovesForPiece(gameState, { row, col }, cell.piece)
      );
    }
  }
  return validMoves;
}

/**
 *
 * @param {Number} arrIdx
 * @return {Position}
 */
function arrayIdxToCord(arrIdx) {
  if (!arrIdx) {
    throw new Error("Can't convert array index with undefined/null index");
  }
  return {
    row: Math.floor(arrIdx / 8),
    col: arrIdx % 8
  };
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} origPos
 * @param {Position} finalPos
 * @return {CheckerMove|null}
 */
function findMovementEvent(gameState, origPos, finalPos) {
  gameState.validMoves = generateValidMoves(gameState);

  if (!gameState.validMoves.has(JSON.stringify(origPos))) {
    return null;
  }

  const validMovesForPosition = gameState.validMoves.get(JSON.stringify(origPos));
  for (const move of validMovesForPosition) {
    if (JSON.stringify(move.finalPos) === JSON.stringify(finalPos)) {
      return move;
    }
  }
  return null;
}

/**
 *
 * @param {GameState} gameState
 */
function lastRowForPlayer(gameState) {
  if (gameState.turn === PlayerTurn.Black) {
    return gameState.size - 1;
  }
  return 0;
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} position
 * @param {PieceType} piece
 */
function replacePiece(gameState, position, piece) {
  const cell = gameState.board[position.row][position.col];
  cell.piece = piece;
}

/**
 *
 * @param {GameState} gameState
 * @return {GameState}
 */
function copy(gameState) {
  const newGameState = {
    size: gameState.size,
    score: gameState.score,
    turn: gameState.turn,
    numberOfCells: gameState.numberOfCells,
    validMoves: gameState.validMoves,
    board: [],
    moves: [...gameState.moves]
  };

  for (const line of gameState.board) {
    const newLine = [];
    for (const cell of line) {
      newLine.push(new CheckerCell(cell.color, cell.piece));
    }
    newGameState.board.push(newLine);
  }

  return newGameState;
}
