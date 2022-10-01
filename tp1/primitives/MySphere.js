import { CGFobject } from '../../lib/CGF.js';
/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Radius in the base of the cylinder
 * @param slices - Number of circular slices of the cylinder
 * @param stacks - Number of horizontal stacks on the cylinder
 */
export class MySphere extends CGFobject {
	constructor(scene, radius, slices, stacks) {
		super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;

		this.initBuffers();
	}
	
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
    
        let latitudeDegIncrement = Math.PI / (2 * this.stacks);
        let longitudeDegIncrement = (2 * Math.PI) / this.slices;
    
        // Sphere stacks, in crescent order of z
        for (let latitude = 0, latitudeDeg = 0; latitude <= this.stacks; latitude++, latitudeDeg += latitudeDegIncrement) {

            let sinLatitudeDeg = Math.sin(latitudeDeg);
            let cosLatitudeDeg = Math.cos(latitudeDeg);
    
            // Sphere slices in counter clockwise order
            for (let longitude = 0, longitudeDeg = 0; longitude <= this.slices; longitude++, longitudeDeg += longitudeDegIncrement) {
                
                // Vertex
                let x = Math.cos(longitudeDeg) * sinLatitudeDeg * this.radius;
                let y = Math.sin(longitudeDeg) * sinLatitudeDeg * this.radius;
                let z = cosLatitudeDeg * this.radius;
                this.vertices.push(x, y, z);
        
                // Indices
                //each slice is composed by inverted triangles that form diamonds
                //each triangle is composed by the current vertex, the one being processed next and the one
                //between them in longitude and above them in latitude
                if (latitude < this.stacks && longitude < this.slices) {
                    let latVertices = this.slices + 1;
                    let current = latitude * latVertices + longitude;
                    let next = current + latVertices;
                    this.indices.push( current + 1, current, next);
                    this.indices.push( current + 1, next, next +1);
                }
        
                // Normals
                //divided by the radius to normalize the vector
                this.normals.push(x / this.radius, y / this.radius, z / this.radius);
            }
        }
    
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}

