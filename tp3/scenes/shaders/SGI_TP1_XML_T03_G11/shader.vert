attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec4 highlightColor;
uniform vec4 materialColor;

uniform float scaleFactor;
uniform float pulseStage;

uniform bool hasTexture;

void main() {
	vec3 scaledVertexPos = scaleFactor * aVertexNormal + aVertexPosition;
	gl_Position = uPMatrix * uMVMatrix * vec4(scaledVertexPos, 1);
	vTextureCoord = aTextureCoord;
}
