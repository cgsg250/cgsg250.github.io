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
uniform float RotationX; 

void main() {
    float angleY = RotationY;
    float cosY = cos(radians(angleY));
    float sinY = sin(radians(angleY));

    float angleX = -90.0 + RotationX; 
    float cosX = cos(radians(angleX));
    float sinX = sin(radians(angleX));

    vec3 posAfterX;
    posAfterX.x = a_pos.x;
    posAfterX.y = a_pos.y * cosX - a_pos.z * sinX;
    posAfterX.z = a_pos.y * sinX + a_pos.z * cosX;

    vec3 rotatedPos;
    rotatedPos.x = posAfterX.x * cosY + posAfterX.z * sinY;
    rotatedPos.y = posAfterX.y;
    rotatedPos.z = posAfterX.z * cosY - posAfterX.x * sinY;

    float zoomFactor = 1.0 / Zoom;
    if (zoomFactor < 0.1) zoomFactor = 0.1;
    if (zoomFactor > 3.0) zoomFactor = 3.0;

    vec3 finalPos = rotatedPos * zoomFactor;

    gl_Position = vec4(finalPos, 1.0);
}
