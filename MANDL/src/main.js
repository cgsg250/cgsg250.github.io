// UI
import { Pane } from 'tweakpane';

// 1. Initialize the pane
const pane = new Pane();
const btn = pane.addButton({
    title: 'Click Me',   // Text displayed inside the button
    label: 'GL3 FRACTAL',     // Optional left-side descriptor label
});
// 3. Handle click events
btn.on('click', () => {
    console.log('Button was clicked!');
});

const Color1 = {
    color1: { r: 1.0, g: 0.5, b: 0.0 },
};

pane.addBinding(Color1, 'color1', {
    view: 'color1',
    label: 'Color1',
}).on('change', (ev) => {
    console.log('Новые значения для шейдера:', ev.value);
});

const Color2 = {
    color2: { r: 1.0, g: 0.5, b: 0.1 },
};

pane.addBinding(Color2, 'color2', {
    view: 'color2',
    label: 'Color2',
}).on('change', (ev) => {
    console.log('Новые значения для шейдера:', ev.value);
});

// Fractal

let gl;
let startTime;

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}

function getShader(shaderStr, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }

    return shader;
}

let u_color1_location;
let u_color2_location;
let u_time_location;
let u_offsetx_location;
let u_offsety_location;
let u_mouse_wheel;
let mouse_wheel = 1;

let OldMouse = {
    X: 0.0,
    Y: 0.0
};

let Mouse = {
    X: 0.0,
    Y: 0.0
};

let Offset = {
    X: 0.0,
    Y: 0.0
};

let GlobalOffset = {
    X: 0.0,
    Y: 0.0
};

// Функция загрузки возвращает Promise с текстом файла
function loadShaderText(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error(`Не удалось загрузить шейдер по пути: ${url} (Статус: ${response.status})`);
        }
        return response.text();
    });
}

function initShaders() {
    // Передаем массив путей напрямую в Promise.all
    Promise.all([
        loadShaderText('fractal.frag'),
        loadShaderText('fractal.vert')
    ])
    .then(sources => {
        // Извлекаем текст шейдеров из полученного массива
        const fragSource = sources[0];
        const vertSource = sources[1];

        console.log('Шейдеры успешно загружены!');

        const vs = getShader(vertSource, gl.VERTEX_SHADER);
        const fs = getShader(fragSource, gl.FRAGMENT_SHADER);

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Program linkage error");
        }

        gl.useProgram(program);

        u_time_location = gl.getUniformLocation(program, "u_time");
        u_offsetx_location = gl.getUniformLocation(program, "OffsetX");
        u_offsety_location = gl.getUniformLocation(program, "OffsetY");
        u_mouse_wheel = gl.getUniformLocation(program, "Zoom");
        u_color1_location = gl.getUniformLocation(program, "Color1");
        u_color2_location = gl.getUniformLocation(program, "Color2");
    })
    .catch(error => {
        console.error('Ошибка при подготовке шейдеров:', error);
    });
}

let vertexBuffer;
function initBuffer() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const vertices = [-1, -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );
}

function drawScene() {
    gl.clearColor(0, 1, 0, 1);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let timeFromStart = new Date().getMilliseconds() - startTime;

    // Put time to shader 
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);

    // Put global offset to shader
    GlobalOffset.X = GlobalOffset.X + Offset.X;
    GlobalOffset.Y = GlobalOffset.Y + Offset.Y;
    gl.uniform1f(u_offsetx_location, GlobalOffset.X);
    gl.uniform1f(u_offsety_location, GlobalOffset.Y);
    Offset.X = 0;
    Offset.Y = 0;

    // Put mouse_wheel to shader
    gl.uniform1f(u_mouse_wheel, mouse_wheel);

    // Put colors to shader
    gl.uniform3f(u_color1_location, Color1.color1.r, Color1.color1.g, Color1.color1.b);
    gl.uniform3f(u_color2_location, Color2.color2.r, Color2.color2.g, Color2.color2.b);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(drawScene);
}

export function onStart() {
    let flag = false;
    let first = true;
    let savemouse;
    let canvas = document.getElementById("webgl-canvas");

    canvas.addEventListener('mousedown', (e) => {
        Mouse.X = e.x;
        Mouse.Y = e.y;
        OldMouse = structuredClone(Mouse);
        flag = true;
    });

    canvas.addEventListener('mouseup', (e) => {
        console.log(`Offset(${Offset.X}, ${Offset.Y})`);
        flag = false;
    });

    canvas.onmousemove = (ev) => {
        if (flag) {
            Offset.X = ev.x - OldMouse.X;
            Offset.Y = ev.y - OldMouse.Y;
            OldMouse.X = ev.x;
            OldMouse.Y = ev.y;
        }
    };

    canvas.onwheel = (ev) => {
        mouse_wheel += ev.deltaY / 100;
    };

    initGL(canvas);
    initShaders();
    initBuffer();

    startTime = new Date().getMilliseconds();
    drawScene();
}

window.onload = onStart();

