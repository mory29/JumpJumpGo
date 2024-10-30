// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// Player properties
const player = {
    x: 60,
    y: canvas.height - 130,
    width: 40,
    height: 40,
    color: '#4682B4',
    speed: 5,
    dx: 0,
    dy: 0,
    gravity: 0.4,
    jumpPower: -15,
    isJumping: false,
    jumpDirection: 0
};

const platformsLanded = new Set();

// Background stages and gravity settings
let backgroundStage = 0;
const gravitySettings = [0.4, 0.4, 0.1];
const jumpPowerSettings = [-15, -15, -10];



// Variables for stage transitions
let fadeOpacity = 1.0; // Opacity for fade effect (1.0 is fully visible)
let transitioning = false; // Flag for active stage transitions

// Game variables

// Platform types
const PLATFORM_TYPES = {
    STATIC: 'static',
    MOVING_HORIZONTAL: 'moving_horizontal',
    MOVING_VERTICAL: 'moving_vertical',
    FALLING: 'falling',
    ROTATING: 'rotating'
};

// Define platforms with initial properties
const platforms = [
    { x: 50, y: canvas.height - 80, width: 120, height: 10, type: PLATFORM_TYPES.STATIC },
    // Additional platforms added dynamically with varying types
];

const obstacles = [];
const platformWidthRange = [80, 150];
const platformSpacing = 80;
let cameraOffset = 0;
let platformsCleared = 0;
let gameOver = false;

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw platforms cleared counter
function drawPlatformCounter() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Platforms Cleared: ${platformsCleared}`, canvas.width - 10, 30);
}

// Draw background with fading effect
function drawBackground() {
    ctx.globalAlpha = fadeOpacity;

    if (backgroundStage === 0) {
        // Daytime background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, canvas.height - 50 - cameraOffset, canvas.width, 50);
        drawSun();
    } else if (backgroundStage === 1) {
        // Nighttime background
        ctx.fillStyle = '#2B2B52';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawStars(4);
        drawMoon();
    } else if (backgroundStage === 2) {
        // Space background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawStars(2);
        drawPlanets();
    }

    ctx.globalAlpha = 1.0; // Reset alpha after drawing background
}

// Draw sun, stars, moon, and planets
function drawSun() { 
     ctx.fillStyle = '#FFD700'; // Golden yellow for the sun
    const sunX = 100; // Fixed x-coordinate for the sun
    const sunY = 80; // Fixed y-coordinate for the sun
    ctx.beginPath();
    ctx.arc(sunX, sunY, 30, 0, Math.PI * 2); // Sun with a radius of 30
    ctx.fill();
 }

 const starPositions = [];

// Initialize stars with fixed positions
function initializeStars() {
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        starPositions.push({ x, y });
    }
}
// Draw stars at fixed positions
function drawStars(size) { 
    ctx.fillStyle = '#FFFFFF';
    starPositions.forEach(star => {
        ctx.fillRect(star.x, star.y, size, size);
    });
}
function drawMoon() { 
    const moonX = canvas.width - 100; // Fixed horizontal position on the right side
    const moonY = 100; // Fixed vertical position near the top
    ctx.fillStyle = '#F0E68C'; // Light yellow for moon
    ctx.beginPath();
    ctx.arc(moonX, moonY, 40, 0, Math.PI * 2); // Moon radius of 40
    ctx.fill();
 }
function drawPlanets() { 
     // Planet colors and sizes
    const planets = [
        { x: 200, y: 100, radius: 40, color: '#FFA500' }, // Jupiter (orange)
        { x: 600, y: 150, radius: 30, color: '#FF6347' }, // Mars (red)
        { x: 400, y: 250, radius: 35, color: '#1E90FF' }  // Neptune (blue)
    ];

    planets.forEach(planet => {
        // Draw planet with a soft glow
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = planet.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for next drawing
    });
 }
//function drawPlanet(x, y, radius, color) { /*...*/ }

function drawPlayer() {
    const bodyColor = '#4682B4';
    const shadowColor = '#2B5D79';

    // Main body with 3D effect
    ctx.fillStyle = bodyColor;
    ctx.fillRect(player.x, player.y - cameraOffset, player.width, player.height);

    // Head with 3D look
    ctx.fillStyle = '#5A9FD6';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 15 - cameraOffset, 15, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + 10, player.y - 5 - cameraOffset, 5, 5);
    ctx.fillRect(player.x + 25, player.y - 5 - cameraOffset, 5, 5);

    // Jumping arm movement
    ctx.fillStyle = shadowColor;
    if (player.isJumping) {
        ctx.fillRect(player.x - 10, player.y + 15 - cameraOffset - jumpAnimationFrame * 0.5, 10, 5); // Left arm
        ctx.fillRect(player.x + player.width, player.y + 15 - cameraOffset - jumpAnimationFrame * 0.5, 10, 5); // Right arm
    } else {
        ctx.fillRect(player.x - 10, player.y + 15 - cameraOffset, 10, 5); // Left arm
        ctx.fillRect(player.x + player.width, player.y + 15 - cameraOffset, 10, 5); // Right arm
    }

    // Jumping leg movement
    ctx.fillStyle = '#2B5D79';
    ctx.fillRect(player.x + 5, player.y + player.height - cameraOffset + (player.isJumping ? -jumpAnimationFrame * 0.2 : 0), 10, 10); // Left leg
    ctx.fillRect(player.x + 25, player.y + player.height - cameraOffset + (player.isJumping ? -jumpAnimationFrame * 0.2 : 0), 10, 10); // Right leg

    // Game Over if player falls below canvas
    if (player.y - cameraOffset > canvas.height) {
        gameOver = true;
        showGameOverDialog("Game Over! You fell off the screen.");
    }
}


// Update platform properties based on type
function updatePlatforms() {
    platforms.forEach(platform => {
        switch (platform.type) {
            case PLATFORM_TYPES.MOVING_HORIZONTAL:
                platform.x += platform.direction * platform.speed;
                if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
                    platform.direction *= -1;
                }
                break;

            case PLATFORM_TYPES.MOVING_VERTICAL:
                platform.y += platform.direction * platform.speed;
                if (platform.y <= 100 || platform.y >= canvas.height - 80) {
                    platform.direction *= -1;
                }
                break;

            case PLATFORM_TYPES.FALLING:
                if (platform.falling) {
                    platform.y += platform.fallSpeed;
                    platform.fallSpeed += 0.3;
                }
                break;

            case PLATFORM_TYPES.ROTATING:
                platform.angle += platform.rotationSpeed;
                break;

            default:
                break;
        }
    });
}

// function updatePlatforms() {
//     platforms.forEach(platform => {
//         switch (platform.type) {
//             case PLATFORM_TYPES.MOVING_HORIZONTAL:
//                 platform.x += platform.direction * platform.speed;
//                 if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
//                     platform.direction *= -1; // Reverse direction on bounds
//                 }
//                 break;

//             case PLATFORM_TYPES.MOVING_VERTICAL:
//                 platform.y += platform.direction * platform.speed;
//                 if (platform.y <= 100 || platform.y >= canvas.height - 80) {
//                     platform.direction *= -1;
//                 }
//                 break;

//             case PLATFORM_TYPES.FALLING:
//                 if (platform.falling) {
//                     platform.y += platform.fallSpeed;
//                     platform.fallSpeed += 0.3; // Accelerate downward
//                 }
//                 break;

//             case PLATFORM_TYPES.ROTATING:
//                 platform.angle += platform.rotationSpeed;
//                 break;
//         }
//     });
// }




let jumpAnimationFrame = 0;

function updatePlayer() {
    player.dy += player.gravity;
    player.y += player.dy;
    player.x += player.dx;

    // Increase animation frame while jumping
    if (player.isJumping) {
        jumpAnimationFrame = (jumpAnimationFrame + 1) % 20;
    } else {
        jumpAnimationFrame = 0;
    }

    // Player boundaries
    if (player.x < 0) player.x = 0;
    else if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    if (player.y - cameraOffset < canvas.height / 2) {
        cameraOffset = player.y - canvas.height / 2;
    }
}

// Handle key presses for movement
function handleKeyDown(e) {
    if (e.key === 'ArrowRight') {
        player.dx = player.speed;
        player.jumpDirection = 1;
    } else if (e.key === 'ArrowLeft') {
        player.dx = -player.speed;
        player.jumpDirection = -1;
    } else if (e.key === 'ArrowUp' && !player.isJumping) {
        player.dy = player.jumpPower;
        player.isJumping = true;
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') player.dx = 0;
}

// Reset game function
function resetGame() {
    player.x = 60;
    player.y = canvas.height - 130;
    player.dy = 0;
    player.isJumping = false;
    cameraOffset = 0;
    platformsCleared = 0;
    gameOver = false;
    platforms.length = 0;
    obstacles.length = 0;
    platformsLanded.clear();
    platforms.push({ x: 50, y: canvas.height - 80, width: 120, height: 10 });
}

// Draw platforms and obstacles
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.save();
        
        if (platform.type === PLATFORM_TYPES.ROTATING) {
            ctx.translate(platform.x + platform.width / 2, platform.y + platform.height / 2);
            ctx.rotate(platform.angle);
            ctx.translate(-(platform.x + platform.width / 2), -(platform.y + platform.height / 2));
        }
        
        ctx.fillStyle = '#8B4513'; // Default platform color
        ctx.fillRect(platform.x, platform.y - cameraOffset, platform.width, platform.height);
        
        ctx.restore();
    });
}

function drawObstacles() { 
    ctx.fillStyle = '#FF0000';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
    });
 }

// Updated platform generation to set `direction` and `speed` for moving platforms
function generatePlatforms() {
    const lastPlatform = platforms[platforms.length - 1];
    const newPlatformY = lastPlatform.y - platformSpacing;
    const newPlatformWidth = Math.random() * (platformWidthRange[1] - platformWidthRange[0]) + platformWidthRange[0];
    const newPlatformX = Math.random() * (canvas.width - newPlatformWidth);

    // Randomize platform type with correct initializations
    let platformType;
    const randomType = Math.random();
    if (randomType < 0.3) platformType = PLATFORM_TYPES.MOVING_HORIZONTAL;
    else if (randomType < 0.5) platformType = PLATFORM_TYPES.FALLING;
    else if (randomType < 0.7) platformType = PLATFORM_TYPES.ROTATING;
    else platformType = PLATFORM_TYPES.STATIC;

    const platform = {
        x: newPlatformX,
        y: newPlatformY,
        width: newPlatformWidth,
        height: 10,
        type: platformType,
        direction: 1,  // Direction for movement
        speed: 2,      // Speed for moving platforms
        falling: false, // Initial falling state for FALLING platforms
        fallSpeed: 2,   // Falling speed adjustment for FALLING platforms
        angle: 0,
        rotationSpeed: 0.03 * (Math.random() < 0.5 ? 1 : -1)
    };

    platforms.push(platform);

    // Generate obstacles on certain platforms
    if (Math.random() < 0.1) {
        const obstacleWidth = 20;
        obstacles.push({
            x: newPlatformX + Math.random() * (newPlatformWidth - obstacleWidth),
            y: newPlatformY - 10,
            width: obstacleWidth,
            height: 10
        });
    }
}


function checkPlatformCollision() {
    platforms.forEach((platform, index) => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height &&
            player.dy >= 0 // Player must be moving downwards
        ) {
            // Trigger falling if it's a FALLING platform
            if (platform.type === PLATFORM_TYPES.FALLING && !platform.falling) {
                platform.falling = true;
                setTimeout(() => platform.falling = true, 1000);
            }

            // Adjust position for rotating platforms
            if (platform.type === PLATFORM_TYPES.ROTATING) {
                const offsetX = player.x - (platform.x + platform.width / 2);
                const offsetY = player.y - (platform.y + platform.height / 2);
                const rotatedX = offsetX * Math.cos(platform.angle) - offsetY * Math.sin(platform.angle);
                player.x = platform.x + platform.width / 2 + rotatedX;
            }

            // Reset player position on platform
            player.y = platform.y - player.height;
            player.dy = 0;
            player.isJumping = false;

            // Increment platformsCleared
            if (!platformsLanded.has(index)) {
                platformsCleared++;
                platformsLanded.add(index);
                console.log("Platforms Cleared:", platformsCleared);
            }
        }
    });

    // Check collision with obstacles
    obstacles.forEach(obstacle => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y + player.height > obstacle.y &&
            player.y < obstacle.y + obstacle.height
        ) {
            gameOver = true;
            showGameOverDialog("Game Over! You hit an obstacle.");
        }
    });
}





// Define thresholds and fading range
const stageThresholds = [20, 40, 100]; // Milestones for each stage change
const fadeRange = 5; // Number of platforms before a threshold to start fading

// Update fadeOpacity for smooth transition
function updateBackgroundStage() {
    if (platformsCleared < 20) {
        if (backgroundStage !== 0 && !transitioning) {
            startTransition(0);
        }
    } else if (platformsCleared < 40) {
        if (backgroundStage !== 1 && !transitioning) {
            startTransition(1);
        }
    } else {
        if (backgroundStage !== 2 && !transitioning) {
            startTransition(2);
        }
    }

    // Check for win condition
    if (platformsCleared >= 100) {
        gameOver = true;
        showGameOverDialog("Congratulations! You reached the spaceship and won the game!");



    }
 }


// Start a smooth transition to a new stage
function startTransition(newStage) {
    transitioning = true;
    const fadeOut = setInterval(() => {
        fadeOpacity -= 0.09; // Adjust this value to control transition speed
        if (fadeOpacity <= 0) {
            clearInterval(fadeOut);
            backgroundStage = newStage;
            fadeIn(); // Start fading in the new stage
        }
    }, 90);
}

// Fade-in function for smooth transition
function fadeIn() {
    const fadeInInterval = setInterval(() => {
        fadeOpacity += 0.09; // Adjust this value to control transition speed
        if (fadeOpacity >= 1) {
            clearInterval(fadeInInterval);
            transitioning = false;
        }
    }, 90);
}
// function updateBackgroundStage() {
//     if (platformsCleared < 20) backgroundStage = 0;
//     else if (platformsCleared < 40) backgroundStage = 1;
//     else backgroundStage = 2;

//     if (platformsCleared >= 100) {
//         gameOver = true;
//         showGameOverDialog("Congratulations! You reached the spaceship and won the game!");
//     }
// }

// Show game over dialog
function showGameOverDialog(message) {
    const overlay = document.createElement('div');
    overlay.style = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                     background: rgba(0, 0, 0, 0.5); color: #FFFFFF; display: flex; 
                     flex-direction: column; align-items: center; justify-content: center; font-size: 24px;`;
    overlay.innerHTML = `
        <p>${message}</p>
        <button id="retryButton">Retry</button>
        <button id="exitButton">Exit</button>`;
    document.body.appendChild(overlay);

    document.getElementById('retryButton').onclick = () => {
        resetGame();
        document.body.removeChild(overlay);
        gameLoop();
    };
    document.getElementById('exitButton').onclick = () => document.body.removeChild(overlay);
}

// Main game loop
function gameLoop() {
    if (gameOver) return;
    clearCanvas();
    drawBackground();
    updatePlayer();

    if (platforms[platforms.length - 1].y > player.y - canvas.height) generatePlatforms();

    drawPlatforms();
    drawObstacles();
    checkPlatformCollision();
    drawPlayer();
    drawPlatformCounter();
    requestAnimationFrame(gameLoop);
}

// Start the game
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
gameLoop();
