#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in float fs_InstanceIdx;
in float fs_TotalBins;

in float fs_time;

out vec4 out_Col;

void main()
{
    out_Col = vec4(0.1, 0.1, 1.0, 1.0);
    // out_Col = fs_Col;

}
