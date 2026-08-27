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

vertices = new Float32Array([
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
])

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

gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

