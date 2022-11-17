#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float redComp;
uniform float greenComp;
uniform float blueComp;

uniform float pulseStage;

void main() {
    vec4 xmlComponent = pulseStage * vec4(redComp, greenComp, blueComp, 1.0);
    vec4 textureComponent = (1.0 - pulseStage) * texture2D(uSampler, vTextureCoord);
    gl_FragColor = textureComponent + xmlComponent;
}