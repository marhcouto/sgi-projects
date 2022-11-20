export class MyKeyframe {
    constructor(instant, translationVec, rotationAngleZ, rotationAngleY, rotationAngleX, scaleVec) {
        this.instant = instant * 1000;
        this.translationVec = translationVec;
        this.scaleVec = scaleVec;
        this.rotationAngleX = rotationAngleX;
        this.rotationAngleY = rotationAngleY;
        this.rotationAngleZ = rotationAngleZ;
    }

    keyframeDiff(keyframe) {
        const translationDiff = vec3.create();
        const scaleDiff = vec3.create();

        vec3.subtract(translationDiff, this.translationVec, keyframe.translationVec);
        vec3.subtract(scaleDiff, this.scaleVec, keyframe.scaleVec);
        return {
            instant: this.instant - keyframe.instant,
            translation: translationDiff,
            scale: scaleDiff,
            rotX: this.rotationAngleX - keyframe.rotationAngleX,
            rotY: this.rotationAngleY - keyframe.rotationAngleY,
            rotZ: this.rotationAngleZ - keyframe.rotationAngleZ
        }
    }
}