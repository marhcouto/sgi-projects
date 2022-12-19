/**
 * @readonly
 * @enum {Symbol<string>}
 */
export const PieceType = {
  Black: Symbol("Black"),
  White: Symbol("White"),
  KingWhite: Symbol("KingWhite"),
  KingBlack: Symbol("KingBlack"),
  Empty: Symbol("Empty")
}
Object.freeze(PieceType);

/**
 * @readonly
 * @enum {Symbol<string>}
 */
export const CellColor = Object.freeze({
  Black: Symbol("Black"),
  White: Symbol("White")
});
Object.freeze(CellColor);

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
}