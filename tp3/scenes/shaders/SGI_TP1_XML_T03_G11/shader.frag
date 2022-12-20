#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 highlightColor;
uniform vec4 materialColor;

uniform float pulseStage;
uniform bool hasTexture;

void main() {
    float normalizedPulseStage;
    normalizedPulseStage = pulseStage;
    if (normalizedPulseStage > 0.85) {
        normalizedPulseStage = 0.85;
    }

    vec4 textureComponent;
    if (hasTexture) {
        textureComponent = (1.0 - normalizedPulseStage) * (0.8 * texture2D(uSampler, vTextureCoord) + 0.2 * materialColor);
    } else {
        textureComponent = (1.0 - normalizedPulseStage) * materialColor;
    }

    vec4 xmlComponent = normalizedPulseStage * highlightColor;
    gl_FragColor = textureComponent + xmlComponent;
}