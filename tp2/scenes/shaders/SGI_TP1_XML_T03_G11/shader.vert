attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float redComp;
uniform float greenComp;
uniform float blueComp;

uniform float scaleFactor;
uniform float pulseStage;

void main() {
	vec3 scaledVertexPos = scaleFactor * aVertexNormal + aVertexPosition;
	gl_Position = uPMatrix * uMVMatrix * vec4(scaledVertexPos, 1);
	vTextureCoord = aTextureCoord;
}
