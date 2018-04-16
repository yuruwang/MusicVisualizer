#version 300 es
precision highp float;

uniform float u_Time;
in vec4 vs_Pos;
out float fs_time;

void main()
{
    fs_time = u_Time;
    gl_Position = vs_Pos;
}