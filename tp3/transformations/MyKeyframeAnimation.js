import { MyAnimation } from './MyAnimation.js'

/**
 * MyKeyFrameAnimation
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, keyframes) {
        super(scene);
        this.keyframes = keyframes;
        this.startInstant = -1;
        this.keyframes.reverse();
        this.lastRecordedInstant = null;
        this.initialPhaseState = null;
    }

    update(t) {
        if (this.startInstant === -1) {
            this.startInstant = t;
            this.lastRecordedInstant = t;
            return;
        }

        const elapsedTime = t - this.startInstant;
        for (let i = this.keyframes.length - 1; i >= 0; i--) {
            if (elapsedTime > this.keyframes[i].instant) {
                this.initialPhaseState = this.keyframes[i];
                this.initialPhaseInstant = t;
                this.keyframes.pop();
            } else {
                break;
            }
        }
        this.lastRecordedInstant = t;
    }

    active() {
        return this.initialPhaseState != null;
    }

    apply() {
        if (this.initialPhaseState == null) return;
        
        let translation, rotX, rotY, rotZ, scale;
        if (this.keyframes.length === 0) {
            translation = [this.initialPhaseState.translationVec[0], this.initialPhaseState.translationVec[1], this.initialPhaseState.translationVec[2]];
            rotX = this.initialPhaseState.rotationAngleX;
            rotY = this.initialPhaseState.rotationAngleY;
            rotZ = this.initialPhaseState.rotationAngleX;
            scale = [this.initialPhaseState.scaleVec[0], this.initialPhaseState.scaleVec[1], this.initialPhaseState.scaleVec[2]];
        } else {
            const keyframeDiff = this.keyframes[this.keyframes.length - 1].keyframeDiff(this.initialPhaseState);
            const animationCompletenessPercentage = (this.lastRecordedInstant - this.initialPhaseInstant) / keyframeDiff.instant;
            translation = [
                this.initialPhaseState.translationVec[0] + keyframeDiff.translation[0] * animationCompletenessPercentage,
                this.initialPhaseState.translationVec[1] + keyframeDiff.translation[1] * animationCompletenessPercentage,
                this.initialPhaseState.translationVec[2] + keyframeDiff.translation[2] * animationCompletenessPercentage
            ];
            rotX = keyframeDiff.rotX * animationCompletenessPercentage;
            rotY = keyframeDiff.rotY * animationCompletenessPercentage;
            rotZ = keyframeDiff.rotZ * animationCompletenessPercentage;
            scale = [
                this.initialPhaseState.scaleVec[0] + keyframeDiff.scale[0] * animationCompletenessPercentage,
                this.initialPhaseState.scaleVec[1] + keyframeDiff.scale[1] * animationCompletenessPercentage,
                this.initialPhaseState.scaleVec[2] + keyframeDiff.scale[2] * animationCompletenessPercentage
            ]
        }

        this.scene.translate(...translation);
        this.scene.rotate(rotZ, 0, 0, 1);
        this.scene.rotate(rotY, 0, 1, 0);
        this.scene.rotate(rotX, 1, 0, 0);
        this.scene.scale(...scale);
    }
}