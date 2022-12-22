export function linearMovement(initialPosition, finalPosition, animationLength) {
  const c = initialPosition;
  const v = (finalPosition - initialPosition) / animationLength;
  return (t) => v * t + c;
}
