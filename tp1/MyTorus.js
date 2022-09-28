import { CGFobject } from "../lib/CGF.js";

export class MyTorus extends CGFobject {
    constructor(scene, innerRadius, outerRadius, nSlices, nLoops) {
        super(scene)
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.nSlices = nSlices;
        this.nLoops = nLoops;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];
        this.indices = [];

        let outerAngle = 0
        let fullAngle = 2 * Math.PI;
        let outerAngleStep = fullAngle / this.nLoops
        let innerAngleStep = fullAngle / this.nSlices

        for (let loop = 0; loop <= this.nLoops; loop++) {
            let innerAngle = 0
            for (let iLoop = 0; iLoop <= this.nSlices; iLoop++) {
                const cosInnerAngle = Math.cos(innerAngle);
                const cosOuterAngle = Math.cos(outerAngle);
                const sinOuterAngle = Math.sin(outerAngle);
                const sinInnerAngle = Math.sin(innerAngle);
                const curX = (this.outerRadius + this.innerRadius * cosInnerAngle) * cosOuterAngle;
                const curY = (this.outerRadius + this.innerRadius * cosInnerAngle) * sinOuterAngle;
                const curZ = this.innerRadius * sinInnerAngle;

                this.vertices.push(curX, curY, curZ);
                
                const firstTangent = vec3.fromValues(-sinInnerAngle, cosInnerAngle, 0);
                const secondTangent = vec3.fromValues(-sinOuterAngle*cosInnerAngle, -sinOuterAngle*sinInnerAngle, cosOuterAngle);
                const normal = vec3.create();
                vec3.cross(normal, firstTangent, secondTangent);
                const normalLength = vec3.length(normal);
                
                this.normals.push(normal[0] / normalLength, normal[1] / normalLength, normal[2] / normalLength);

                if (loop < this.nLoops && iLoop < this.nSlices) {
                    const current = loop * (this.nSlices + 1) + iLoop;
                    const next = current + this.nSlices + 1;

                    this.indices.push(current + 1, current, next);
                    this.indices.push(current + 1, next, next + 1);
                }

                innerAngle += innerAngleStep;
            }
            outerAngle += outerAngleStep;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.enableNormalViz();
		this.initGLBuffers();
    } 
}