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
    }

    addKeyFrame(keyframe) {
        let i = 0;
        for (; i < this.keyframes.length; i++) {
            if (this.keyframes[i].instant < keyframe.instant) break;
        }
        this.keyframes.splice(i, 0, keyframe);
    }

    update(t) {
        if (this.keyframes.length == 0) return; // No keyframes in this animation

        let keyframesToApply = [];
        for (let keyframe of this.keyframes) {
            if (keyframe.instant * 1000 > t)
                keyframesToApply.push(keyframe);
        }

        // TODO: complete this and apply
        
    }

    apply() {

    }
}