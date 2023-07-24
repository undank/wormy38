// Canvas and context
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// Image sources
var imageSources = ['images/kfc.png', 'images/subway.png', 'images/kebab.png', 'images/burger.png', 'images/chips.png', 'images/cider.png'];
var snakeHead = loadImage('images/snake.png');
var snakeColor = '#80b263';
var wormHead = loadImage('images/worm.png');
var wormColor = '#DEB598';

// Game variables
var cellSize = 40,
    direction = 'right',
    speed = 80;
var frameCount = 0;
var snake = [{
        x: cellSize,
        y: cellSize
    }],
    food = null;
var game, highScore = 0,
    score = 0,
    gameOver = false,
    foodSpawn;
var food = [];
// Images
var foodImages = imageSources.map(loadImage);

var gameStarted = false;
var isSnake = false;

//sounds
var gameOverSounds = ['sounds/gameOverCook.mp3', 'sounds/gameOverEighty.mp3', 'sounds/gameOverEveryday.mp3'];
var thankSounds = ['sounds/thanks1.ogg', 'sounds/thanks2.ogg','sounds/thanks3.ogg',];
var foodSounds = ['sounds/bite1.ogg', 'sounds/bite2.ogg', 'sounds/bite3.ogg'];
let isMuted = false;

// Event listeners
document.getElementById('snakeButton').addEventListener('click', toggleSnakeWorm);
window.addEventListener('keydown', setDirection);
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('muteButton').addEventListener('click', function() {
    isMuted = !isMuted;
    this.textContent = isMuted ? 'Unmute' : 'Mute';
});


function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

var directionChangedInCurrentTick = false;
var directionQueue = [];
var lastDirection = 'null';

function startGame() {
    clearTimeout(game);
    lastDirection = 'null';
    food = [];
    spawnFood();
    foodSpawn = setInterval(spawnFood, 8000);
    gameOver = false;
    gameStarted = false;
    ['startButton', 'title', 'sub'].forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById('myCanvas').style.display = 'block';
    direction = 'right';
    // Generate a random position on the canvas, but make sure it's not at the edges
    let randomX = Math.floor(Math.random() * (canvas.width / cellSize - 2)) * cellSize + cellSize;
    let randomY = Math.floor(Math.random() * (canvas.height / cellSize - 2)) * cellSize + cellSize;

    // Initialize the snake at the random position
    snake = [{
        x: randomX,
        y: randomY
    }];
    score = 0;
    speed = 80;
    gameLoop(); // start game loop
    snakeUpdateInterval = setInterval(update, speed);
	var randomThankSoundIndex = Math.floor(Math.random() * thankSounds.length);
	playSound(thankSounds[randomThankSoundIndex]);
}

function setDirection(e) {
    var keyToDirection = {
        'ArrowUp': 'up',
        'w': 'up',
        'ArrowDown': 'down',
        's': 'down',
        'ArrowLeft': 'left',
        'a': 'left',
        'ArrowRight': 'right',
        'd': 'right'
    };

    var newDirection = keyToDirection[e.key];
    var oppositeDir = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
    }[lastDirection];

    if (newDirection && newDirection !== oppositeDir) {
        direction = newDirection;
        gameStarted = true;
    }
}

function gameLoop() {
    directionQueue = [];
    draw();
    requestAnimationFrame(gameLoop);
}

function spawnFood() {
    while (true) {
        let potentialFood = {
            x: Math.floor(Math.random() * (canvas.width / cellSize - 1)) * cellSize,
            y: Math.floor(Math.random() * (canvas.height / cellSize - 1)) * cellSize,
            img: foodImages[Math.floor(Math.random() * foodImages.length)], // Random image from foodImages
            timeout: null
        };

        let overlapsWithSnake = snake.some(cell => cell.x === potentialFood.x && cell.y === potentialFood.y);
        let overlapsWithFood = food.some(item => item.x === potentialFood.x && item.y === potentialFood.y);

        if (!overlapsWithSnake && !overlapsWithFood) {
            potentialFood.timeout = setTimeout(function() { // Add new food and set timeout to remove it after 8 seconds
                let index = food.indexOf(potentialFood);
                if (index !== -1) {
                    food.splice(index, 1);
                }
            }, 6000);
            food.push(potentialFood);
            break;
        }
    }
}

function update() {
    if (gameOver || !gameStarted) return;
    lastDirection = direction;
    if (directionQueue.length > 0) {
        direction = directionQueue.shift();
    }

    var head = Object.assign({}, snake[0]); // update snake position
    switch (direction) {
        case 'up':
            head.y -= cellSize;
            break;
        case 'down':
            head.y += cellSize;
            break;
        case 'left':
            head.x -= cellSize;
            break;
        case 'right':
            head.x += cellSize;
            break;
    }
    snake.unshift(head);


    let foodEaten = false; // Check each food item
    for (let i = 0; i < food.length; i++) {
        if (food[i].x === head.x && food[i].y === head.y) {
            // eat food
            clearTimeout(food[i].timeout); // Clear the removal timeout
            food.splice(i, 1); // remove this food item
            score += 1; // increase score

            if (speed > 50) { // // Increase speed when score increases, with a minimum speed
                speed -= 1; // Decrease the interval time (thus increasing speed)
                clearInterval(snakeUpdateInterval); // Clear the existing interval
                snakeUpdateInterval = setInterval(update, speed); // Start a new interval with the updated speed
            }

            foodEaten = true;
            var randomFoodSoundIndex = Math.floor(Math.random() * foodSounds.length);
            playSound(foodSounds[randomFoodSoundIndex]);
            break;
        }
    }

    if (!foodEaten) { // remove tail if no food eaten
        snake.pop();
    }

    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) { // game over conditions
        stopGame();
    }

    for (var i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            stopGame();
        }
    }

    if (foodEaten) { // only spawn new food if food was eaten
        spawnFood();
    }
}

function draw() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'green';
    ctx.font = '36px arial';
    ctx.fillText('HIGHEST BILL: ' + String.fromCharCode('163') + highScore + '0.00', 10, 50);
    ctx.fillStyle = 'blue';
    ctx.fillText('JUST EAT BILL: ' + String.fromCharCode('163') + score + '0.00', 10, 90);
    ctx.fillStyle = isSnake ? snakeColor : wormColor;
    snake.slice(1).forEach(cell => ctx.fillRect(cell.x, cell.y, cellSize, cellSize));

    if (snake[0]) {
        ctx.drawImage(isSnake ? snakeHead : wormHead, snake[0].x - cellSize / 2, snake[0].y - cellSize / 2, cellSize * 2.3, cellSize * 2.3);
    }

    for (let i = 0; i < food.length; i++) {
        ctx.drawImage(food[i].img, food[i].x - cellSize / 4, food[i].y - cellSize / 4, cellSize * 1.9, cellSize * 1.9);
    }
}

function stopGame() {
    if (score > highScore) {
        highScore = score;
    }
    gameOver = true;
    var randomGameOverSoundIndex = Math.floor(Math.random() * gameOverSounds.length);
    playSound(gameOverSounds[randomGameOverSoundIndex]);
    drawMessage("GAME OVER");
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('startButton').innerText = "Restart";
    clearTimeout(game);
    clearInterval(foodSpawn);
    clearInterval(snakeUpdateInterval);
}

function drawMessage(message) {
    var originalFillStyle = ctx.fillStyle;
    var originalTextAlign = ctx.textAlign;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "40px Arial";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = originalFillStyle;
    ctx.textAlign = originalTextAlign;
}

function playSound(src) {
    if (!isMuted) {
        new Audio(src).play();
    }
}

function toggleMute() {
    isMuted = !isMuted;
    Tone.Master.mute = isMuted;
    document.getElementById('muteButton').innerText = isMuted ? 'Unmute' : 'Mute';
}

var snakeImageSource = 'images/snake38.png';
var wormImageSource = 'images/wormy38.png';


function toggleSnakeWorm() {
    isSnake = !isSnake;
    var snakeImage = document.getElementById('snakeImage');
    //var snakeButton = document.getElementById('snakeButton');
    if (isSnake) {
        snakeImage.src = snakeImageSource;
        snakeButton.innerText = 'Worm';
	snakeButton.style.backgroundColor = "#F091AD";
    } else {
        snakeImage.src = wormImageSource;
        snakeButton.innerText = 'Snake';
	snakeButton.style.backgroundColor = "green";
    }
}
