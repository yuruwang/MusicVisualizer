#version 300 es
precision highp float;

uniform float u_Freq;

in float fs_time;
in vec2 fs_Dimensions;

out vec4 outColor;

vec2 getPosition(float t, float asp) {
    float tx = t / asp;
    vec2 pos = vec2(sin(2.2 * tx) - cos(1.4 * tx), cos(1.3 * t) + sin(-1.9 * t));
    pos.y *= 0.2;
    pos.x *= 0.4;
 	return pos;
}


void main() {
    float freqFactor = 1.0;
    float time = fs_time * 0.005;

    vec2 uv = vec2(0.5) - gl_FragCoord.xy / fs_Dimensions.xy;
    float aspect = fs_Dimensions.x / fs_Dimensions.y;
    uv.x *= aspect;
    vec3 color = vec3(0.0);
    
    vec3 color1 = vec3(0.0, 0.2, 0.9);
    const float radius = 0.001;
    const float tailLength = 0.7;
    float edgeWidth = 0.2 * u_Freq / 255.0;
    for (float j = 0.0; j < 3.0; j++) {
        float totalRadius = radius + sin(j * 0.7 + time * 1.2) * 0.02;
        float dMin = 1.0;
        for (float i = 0.0; i < 5.0; i++) {
            float portion = i / 5.0;
            float dist = length(getPosition(time * 2.0 * freqFactor + j * 1.5 - portion * tailLength, aspect) - uv);
            dMin = min(dMin, dist + pow(portion, 0.8) * (totalRadius + edgeWidth));
        }
        color += 5.0 * (1.0 - smoothstep(totalRadius, totalRadius + edgeWidth, dMin)) * color1; //mix(color1, color2, mod(float(j), 2.0));
    }
    
	outColor = vec4(color, 1.0);
   
}
