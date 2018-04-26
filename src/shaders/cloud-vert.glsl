#version 300 es
precision highp float;

uniform float u_Time;
uniform vec2 u_Dimensions;

in vec4 vs_Pos;
out vec2 fs_Dimensions;
out float fs_time;

void main()
{
    fs_Dimensions = u_Dimensions;
    fs_time = u_Time;
    gl_Position = vs_Pos;
}