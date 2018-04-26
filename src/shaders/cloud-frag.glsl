#version 300 es
precision highp float;

uniform sampler2D tex_Color;
uniform float u_Freq;

in float fs_time;
in vec2 fs_Dimensions;

out vec4 outColor;

vec2 thingPosition(float t, float aspect) {
    float tx = t / aspect;
    vec2 p = vec2(sin(2.2 * tx) - cos(1.4 * tx), cos(1.3 * t) + sin(-1.9 * t));
    p.y *= 0.2;
    p.x *= 0.4;
 	return p;
}


void main() {
    float freqFactor = 1.0;
    // if (u_Freq > 255.0 / 2.0) {
    //      freqFactor = 1.4;
    // } else {
    //     freqFactor = 1.0;
    // }
    float time = fs_time * 0.005;


    vec2 uv = vec2(0.5) - gl_FragCoord.xy / fs_Dimensions.xy;
    float aspect = fs_Dimensions.x / fs_Dimensions.y;
    uv.x *= aspect;
    vec3 cFinal = vec3(0.0);
    
    vec3 color1 = vec3(0.0, 0.2, 0.9);
    //vec3 color2 = vec3(0.8, 0.3, 0.2);
    const float radius = 0.001;
    const float tailLength = 0.7;
    // const float edgeWidth = 0.03;
    float edgeWidth = 0.2 * u_Freq / 255.0;
    for (int j = 0; j < 3; j++) {
        float thisRadius = radius + sin(float(j) * 0.7 + time * 1.2) * 0.02;
        float dMin = 1.0;
        const int iMax = 5;
        for (int i = 0; i < iMax; i++) {
            float iPct = float(i) / float(iMax);
            float segmentDistance = length(thingPosition(time * 2.0 * freqFactor + float(j) * 1.5 - iPct * tailLength, aspect) - uv);
            dMin = min(dMin, segmentDistance + pow(iPct, 0.8) * (thisRadius + edgeWidth));
        }
        cFinal += 5.0 * (1.0 - smoothstep(thisRadius, thisRadius + edgeWidth, dMin)) * color1; //mix(color1, color2, mod(float(j), 2.0));
    }
    
	outColor = vec4(cFinal, 1.0);
   
}
