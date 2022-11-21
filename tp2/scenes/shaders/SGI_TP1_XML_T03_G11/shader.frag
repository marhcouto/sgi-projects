#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec4 highlightColor;
uniform vec4 materialColor;

uniform float pulseStage;

void main() {
    float normalizedPulseStage;
    normalizedPulseStage = pulseStage;
    if (normalizedPulseStage > 0.85) {
        normalizedPulseStage = 0.85;
    }

    vec4 xmlComponent = normalizedPulseStage * highlightColor;
    vec4 textureComponent = (1.0 - normalizedPulseStage) * (0.5 * texture2D(uSampler, vTextureCoord) + 0.5 * materialColor);
    gl_FragColor = textureComponent + xmlComponent;
}