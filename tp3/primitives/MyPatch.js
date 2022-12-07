import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from '../../lib/CGF.js';

/**
 * MyPatch
 * @constructor
 * @param scene - Reference to MyScene object
 * @param degU - Degree of the curve in U
 * @param degV - Degree of the curve in V
 * @param partsU - Divisions in U
 * @param partsV - Divisions in V
 * @param vertices - Array of vertices
 */
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
        let nurbsSurface = new CGFnurbsSurface(this.degU, this.degV , this.vertices);
        this.nurbsObject = new CGFnurbsObject(this.scene, this.partsU, this.partsV, nurbsSurface);
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param lenS 
     * @param lenT
	 */
     updateTexCoords(lenS, lenT) {

	}

    display() {
        this.nurbsObject.display();
    }
}