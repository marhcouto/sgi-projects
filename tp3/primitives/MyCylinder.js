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

        let theta = 0;
        let thetaInc = (2 * Math.PI) / this.slices;
        let heightVertices = this.slices + 1;
        let tIncrement = 1/this.stacks;
        let sIncrement = 1/this.slices;
        let curHeight = 0;
        let heightIncrement = this.height / this.stacks;
        let curRadius = this.base;
        let radiusIncrement = (this.top - this.base) / this.stacks
        let t = 0;

        // build an all-around stack at a time, starting on "north pole" and proceeding "south"
        for (let curStack = 0; curStack <= this.stacks; curStack++) {
            // in each stack, build all the slices around, starting on longitude 0
            theta = 0;
            var s = 0;
            for (let vertex = 0; vertex <= this.slices; vertex++) {
                //--- Vertices coordinates
                var x = Math.cos(theta);
                var y = Math.sin(theta);
                var z = curHeight;
                this.vertices.push(x * curRadius, y * curRadius, z);
        
                //--- Indices
                if (curStack < this.stacks && vertex < this.slices) {
                    var current = curStack * heightVertices + vertex;
                    var next = current + heightVertices;
                    // pushing two triangles using indices from this round (current, current+1)
                    // and the ones directly south (next, next+1)
                    // (i.e. one full round of slices ahead)
                    
                    this.indices.push( next, current, current + 1);
                    this.indices.push( next, current + 1, next + 1);
                }
        
                //--- Normals
                // at each vertex, the direction of the normal is equal to 
                // the vector from the center of the sphere to the vertex.
                // in a sphere of radius equal to one, the vector length is one.
                // therefore, the value of the normal is equal to the position vectro
                this.normals.push(x, y, 0);
                theta += thetaInc;
        
                //--- Texture Coordinates
                // To be done... 
                // May need some additional code also in the beginning of the function.
                this.texCoords.push(s, t);
                s += sIncrement;
            }
            curRadius += radiusIncrement;
            curHeight += heightIncrement;
            t += tIncrement;
        }

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	} 

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param lenS 
     * @param lenT
	 */
     updateTexCoords(lenS, lenT) {

	}
}

