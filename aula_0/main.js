const flowerCanvas = document.getElementById("flower-canvas");
const flowerGl = flowerCanvas.getContext("webgl2");

const robotCanvas = document.getElementById("robot-canvas");
const robotGl = robotCanvas.getContext("webgl2");

const carCanvas = document.getElementById("car-canvas");
const carGl = carCanvas.getContext("webgl2");

if (!flowerGl || !robotGl || !carGl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES
// --------------------------------------------------

// -------------------------------------------------- 
// Flower
// -------------------------------------------------
function flowerVertices(center_x = 0.0, center_y = 0.0, radius = 0.4, numPetals = 6, numSides = 40) {
    const vertices = [];

    // Center point of the pentagon
    vertices.push(center_x, center_y);

    // Calculate pentagon vertices
    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = center_x + radius * Math.cos(angle);
        const y = center_y + radius * Math.sin(angle);
        vertices.push(x, y);
    }

    // Calculate petal vertices
    for (let i = 0; i < numPetals; i++) {
        const angle = i * 2 * Math.PI / numPetals;
        const petal_center_x = center_x + radius * Math.cos(angle);
        const petal_center_y = center_y + radius * Math.sin(angle);
        vertices.push(petal_center_x, petal_center_y);
        for (let j = 0; j <= numSides; j++) {
            const petalRadius = radius * 0.5;
            const angle = j * 2 * Math.PI / numSides;
            const x = petal_center_x + petalRadius * Math.cos(angle);
            const y = petal_center_y + petalRadius * Math.sin(angle);
            vertices.push(x, y);
        }
    }

    return new Float32Array(vertices);
}

flowerVertices = flowerVertices();

// -------------------------------------------------- 
// Robot
// -------------------------------------------------
robotVertices = [
    // Head
    -0.7, 1.0,
    0.7, 1.0,
    0.7, 0.4,
    -0.7, 1.0,
    0.7, 0.4,
    -0.7, 0.4,
    // Neck
    -0.1, 0.4,
    0.1, 0.4,
    0.1, 0.2,
    -0.1, 0.4,
    0.1, 0.2,
    -0.1, 0.2,
    // Body
    -0.5, 0.2,
    0.5, 0.2,
    0.5, -0.6,
    -0.5, 0.2,
    0.5, -0.6,
    -0.5, -0.6,
    // Arms
    -0.65, 0.1,
    -0.5, 0.1,
    -0.5, -0.7,
    -0.65, 0.1,
    -0.5, -0.7,
    -0.65, -0.7,
    0.65, 0.1,
    0.5, 0.1,
    0.5, -0.7,
    0.65, 0.1,
    0.5, -0.7,
    0.65, -0.7,
    // Legs
    -0.25, -0.6,
    -0.1, -0.6,
    -0.1, -0.9,
    -0.25, -0.6,
    -0.1, -0.9,
    -0.25, -0.9,
    0.25, -0.6,
    0.1, -0.6,
    0.1, -0.9,
    0.25, -0.6,
    0.1, -0.9,
    0.25, -0.9,
    // Feet
    -0.4, -0.9,
    -0.1, -0.9,
    -0.1, -1.0,
    -0.4, -0.9,
    -0.1, -1.0,
    -0.4, -1.0,
    0.4, -0.9,
    0.1, -0.9,
    0.1, -1.0,
    0.4, -0.9,
    0.1, -1.0,
    0.4, -1.0
];

// --------------------------------------------------
// Car
// --------------------------------------------------
function rectangleVertices(x, y, width, height) {
    let rec_vertices = [
        x, y,
        x + width, y,
        x + width, y - height,
        x, y,
        x + width, y - height,
        x, y - height
    ]

    return rec_vertices;
}

function circleVertices(center_x, center_y, radius, numSides) {
    let circle_vertices = [center_x, center_y];

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = center_x + radius * Math.cos(angle);
        const y = center_y + radius * Math.sin(angle);
        circle_vertices.push(x, y);
    }

    return circle_vertices;
}

carVertices = [];

carVertices.push(...rectangleVertices(-0.4, 0.2, 0.8, 0.3)); // Body
carVertices.push(...rectangleVertices(-0.7, 0.05, 0.3, 0.15)); // Front body
carVertices.push(...rectangleVertices(0.4, 0.1, 0.2, 0.2)); // Back body
carVertices.push(...circleVertices(-0.4, -0.1, 0.1, 40)); // Front wheel
carVertices.push(...circleVertices(0.4, -0.1, 0.1, 40)); // Back wheel

// --------------------------------------------------
// BUFFERS
// --------------------------------------------------

const flowerBuffer = flowerGl.createBuffer();
flowerGl.bindBuffer(flowerGl.ARRAY_BUFFER, flowerBuffer);

const robotBuffer = robotGl.createBuffer();
robotGl.bindBuffer(robotGl.ARRAY_BUFFER, robotBuffer);

const carBuffer = carGl.createBuffer();
carGl.bindBuffer(carGl.ARRAY_BUFFER, carBuffer);

flowerGl.bufferData(flowerGl.ARRAY_BUFFER, new Float32Array(flowerVertices), flowerGl.STATIC_DRAW);
robotGl.bufferData(robotGl.ARRAY_BUFFER, new Float32Array(robotVertices), robotGl.STATIC_DRAW);
carGl.bufferData(carGl.ARRAY_BUFFER, new Float32Array(carVertices), carGl.STATIC_DRAW);

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

`;

// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

out vec4 outColor;

void main() {
    outColor = vec4(1.0, 0.0, 0.0, 1.0);
}

`;

// --------------------------------------------------
// COMPILAR SHADERS
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

// Flower
const flowerVertexShader = createShader(
    flowerGl,
    flowerGl.VERTEX_SHADER,
    vertexShaderSource
);

const flowerFragmentShader = createShader(
    flowerGl,
    flowerGl.FRAGMENT_SHADER,
    fragmentShaderSource
);

// Robot
const robotVertexShader = createShader(
    robotGl,
    robotGl.VERTEX_SHADER,
    vertexShaderSource
);

const robotFragmentShader = createShader(
    robotGl,
    robotGl.FRAGMENT_SHADER,
    fragmentShaderSource
);

// Car
const carVertexShader = createShader(
    carGl,
    carGl.VERTEX_SHADER,
    vertexShaderSource
);

const carFragmentShader = createShader(
    carGl,
    carGl.FRAGMENT_SHADER,
    fragmentShaderSource
);

// --------------------------------------------------
// CRIAR PROGRAMA
// --------------------------------------------------

// Flower
const flowerProgram = flowerGl.createProgram();

flowerGl.attachShader(flowerProgram, flowerVertexShader);
flowerGl.attachShader(flowerProgram, flowerFragmentShader);

flowerGl.linkProgram(flowerProgram);

if (!flowerGl.getProgramParameter(flowerProgram, flowerGl.LINK_STATUS)) {

    throw new Error(
        flowerGl.getProgramInfoLog(flowerProgram)
    );
}

// Robot
const robotProgram = robotGl.createProgram();

robotGl.attachShader(robotProgram, robotVertexShader);
robotGl.attachShader(robotProgram, robotFragmentShader);

robotGl.linkProgram(robotProgram);

if (!robotGl.getProgramParameter(robotProgram, robotGl.LINK_STATUS)) {

    throw new Error(
        robotGl.getProgramInfoLog(robotProgram)
    );
}

// Car
const carProgram = carGl.createProgram();

carGl.attachShader(carProgram, carVertexShader);
carGl.attachShader(carProgram, carFragmentShader);

carGl.linkProgram(carProgram);

if (!carGl.getProgramParameter(carProgram, carGl.LINK_STATUS)) {

    throw new Error(
        carGl.getProgramInfoLog(carProgram)
    );
}

// --------------------------------------------------
// VERTEX ARRAY OBJECT (VAO)
// --------------------------------------------------

const flowerPostionLocation = flowerGl.getAttribLocation(flowerProgram, "aPosition");
const robotPostionLocation = robotGl.getAttribLocation(robotProgram, "aPosition");
const carPostionLocation = carGl.getAttribLocation(carProgram, "aPosition");

var flowerVao = flowerGl.createVertexArray();
var robotVao = robotGl.createVertexArray();
var carVao = carGl.createVertexArray();

flowerGl.bindVertexArray(flowerVao);
flowerGl.enableVertexAttribArray(flowerPostionLocation);

flowerGl.vertexAttribPointer(
    flowerPostionLocation,
    2,
    flowerGl.FLOAT,
    false,
    0,
    0
);

robotGl.bindVertexArray(robotVao);
robotGl.enableVertexAttribArray(robotPostionLocation);

robotGl.vertexAttribPointer(
    robotPostionLocation,
    2,
    robotGl.FLOAT,
    false,
    0,
    0
);

carGl.bindVertexArray(carVao);
carGl.enableVertexAttribArray(carPostionLocation);

carGl.vertexAttribPointer(
    carPostionLocation,
    2,
    carGl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

flowerGl.clearColor(0.1, 0.1, 0.1, 1.0);
flowerGl.clear(flowerGl.COLOR_BUFFER_BIT);

robotGl.clearColor(0.1, 0.1, 0.1, 1.0);
robotGl.clear(robotGl.COLOR_BUFFER_BIT);

carGl.clearColor(0.1, 0.1, 0.1, 1.0);
carGl.clear(carGl.COLOR_BUFFER_BIT);

// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

// Flower
flowerGl.useProgram(flowerProgram);
for (let i = 0; i < 7; i++) {
    flowerGl.drawArrays(
        flowerGl.TRIANGLE_FAN,
        42 * i,
        42
    );
}

// Robot
robotGl.useProgram(robotProgram);
robotGl.drawArrays(robotGl.TRIANGLES, 0, robotVertices.length / 2);

// Car
carGl.useProgram(carProgram);
carGl.drawArrays(carGl.TRIANGLES, 0, 18);
carGl.drawArrays(carGl.TRIANGLE_FAN, 18, 42);
carGl.drawArrays(carGl.TRIANGLE_FAN, 60, 42);