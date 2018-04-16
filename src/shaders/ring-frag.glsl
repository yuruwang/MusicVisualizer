#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;

in float fs_time;

out vec4 out_Col;

void main()
{
    vec3 dist = vec3(fs_Pos.xyz - vec3(0.0, 0.5, 0.0));
    float gradient = 1.0 - (length(dist) * 2.0);
    out_Col = vec4(gradient) * fs_Col;
    // out_Col = fs_Col;
    // out_Col = vec4(1.0, 0.0, 0.0, 1.0);

}
