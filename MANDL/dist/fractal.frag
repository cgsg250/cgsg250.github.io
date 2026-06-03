#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

uniform float u_time;
uniform float MouseX;
uniform float MouseY;
uniform float OffsetX;
uniform float OffsetY;
uniform float Zoom;
uniform vec3 Color1;
uniform vec3 Color2;

float Mandel(vec2 Z) {
    float n = 0.0;
    vec2 Z0 = Z;

    while (Z.x * Z.x + Z.y * Z.y < 4.0 && n < 255.0) {
        Z = vec2(vec2(Z.x * Z.x - Z.y * Z.y, Z.x * Z.y + Z.y * Z.x) + Z0);
        n++;
    }
    return n;
}

float Julia(vec2 Z, vec2 C) {
    float n = 0.0;

    while (Z.x * Z.x + Z.y * Z.y < 4.0 && n < 255.0)
    Z = vec2(Z.x * Z.x - Z.y * Z.y, Z.x * Z.y + Z.y * Z.x) + C, n++;
    return n;
}        

void main() {
    vec2 Z, C;          
    float N;
    float xs, ys;
    float Frame_W = 500.0, Frame_H = 500.0, X1 = 2.0, X0 = -2.0, Y1 = 2.0, Y0 = -2.0;
    int Flag = 1; // Mandelbrot = 0, Jule = 1, Nuton = 2
    float n = 0.0;

    xs = gl_FragCoord.x - OffsetX;
    ys = gl_FragCoord.y + OffsetY;
    Z = vec2((xs * (X1 - X0) / Frame_W + X0) / Zoom, (ys * (Y1 - Y0) / Frame_H + Y0) / Zoom);
    C = vec2(0.35 + 0.5 * sin(u_time / 1000.0), 0.39 + 1.0 * sin(u_time * 0.5 / 1000.0 + 3.0));

    // Mandelbrot                                       
    if (Flag == 0) {
        n = Mandel(Z);
    }
    if (Flag == 1) {
        n = Julia(Z, C);
    }

    o_color = vec4(vec3(n / 255.0, n / 255.0, n / 255.0) * vec3((Color2 - Color1) / vec3(2.0)), 1);
}