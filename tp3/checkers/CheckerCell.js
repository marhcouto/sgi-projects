export const PieceType = Object.freeze({
  Black: Symbol("Black"),
  White: Symbol("White"),
  KingWhite: Symbol("KingWhite"),
  KingBlack: Symbol("KingBlack"),
  Empty: Symbol("Empty")
});

export const CellColor = Object.freeze({
  Black: Symbol("Black"),
  White: Symbol("White")
});

export class CheckerCell {
  constructor(color, piece) {
    if (!color) {
      throw new Error("Can't create cell with undefined or null color");
    }
    if (!piece) {
      throw new Error("Can't create cell with undefined or null piece");
    }
    this.color = color;
    this.piece = piece;
  }

  getPiece() {
    return this.piece;
  }

  getColor() {
    return this.color;
  }
}