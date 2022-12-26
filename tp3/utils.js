import { CGFcamera, CGFcameraOrtho } from '../lib/CGF.js';

export function degreeToRad(deg) {
    const DEGREE_TO_RAD = Math.PI / 180;
    return deg * DEGREE_TO_RAD; 
}

export function axisToVector(axisStr, messageError) {
    switch (axisStr) {
        case 'x': return vec3.fromValues(1, 0, 0);
        case 'y': return vec3.fromValues(0, 1, 0);
        case 'z': return vec3.fromValues(0, 0, 1);
        default: return `invalid axis expected one of [x, y, z] but got '${axisStr}' at the ${messageError}`;
    }
}

export function vecExactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function vectorToAxis(axisVec) {
    if (vecExactEquals(axisVec, vec3.fromValues(1, 0, 0))) {
        return 'x';
    } else if (vecExactEquals(axisVec, vec3.fromValues(0, 1, 0))) {
        return 'y';
    } else if (vecExactEquals(axisVec, vec3.fromValues(0, 0, 1))) {
        return 'z';
    }
    throw 'Invalid axis';
}

export function coplanarCylindersColliding(center1, center2, radius) {
  let diff = vec3.fromValues(0, 0, 0);
  vec3.sub(diff, center2, center1);
  return vec3.length(diff) <= 2 * radius;
}
