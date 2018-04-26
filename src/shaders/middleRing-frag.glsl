#version 300 es
precision highp float;

in vec4 fs_Col;

in float fs_time;

uniform vec2 u_Dimensions;

out vec4 out_Col;

float squared(float n) { 
    return n * n; 
}

void main()
{
    float t = fs_time * 0.01;
    vec2 uv = gl_FragCoord.xy / u_Dimensions.xy;
    vec2 uv_offset = -1.0 + 2.0 * uv;
    uv_offset.y += 0.5 * (0.2 * sin(uv_offset.x - t * 1.0));
    
	float intensity = 0.0;
    float width = 0.0;
    vec3 color = vec3(0.0);
    
    intensity = 0.4 + squared(1.6 * abs(mod(uv.x + t * 0.6 ,2.0) - 1.0));
    width = 0.5 * abs(intensity / (150.0 * uv_offset.y));
    color += vec3(width * (2.0 + sin(t * 0.13)), width * (2.0 - sin(t * 0.23)), width * (2.0 - cos(t * 0.19)));

	out_Col = vec4(color, 1.0);

}
