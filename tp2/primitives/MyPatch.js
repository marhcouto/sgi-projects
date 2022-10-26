import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from '../../lib/CGF.js';

export class MyPatch extends CGFobject {
    constructor(scene, degU, partsU, degV, partsV, vertices) {
        super(scene);
        this.scene = scene;
        this.degU = degU;
        this.degV = degV;
        this.partsU = partsU;
        this.partsV = partsV;
        this.vertices = vertices;
        this.initBuffers();
    }

    initBuffers() {
        let nurbsSurface = new CGFnurbsSurface(this.degU, this.degV, this.vertices);
        this.nurbsObject = new CGFnurbsObject(this.scene, this.partsU, this.partsV, nurbsSurface);
    }

    display() {
        this.nurbsObject.display();
    }
}