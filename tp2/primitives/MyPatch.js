import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from '../../lib/CGF.js';

export class MyPatch extends CGFobject {
    constructor(degU, partsU, degV, partsV, vertices) {
        this.degU = degU;
        this.degV = degV;
        this.partsU = partsU;
        this.partsV = partsV;
        this.vertsU = vertices;
    }

    initBuffers() {
        let nurbsSurface = CGFnurbsSurface(this.degU, this.degV, this.vertices);
        this.nurbsObject = CGFnurbsObject(this.partsU, this.partsV, nurbsSurface);
    }

    display() {
        this.nurbsObject.display();
    }
}