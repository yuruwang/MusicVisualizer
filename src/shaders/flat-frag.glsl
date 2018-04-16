#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in float fs_InstanceIdx;
in float fs_TotalBins;

in float fs_time;

out vec4 out_Col;

vec3 a = vec3(0.500, 0.500, 0.500);
vec3 b = vec3(0.500, 0.500, 0.500);
vec3 c = vec3(3.138, 1.718, 1.000);
vec3 d = vec3(0.000, 0.333, 0.667);

void main()
{
    float portion = fs_InstanceIdx / fs_TotalBins;

    vec3 color = a * b * cos(2.0 * 3.1415 * (c * portion + d));
    vec3 dist = vec3(fs_Pos.xyz - vec3(0.0, 0.5, 0.0));
    float gradient = 1.0 - (length(dist) * 2.0);
    out_Col = vec4(gradient) * fs_Col;
    // out_Col = vec4(gradient) * vec4(color, 1.0);
    // out_Col = vec4(color, 1.0);
    // out_Col = vec4(1.0, 0.0, 0.0, 1.0);

}
