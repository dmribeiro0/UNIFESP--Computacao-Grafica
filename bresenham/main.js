const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

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

function drawPoints(r = 1.0, g = 0.0, b = 0.0, size = 10.0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );

    colors = [];
    for (let i = 0; i < vertices.length / 2; i++) {
        colors.push(r, g, b);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW
    );

    pointSizes = [];
    for (let i = 0; i < vertices.length / 2; i++) {
        pointSizes.push(size); // Point size
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(pointSizes),
        gl.STATIC_DRAW
    );

    drawScene();
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

    let points = [];

    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);

    let sx = (x1 < x2) ? 1 : -1; // step direction on x (handles right-to-left)
    let sy = (y1 < y2) ? 1 : -1; // step direction on y (handles up/down)

    let err = dx - dy; // combined decision variable (replaces p/incInf/incSup)

    let x = x1;
    let y = y1;

    while (true) {
        let [webglX, webglY] = convertCoordinatesToWebGl2(x, y);
        points.push(webglX, webglY);

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

    return new Float32Array(points);
}

// --------------------------------------------------
// Mouse Interaction
// --------------------------------------------------

let canvasMousePosition = { x: 0, y: 0 };
let counter = 0;

function mouseClickRetas(e) {
    getMousePosition(e);
    let [webglX, webglY] = convertCoordinatesToWebGl2(
        canvasMousePosition.x,
        canvasMousePosition.y
    )

    if (counter % 2 === 0) {
        // update the first point
        vertices = new Float32Array([
            webglX, webglY,
            vertices[vertices.length - 2], vertices[vertices.length - 1]
        ]);
    } else {
        // update the second point
        vertices = new Float32Array([
            vertices[0], vertices[1],
            webglX, webglY
        ]);
    }

    // Calculate points in between the two points using the Bresenham's line algorithm
    let [x1, y1] = convertCoordinatesToCanvas(vertices[0], vertices[1]);
    let [x2, y2] = convertCoordinatesToCanvas(vertices[2], vertices[3]);
    vertices = Bresenham(
        x1, y1,
        x2, y2
    );

    drawPoints(defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);

    counter++;
}

canvas.addEventListener('mousedown', mouseClickRetas);

function mouseClickTriangulos(e) {
    getMousePosition(e);
    let [webglX, webglY] = convertCoordinatesToWebGl2(
        canvasMousePosition.x,
        canvasMousePosition.y
    );
}

// --------------------------------------------------
// Keyboard Interaction
// --------------------------------------------------

function handleKeyPress(e) {
    if (e.key === 'r' || e.key === 'R') {
        // Mode 'retas'
        canvas.removeEventListener('mousedown', mouseClickTriangulos);
        canvas.addEventListener('mousedown', mouseClickRetas);
    }
    else if (e.key === 't' || e.key === 'T') {
        // Mode 'triangulos'
        canvas.removeEventListener('mousedown', mouseClickRetas);
        canvas.addEventListener('mousedown', mouseClickTriangulos);
    }
    else if(e.key === 'ArrowUp') {
        // Increase point size
        defaultPointSize += 1.0;
        drawPoints(defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);
    }
    else if(e.key === 'ArrowDown') {
        // Decrease point size
        if (defaultPointSize > 1.0) {
            defaultPointSize -= 1.0;
        }
        drawPoints(defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);
    }
    else if (e.key === '1')  {
        // Change color to red
        defaultColor = [1.0, 0.0, 0.0];
        drawPoints(defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);
    } 
    else if (e.key === '2') {
        // Change color to green
        defaultColor = [0.0, 1.0, 0.0];
        drawPoints(defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);
    }
    else if (e.key === '3') {
        // Change color to blue
        defaultColor = [0.0, 0.0, 1.0];
        drawPoints(defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);
    }
    else if (e.key === '4') {
        // Change color to yellow
        defaultColor = [1.0, 1.0, 0.0];
        drawPoints(defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);
    }
    else if (e.key === '5') {
        // Change color to magenta
        defaultColor = [1.0, 0.0, 1.0];
        drawPoints(defaultColor[0], defaultColor[1], defaultColor[2], defaultPointSize);
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

function drawScene(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.drawArrays(
        gl.POINTS,
        0,
        vertices.length / 2
    );
}

drawScene();