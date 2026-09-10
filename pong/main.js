const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();

let corBarraDireita = new Float32Array([
    0.29, 0.66, 1.0,
]);

let verticesBarraEsquerda = verticesBarra();

let corBarraEsquerda = new Float32Array([
    0.21, 0.88, 0.54,
]);

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([
    1.0, 0.32, 0.32,
]);

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);

let MbarraDireita = m3.translation(0.9, 0.0);

let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_transform;

out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
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
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );

const transformLocation =
    gl.getUniformLocation(
        program,
        "u_transform"
    );

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0, 0, 0, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

const numComponents = 2;

function drawScene(){

    if (gameState === "playing") {
        atualizaAnimacao();
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraEsquerda,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarraEsquerda
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraEsquerda
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraEsquerda.length / numComponents
    );

}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraDireita,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarraDireita
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraDireita
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraDireita.length / numComponents
    );

}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBolaCentro,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBolaCentro
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbolaCentro
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBolaCentro.length / numComponents
    );

}

// --------------------------------------------------
// ESTADO DO JOGO
// --------------------------------------------------
 
const WINNING_SCORE = 5;
 
let gameState = "start"; // "start" | "playing" | "gameover"
let scoreBE = 0; // pontuação do jogador esquerdo (ponto quando a bola passa pela direita)
let scoreBD = 0; // pontuação do jogador direito (ponto quando a bola passa pela esquerda)
 
const scoreLeftEl = document.getElementById("scoreLeft");
const scoreRightEl = document.getElementById("scoreRight");
const startScreenEl = document.getElementById("startScreen");
const gameOverScreenEl = document.getElementById("gameOverScreen");
const winnerTextEl = document.getElementById("winnerText");
 
function updateScoreDisplay(){
    scoreLeftEl.textContent = scoreBE;
    scoreRightEl.textContent = scoreBD;
}
 
function resetBall(directionTowards){
    txBola = 0.0;
    tyBola = 0.0;
 
    // serve towards whoever just conceded the point; random-ish vertical angle
    txBola_offset = directionTowards === "left" ? -Math.abs(txBola_offset) : Math.abs(txBola_offset);
    tyBola_offset = (Math.random() < 0.5 ? -1 : 1) * Math.abs(tyBola_offset);
}
 
function resetMatch(){
    scoreBE = 0;
    scoreBD = 0;
    tyBE = 0.0;
    tyBD = 0.0;
    updateScoreDisplay();
    resetBall(Math.random() < 0.5 ? "left" : "right");
}
 
function startGame(){
    resetMatch();
    startScreenEl.classList.add("hidden");
    gameOverScreenEl.classList.add("hidden");
    gameState = "playing";
}
 
function endGame(winnerLabel){
    gameState = "gameover";
    winnerTextEl.textContent = winnerLabel + " wins";
    gameOverScreenEl.classList.remove("hidden");
}
 
function checkForWinner(){
    if (scoreBE >= WINNING_SCORE) {
        endGame("Left player");
    } else if (scoreBD >= WINNING_SCORE) {
        endGame("Right player");
    }
}

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO
// --------------------------------------------------

let isMovingUp_BE = false;
let isMovingDown_BE = false;
let isMovingUp_BD = false;
let isMovingDown_BD = false;
let tyBE = 0.0;
let tyBD = 0.0;
let tyBE_offset = 0.02;
let tyBD_offset = 0.02;
let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.01;
let tyBola_offset = 0.01;
// handles collision
let closestX, closestY, edgeLeft, edgeRight, edgeBottom, edgeTop;

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function checkPaddleCollision(
    ballX, 
    ballY, 
    radius = 0.05, 
    paddleX, 
    paddleY, 
    halfWidth = 0.05, 
    halfHeight = 0.2
    ) {
    edgeLeft = paddleX - halfWidth;
    edgeRight = paddleX + halfWidth;
    edgeTop = paddleY + halfHeight;
    edgeBottom = paddleY - halfHeight;

    closestX = clamp(ballX, edgeLeft, edgeRight);
    closestY = clamp(ballY, edgeBottom, edgeTop);

    let dx = ballX - closestX;
    let dy = ballY - closestY;
    let distanceSquared = dx*dx + dy*dy;

    return distanceSquared < radius*radius;
}

function atualizaAnimacao(){
    // Handle Paddle Movement

    if (isMovingUp_BE && tyBE + tyBE_offset <= 0.8) {
        tyBE += tyBE_offset;
    }

    if (isMovingDown_BE && tyBE - tyBE_offset >= -0.8) {
        tyBE -= tyBE_offset;
    }

    if (isMovingUp_BD && tyBD + tyBD_offset <= 0.8) {
        tyBD += tyBD_offset;
    }

    if (isMovingDown_BD && tyBD - tyBD_offset >= -0.8) {
        tyBD -= tyBD_offset;
    }

    // Handle Ball Movement
    txBola += txBola_offset;
    tyBola += tyBola_offset;

    // Paddle Collision - Right Paddle

    if (checkPaddleCollision(txBola, tyBola, 0.05, 0.9, tyBD, 0.05, 0.2)) {
        txBola_offset = -txBola_offset
        txBola = edgeLeft - 0.05 - 0.001 // prevents jittering
        if (closestY == edgeTop) {
            tyBola_offset = -tyBola_offset;
        } else if (closestY == edgeBottom) {
            tyBola_offset = -tyBola_offset;
        }
    }

    // Paddle Collision - Left Paddle

    if (checkPaddleCollision(txBola, tyBola, 0.05, -0.9, tyBE, 0.05, 0.2)) {
        txBola_offset = -txBola_offset
        txBola = edgeRight + 0.05 + 0.001 // prevents jittering
        if (closestY == edgeTop) {
            tyBola_offset = -tyBola_offset;
            tyBola = edgeTop + 0.05 + 0.001;
        } else if (closestY == edgeBottom) {
            tyBola_offset = -tyBola_offset;
            tyBola = edgeBottom - 0.05 - 0.001;
        }
    }

    // Wall Collision
    // ---- Back wall (scoring)
    if (txBola - 0.05 < -0.9) {
        // ball got past the left paddle -> right player scores
        scoreBD += 1;
        updateScoreDisplay();
        checkForWinner();
        if (gameState === "playing") resetBall("left");
    } else if (txBola + 0.05 > 0.9) {
        // ball got past the right paddle -> left player scores
        scoreBE += 1;
        updateScoreDisplay();
        checkForWinner();
        if (gameState === "playing") resetBall("right");
    }
    
    // ---- Side wall
    if(tyBola + 0.05 > 1.0 || tyBola - 0.05 < -1.0)
        tyBola_offset = -tyBola_offset;

    // Update transformation matrixes
    MbolaCentro = m3.translation(txBola,tyBola);
    MbarraEsquerda = m3.translation(-0.9, tyBE);
    MbarraDireita = m3.translation(0.9, tyBD);
}

// --------------------------------------------------
// EVENTOS DE TECLADO
// --------------------------------------------------

document.addEventListener("keydown", function(event) {
    if (event.key === " ") {
        event.preventDefault();
        if (gameState === "start" || gameState === "gameover") {
            startGame();
        }
        return;
    }

    switch(event.key) {
        case "w":
            isMovingUp_BE = true;
            break;
        case "s":
            isMovingDown_BE = true;
            break;
        case "ArrowUp":
            isMovingUp_BD = true;
            break;
        case "ArrowDown":
            isMovingDown_BD = true;
            break;
    }
});

document.addEventListener("keyup", function(event) {
    switch(event.key) {
        case "w":
            isMovingUp_BE = false;
            break;
        case "s":
            isMovingDown_BE = false;
            break;
        case "ArrowUp":
            isMovingUp_BD = false;
            break;
        case "ArrowDown":
            isMovingDown_BD = false;
            break;
    }
});


// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------

updateScoreDisplay();
drawScene();