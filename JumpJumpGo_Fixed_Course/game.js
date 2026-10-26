

// In the <script> tag

// Animate the game title
gsap.to('#gameTitle', {
    duration: 2,
    opacity: 1,
    y: -20,
    ease: 'power2.out',
    delay: 0.5
});

// Home Canvas setup
const homeCanvas = document.getElementById('homeCanvas');
const homeCtx = homeCanvas.getContext('2d');
homeCanvas.width = window.innerWidth;
homeCanvas.height = window.innerHeight;

// Adjust canvas size on window resize
window.addEventListener('resize', () => {
    homeCanvas.width = window.innerWidth;
    homeCanvas.height = window.innerHeight;
});
    
const starLayers = [
    { speed: 0.02, stars: [] }, // Farthest layer
    { speed: 0.05, stars: [] }, // Middle layer
    { speed: 0.1, stars: [] }   // Closest layer
];

const numStarsPerLayer = [50, 30, 20]; // Number of stars per layer

// Initialize stars for each layer
starLayers.forEach((layer, index) => {
    for (let i = 0; i < numStarsPerLayer[index]; i++) {
        layer.stars.push({
            x: Math.random() * homeCanvas.width,
            y: Math.random() * homeCanvas.height,
            size: Math.random() * (index + 1),
            alpha: Math.random()
        });
    }
});

const planet = {
    x: homeCanvas.width + 100,
    y: homeCanvas.height * 0.7,
    radius: 50,
    image: new Image()
};

//planet.image.src = "C:\Users\Mory B Fakoly\OneDrive\Desktop\planet.png"; // Replace with the actual path


function animateHomeScreen() {
    homeCtx.clearRect(0, 0, homeCanvas.width, homeCanvas.height);

    // Draw and animate stars for each layer
    starLayers.forEach(layer => {
        layer.stars.forEach(star => {
            // Update star position
            star.y += layer.speed;
            if (star.y > homeCanvas.height) {
                star.y = 0;
                star.x = Math.random() * homeCanvas.width;
            }

            // Draw star
            homeCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            homeCtx.fillRect(star.x, star.y, star.size, star.size);
        });
    });

    // Other animations or drawings can go here

     // Draw the planet
    planet.x -= 0.5; // Move left
    if (planet.x < -100) {
        planet.x = homeCanvas.width + 100; // Reset position
    }

    // Draw the planet image if loaded
    // if (planet.image.complete) {
    //     homeCtx.drawImage(planet.image, planet.x - planet.radius, planet.y - planet.radius, planet.radius * 2, planet.radius * 2);
    // } else {
    //     // Draw a placeholder circle
    //     homeCtx.fillStyle = '#8888FF';
    //     homeCtx.beginPath();
    //     homeCtx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    //     homeCtx.fill();
    // }


    requestAnimationFrame(animateHomeScreen);
}

// Start the animation
animateHomeScreen();

// Floating animation for game title
gsap.to('#gameTitle', {
    y: -30,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    duration: 3
});

// Floating animation for buttons
gsap.to('#buttonContainer', {
    y: -10,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    duration: 2
});

const playButton = document.getElementById('playButton');
playButton.addEventListener('click', () => {
    // Hide home screen
    document.getElementById('homeScreen').style.display = 'none';
    // Show game container
    document.getElementById('gameContainer').style.display = 'block';
    // Start the game
    startGame();
});


exitButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to exit the game?')) {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #000; color: #fff; flex-direction: column;">
                <h1>Thank you for playing!</h1>
                <button id="backButton">Back to Home</button>
            </div>
        `;
        document.getElementById('backButton').addEventListener('click', () => {
            window.location.reload();
        });
    }
});


const backgroundMusic = document.getElementById('backgroundMusic');

// Play music when the home screen loads
// backgroundMusic.volume = 0.5; // Set volume level
// backgroundMusic.play().catch(error => {
//     // Autoplay might be blocked; handle errors if necessary
//     console.log('Autoplay was prevented:', error);
// });

function startGame() {

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 500;
// Background stages and gravity settings
let backgroundStage = 0;
const gravitySettings = [0.4, 0.4, 0.1];
const jumpPowerSettings = [-15, -15, -10];

const groundHeight = 50; // Height of the ground in pixels

// Variables for stage transitions
let fadeOpacity = 1.0; // Opacity for fade effect (1.0 is fully visible)
let transitioning = false; // Flag for active stage transitions

// Define thresholds and fading range
const stageThresholds = [20, 40, 100]; // Milestones for each stage change
const fadeRange = 5; // Number of platforms before a threshold to start fading

// Game variables
let debugMode = false; // Set this to false to disable debug mode in production
let collisionEnabled = true;
const platformsLanded = new Set();

// Level layout: edit these values to change the practice course.
// heightAboveGround measures upward from the ground surface.
const PRACTICE_PLATFORM_WIDTH = 140;
const PRACTICE_COURSE = [
    { x: 60,  heightAboveGround: 80,  collectible: false },
    { x: 220, heightAboveGround: 160, collectible: true },
    { x: 380, heightAboveGround: 240, collectible: false },
    { x: 540, heightAboveGround: 320, collectible: true },
    { x: 700, heightAboveGround: 400, collectible: false },
    { x: 540, heightAboveGround: 480, collectible: true },
    { x: 380, heightAboveGround: 560, collectible: false },
    { x: 220, heightAboveGround: 640, collectible: true },
    { x: 60,  heightAboveGround: 720, collectible: false },
    { x: 220, heightAboveGround: 800, collectible: true }
];
// Extend the course to 60 platforms with a repeatable layout.
const platformXPattern = [60, 220, 380, 540, 700, 540, 380, 220];

for (let i = PRACTICE_COURSE.length; i < 60; i++) {
    PRACTICE_COURSE.push({
        x: platformXPattern[i % platformXPattern.length],
        heightAboveGround: (i + 1) * 80,
        collectible: i % 2 === 1
    });
}

const platforms = [];
const trees = [];
const obstacles = [];
let cameraOffset = 0;
let platformsCleared = 0;
let gameOver = false;

// Player properties
const player = {
    x: 60,
    y: canvas.height - groundHeight - 40, // Adjusted position
    width: 40,
    height: 40,
    color: '#4682B4',
    speed: 5,
    dx: 0,
    dy: 0,
    gravity: 0.4,
    jumpPower: -15,
    isJumping: false,
    jumpDirection: 0,
    score: 0,
    jumpCount: 0,    // Tracks the number of jumps
    maxJumps: 2      // Maximum jumps allowed (double jump)
};



function skipToNextLevel() {
    platformCount += 20; // or any number that represents a level advancement
    console.log(`Skipped to platform ${platformCount}`);
    // Call any other functions needed to update the game state for the new level
}
function togglePlatformCollision() {
    collisionEnabled = !collisionEnabled;
    console.log(`Platform collision is now ${collisionEnabled ? "enabled" : "disabled"}.`);
}

function triggerBackgroundTransition() {
    // This should call your background transition function
    startTransition();// Replace with your actual transition function
    console.log("Background transition triggered.");
}

// Platform types
const PLATFORM_TYPES = {
    STATIC: 'static',
    MOVING_HORIZONTAL: 'moving_horizontal',
    //MOVING_VERTICAL: 'moving_vertical',
    FALLING: 'falling',
    OSCILLATING: 'oscillating',
};



// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function drawGround() {
    // Draw the ground rectangle
    ctx.fillStyle = '#8B4513'; // SaddleBrown color for the ground
    ctx.fillRect(0, canvas.height - groundHeight - cameraOffset, canvas.width, groundHeight);

    // Add earth texture
    drawEarthTexture();
}

const groundPatches = [];

function initializeGroundTexture() {
    groundPatches.length = 0;
    const patchCount = Math.floor(canvas.width * 0.1);

    for (let i = 0; i < patchCount; i++) {
        const width = Math.random() * 30 + 20;
        const height = Math.random() * 10 + 5;

        groundPatches.push({
            x: Math.random() * (canvas.width - width),
            y: canvas.height - groundHeight +
                Math.random() * (groundHeight - height),
            width: width,
            height: height
        });
    }
}

function drawEarthTexture() {
    ctx.fillStyle = '#654321';

    groundPatches.forEach(patch => {
        ctx.fillRect(
            patch.x,
            patch.y - cameraOffset,
            patch.width,
            patch.height
        );
    });
}



function initializeTrees() {
    const treeCount = 10; // Number of trees

    for (let i = 0; i < treeCount; i++) {
        const tree = {
            x: Math.random() * canvas.width,
            y: canvas.height - groundHeight - Math.random() * 100 - 50, // Random height above the ground
            width: Math.random() * 20 + 30, // Width between 30 and 50
            height: Math.random() * 100 + 150 // Height between 150 and 250
        };
        trees.push(tree);
    }
}

function drawTrees() {
    trees.forEach(tree => {
        // Draw trunk
        ctx.fillStyle = '#8B4513'; // SaddleBrown color for the trunk
        ctx.fillRect(tree.x, tree.y - cameraOffset, tree.width / 4, tree.height);

        // Draw foliage
        ctx.fillStyle = '#228B22'; // ForestGreen color for leaves
        ctx.beginPath();
        ctx.moveTo(tree.x - tree.width / 2, tree.y - cameraOffset);
        ctx.lineTo(tree.x + tree.width / 2, tree.y - tree.height - cameraOffset);
        ctx.lineTo(tree.x + tree.width * 1.5, tree.y - cameraOffset);
        ctx.closePath();
        ctx.fill();
    });
}


// Draw platforms cleared counter
function drawPlatformCounter() {
    let highestPlatformHeight = 0;

    platformsLanded.forEach(index => {
        highestPlatformHeight = Math.max(
            highestPlatformHeight,
            PRACTICE_COURSE[index].heightAboveGround
        );
    });

    const summitHeight =
        PRACTICE_COURSE[PRACTICE_COURSE.length - 1].heightAboveGround;

    const progress = Math.floor(
        (highestPlatformHeight / summitHeight) * 100
    );

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(
        `Spaceship progress: ${progress}%`,
        canvas.width - 10,
        30
    );
}


// Draw background with fading effect
function drawBackground() {
    // Only apply globalAlpha if we're transitioning
    ctx.globalAlpha = transitioning ? fadeOpacity : 1.0;

    if (backgroundStage === 0) {
        // Daytime background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, canvas.height - 50 - cameraOffset, canvas.width, 50);
        drawSun();
        drawClouds();
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

    // Only reset globalAlpha if we're not transitioning
    if (!transitioning) {
        ctx.globalAlpha = 1.0;
    }
}

function drawScore() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${player.score}`, 10, 30);
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

 class Cloud {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    draw(ctx) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.width, this.height, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.speed;
        if (this.x > canvas.width) this.x = -this.width; // loop cloud to the left
    }
}

const clouds = [
    new Cloud(50, 80, 40, 20, 0.3),
    new Cloud(200, 120, 50, 25, 0.2),
    // add more clouds as desired
];

function drawClouds() {
    clouds.forEach(cloud => {
        cloud.update();
        cloud.draw(ctx);
    });
}

// In the game loop:



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


    // Draw jet wings if jumping
    if (player.isJumping) {
        drawJetWings();
    }

    // // Game Over if player falls below canvas
    // if (player.y + player.height - cameraOffset > canvas.height) {
    //     gameOver = true;
    //     showGameOverDialog("Game Over! You fell off the screen.");
    // }
    

    // lets make the player start on a actual ground and not on a platform.
    // add ascending wind that will boost the robot up in certain area of the ascens



}

function drawJetWings() {
    const wingWidth = 10;
    const wingHeight = 20;
    const wingOffsetX = 5;
    const wingOffsetY = 10;

    // Wings color
    ctx.fillStyle = '#808080';

    // Left wing
    ctx.beginPath();
    ctx.moveTo(player.x - wingOffsetX, player.y + wingOffsetY - cameraOffset);
    ctx.lineTo(player.x - wingOffsetX - wingWidth, player.y + wingOffsetY + wingHeight - cameraOffset);
    ctx.lineTo(player.x - wingOffsetX, player.y + wingOffsetY + wingHeight - cameraOffset);
    ctx.closePath();
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(player.x + player.width + wingOffsetX, player.y + wingOffsetY - cameraOffset);
    ctx.lineTo(player.x + player.width + wingOffsetX + wingWidth, player.y + wingOffsetY + wingHeight - cameraOffset);
    ctx.lineTo(player.x + player.width + wingOffsetX, player.y + wingOffsetY + wingHeight - cameraOffset);
    ctx.closePath();
    ctx.fill();

    // Flames
    drawFlames();
}

function drawFlames() {
    const flameHeight = 15 + Math.random() * 5; // Flickering effect
    const flameWidth = 5;
    const wingOffsetX = 5;
    const wingWidth = 10;
    const wingOffsetY = 10;
    const wingHeight = 20;

    // Flame color
    ctx.fillStyle = '#FFA500';

    // Left flame
    ctx.beginPath();
    ctx.moveTo(player.x - wingOffsetX - wingWidth / 2, player.y + wingOffsetY + wingHeight - cameraOffset);
    ctx.lineTo(player.x - wingOffsetX - wingWidth / 2 - flameWidth, player.y + wingOffsetY + wingHeight + flameHeight - cameraOffset);
    ctx.lineTo(player.x - wingOffsetX - wingWidth / 2 + flameWidth, player.y + wingOffsetY + wingHeight + flameHeight - cameraOffset);
    ctx.closePath();
    ctx.fill();

    // Right flame
    ctx.beginPath();
    ctx.moveTo(player.x + player.width + wingOffsetX + wingWidth / 2, player.y + wingOffsetY + wingHeight - cameraOffset);
    ctx.lineTo(player.x + player.width + wingOffsetX + wingWidth / 2 + flameWidth, player.y + wingOffsetY + wingHeight + flameHeight - cameraOffset);
    ctx.lineTo(player.x + player.width + wingOffsetX + wingWidth / 2 - flameWidth, player.y + wingOffsetY + wingHeight + flameHeight - cameraOffset);
    ctx.closePath();
    ctx.fill();
}



let jumpAnimationFrame = 0;

function updatePlayer() {
    player.previousY = player.y; // Remember where the feet were before movement.
    player.dy += player.gravity;
    player.y += player.dy;
    player.x += player.dx;

    // Increase animation frame while jumping
    if (player.isJumping) {
        jumpAnimationFrame = (jumpAnimationFrame + 1) % 60;
    } else {
        jumpAnimationFrame = 0;
    }

    // Player boundaries
    if (player.x < 0) player.x = 0;
    else if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // if (player.y - cameraOffset < canvas.height / 2) {
    //     cameraOffset = player.y - canvas.height / 2;
    // }
}

function checkFallOutOfView() {
    if (gameOver) return;

    const headAboveBody = 30;
    const playerTopOnScreen =
        player.y - headAboveBody - cameraOffset;

    if (playerTopOnScreen > canvas.height) {
        gameOver = true;
        showGameOverDialog("Game Over! You fell off the screen.");
    }
}

function updateCamera() {
    const targetOffset = player.y - canvas.height / 2;
    const cameraFollowSpeed = 0.12;

    if (targetOffset < cameraOffset) {
        cameraOffset +=
            (targetOffset - cameraOffset) * cameraFollowSpeed;
    }
}

// Handle key presses for movement
function handleKeyDown(e) {
    const gameKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp'];

    if (gameKeys.includes(e.key)) {
        e.preventDefault();
    }

    if (gameOver) return;

    if (e.key === 'ArrowRight') {
        player.dx = player.speed;
        player.jumpDirection = 1;
    } else if (e.key === 'ArrowLeft') {
        player.dx = -player.speed;
        player.jumpDirection = -1;
    } else if (e.key === 'ArrowUp') {
        if (e.repeat) return;

        if (player.jumpCount < player.maxJumps) {
            player.dy = player.jumpPower;
            player.isJumping = true;
            player.jumpCount++;
        }
    }
}


function handleKeyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') player.dx = 0;
}

// Reset game function
function resetGame() {
    player.standingPlatform = null;
    player.x = 60;
    player.y = canvas.height - groundHeight - player.height;
    player.previousY = player.y;
    player.dx = 0;
    player.dy = 0;
    player.isJumping = false;
    player.jumpCount = 0;
    player.jumpDirection = 0;
    player.score = 0;
    jumpAnimationFrame = 0;
    cameraOffset = 0;
    platformsCleared = 0;
    backgroundStage = 0;
    fadeOpacity = 1;
    transitioning = false;
    collisionEnabled = true;
    gameOver = false;
    loadPracticeCourse();
}

// Draw platforms and obstacles


function drawObstacles() { 
    ctx.fillStyle = '#FF0000';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y - cameraOffset, obstacle.width, obstacle.height);
    });
 }

function drawCollectibles() {
    ctx.fillStyle = '#FFD700'; // Gold color for collectibles
    collectibles.forEach(collectible => {
        if (!collectible.collected) {
            ctx.fillRect(collectible.x, collectible.y - cameraOffset, collectible.width, collectible.height);
        }
    });
}

function drawSpaceship() {
    const finishPlatform = platforms[platforms.length - 1];
    if (!finishPlatform) return;

    const shipX = finishPlatform.x + finishPlatform.width / 2;
    const shipY = finishPlatform.y - cameraOffset - 100;

    ctx.save();
    ctx.translate(shipX, shipY);

    // Glass cockpit
    ctx.fillStyle = '#7DE3FF';
    ctx.beginPath();
    ctx.ellipse(0, -15, 30, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ship body
    ctx.fillStyle = '#B8C5D6';
    ctx.beginPath();
    ctx.ellipse(0, 0, 65, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lower hull
    ctx.fillStyle = '#526580';
    ctx.fillRect(-35, 10, 70, 12);

    // Three yellow lights
    ctx.fillStyle = '#FFE066';
    [-35, 0, 35].forEach(lightX => {
        ctx.beginPath();
        ctx.arc(lightX, 0, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.save();
        
        // if (platform.type === PLATFORM_TYPES.ROTATING) {
        //     ctx.translate(platform.x + platform.width / 2, platform.y + platform.height / 2);
        //     ctx.rotate(platform.angle);
        //     ctx.translate(-(platform.x + platform.width / 2), -(platform.y + platform.height / 2));
        // }

        if (platform.type === PLATFORM_TYPES.OSCILLATING) {
            ctx.translate(platform.x + platform.width / 2, platform.y + platform.height / 2);
            ctx.translate(-(platform.x + platform.width / 2), -(platform.y + platform.height / 2));
        }
        
        // Set different colors for different platform types
        if (platform.type === PLATFORM_TYPES.FALLING) {
            ctx.fillStyle = '#FF6347'; // Tomato color for falling platforms
        } else if (platform.type === PLATFORM_TYPES.OSCILLATING) {
            ctx.fillStyle = '#FFD700'; // Golden color for oscillating platforms
        } else {
            ctx.fillStyle = platform.id === PRACTICE_COURSE.length - 1 ? '#2E8B57' : '#8B4513'; // Green marks the finish
        }
        ctx.fillRect(platform.x, platform.y - cameraOffset, platform.width, platform.height);
        if (platform.id === PRACTICE_COURSE.length - 1) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                'SPACESHIP',
                platform.x + platform.width / 2,
                platform.y - cameraOffset - 35
        );
}
        
        ctx.restore();
    });
}
// Updated platform generation to set `direction` and `speed` for moving platforms
// Build fresh objects each time so Retry restores the original layout.
function loadPracticeCourse() {
    platforms.length = 0;
    obstacles.length = 0;
    collectibles.length = 0;
    platformsLanded.clear();

    PRACTICE_COURSE.forEach((definition, index) => {
        const platform = {
            id: index,
            x: definition.x,
            y: canvas.height - groundHeight - definition.heightAboveGround,
            width: PRACTICE_PLATFORM_WIDTH,
            height: 10,
            type: PLATFORM_TYPES.STATIC
        };
        if (index === 1) {
            platform.type = PLATFORM_TYPES.OSCILLATING;
            platform.baseX = platform.x;
            platform.angle = 0;
            platform.rotationSpeed = 0.02;
            platform.oscillationRange = 40;
        }
        platforms.push(platform);

        if (definition.collectible) {
            generateCollectible(platform);
        }
    });
}

function updatePlatforms() {
    platforms.forEach(platform => {
        const previousX = platform.x;
        switch (platform.type) {
            case PLATFORM_TYPES.MOVING_HORIZONTAL:
                platform.x += platform.direction * platform.speed;
                if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
                    platform.direction *= -1;
                }
                break;

            // case PLATFORM_TYPES.MOVING_VERTICAL:
            //     platform.y += platform.direction * platform.speed;
            //     if (platform.y <= platform.initialY - 50 || platform.y >= platform.initialY + 50) {
            //         platform.direction *= -1;
            //     }
            //     break;

            case PLATFORM_TYPES.FALLING:
                if (platform.falling) {
                    platform.y += platform.fallSpeed;
                    platform.fallSpeed += 0.3;
                }
                break;

            case PLATFORM_TYPES.OSCILLATING:
                platform.angle += platform.rotationSpeed;
                platform.x = platform.baseX + Math.sin(platform.angle) * platform.oscillationRange;
                break;

            default:
                break;
        }
        if (
            player.standingPlatform === platform &&
            !player.isJumping &&
            player.x + player.width > previousX &&
            player.x < previousX + platform.width
        ) {
            player.x += platform.x - previousX;
        }
    });
}
function checkCollectiblesCollision() {
    collectibles.forEach(collectible => {
        if (!collectible.collected &&
            player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y
        ) {
            collectible.collected = true;
            player.score += 10; // Increase score
            // Add sound effect or animation if desired
        }
    });
}


function checkCollectiblesCollision() {
    collectibles.forEach(collectible => {
        if (!collectible.collected &&
            player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y
        ) {
            collectible.collected = true;
            player.score += 10; // Increase score
            // Add sound effect or animation if desired
        }
    });
}




function checkPlatformCollision() {
    if (!collisionEnabled) return;

    player.standingPlatform = null;
    let onPlatform = false;
    platforms.forEach((platform, index) => {

        // Skip platforms below the visible play area.
        if (platform.y - cameraOffset >= canvas.height) {
            return;
        }
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.previousY + player.height <= platform.y &&
            player.y + player.height >= platform.y &&
            player.dy >= 0 // Player must be moving downwards
        ) {
             player.y = platform.y - player.height;
            player.dy = 0;
            player.isJumping = false;
            player.jumpCount = 0; // Reset jump count on landing
            player.standingPlatform = platform;


            // Trigger falling if it's a FALLING platform
            if (platform.type === PLATFORM_TYPES.FALLING && !platform.falling) {
                platform.falling = true;
                setTimeout(() => platform.falling = true, 1000);
            }

            // // Adjust position for rotating platforms
            // if (platform.type === PLATFORM_TYPES.ROTATING) {
            //     const offsetX = player.x - (platform.x + platform.width / 2);
            //     const offsetY = player.y - (platform.y + platform.height / 2);
            //     const rotatedX = offsetX * Math.cos(platform.angle) - offsetY * Math.sin(platform.angle);
            //     player.x = platform.x + platform.width / 2 + rotatedX;
            // }

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

   
   
    
    // Ground collision
        if (
            canvas.height - groundHeight - cameraOffset < canvas.height &&
            player.previousY + player.height <= canvas.height - groundHeight &&
            player.y + player.height >= canvas.height - groundHeight &&
            player.dy >= 0
        ) {
            player.y = canvas.height - groundHeight - player.height;
            player.dy = 0;
            player.isJumping = false;
            player.jumpCount = 0; // Reset double jump
            onPlatform = true;
        }

    // // If the player is not on any platform or ground, they are in the air
    // if (!onPlatform) {
    //     player.isJumping = true;
    // }




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

// Update fadeOpacity for smooth transition
function updateBackgroundStage() {
    if (platformsCleared < 20 && backgroundStage !== 0 && !transitioning) {
        startTransition(0);
    } else if (platformsCleared >= 20 && platformsCleared < 40 && backgroundStage !== 1 && !transitioning) {
        startTransition(1);
    } else if (platformsCleared >= 40 && backgroundStage !== 2 && !transitioning) {
        startTransition(2);
    }

    if (platformsLanded.has(PRACTICE_COURSE.length - 1)) {
        gameOver = true;
        showGameOverDialog("You reached the spaceship! Ready for takeoff!");
    }
}

// Start a smooth transition to a new stage
function startTransition(newStage) {
    transitioning = true; // Begin transition process
    const fadeOut = setInterval(() => {
        fadeOpacity -= 0.05; // Adjust for smoother fade-out
        if (fadeOpacity <= 0) {
            clearInterval(fadeOut);
            backgroundStage = newStage; // Update stage
            fadeIn(); // Start fade-in
        }
    }, 50);
}

function fadeIn() {
    const fadeInInterval = setInterval(() => {
        fadeOpacity += 0.05; // Adjust for smoother fade-in
        if (fadeOpacity >= 1) {
            clearInterval(fadeInInterval);
            transitioning = false; // End transition
        }
    }, 50);
}




const collectibles = [];

function generateCollectible(platform) {
    const width = 20;
    const height = 20;
    const offsetX = (platform.width - width) / 2;
    const offsetY = -height;

    const collectible = {
        platform: platform,
        offsetX: offsetX,
        offsetY: offsetY,
        x: platform.x + offsetX,
        y: platform.y + offsetY,
        width: width,
        height: height,
        collected: false
    };

    collectibles.push(collectible);
}

function updateCollectibles() {
    collectibles.forEach(collectible => {
        collectible.x =
            collectible.platform.x + collectible.offsetX;

        collectible.y =
            collectible.platform.y + collectible.offsetY;
    });
}


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

    // Update game state before drawing.
    updatePlayer();
    updatePlatforms();
    updateCollectibles();
    checkPlatformCollision();
    checkCollectiblesCollision();
    updateCamera();
    checkFallOutOfView();

    if (!gameOver) {
        updateBackgroundStage();
    }

    // Draw using the same updated camera position.
    clearCanvas();
    drawBackground();
    drawTrees();
    drawGround();
    drawPlatforms();
    drawSpaceship();
    drawObstacles();
    drawCollectibles();
    drawPlayer();
    drawPlatformCounter();
    drawScore();
    drawClouds();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}



// Start the game
document.addEventListener('keydown', (event) => {
    if (!debugMode) return; // Only run if debug mode is enabled
    
    switch (event.key) {
        case 'N': // Move to the next stage/level
            skipToNextLevel();
            console.log("Skipped level triggered");
            break;
        case 'T': // Trigger background transition directly
            triggerBackgroundTransition();
            console.log("Background transition triggered");
            break;
        case 'C': // Toggle platform collision
            togglePlatformCollision();
            console.log(`Platform collision is now ${collisionEnabled ? "enabled" : "disabled"}.`);
            break;
        default:
            break;
    }
});
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

initializeGroundTexture(); // Create ground details once.
initializeTrees(); // Initialize scenery once.
resetGame(); // Load the fixed course before the first frame.
gameLoop();

}

    // We'll add JavaScript code here
    