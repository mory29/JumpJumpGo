// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// Player setup
const player = {
    x: 60,
    y: canvas.height - 130,
    width: 40,
    height: 40,
    color: '#4682B4',
    dy: 0,
    gravity: 0.4,
    jumpPower: -12,
    isJumping: false
};

// Single platform for testing
const platforms = [
    { x: 50, y: canvas.height - 80, width: 120, height: 10 }
];

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw platform
function drawPlatforms() {
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// Basic gravity and movement
function updatePlayer() {
    player.dy += player.gravity;
    player.y += player.dy;

    // Prevent player from falling through the floor/platform
    if (player.y + player.height >= canvas.height - 80) {  // Adjusted height of initial platform
        player.y = canvas.height - 80 - player.height;
        player.dy = 0;
        player.isJumping = false;
    }
}

// Game loop for testing
function gameLoop() {
    clearCanvas();
    drawPlatforms();
    drawPlayer();
    updatePlayer();

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
