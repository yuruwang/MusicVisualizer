#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec3 fs_ParticleTranslate;

in float fs_time;

out vec4 out_Col;

void main()
{
    // float factor = fs_ParticleTranslate.y + 2.0;
    float factor = fs_ParticleTranslate.y + 0.7;
    float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);

    // out_Col = vec4(dist) * fs_Col * factor;
     out_Col = vec4(dist) * fs_Col + vec4(0.0, factor, 0.0, 1.0);

}
