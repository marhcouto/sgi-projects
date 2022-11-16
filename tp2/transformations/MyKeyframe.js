
/**
 * MyKeyframe
 * @constructor
 * @param instant - Instant of the keyframe
 * @param transformationMatrix - Matrix with all the Translation, Rotation and Scaling transformation already multiplied
 * @param tx - Translation value in x
 * @param ty - Translation value in y
 * @param tz - Translation value in z
 * @param rax1 - Rotation1' axis
 * @param rax2 - Rotation2' axis
 * @param rax3 - Rotation3' axis
 * @param rang1 - Rotation1's angle
 * @param rang2 - Rotation2's angle
 * @param rang3 - Rotation3's angle
 * @param sx - Scaling value in x
 * @param sy - Scaling value in y
 * @param sz - Scaling value in z
 */
class MyKeyframe {
    constructor(instant, tx, ty, tz, rax1, rang1, rax2, rang2, rax3, rang3, sx, sy, sz) {
        this.instant = instant;
        this.tx = tx;
        this.ty = ty;
        this.tz = tz;
        this.rax1 = rax1;
        this.rax2 = rax2;
        this.rax3 = rax3;
        this.rang1 = rang1;
        this.rang2 = rang2;
        this.rang3 = rang3;
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
    }
}