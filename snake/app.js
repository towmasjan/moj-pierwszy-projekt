const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let score = 0;
let direction = 'right';
let changingDirection = false;
let gameOver = false;

function main() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText('Game Over', canvas.width / 4, canvas.height / 2);
        return;
    }

    changingDirection = false;
    setTimeout(function onTick() {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        main();
    }, 100);
}

function clearCanvas() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#a8c0ff');
    gradient.addColorStop(1, '#3f2b96');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawSnakePart(snakePart, index) {
    const x = snakePart.x * gridSize;
    const y = snakePart.y * gridSize;
    const radius = gridSize / 2;

    // Head
    if (index === 0) {
        const gradient = ctx.createRadialGradient(x + radius, y + radius, radius / 2, x + radius, y + radius, radius);
        gradient.addColorStop(0, '#81F781');
        gradient.addColorStop(1, '#088A08');
        ctx.fillStyle = gradient;
    }
    // Body
    else {
        const gradient = ctx.createRadialGradient(x + radius, y + radius, radius / 4, x + radius, y + radius, radius);
        gradient.addColorStop(0, '#9AFE2E');
        gradient.addColorStop(1, '#04B404');
        ctx.fillStyle = gradient;
    }

    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }

    if (didGameEnd(head)) {
        gameOver = true;
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        createFood();
    } else {
        snake.pop();
    }
}

function didGameEnd(head) {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x > (canvas.width / gridSize) - 1;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y > (canvas.height / gridSize) - 1;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function createFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize));
    food.y = Math.floor(Math.random() * (canvas.height / gridSize));
    snake.forEach(function isFoodOnSnake(part) {
        if (part.x === food.x && part.y === food.y) {
            createFood();
        }
    });
}

function drawFood() {
    const x = food.x * gridSize;
    const y = food.y * gridSize;
    const radius = gridSize / 2;

    const gradient = ctx.createRadialGradient(x + radius, y + radius, radius / 3, x + radius, y + radius, radius);
    gradient.addColorStop(0, '#FF8A8A');
    gradient.addColorStop(1, '#FF0000');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Add a little shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x + radius - 3, y + radius - 3, radius / 4, 0, 2 * Math.PI);
    ctx.fill();
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingRight = direction === 'right';
    const goingLeft = direction === 'left';

    if (keyPressed === LEFT_KEY && !goingRight) {
        direction = 'left';
    }
    if (keyPressed === UP_KEY && !goingDown) {
        direction = 'up';
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        direction = 'right';
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        direction = 'down';
    }
}

document.addEventListener('keydown', changeDirection);
createFood();
main();
