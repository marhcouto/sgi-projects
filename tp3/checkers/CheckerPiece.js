import { PieceType } from "./CheckerCell.js";
import { CheckerMove, MoveType } from "./CheckerMove.js";

export const Direction = Object.freeze({
  TopRight: Symbol("TopRight"),
  TopLeft: Symbol("TopLeft"),
  BottomRight: Symbol("BottomRight"),
  BottomLeft: Symbol("BottomLeft")
});

function* moveGenerator(board, initPost, direction) {
  const size = board.n;
  const { row, col } = initPost;
  const transformationFunction = {
    [Direction.TopRight]: (row, col) => [row + 1, col + 1],
    [Direction.TopLeft]: (row, col) => [row + 1, col - 1],
    [Direction.BottomRight]: (row, col) => [row - 1, col + 1],
    [Direction.BottomLeft]: (row, col) => [row - 1, col - 1]
  }

  while(row > 0 && col > 0 && row < size && col < size) {
    const [newRow, newCol] = transformationFunction[direction](row, col);
    yield {
      row: newRow,
      col: newCol,
    };
    row = newRow;
    col = newCol;
  }
}

export const generateValidMoves = (board, piecePos, piece) =>{
  switch(piece) {
    case PieceType.Black:
      return generateValidMovesForBlack(board, piecePos);
    case PieceType.White:
      return generateValidMovesForWhite(board, piecePos);
    case PieceType.KingWhite:
    case PieceType.KingBlack:
      return generateValidMovesForKing(board, piecePos);
  }
}

const generateValidMovesForBlack = (board, piecePos) => {
  const validMoves = [];
  const hasTopRightFree = 
    piecePos.row < board.n - 1  &&
    piecePos.col < board.n - 1 &&
    board.getPiece(piecePos.row + 1, piecePos.col + 1) === PieceType.Empty;
  if (hasTopRightFree) {
    validMoves.push(
      new CheckerMove(
        piecePos,
        [piecePos.row + 1, piecePos.col + 1],
        MoveType.Move,
      )
    );
  }

  const hasTopLeftFree =
    piecePos.row < board.n - 1 &&
    piecePos.col > 0 &&
    board.getPiece(piecePos.row + 1, piecePos.col - 1) === PieceType.Empty;
  if (hasTopLeftFree) {
    validMoves.push(
      new CheckerMove(
        piecePos,
        [piecePos.row + 1, piecePos.col - 1],
        MoveType.Move,
      ),
    );
  }

  const canCaptureTopRight = 
    piecePos.row < board.n - 2 &&
    piecePos.col < board.n - 2 &&
    board.getPiece(piecePos.row + 1, piecePos.col + 1) === PieceType.White &&
    board.getPiece(piecePos.row + 2, piecePos.col + 2) === PieceType.Empty;
  if (canCaptureTopRight) {
    validMoves.push(
      new CheckerMove(
        piecePos,
        [piecePos.row + 2, piecePos.col + 2],
        MoveType.Capture,
      ),
    );
  }

  const canCaptureTopLeft =
    piecePos.row < board.n - 2 &&
    piecePos.col > 1 &&
    board.getPiece(piecePos.row + 1, piecePos.col - 1) === PieceType.White &&
    board.getPiece(piecePos.row + 1, piecePos.col - 2) === PieceType.Empty;
  if (canCaptureTopLeft) {
    validMoves.push(
      new CheckerMove(
        piecePos,
        [piecePos.row + 2, piecePos.col - 2],
        MoveType.Capture,
      ),
    );
  }

  return validMoves;
}

const generateValidMovesInDirection = (board, piecePos, direction) => {
  const validMoves = [];
  const hasGoneThroughDiffColor = false;
  const mvGen = moveGenerator(board, piecePos, direction);
  for (const {row, col} of mvGen) {
    if (board.getPiece(piecePos.row + 1, piecePos.col + 1) === PieceType.Empty) {
      validMoves.push(
        new CheckerMove(
          piecePos,
          [row, col],
          !hasGoneThroughDiffColor ? MoveType.Move : MoveType.Capture,
        ),
      );
    }

    if (board.getPiece(piecePos.row + 1, piecePos.col + 1) === board.enemyPieceColor()) {
      hasGoneThroughDiffColor = true;
    }

    if (board.getPiece(piecePos.row + 1, piecePos.col + 1) === board.turnPieceColor()) {
      break;
    }
  }
  return validMoves;
}

const generateValidMovesForKing = (board, piecePos) => {
  const validMoves = [];
  
  for (const direction in Direction) {
    validMoves.push(...generateValidMovesInDirection(board, piecePos, Direction[direction]));
  }
}

const generateValidMovesForWhite = (board, piecePos) => {
  const validMoves = [];
  const hasBottomRightFree =
    piecePos.row > 0 &&
    piecePos.col < board.n - 1 &&
    board.getPiece(piecePos.row - 1, piecePos.col + 1) === PieceType.Empty;
  if (hasBottomRightFree) {
    validMoves.push(
      new CheckerMove(
        piecePos,
        [piecePos.row - 1, piecePos.col + 1],
        MoveType.Move,
      ),
    );
  }

  const hasBottomLeftFree =
    piecePos.row > 0 &&
    piecePos.col > 0 &&
    board.getPiece(piecePos.row - 1, piecePos.col - 1) === PieceType.Empty;
  if (hasBottomLeftFree) {
    validMoves.push(
      new CheckerMove(
        piecePos,
        [piecePos.row - 1, piecePos.col - 1],
        MoveType.Move,
      ),
    );
  }

  const canCaptureBottomRight =
    piecePos.row > 1 &&
    piecePos.col < board.n - 1 &&
    board.getPiece(piecePos.row - 1, piecePos.col + 1) === PieceType.Black &&
    board.getPiece(piecePos.row - 2, piecePos.col + 2) === PieceType.Empty;
  if (canCaptureBottomRight) {
    validMoves.push(
      new CheckerMove(
        piecePos,
        [piecePos.row - 2, piecePos.col + 2],
        MoveType.Capture,
      ),
    );
  }

  const canCaptureBottomLeft =
    piecePos.row > 1 &&
    piecePos.col > 1 &&
    board.getPiece(piecePos.row - 1, piecePos.col - 1) === PieceType.Black &&
    board.getPiece(piecePos.row - 2, piecePos.col - 2) === PieceType.Empty;
  if (canCaptureBottomLeft) {
    validMoves.push(
      new CheckerMove(
        piecePos,
        [piecePos.row - 2, piecePos.col - 2],
        MoveType.Capture,
      ),
    );
  }

  return validMoves;
}
