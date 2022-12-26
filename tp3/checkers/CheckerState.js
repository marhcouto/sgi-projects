import {generateValidMoves as generateValidMovesForPiece, MoveType} from "./CheckerPiece.js";


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
  Black: Symbol("PlayerBlack"),
  White: Symbol("PlayerWhite")
};
Object.freeze(PlayerTurn);

/**
 * Enum for valid cell colors
 * @readonly
 * @enum {Symbol<string>}
 */
export const CellColor = {
  Black: Symbol("CellBlack"),
  White: Symbol("CellWhite"),
}
Object.freeze(CellColor);

/**
 * @readonly
 * @enum {Symbol<string>}
 */
export const PieceType = {
  KingBlack: Symbol("PieceKingBlack"),
  Black: Symbol("PieceBlack"),
  White: Symbol("PieceWhite"),
  KingWhite: Symbol("PieceKingWhite"),
  Empty: Symbol("PieceEmpty"),
}

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
 * @property {Map<string, CheckerMove[]>} validMoves
 * @property {Number} nCaptures
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
        board[i].push({
          color: CellColor.Black,
          piece: cell
        })
      } else {
        board[i].push({
          color: CellColor.White,
          piece: PieceType.Empty
        })
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
    moves: [],
    validMoves: [],
    nCaptures: 0,
  }

  const validMoves = generateValidMoves(initialState);
  initialState.validMoves = validMoves.validMoves;
  initialState.nCaptures = validMoves.nFoundCaptures;

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
    console.error("Can't move piece with invalid orig");
    return {
      success: false,
      gameState: gameState
    }
  }
  if (!dest || !(typeof dest === 'number')) {
    console.error("Can't move piece with invalid dest");
    return {
      success: false,
      gameState: gameState
    }
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

  const origPos = arrayIdxToCord(gameState, orig);
  const destPos = arrayIdxToCord(gameState, dest);
  const movement = findMovementEvent(gameState, origPos, destPos);
  if (!movement) {
    return {
      success: false,
      gameState: gameState,
    };
  }

  const newGameState = copy(gameState);
  if (gameState.nCaptures - 1 <= 0) {
    newGameState.turn = gameState.turn === PlayerTurn.Black ? PlayerTurn.White : PlayerTurn.Black;
  }

  replacePiece(newGameState, origPos, PieceType.Empty);
  if (movement.moveType === MoveType.MoveAndUpgrade || movement.moveType === MoveType.CaptureAndUpgrade) {
    replacePiece(newGameState, destPos, upgradedPiece(getPiece(gameState, movement.initPos)));
  } else {
    replacePiece(newGameState, destPos, getPiece(gameState, movement.initPos));
  }

  if (movement.moveType === MoveType.Capture || movement.moveType === MoveType.CaptureAndUpgrade) {
    gameState.turn === PlayerTurn.Black ? newGameState.score.blacksScore++ : newGameState.score.whitesScore++;
    const capturePosition = getCapturePosition(movement);
    replacePiece(newGameState, capturePosition, PieceType.Empty);
  }

  newGameState.moves.push(movement);

  const validMoves = generateValidMoves(newGameState);
  newGameState.validMoves = validMoves.validMoves;
  newGameState.nCaptures = validMoves.nFoundCaptures;

  console.log(newGameState);

  return {
    success: true,
    gameState: newGameState
  };
}

/**
 *
 * @param {CheckerMove} movement
 * @return {Position}
 */
export function getCapturePosition(movement) {
  const jumpLen = 2;
  const movementVec = {
    rowDis: (movement.finalPos.row - movement.initPos.row) / jumpLen,
    colDis: (movement.finalPos.col - movement.initPos.col) / jumpLen,
  };

  return {
    row: movement.initPos.row + movementVec.rowDis,
    col: movement.initPos.col + movementVec.colDis
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
 * @returns {{nFoundCaptures, validMoves: Map<string, CheckerMove[]>}}
 */
function generateValidMoves(gameState) {
  const validPieces = turnPieceColor(gameState);
  const validMoves = new Map();

  let nFoundCaptures = 0;
  for (let row = 0; row < gameState.size; row++) {
    for (let col = 0; col < gameState.size; col++) {
      const cell = gameState.board[row][col];
      if (!validPieces.includes(cell.piece)) {
        continue;
      }
      const validMovesForPiece = generateValidMovesForPiece(gameState, { row, col }, cell.piece);
      nFoundCaptures += validMovesForPiece.nFoundCaptures;
      validMoves.set(
          JSON.stringify({row, col}),
          validMovesForPiece.validMoves,
      );
    }
  }

  if (nFoundCaptures === 0) {
    return {validMoves, nFoundCaptures};
  }

  const filteredMovesByCapture = new Map();
  for (const [orig, validMovesForOrig] of validMoves.entries()) {
    filteredMovesByCapture.set(
        orig,
        validMovesForOrig.filter((move) => move.moveType === MoveType.Capture || move.moveType === MoveType.CaptureAndUpgrade)
    )
  }

  return {
    validMoves: filteredMovesByCapture,
    nFoundCaptures: nFoundCaptures
  };
}

/**
 *
 * @param {GameState} gameState
 * @param {Number} arrIdx
 * @return {Position}
 */
export function arrayIdxToCord(gameState, arrIdx) {
  if (arrIdx === null) {
    throw new Error("Can't convert array index with undefined/null index");
  }
  return {
    row: Math.floor(arrIdx / gameState.size),
    col: arrIdx % gameState.size
  };
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} position
 */
export function cordToArrayIdx(gameState, position) {
  return position.row * gameState.size + position.col;
}

/**
 *
 * @param {GameState} gameState
 * @return {CheckerMove}
 */
export function lastMove(gameState) {
  return gameState.moves.at(-1);
}

/**
 *
 * @param {GameState} gameState
 * @param {Position} origPos
 * @param {Position} finalPos
 * @return {CheckerMove|null}
 */
function findMovementEvent(gameState, origPos, finalPos) {
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
export function lastRowForPlayer(gameState) {
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
  if (piece === null) {
    throw new Error("Tried to replace piece for null");
  }
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
    score: { ...gameState.score },
    turn: gameState.turn,
    numberOfCells: gameState.numberOfCells,
    validMoves: gameState.validMoves,
    nCaptures: gameState.nCaptures,
    board: [],
    moves: [ ...gameState.moves ]
  };

  for (const line of gameState.board) {
    const newLine = [];
    for (const cell of line) {
      newLine.push({...cell});
    }
    newGameState.board.push(newLine);
  }

  return newGameState;
}

/**
 *
 * @param {GameState} gameState
 * @param {Number} pos
 */
export function isFromTurn(gameState, pos) {
  const posObj = arrayIdxToCord(gameState, pos);
  const piece = getPiece(gameState, posObj);
  const validPiecesForTurn = turnPieceColor(gameState);
  return validPiecesForTurn.includes(piece);
}

/**
 *
 * @param {PieceType} piece
 * @return {PieceType}
 */
export function upgradedPiece(piece) {
  const upgradedEquivalents = {
    [PieceType.KingWhite]: PieceType.KingWhite,
    [PieceType.KingBlack]: PieceType.KingBlack,
    [PieceType.White]: PieceType.KingWhite,
    [PieceType.Black]: PieceType.KingBlack,
    [PieceType.Empty]: PieceType.Empty
  };

  return upgradedEquivalents[piece];
}

/**
 *
 * @param {GameState} gameState
 * @return {GameState}
 */
export function undo(gameState) {
  if (gameState.moves.length === 0) {
    return gameState;
  }

  let newGameState = generateGameState(gameState.size);
  const moves = gameState.moves.slice(0, gameState.moves.length - 1);
  moves.forEach((move) => {
    const orig = cordToArrayIdx(newGameState, move.initPos);
    const dest = cordToArrayIdx(newGameState, move.finalPos);
    const newState = movePiece(gameState, orig, dest);
    newGameState = newState.gameState;
  })
  return newGameState;
}
