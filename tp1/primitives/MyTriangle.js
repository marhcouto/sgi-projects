import { CGFobject } from '../../lib/CGF.js';

export class MyTriangle extends CGFobject {
    constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        super(scene);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;

        this.initBuffers();
    }

    initBuffers() {
        // Side lengths
        this.sideA = Math.sqrt(
            Math.pow(this.x2 - this.x1, 2) + 
            Math.pow(this.y2 - this.y1, 2) + 
            Math.pow(this.z2 - this.z1, 2)
        );

        this.sideB = Math.sqrt(
            Math.pow(this.x3 - this.x2, 2) + 
            Math.pow(this.y3 - this.y2, 2) + 
            Math.pow(this.z3 - this.z2, 2)
        );

        this.sideC = Math.sqrt(
            Math.pow(this.x3 - this.x1, 2) + 
            Math.pow(this.y3 - this.y1, 2) + 
            Math.pow(this.z3 - this.z1, 2)
        );
        
        // Vertices
        this.vertices = [
            this.x1, this.y1, this.z1, // A
            this.x2, this.y2, this.z2, // B
            this.x3, this.y3, this.z3 // C
        ];

        this.indices = [
            0, 1 , 2
        ];

        // Normals
        const normals = this._computeNormal()
        this.normals = [
            normals[0], normals[1], normals[2],
            normals[0], normals[1], normals[2],
            normals[0], normals[1], normals[2]
        ];

        // Texture coordinates
        this.texCoords = this._computeTexCords()
        
        this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }

    /**
	 * @method _computeNormal
	 * Computes triangle normals
	 */
    _computeNormal() {
        const vectorAB = vec3.fromValues(this.x2 - this.x1, this.y2 - this.y1, this.z2 - this.z1);
        const vectorAC = vec3.fromValues(this.x3 - this.x1, this.y3 - this.y1, this.z3 - this.z1);
        const normal = vec3.create();
        vec3.cross(normal, vectorAB, vectorAC);
        // Could have used the side size but this is the same thing
        const lenVec = vec3.fromValues(vec3.length(normal), vec3.length(normal), vec3.length(normal));
        vec3.divide(normal, normal, lenVec);
        return normal
    }

    /**
	 * @method _computeTexCords
	 * Computes triangle texture coords
	 * @param lenS 
     * @param lenT
	 */
    _computeTexCords(lenS, lenT) {
        
        // This function uses the nomenclature used in the theoretical class slides
        const cosAlpha = (Math.pow(this.sideA, 2) - Math.pow(this.sideB, 2) + Math.pow(this.sideC, 2)) / (2*this.sideA*this.sideC)
        const sinAlpha = Math.sqrt(1 - Math.pow(cosAlpha, 2))

        return [
            0, 0,
            this.sideA * lenS, 0,
            this.sideC * cosAlpha * lenS, this.sideC * sinAlpha * lenT
        ];
    }

    /*
    Texture coords (s,t)
    +----------> s
    |
    |
    |
    v
    t
    */

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param lenS 
     * @param lenT
	 */
	updateTexCoords(lenS, lenT) {
		this.texCoords = this._computeTexCords(lenS, lenT);
		this.updateTexCoordsGLBuffers();
	}
}