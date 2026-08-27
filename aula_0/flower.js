// Atividade: Desenhar uma flor, um robô e um carro.

// Setting up canvas
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES
// --------------------------------------------------

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

vertices = flowerVertices();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

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
// CRIAR PROGRAMA
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
// VERTEX ARRAY OBJECT (VAO)
// --------------------------------------------------

const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");

var vao = gl.createVertexArray();

gl.bindVertexArray(vao);

gl.enableVertexAttribArray(positionAttributeLocation);

gl.vertexAttribPointer(
    positionAttributeLocation,
    2,          // tamanho (número de componentes por vértice)
    gl.FLOAT,   // tipo
    false,      // normalizado
    0,          // stride (espaçamento entre vértices)
    0           // offset (deslocamento do primeiro vértice no buffer)
)

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

gl.useProgram(program);

for (let i = 0; i < 7; i++) {
    gl.drawArrays(
        gl.TRIANGLE_FAN,
        42 * i,
        42
    );
}

