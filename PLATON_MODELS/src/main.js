// UI
import { Pane } from 'tweakpane';

// 1. Initialize the pane
const pane = new Pane();
const btn = pane.addButton({
    title: 'Click Me',   // Text displayed inside the button
    label: 'GL3 PLATON MODEL RENDER',     // Optional left-side descriptor label
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
let u_zoom_location;
let u_time_location;
let u_rotation_location;

let mouse_wheel = 0;
let rotation_y = 0;

let OldMouse = {
    X: 0.0,
    Y: 0.0
};

let Mouse = {
    X: 0.0,
    Y: 0.0
};

function loadShaderText(url) {
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error(`Не удалось загрузить шейдер по пути: ${url} (Статус: ${response.status})`);
        }
        return response.text();
    });
}

function initShaders() {
    Promise.all([
        loadShaderText('bin/platon_models.frag'),
        loadShaderText('bin/platon_models.vert')
    ])
        .then(sources => {
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
            u_color1_location = gl.getUniformLocation(program, "Color1");
            u_zoom_location = gl.getUniformLocation(program, 'Zoom');
            u_rotation_location = gl.getUniformLocation(program, 'RotationY');
        })
        .catch(error => {
            console.error('Ошибка при подготовке шейдеров:', error);
        });
}


function drawScene() {
    gl.clearColor(0, 1, 0, 1);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);                               

    drawKleinBottle(gl, buffers, 0);

    let timeFromStart = new Date().getMilliseconds() - startTime;
    // Put time to shader 
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);

    // Put colors to shader
    gl.uniform3f(u_color1_location, Color1.color1.r, Color1.color1.g, Color1.color1.b);

    // Put zoom to shader
    gl.uniform1f(u_zoom_location, mouse_wheel);
    
    // Put rotation to shader
    gl.uniform1f(u_rotation_location, rotation_y);

    window.requestAnimationFrame(drawScene);
}           


// Klein bottle module
function createKleinBottle(uSegments = 80, vSegments = 40) {
    const vertices = [];
    const indices = [];

    for (let i = 0; i <= uSegments; i++) {
        const u = (i / uSegments) * Math.PI; 
        
        for (let j = 0; j <= vSegments; j++) {
            const v = (j / vSegments) * 2 * Math.PI; 

            const cosU = Math.cos(u);
            const sinU = Math.sin(u);
            const cosV = Math.cos(v);
            const sinV = Math.sin(v);

            let x = -2/15 * cosU * (3 * cosV - 30 * sinU + 90 * Math.pow(cosU, 4) * sinU - 60 * Math.pow(cosU, 6) * sinU + 5 * cosU * cosV * sinU);
            let y = -1/15 * sinU * (3 * cosV - 3 * Math.pow(cosU, 2) * cosV - 48 * Math.pow(cosU, 4) * cosV + 48 * Math.pow(cosU, 6) * cosV - 60 * sinU + 5 * cosU * cosV * sinU - 5 * Math.pow(cosU, 3) * cosV * sinU - 80 * Math.pow(cosU, 5) * cosV * sinU + 80 * Math.pow(cosU, 7) * cosV * sinU);
            let z = 2/15 * (3 + 5 * cosU * sinU) * sinV;

            let finalX = x * 0.2;
            let finalY = z * 0.2;
            let finalZ = (y - 3.6) * 0.2; 

            vertices.push(finalX, finalY, finalZ);
        }
    }

    for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
            const p0 = i * (vSegments + 1) + j;
            const p1 = p0 + 1;
            const p2 = (i + 1) * (vSegments + 1) + j;
            const p3 = p2 + 1;

            indices.push(p0, p2, p1);
            indices.push(p1, p2, p3);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices) 
    };
}


function InitKleinBottle( gl, a = 40, b = 80 ) {
    const { vertices, indices } = createKleinBottle(a, b); 
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        indices: indexBuffer,
        indexCount: indices.length 
    };
}


function drawKleinBottle(gl, buffers, positionAttributeLocation) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.drawElements(gl.LINES, buffers.indexCount, gl.UNSIGNED_SHORT, 0);
}

let buffers = {
    position: 0,
    indices: 0,
    indexCount: 0
};
                             
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

    canvas.addEventListener('mousemove', (e) => {
        if (flag) {
            let deltaX = e.x - OldMouse.X;
            rotation_y += deltaX * 0.5;
            OldMouse.X = e.x;
            OldMouse.Y = e.y;
        }
    });

    canvas.addEventListener('mouseup', () => {
        flag = false;
    });

    canvas.onwheel = (ev) => {
        mouse_wheel += ev.deltaY / 100;
        if (mouse_wheel > 10.0) mouse_wheel = 10.0;
        if (mouse_wheel < -10.0) mouse_wheel = -10.0;
    };    


    initGL(canvas);
    initShaders();
    const { position, indices, indexCount } = InitKleinBottle(gl, 40, 80);
    buffers.position = position;
    buffers.indices = indices;
    buffers.indexCount = indexCount;

    startTime = new Date().getMilliseconds();
    drawScene();
}

window.onload = onStart();
