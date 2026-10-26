

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
    jumpPower: -12,
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
    BOOST: 'boost',
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
    const altitude = Math.max(0, -cameraOffset);

    // Each height marks an environment along the climb.
    const stages = [
        { height: 0,    color: [135, 206, 235] }, // Day
        { height: 1000, color: [235, 139, 100] }, // Sunset
        { height: 2000, color: [35, 35, 75] },    // Night
        { height: 3000, color: [12, 15, 40] },    // Space
        { height: 4000, color: [3, 4, 14] }       // Deep space
    ];

    // Find the two colors surrounding our current altitude.
    let stageIndex = 0;

    while (
        stageIndex < stages.length - 2 &&
        altitude >= stages[stageIndex + 1].height
    ) {
        stageIndex++;
    }

    const from = stages[stageIndex];
    const to = stages[stageIndex + 1];

    const progress = Math.min(
        1,
        Math.max(0,
            (altitude - from.height) / (to.height - from.height)
        )
    );

    const color = from.color.map((channel, index) => {
        return Math.round(
            channel + (to.color[index] - channel) * progress
        );
    });

    ctx.save();

    // Always paint an opaque sky behind the game.
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgb(${color.join(',')})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun and clouds gradually disappear.
    const daylight = Math.max(0, 1 - altitude / 1800);

    ctx.globalAlpha = daylight;
    drawSun();
    drawClouds();

    // Stars gradually appear approaching nighttime.
    const starlight = Math.min(
        1,
        Math.max(0, (altitude - 1000) / 1000)
    );

    ctx.globalAlpha = starlight;
    drawStars(3);

    // The moon appears at night, then fades toward space.
    const moonVisibility = starlight * Math.max(
        0,
        Math.min(1, (3000 - altitude) / 1000)
    );

    ctx.globalAlpha = moonVisibility;
    drawMoon();

    // Planets appear in space and fade into deep space.
    const planetVisibility = Math.max(
        0,
        Math.min(
            1,
            (altitude - 2200) / 800,
            (4400 - altitude) / 800
        )
    );

    ctx.globalAlpha = planetVisibility;
    drawPlanets();

    ctx.restore();
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
    const time = performance.now() / 1000;

    ctx.save();
    const backgroundOpacity = ctx.globalAlpha;
    ctx.fillStyle = '#FFFFFF';

    starPositions.forEach((star, index) => {
        const speed = 1.6 + (index % 5) * 0.6;
        const phase = index * 2.4;

        const brightness =
            0.65 + Math.sin(time * speed + phase) * 0.35;

        ctx.globalAlpha = backgroundOpacity * brightness;
        ctx.fillRect(star.x, star.y, size, size);
    });

    ctx.restore();
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
    const time = performance.now() / 1000;
    const airborne = player.isJumping || Math.abs(player.dy) > 0.5;
    const running = Math.abs(player.dx) > 0 && !airborne;

    const stride = running ? Math.sin(time * 14) : 0;
    const direction = Math.sign(player.dx);
    const lean = running ? direction * 0.07 : 0;

    ctx.save();

    // Draw relative to the center of the robot's body.
    ctx.translate(
        player.x + player.width / 2,
        player.y - cameraOffset + player.height / 2
    );
    ctx.rotate(lean);

    // Legs swing in opposite directions.
    const legSwing = stride * 7;

    ctx.fillStyle = '#2B5D79';
    ctx.fillRect(-15, 18 + legSwing, 10, 12);
    ctx.fillRect(5, 18 - legSwing, 10, 12);

    // Arms swing opposite to the legs.
    const armSwing = airborne ? -10 : stride * 8;

    ctx.fillStyle = '#2B5D79';
    ctx.fillRect(-29, -5 - armSwing, 9, 18);
    ctx.fillRect(20, -5 + armSwing, 9, 18);

    // Body
    ctx.fillStyle = '#4682B4';
    ctx.fillRect(-20, -20, 40, 40);

    // Chest panel
    ctx.fillStyle = '#7DCBE8';
    ctx.fillRect(-11, -10, 22, 14);

    // Head
    ctx.fillStyle = '#5A9FD6';
    ctx.beginPath();
    ctx.arc(0, -35, 15, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-9, -39, 6, 6);
    ctx.fillRect(3, -39, 6, 6);

    ctx.restore();

    // Jet wings use the original world coordinates.
    if (player.isJumping) {
        drawJetWings();
    }
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

function drawBoostPlatform(platform) {
    const x = platform.x;
    const y = platform.y - cameraOffset;
    const width = platform.width;

    ctx.save();

    // Dark base beneath the springs.
    ctx.fillStyle = '#24364B';
    ctx.fillRect(x, y + 24, width, 8);

    // Three visible metal springs.
    ctx.strokeStyle = '#A9BED0';
    ctx.lineWidth = 3;

    [0.2, 0.5, 0.8].forEach(position => {
        const springX = x + width * position;

        ctx.beginPath();
        ctx.moveTo(springX, y + 7);
        ctx.lineTo(springX - 6, y + 11);
        ctx.lineTo(springX + 6, y + 15);
        ctx.lineTo(springX - 6, y + 19);
        ctx.lineTo(springX, y + 24);
        ctx.stroke();
    });

    // Glowing launch plate: its top matches the collision surface.
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#00B8D4';
    ctx.fillRect(x, y, width, 7);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#A7FFFF';
    ctx.fillRect(x + 3, y, width - 6, 2);

    // Upward chevrons communicate the launch direction.
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    [0.3, 0.7].forEach(position => {
        const arrowX = x + width * position;

        ctx.beginPath();
        ctx.moveTo(arrowX - 5, y - 3);
        ctx.lineTo(arrowX, y - 8);
        ctx.lineTo(arrowX + 5, y - 3);
        ctx.stroke();
    });

    ctx.restore();
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.save();
        
        

        if (platform.type === PLATFORM_TYPES.OSCILLATING) {
            ctx.translate(platform.x + platform.width / 2, platform.y + platform.height / 2);
            ctx.translate(-(platform.x + platform.width / 2), -(platform.y + platform.height / 2));
        }
        
        // Set different colors for different platform types
        if (platform.type === PLATFORM_TYPES.BOOST) {
            ctx.fillStyle = '#00E5FF'; // Cyan jump pad
        } else if (platform.type === PLATFORM_TYPES.FALLING) {
            ctx.fillStyle = '#FF6347'; // Tomato color for falling platforms
        } else if (platform.type === PLATFORM_TYPES.OSCILLATING) {
            ctx.fillStyle = '#FFD700'; // Golden color for oscillating platforms
        } else {
            ctx.fillStyle = platform.id === PRACTICE_COURSE.length - 1 ? '#2E8B57' : '#8B4513'; // Green marks the finish
        }

        if (platform.type === PLATFORM_TYPES.BOOST) {
            drawBoostPlatform(platform);
        } else {
            ctx.fillRect(
                platform.x,
                platform.y - cameraOffset,
                platform.width,
                platform.height
            );
}
        if (platform.type === PLATFORM_TYPES.BOOST) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                'BOOST',
                platform.x + platform.width / 2,
                platform.y - cameraOffset - 12
        );
}
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
        // Platform 15 is our first test jump pad.
        if (index === 14) {
            platform.type = PLATFORM_TYPES.BOOST;
            platform.boostPower = -20;
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


            // Apply the boost after the normal landing resets.
            if (platform.type === PLATFORM_TYPES.BOOST) {
                player.dy = platform.boostPower;
                player.isJumping = true;
                player.jumpCount = 0;
                player.standingPlatform = null;
            }

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
    if (platformsLanded.has(PRACTICE_COURSE.length - 1)) {
        gameOver = true;
        showGameOverDialog(
            "You reached the spaceship! Ready for takeoff!"
        );
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
initializeStars(); // Create star positions once.
resetGame(); // Load the fixed course before the first frame.
gameLoop();

}

    // We'll add JavaScript code here
    