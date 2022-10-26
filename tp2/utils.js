import { CGFcamera, CGFcameraOrtho } from '../lib/CGF.js';

export function degreeToRad(deg) {
    const DEGREE_TO_RAD = Math.PI / 180;
    return deg * DEGREE_TO_RAD; 
}

export function cloneCamera(camera) {
    if (camera instanceof CGFcamera) {
        return new CGFcamera(
            camera.fov,
            camera.near,
            camera.far,
            camera.position,
            camera.target
        );
    }
    if (camera instanceof CGFcameraOrtho) {
        return new CGFcameraOrtho (
            camera.left,
            camera.right,
            camera.bottom,
            camera.top,
            camera.near,
            camera.far,
            camera.position,
            camera.target,
            camera._up
        );
    }
}