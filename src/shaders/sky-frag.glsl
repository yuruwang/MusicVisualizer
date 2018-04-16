#version 300 es
precision highp float;

uniform vec2 u_Dimensions;

in float fs_time;
out vec4 outColor;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

// Sunset palette
const vec4 skyPalette[2] = vec4[](vec4(200.0 / 255.0, 10.0 / 255.0, 10.0 / 255.0, 1.0),
                               vec4(10.0 / 255.0, 10.0 / 255.0, 10.0 / 255.0, 1.0));
const vec4 moonColor = vec4(255.0 / 255.0, 255.0 / 255.0, 255.0 / 255.0, 1.0);

vec3 a = vec3(0.418, -2.052, 0.318);
vec3 b = vec3(0.415, 0.415, 0.415);
vec3 c = vec3(1.000, 1.000, 1.000);
vec3 d = vec3(0.000, 0.333, 0.667);

void main()
{
    vec3 color1 = a * b * cos(2.0 * 3.1415 * (c * fs_time * 0.0001 + d));
    vec3 color2 = b * c * cos(2.0 * 3.1415 * (d * fs_time * 0.0001 + a));
    
    vec2 uv = vec2(gl_FragCoord.x / u_Dimensions.x, gl_FragCoord.y / u_Dimensions.y);
    vec4 color = vec4(0.1, 0.6, 0.5, 1);
    // color = mix(skyPalette[0], skyPalette[1], uv.y);
    color = mix(vec4(color1, 1.0), vec4(color2, 1.0), uv.y);
    outColor = color;
    // outColor= vec4(color1, 1.0);
}