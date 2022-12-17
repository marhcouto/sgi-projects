import { CheckerCell, CellColor, PieceType } from "./CheckerCell.js";
import { generateValidMoves } from "./CheckerPiece.js";

export const PlayerTurn = Object.freeze({
  Black: Symbol("Black"),
  White: Symbol("White")
});

export class CheckerBoard {
  constructor() {
    this.n = 8;
    this.numberOfCells = this.n * this.n;
    this.turn = PlayerTurn.Black;

    this.initBoard();
    console.log(this._generateListOfValidMoves())
  }

  initBoard() {
    this.board = [];
    for (let i = 0; i < this.n; i++) {
      this.board.push([]);
      for (let j = 0; j < this.n; j++) {
        let cell = PieceType.Empty;
        if (i < 3) {
          cell = PieceType.Black;
        } else if (i > 4) {
          cell = PieceType.White;
        }

        if ((i % 2) === (j % 2)) {
          this.board[i].push(new CheckerCell(CellColor.Black, cell));
        } else {
          this.board[i].push(new CheckerCell(CellColor.White, PieceType.Empty));
        }
      }
    }
  }

  changeTurn() {
    this.turn = PlayerTurn.Black ? PlayerTurn.White : PlayerTurn.Black;
    return this.turn;
  }

  static arrayIdxToCord(arrIdx) {
    if (!arrIdx) {
      throw new Error("Can't convert array index with undefined/null index");
    }
    return {
      row: Math.floor(arrIdx / 9),
      column: arrIdx % 9
    };
  }

  _validTurnPieces() {
    if (this.turn === PlayerTurn.Black) {
      return [PieceType.Black, PieceType.KingBlack];
    } else if(this.turn === PlayerTurn.White) {
      return [PieceType.White, PieceType.KingWhite];
    }
    throw new Error(`Unexpected player turn: ${this.turn}`);
  }

  _generateListOfValidMoves() {
    const validPieces = this._validTurnPieces();
    const validMoves = new Map();
    for (let row = 0; row < this.n; row++) {
      for (let col = 0; col < this.n; col++) {
        const cell = this.board[row][col];
        if (!validPieces.includes(cell.piece)) {
          continue;
        }
        validMoves.set([row, col], generateValidMoves(this, { row, col }, cell.piece));
      }
    }

    return validMoves;
  }

  _validMove(orig, dest) {
    if (!orig) {
      throw new Error("Can't move piece with undefined/null orig");
    }
    if (!dest) {
      throw new Error("Can't move piece with undefined/null dest");
    }
    if (orig > numberOfCells) {
      return false;
    }
    if (dest > numberOfCells) {
      return false;
    }

    const origPos = CheckerBoard.arrayIdxToCord(orig);
    const destPos = CheckerBoard.arrayIdxToCord(dest);

    const origCell = this.board[origPos.row][origPos.column];
    if (!this._validTurnPieces().includes(origCell.piece)) {
      return false;
    }
  }

  movePiece(orig, dest) {
    if (!orig) {
      throw new Error("Can't move piece with undefined/null orig");
    }
    if (!dest) {
      throw new Error("Can't move piece with undefined/null dest");
    }
    if (origPos > numberOfCells) {
      return false;
    }

  }

  getPiece(row, col) {
    return this.board[row][col].piece;
  }

  turnPieceColor() {
    return this.turn === PlayerTurn.Black ? PieceType.Black : PieceType.White;
  }

  enemyPieceColor() {
    return this.turn === PlayerTurn.Black ? PieceType.White : PieceType.Black;
  }
}