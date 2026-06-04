#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

uniform float u_time;
uniform float MouseX;
uniform float MouseY;
uniform float Zoom;
uniform vec3 Color1;

void main() {
    o_color = vec4(Color1 / 255.0, 1);
}