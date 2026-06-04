#version 300 es
precision highp float;

layout(location = 0) in vec3 a_pos;

#define PI 3.14159265358979323846
#define D2R(A) ((A) * (PI / 180.0))

mat4 MatrScale(vec3 T) {
    return mat4(T.x, 0, 0, 0,
        0, T.y, 0, 0, 
        0, 0, T.z, 0, 
        0, 0, 0, 1);
}

mat4 MatrRotateY(float AngleInDegree) {
    float A = D2R(AngleInDegree), si = sin(A), co = cos(A);

    return mat4(vec4(co, 0, -si, 0),
        vec4(0, 1, 0, 0),
        vec4(si, 0, co, 0), 
        vec4(0, 0, 0, 1));
}

mat4 MatrRotateX(float AngleInDegree) {
    float a = radians(AngleInDegree), si = sin(a), co = cos(a);

    return mat4(vec4(1, 0, 0, 0), 
        vec4(0, co, si, 0), 
        vec4(0, -si, co, 0), 
        vec4(0, 0, 0, 1));
}

uniform float u_time;

void main() {
    gl_Position = vec4(a_pos * mat3(MatrScale(vec3(0.9))) * mat3(MatrRotateY(u_time * 100.0)) * mat3(MatrRotateX(90.0)), 1);
}
