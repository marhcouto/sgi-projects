import { CGFobject } from '../../lib/CGF.js';
/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param base - Radius in the base of the cylinder
 * @param top - Radius in the top of the cylinder
 * @param height - Height of the cylinder
 * @param slices - Number of circular slices of the cylinder
 * @param stacks - Number of horizontal stacks on the cylinder
 */
export class MyCylinder extends CGFobject {
	constructor(scene, base, top, height, slices, stacks) {
		super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
        this.texCoords = [];

        let degIncrement = 2 * Math.PI / this.slices;
        let heightIncrement = this.height / this.stacks;

        // Cylinder stacks, in crescent order of z
        for (let j = 0, currentHeight = 0; j < this.stacks; j++, currentHeight += heightIncrement) {

            // Cylinder slices, each 'face' of the cylinder in counter clockwise order 
            for (let i = 0, currentDeg = 0; i < this.slices; i++, currentDeg += degIncrement) {

                // Triangles coordinates
                // Two triangles correspond to a rectangle, which compose the face of the polygon
                let y1 = Math.sin(currentDeg) * this.base;
                let y2 = Math.sin(currentDeg + degIncrement) * this.top;
                let x1 = Math.cos(currentDeg) * this.base;
                let x2 = Math.cos(currentDeg + degIncrement) * this.top;
                let z1 = currentHeight;
                let z2 = currentHeight + heightIncrement;
    
                // Vertexes
                this.vertices.push(x1, y1, z1); // Base 1
                this.vertices.push(x2, y2, z1); // Base 2
                this.vertices.push(x1, y1, z2); // Top 1
                this.vertices.push(x2, y2, z2); // Top 2
    
                // Indexes
                //two triangles, being one a reflection of the other by one of the rectangle's diagonal,
                //side by side, create such rectangle, which is a part of the cylinder's lateral face
                this.indices.push(4*i + j*this.slices*4, 4*i + j*this.slices*4 + 1, 4*i + j*this.slices*4 + 2);
                this.indices.push(4*i + j*this.slices*4 + 1, 4*i + j*this.slices*4 + 3, 4*i + j*this.slices*4 + 2);
    
                // Normals
                //the normals are divided by the sum of its coordinates to normalize the vector
                let norm1 = x1 + y1
                let norm2 = x2 + y2
                let x1Normalized = x1 / norm1
                let y1Normalized = y1 / norm1
                let x2Normalized = x2 / norm2
                let y2Normalized = y2 / norm2

                this.normals.push(x1Normalized, y1Normalized, 0); 
                this.normals.push(x2Normalized, y2Normalized, 0); 
                this.normals.push(x1Normalized, y1Normalized, 0); 
                this.normals.push(x2Normalized, y2Normalized, 0); 
            }
        }

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	} 

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}

