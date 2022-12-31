import {generateValidMoves, generateValidMovesForPiece, MoveType} from "./CheckerMoves.js";



// Object Definitions

/**
 * @typedef {import('./CheckerMoves.js').CheckerMove} CheckerMove
 */

/**
 * Enum for game status
 * @readonly
 * @enum {string}
 */
export const GameStatus = {
  victoryBlacks: "Black Pieces Win!",
  victoryWhites: "White Pieces Win!",
  ongoing: "Game in progress"
}
Object.freeze(GameStatus);

/**
 * Enum for validity of move choice
 * @readonly
 * @enum {string}
 */
export const MoveChoiceError = {
  availableCaptures: "If a capture is available, you must take it",
  invalidMoveForPiece: "That piece cannot move to that destination"
}
Object.freeze(MoveChoiceError);

/**
 * Enum for validity of Piece Choice
 * @readonly
 * @enum {string}
 */
export const PieceChoiceError = {
  wrongTurn: "It is not that player's turn",
  notAPiece: "That is not a piece"
}
Object.freeze(PieceChoiceError);

/**
 * Enum for validity of destination choice
 * @readonly
 * @enum {string}
 */
export const DestinationChoiceError = {
  pieceInCell: "There is a pawn in that cell",
  notACell: "That is not a valid cell",
  whiteCellPlay: "You cannot play in the white cells"
}

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



// Public Functions

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
  initialState.validMoves = validMoves.moves;
  initialState.nCaptures = validMoves.nFoundCaptures;

  return initialState;
}

/**
 * Updates gameState with new move
 *
 * @param {GameState} gameState
 * @param {CheckerMove} move
 * @return {GameState}
 */
export function movePiece(gameState, move) {

  const newGameState = copy(gameState);

  replacePiece(newGameState, move.initPos, PieceType.Empty);
  if (move.moveType === MoveType.MoveAndUpgrade || move.moveType === MoveType.CaptureAndUpgrade) {
    replacePiece(newGameState, move.finalPos, upgradedPiece(getPiece(gameState, move.initPos)));
  } else {
    replacePiece(newGameState, move.finalPos, getPiece(gameState, move.initPos));
  }

  if (move.moveType === MoveType.Capture || move.moveType === MoveType.CaptureAndUpgrade) {
    gameState.turn === PlayerTurn.Black ? newGameState.score.blacksScore++ : newGameState.score.whitesScore++;
    const capturePosition = getCapturePosition(move);
    replacePiece(newGameState, capturePosition, PieceType.Empty);
  }

  newGameState.moves.push(move);

  // TODO: extract task of checking captures from function
  const validMovesForMovedPiece = generateValidMovesForPiece(newGameState, move.finalPos, getPiece(newGameState, move.finalPos));
  if (validMovesForMovedPiece.nFoundCaptures <= 0 || (move.moveType !== MoveType.Capture && move.moveType !== MoveType.CaptureAndUpgrade)) {
    newGameState.turn = gameState.turn === PlayerTurn.Black ? PlayerTurn.White : PlayerTurn.Black;
  }

  const validMoves = generateValidMoves(newGameState);
  newGameState.validMoves = validMoves.moves;
  newGameState.nCaptures = validMoves.nFoundCaptures;

  return newGameState;
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
 */
export function lastRowForPlayer(gameState) {
  if (gameState.turn === PlayerTurn.Black) {
    return gameState.size - 1;
  }
  return 0;
}

/**
 * Return Move or MoveChoiceError
 *
 * @param {GameState} gameState
 * @param {Position} origPos
 * @param {Position} finalPos
 * @return {{checkerMove: CheckerMove, moveError: MoveChoiceError}}
 */
export function getMove(gameState, origPos, finalPos) {

  const validMovesForPosition = gameState.validMoves.get(JSON.stringify(origPos));
  if (!validMovesForPosition) return {
    checkerMove: null,
    moveError: MoveChoiceError.invalidMoveForPiece
  };
  for (const move of validMovesForPosition) {
    if (JSON.stringify(move.finalPos) === JSON.stringify(finalPos)) {
      return {
        checkerMove: move,
        moveError: null,
      };
    }
  }
  if (gameState.nCaptures > 0) return {
    checkerMove: null,
    moveError: MoveChoiceError.availableCaptures
  };
  else return {
    checkerMove: null,
    moveError: MoveChoiceError.invalidMoveForPiece
  };
}

/**
 * Checks if a piece is valid to pick
 * @param {GameState} gameState
 * @param {Number} pos
 * @return {{pos: Position|null, error: PieceChoiceError|null}}
 */
export function getPieceChoiceError(gameState, pos) {
  const posObj = arrayIdxToCord(gameState, pos);
  const piece = getPiece(gameState, posObj);
  if (piece === PieceType.Empty || piece === null) return {
    pos: null,
    error: PieceChoiceError.notAPiece,
  };
  const validPiecesForTurn = turnPieceColor(gameState);
  return validPiecesForTurn.includes(piece) ? {
    pos: posObj,
    error: null
  } : {
    pos: null,
    error: PieceChoiceError.wrongTurn
  };
}

/**
 * Checks if a destination for a given piece is valid
 * @param {GameState} gameState
 * @param {Number} pos
 * @return {{pos: Position|null, error: DestinationChoiceError|null}}
 */
export function getDestinationChoiceError(gameState, pos) {
  const posObj = arrayIdxToCord(gameState, pos);
  const piece = getPiece(gameState, posObj);
  if (piece !== PieceType.Empty) return {
    pos: null,
    error: DestinationChoiceError.pieceInCell
  };
  if (((posObj.col + posObj.row) % 2) == 0) return {
    pos: null,
    error: DestinationChoiceError.whiteCellPlay
  };
  if (pos > gameState.numberOfCells) return {
    pos: null,
    error: DestinationChoiceError.notACell
  };
  return {
    pos: posObj,
    error: null
  };
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
    newGameState = movePiece(newGameState, move);
  });
  return newGameState;
}

/**
 * Checks wins
 * @param {GameState} gameState
 * @returns {GameStatus}
 */
export function getGameStatus(gameState) {
  if (gameState.score.whitesScore == 12) return GameStatus.victoryWhites;
  else if (gameState.score.blacksScore == 12) return GameStatus.victoryBlacks;
  else return GameStatus.ongoing;
}



// Auxiliary Functions

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

