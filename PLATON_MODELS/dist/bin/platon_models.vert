#version 300 es
precision highp float;

layout(location = 0) in vec3 a_pos;

#define PI 3.14159265358979323846
#define D2R(A) ((A) * (PI / 180.0))

mat4 MatrRotateY(float AngleInDegree) {
    float A = D2R(AngleInDegree), si = sin(A), co = cos(A);
    return mat4(
        vec4(co, 0, -si, 0),
        vec4(0, 1, 0, 0),
        vec4(si, 0, co, 0),
        vec4(0, 0, 0, 1));
}

mat4 MatrRotateX(float AngleInDegree) {
    float a = radians(AngleInDegree), si = sin(a), co = cos(a);
    return mat4(
        vec4(1, 0, 0, 0),
        vec4(0, co, si, 0),
        vec4(0, -si, co, 0),
        vec4(0, 0, 0, 1));
}

uniform float u_time;
uniform float Zoom;
uniform float RotationY;

void main() {
    float angleY = RotationY;
    float cosY = cos(radians(angleY));
    float sinY = sin(radians(angleY));

    vec3 rotatedPos;
    rotatedPos.x = a_pos.x * cosY + a_pos.z * sinY;
    rotatedPos.y = a_pos.y;
    rotatedPos.z = a_pos.z * cosY - a_pos.x * sinY;

    float zoomFactor = 1.0 / Zoom;
    if (zoomFactor < 0.5) zoomFactor = 0.5;
    if (zoomFactor > 2.0) zoomFactor = 2.0;

    vec3 finalPos = rotatedPos * zoomFactor;

    gl_Position = vec4(finalPos, 1.0);
}