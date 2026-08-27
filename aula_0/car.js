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

vertices = [];

vertices.push(...rectangleVertices(-0.4, 0.2, 0.8, 0.3)); // Body
vertices.push(...rectangleVertices(-0.7, 0.05, 0.3, 0.15)); // Front body
vertices.push(...rectangleVertices(0.4, 0.1, 0.2, 0.2)); // Back body
vertices.push(...circleVertices(-0.4, -0.1, 0.1, 40)); // Front wheel
vertices.push(...circleVertices(0.4, -0.1, 0.1, 40)); // Back wheel

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

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

gl.drawArrays(gl.TRIANGLES, 0, 18);
gl.drawArrays(gl.TRIANGLE_FAN, 18, 42);
gl.drawArrays(gl.TRIANGLE_FAN, 60, 42);

