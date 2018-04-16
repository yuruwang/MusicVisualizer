#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;
uniform float u_TotalBins;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in float vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in float vs_InstanceIdx; // an instance rendering attibute representing the bin index
in float vs_ScaleFactor; // an instance rendering attibute representing the bin index

out vec4 fs_Col;
out vec4 fs_Pos;

out float fs_time;

const float PI = 3.1415;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

mat4 scaleMatrix(float sx, float sy, float sz) {
    return mat4(sx, 0.0, 0.0, 0.0,
                0.0, sy, 0.0, 0.0,
                0.0, 0.0, sz, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

mat4 translateMatrix(float tx, float ty, float tz) {
    return mat4(1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                tx, ty, tz, 1.0);
}

void main()
{
    float portion = vs_InstanceIdx / u_TotalBins;
    float rad = portion * PI;
    mat4 transformM = rotationMatrix(vec3(0.0, 0.0, 1.0), rad * u_Time * 0.001) * translateMatrix(0.0, 0.4 + vs_Translate, 0.0) * scaleMatrix(0.005, 0.2 * vs_ScaleFactor, 1.0);
    vec4 pos = transformM * vs_Pos;

    fs_Col = vs_Col;
    fs_Pos = vs_Pos;

    gl_Position = u_ViewProj * pos;
}
