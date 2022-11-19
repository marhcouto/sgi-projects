export class MyKeyframe {
    constructor(instant, translationVec, rotationAngleZ, rotationAngleY, rotationAngleX, scaleVec) {
        this.instant = instant;
        this.translationVec = translationVec;
        this.scaleVec = scaleVec;
        this.rotationAngleX = rotationAngleX;
        this.rotationAngleY = rotationAngleY;
        this.rotationAngleZ = rotationAngleZ;
    }
}