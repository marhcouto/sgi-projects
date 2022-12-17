export const MoveType = Object.freeze({
  Move: Symbol("Move"),
  Capture: Symbol("Capture")
});

export class CheckerMove {
  constructor(orig, dest, moveType) {
    this.orig = orig;
    this.dest = dest;
    this.moveType = moveType;
  }
}