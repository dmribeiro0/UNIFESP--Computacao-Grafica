const canvas = document.getElementById('canvas');
const gl = canvas.getContext("webgl2",{preserveDrawingBuffer:true});

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

//--------------------------------------------------
// VERTICES
// --------------------------------------------------

let vertices = new Float32Array([
    0.0, 0.0,
    0.0, 0.0
]);

// --------------------------------------------------
// COLORS
// --------------------------------------------------

let colors = new Float32Array([
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0
]);

let defaultColor = [1.0, 0.0, 0.0]; // Default color is red

// --------------------------------------------------
// POINT SIZES
// --------------------------------------------------

let pointSizes = new Float32Array([10.0, 10.0]);

let defaultPointSize = 10.0; // Default point size

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const colorsBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);

const pointSizesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    pointSizes,
    gl.STATIC_DRAW
);

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;
in float aPointSize;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
    vColor = aColor;
}

`;

// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
}

`;

// --------------------------------------------------
// COMPILE SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);

// --------------------------------------------------
// CREATE PROGRAM
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}

// --------------------------------------------------
// ATTRIBUTES LOCATION
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );

const pointSizeLocation =
    gl.getAttribLocation(
        program,
        "aPointSize"
    );

// --------------------------------------------------
// CONFIGURE ATTRIBUTES
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.enableVertexAttribArray(colorLocation);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.enableVertexAttribArray(pointSizeLocation);

gl.vertexAttribPointer(
    pointSizeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// Auxiliary Functions
// --------------------------------------------------

function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    canvasMousePosition.x = e.clientX - rect.left;
    canvasMousePosition.y = e.clientY - rect.top;
}

function convertCoordinatesToWebGl2(x, y) {
    const clipX = (x / canvas.width) * 2 - 1;
    const clipY = -((y / canvas.height) * 2 - 1);
    return [clipX, clipY];
}

function convertCoordinatesToCanvas(x, y) {
    const canvasX = ((x + 1) / 2) * canvas.width;
    const canvasY = ((-y + 1) / 2) * canvas.height;
    return [canvasX, canvasY];
}

function drawPoint(x, y, r = 1.0, g = 0.0, b = 0.0, size = 10.0) {
    const [webglX, webglY] = convertCoordinatesToWebGl2(x, y);
    const vertices = new Float32Array([webglX, webglY]);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );

    colors = new Float32Array([r, g, b]);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        colors,
        gl.STATIC_DRAW
    );

    pointSizes = new Float32Array([size]);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        pointSizes,
        gl.STATIC_DRAW
    );

    drawScene(pointCount = 1);
}

function drawTriangle (x1, y1, x2, y2, x3, y3, r = 1.0, g = 0.0, b = 0.0, size = 10.0) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    Bresenham(x1, y1, x2, y2, r, g, b, size);
    Bresenham(x2, y2, x3, y3, r, g, b, size);
    Bresenham(x1, y1, x3, y3, r, g, b, size);
}

// --------------------------------------------------
// Bresenham's Line Algorithm
// --------------------------------------------------

function Bresenham(x1, y1, x2, y2) {
    // work in integer pixel coordinates
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    x2 = Math.round(x2);
    y2 = Math.round(y2);

    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);

    let sx = (x1 < x2) ? 1 : -1; // step direction on x (handles right-to-left)
    let sy = (y1 < y2) ? 1 : -1; // step direction on y (handles up/down)

    let err = dx - dy; // combined decision variable (replaces p/incInf/incSup)

    let x = x1;
    let y = y1;

    while (true) {
        drawPoint(x, y, defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);

        if (x === x2 && y === y2) break; // reached the end point

        let e2 = 2 * err;

        if (e2 > -dy) { // step in x
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {  // step in y
            err += dx;
            y += sy;
        }
    }
}

// --------------------------------------------------
// Mouse Interaction
// --------------------------------------------------

let canvasMousePosition = { x: 0, y: 0 };
let x1 = 300, y1 = 300, x2 = 300, y2 = 300, x3 = 300, y3 = 300;
let counter = 0;

// Função para retas!
function mouseClickRetas(e) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    getMousePosition(e);

    if (counter % 2 === 0) {
        // update the first point
        x1 = canvasMousePosition.x;
        y1 = canvasMousePosition.y;
        Bresenham(
            x1, 
            y1, 
            x2, 
            y2,
            defaultColor[0], 
            defaultColor[1], 
            defaultColor[2], 
            defaultPointSize 
        );
    } else {
        // update the second point
        x2 = canvasMousePosition.x;
        y2 = canvasMousePosition.y;
        Bresenham(
            x1, 
            y1, 
            x2,
            y2,
            defaultColor[0], 
            defaultColor[1], 
            defaultColor[2], 
            defaultPointSize 
        );
    }

    counter++;
}

canvas.addEventListener('mousedown', mouseClickRetas);

// Função para triangulos!
function mouseClickTriangulos(e) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    getMousePosition(e);

    if (counter % 3 === 0) {
        // update the first point
        x1 = canvasMousePosition.x;
        y1 = canvasMousePosition.y;
        drawTriangle(
            x1, 
            y1,
            x2, 
            y2,
            x3, 
            y3,
            defaultColor[0], 
            defaultColor[1], 
            defaultColor[2], 
            defaultPointSize 
        );
    } else if (counter % 3 === 1) {
        // update the second point
        x2 = canvasMousePosition.x;
        y2 = canvasMousePosition.y;
        drawTriangle(
            x1, 
            y1,
            x2, 
            y2,
            x3, 
            y3,
            defaultColor[0], 
            defaultColor[1], 
            defaultColor[2], 
            defaultPointSize 
        );
    } else {
        // update the third point
        x3 = canvasMousePosition.x;
        y3 = canvasMousePosition.y;
        drawTriangle(
            x1, 
            y1,
            x2,
            y2,
            x3, 
            y3,
            defaultColor[0], 
            defaultColor[1], 
            defaultColor[2], 
            defaultPointSize 
        );
    }

    counter++;
}

// --------------------------------------------------
// Keyboard Interaction
// --------------------------------------------------

let mode = 'r'; // Default mode is 'retas'

function handleKeyPress(e) {
    if (e.key === 'r' || e.key === 'R') {
        // Mode 'retas'
        mode = 'r';
        canvas.removeEventListener('mousedown', mouseClickTriangulos);
        canvas.addEventListener('mousedown', mouseClickRetas);
    }
    else if (e.key === 't' || e.key === 'T') {
        // Mode 'triangulos'
        mode = 't';
        canvas.removeEventListener('mousedown', mouseClickRetas);
        canvas.addEventListener('mousedown', mouseClickTriangulos);
    }
    else if(e.key === 'ArrowUp') {
        // Increase point size
        defaultPointSize += 1.0;
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (mode === 'r') {
            Bresenham(
                x1, 
                y1, 
                x2, 
                y2,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        } else {
            drawTriangle(
                x1, 
                y1,
                x2, 
                y2,
                x3, 
                y3,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        }
    }
    else if(e.key === 'ArrowDown') {
        // Decrease point size
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (defaultPointSize > 1.0) {
            defaultPointSize -= 1.0;
        }
        if (mode === 'r') {
            Bresenham(
                x1, 
                y1, 
                x2, 
                y2,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        } else {
            drawTriangle(
                x1,
                y1,
                x2, 
                y2,
                x3, 
                y3,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        }
    }
    else if (e.key === '1')  {
        // Change color to red
        gl.clear(gl.COLOR_BUFFER_BIT);
        defaultColor = [1.0, 0.0, 0.0];
        if (mode === 'r') {
            Bresenham(
                x1, 
                y1, 
                x2, 
                y2,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        } else {
            drawTriangle(
                x1, 
                y1,
                x2, 
                y2,
                x3, 
                y3,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        }
    } 
    else if (e.key === '2') {
        // Change color to green
        gl.clear(gl.COLOR_BUFFER_BIT);
        defaultColor = [0.0, 1.0, 0.0];
        if (mode === 'r') {
            Bresenham(
                x1, 
                y1, 
                x2, 
                y2,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        } else {
            drawTriangle(
                x1, 
                y1,
                x2, 
                y2,
                x3, 
                y3,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        }
    }
    else if (e.key === '3') {
        // Change color to blue
        gl.clear(gl.COLOR_BUFFER_BIT);
        defaultColor = [0.0, 0.0, 1.0];
        if (mode === 'r') {
            Bresenham(
                x1, 
                y1, 
                x2, 
                y2,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        } else {
            drawTriangle(
                x1, 
                y1,
                x2, 
                y2,
                x3, 
                y3,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        }
    }
    else if (e.key === '4') {
        // Change color to yellow
        gl.clear(gl.COLOR_BUFFER_BIT);
        defaultColor = [1.0, 1.0, 0.0];
        if (mode === 'r') {
            Bresenham(
                x1, 
                y1, 
                x2, 
                y2,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        } else {
            drawTriangle(
                x1, 
                y1,
                x2, 
                y2,
                x3, 
                y3,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        }
    }
    else if (e.key === '5') {
        // Change color to magenta
        gl.clear(gl.COLOR_BUFFER_BIT);
        defaultColor = [1.0, 0.0, 1.0];
        if (mode === 'r') {
            Bresenham(
                x1, 
                y1, 
                x2, 
                y2,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        } else {
            drawTriangle(
                x1, 
                y1,
                x2, 
                y2,
                x3, 
                y3,
                defaultColor[0], 
                defaultColor[1], 
                defaultColor[2], 
                defaultPointSize 
            );
        }
    }
}

window.addEventListener('keydown', handleKeyPress);

// --------------------------------------------------
// CLEAR CANVAS
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DRAW
// --------------------------------------------------

function drawScene(pointCount = vertices.length / 2) {
    gl.useProgram(program);
    gl.drawArrays(
        gl.POINTS,
        0,
        pointCount
    );
}

drawScene();