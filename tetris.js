const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const rows = 20;
const cols = 10;
const blockSize = 30;
const colors = {
    'I': '#00f0f0',
    'J': '#0000f0',
    'L': '#f0a000',
    'O': '#f0f000',
    'S': '#00f000',
    'T': '#a000f0',
    'Z': '#f00000'
};

let board = Array.from({ length: rows }, () => Array(cols).fill(''));
let score = 0;
let piece = null;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const tetrominoes = {
    'I': [[1,1,1,1]],
    'J': [[1,0,0],[1,1,1]],
    'L': [[0,0,1],[1,1,1]],
    'O': [[1,1],[1,1]],
    'S': [[0,1,1],[1,1,0]],
    'T': [[0,1,0],[1,1,1]],
    'Z': [[1,1,0],[0,1,1]]
};

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize-1, blockSize-1);
}

function drawBoard() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = board[y][x];
            if (cell) drawCell(x, y, colors[cell]);
        }
    }
}

function merge(piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[y + piece.pos.y][x + piece.pos.x] = piece.type;
            }
        });
    });
}

function collide(board, piece) {
    for (let y = 0; y < piece.shape.length; ++y) {
        for (let x = 0; x < piece.shape[y].length; ++x) {
            if (piece.shape[y][x] &&
                (board[y + piece.pos.y] &&
                 board[y + piece.pos.y][x + piece.pos.x]) !== '') {
                return true;
            }
        }
    }
    return false;
}

function rotate(matrix) {
    const N = matrix.length;
    return matrix.map((_, i) => matrix.map(row => row[i])).map(row => row.reverse());
}

function playerReset() {
    const types = 'IJLOSTZ';
    const type = types[Math.floor(Math.random() * types.length)];
    piece = {
        pos: {x: Math.floor(cols/2) - 1, y: 0},
        shape: tetrominoes[type].map(row => [...row]),
        type: type
    };
    if (collide(board, piece)) {
        board = Array.from({ length: rows }, () => Array(cols).fill(''));
        score = 0;
        updateScore();
        alert('Koniec gry!');
    }
}

function clearLines() {
    outer: for (let y = rows -1; y >= 0; --y) {
        for (let x = 0; x < cols; ++x) {
            if (board[y][x] === '') {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill('');
        board.unshift(row);
        ++score;
        ++y;
    }
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        piece.pos.y++;
        if (collide(board, piece)) {
            piece.pos.y--;
            merge(piece);
            clearLines();
            playerReset();
            updateScore();
        }
        dropCounter = 0;
    }
    draw();
    requestAnimationFrame(update);
}

function draw() {
    drawBoard();
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) drawCell(x + piece.pos.x, y + piece.pos.y, colors[piece.type]);
        });
    });
}

function updateScore() {
    document.getElementById('scoreValue').innerText = score;
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        piece.pos.x--;
        if (collide(board, piece)) piece.pos.x++;
    } else if (e.key === 'ArrowRight') {
        piece.pos.x++;
        if (collide(board, piece)) piece.pos.x--;
    } else if (e.key === 'ArrowDown') {
        piece.pos.y++;
        if (collide(board, piece)) {
            piece.pos.y--;
        }
    } else if (e.key === 'ArrowUp') {
        const rotated = rotate(piece.shape);
        const pos = piece.pos.x;
        let offset = 1;
        piece.shape = rotated;
        while (collide(board, piece)) {
            piece.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > piece.shape[0].length) {
                piece.shape = rotate(rotate(rotate(piece.shape)));
                piece.pos.x = pos;
                return;
            }
        }
    }
});

playerReset();
updateScore();
update();
