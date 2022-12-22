export function parabolicMovement(initialPosition, finalPosition, animationLength, maxPos) {
  const c = initialPosition;
  const halfA = -(maxPos - c / 2 - finalPosition / 2) / (2 * Math.pow(animationLength, 2));
  const v = (finalPosition - initialPosition - halfA * Math.pow(animationLength, 2)) / animationLength;
  return (t) => halfA * Math.pow(t, 2) + v * t + c;
}
