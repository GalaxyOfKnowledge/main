// Game constants and variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const FPS = 60;

// Game states
const GAME_STATE = {
    MENU: 'menu',
    GAME: 'game',
    TRIVIA: 'trivia',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete',
    GAME_COMPLETE: 'game_complete',
    HIGH_SCORE: 'high_score',
    SETTINGS: 'settings'
};

// Game settings
let settings = {
    difficulty: 'medium',
    sound: 'on',
    startingLives: 3
};

// Game variables
let currentState = GAME_STATE.MENU;
let score = 0;
let level = 1;
let lives = 3;
let triviaCorrect = 0;
let triviaTotal = 0;
let gameInterval;
let enemies = [];
let bullets = [];
let stars = [];
let powerUps = [];
let currentTrivia = null;
let playerHasTripleShot = false;
let tripleShotCount = 0;

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 40,
    speed: 6,
    color: '#00FF00',
    isMovingLeft: false,
    isMovingRight: false,
    shootCooldown: 0,
    shootCooldownMax: 15,
    bulletSpeed: 12,
    bulletDamage: 1,
    invincible: false,
    invincibleTime: 0,
    tripleShot: 0
};

// Pinoy Trivia Questions
const triviaQuestions = [
    {
        question: "What is the national animal of the Philippines?",
        options: ["Tamaraw", "Carabao", "Philippine Eagle", "Tarsier"],
        correctIndex: 1
    },
    {
        question: "Which Filipino dish is made with pig's blood?",
        options: ["Adobo", "Sinigang", "Dinuguan", "Kare-kare"],
        correctIndex: 2
    },
    {
        question: "What is the Filipino term for the traditional healing massage?",
        options: ["Hilot", "Dagdagay", "Bentosa", "Lana"],
        correctIndex: 0
    },
    {
        question: "Which is the largest island in the Philippines?",
        options: ["Cebu", "Mindanao", "Palawan", "Luzon"],
        correctIndex: 3
    },
    {
        question: "What is the name of the traditional Filipino martial art?",
        options: ["Sikaran", "Arnis", "Mano Mano", "Yaw-Yan"],
        correctIndex: 1
    },
    {
        question: "Which Filipino festival is known as the 'Mother of All Philippine Festivals'?",
        options: ["Panagbenga", "Sinulog", "Ati-Atihan", "MassKara"],
        correctIndex: 2
    },
    {
        question: "What is the Filipino term for 'neighborhood'?",
        options: ["Barangay", "Purok", "Barrio", "Sitio"],
        correctIndex: 0
    },
    {
        question: "Which mountain is the highest peak in the Philippines?",
        options: ["Mount Pulag", "Mount Apo", "Mount Mayon", "Mount Pinatubo"],
        correctIndex: 1
    },
    {
        question: "Which Filipino dessert consists of shaved ice with various toppings?",
        options: ["Bibingka", "Puto", "Halo-halo", "Leche Flan"],
        correctIndex: 2
    },
    {
        question: "What is the national flower of the Philippines?",
        options: ["Ylang-ylang", "Sampaguita", "Waling-waling", "Gumamela"],
        correctIndex: 1
    },
    {
        question: "Which Philippine president implemented Martial Law in 1972?",
        options: ["Corazon Aquino", "Joseph Estrada", "Ferdinand Marcos", "Fidel Ramos"],
        correctIndex: 2
    },
    {
        question: "What is the traditional Filipino house made of bamboo and nipa palm?",
        options: ["Torogan", "Bahay Kubo", "Bahay na Bato", "Ivatan House"],
        correctIndex: 1
    },
    {
        question: "Which Philippine revolutionary is known as the 'Sublime Paralytic'?",
        options: ["Andres Bonifacio", "Apolinario Mabini", "Emilio Aguinaldo", "Jose Rizal"],
        correctIndex: 1
    },
    {
        question: "What is the Filipino term for Christmas Eve feast?",
        options: ["Simbang Gabi", "Noche Buena", "Media Noche", "Parol"],
        correctIndex: 1
    },
    {
        question: "Which Philippine lake is the largest lake on Luzon Island?",
        options: ["Taal Lake", "Laguna de Bay", "Lake Buhi", "Lake Naujan"],
        correctIndex: 1
    }
];

// Power-up types
const POWER_UP_TYPES = {
    EXTRA_LIFE: { color: '#FF66FF', effect: 'Extra Life' },
    TRIPLE_SHOT: { color: '#FFFF00', effect: 'Triple Shot' },
    SPEED_BOOST: { color: '#00FFFF', effect: 'Speed Boost' },
    SHIELD: { color: '#6666FF', effect: 'Shield' }
};

// High scores
let highScores = JSON.parse(localStorage.getItem('pinoySpaceInvadersHighScores')) || [];

// DOM elements
const screens = {
    mainMenu: document.getElementById('main-menu'),
    game: document.getElementById('game-screen'),
    trivia: document.getElementById('trivia-screen'),
    gameOver: document.getElementById('game-over'),
    levelComplete: document.getElementById('level-complete'),
    gameComplete: document.getElementById('game-complete'),
    highScore: document.getElementById('high-score-screen'),
    settings: document.getElementById('settings-screen')
};

// HUD elements
const hudElements = {
    score: document.getElementById('score-display'),
    level: document.getElementById('level-display'),
    lives: document.getElementById('lives-display')
};

// Initialize stars
function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1
        });
    }
}

// Initialize game
function initGame() {
    // Reset game variables
    score = 0;
    level = 1;
    lives = parseInt(settings.startingLives);
    triviaCorrect = 0;
    triviaTotal = 0;
    
    // Set difficulty based on settings
    switch(settings.difficulty) {
        case 'easy':
            player.speed = 8;
            player.shootCooldownMax = 12;
            break;
        case 'medium':
            player.speed = 6;
            player.shootCooldownMax = 15;
            break;
        case 'hard':
            player.speed = 5;
            player.shootCooldownMax = 18;
            break;
    }
    
    // Reset player position
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 80;
    player.isMovingLeft = false;
    player.isMovingRight = false;
    player.shootCooldown = 0;
    player.invincible = false;
    player.invincibleTime = 0;
    player.tripleShot = 0;
    
    // Clear arrays
    enemies = [];
    bullets = [];
    powerUps = [];
    
    // Create stars
    initStars();
    
    // Create enemies for level 1
    createEnemiesForLevel();
    
    // Update HUD
    updateHUD();
    
    // Start game loop
    startGameLoop();
}

// Create enemies for current level
function createEnemiesForLevel() {
    const rows = Math.min(3 + Math.floor(level / 2), 6);
    const cols = Math.min(6 + Math.floor(level / 3), 10);
    const spacing = (canvas.width - 100) / cols;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const type = Math.floor(Math.random() * 3);
            let color, health, points;
            
            switch(type) {
                case 0: // Basic enemy
                    color = '#FF0000';
                    health = 1;
                    points = 50;
                    break;
                case 1: // Medium enemy
                    color = '#FF6600';
                    health = 2;
                    points = 100;
                    break;
                case 2: // Hard enemy
                    color = '#FF9900';
                    health = 3;
                    points = 150;
                    break;
            }
            
            enemies.push({
                x: col * spacing + 50,
                y: row * 60 + 80,
                width: 50,
                height: 40,
                color: color,
                health: health,
                maxHealth: health,
                points: points,
                speed: 1 + (level * 0.2),
                direction: 1,
                shootChance: 0.001 + (level * 0.0005)
            });
        }
    }
}

// Update HUD elements
function updateHUD() {
    hudElements.score.textContent = `Score: ${score}`;
    hudElements.level.textContent = `Level: ${level}`;
    hudElements.lives.textContent = `Lives: ${lives}`;
}

// Start game loop
function startGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    gameInterval = setInterval(() => {
        update();
        draw();
    }, 1000 / FPS);
}

// Stop game loop
function stopGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

// Update game state
function update() {
    // Update player
    updatePlayer();
    
    // Update bullets
    updateBullets();
    
    // Update enemies
    updateEnemies();
    
    // Update power-ups
    updatePowerUps();
    
    // Update stars
    updateStars();
    
    // Check if level is complete
    if (enemies.length === 0) {
        stopGameLoop();
        showLevelComplete();
    }
    
    // Check if game is over
    if (lives <= 0) {
        stopGameLoop();
        showGameOver();
    }
}

// Update player
function updatePlayer() {
    // Movement
    if (player.isMovingLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (player.isMovingRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    
    // Shooting cooldown
    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }
    
    // Invincibility frames
    if (player.invincible) {
        player.invincibleTime--;
        if (player.invincibleTime <= 0) {
            player.invincible = false;
        }
    }
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Move bullet
        bullet.y += bullet.speed;
        
        // Check if bullet is off-screen
        if ((bullet.speed < 0 && bullet.y + bullet.height < 0) || 
            (bullet.speed > 0 && bullet.y > canvas.height)) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check for collisions with player (enemy bullets)
        if (bullet.speed > 0 && !player.invincible && 
            bullet.x < player.x + player.width && 
            bullet.x + bullet.width > player.x && 
            bullet.y < player.y + player.height && 
            bullet.y + bullet.height > player.y) {
            // Player hit by enemy bullet
            lives--;
            updateHUD();
            bullets.splice(i, 1);
            player.invincible = true;
            player.invincibleTime = 60; // 1 second invincibility
            continue;
        }
        
        // Check for collisions with enemies (player bullets)
        if (bullet.speed < 0) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (bullet.x < enemy.x + enemy.width && 
                    bullet.x + bullet.width > enemy.x && 
                    bullet.y < enemy.y + enemy.height && 
                    bullet.y + bullet.height > enemy.y) {
                    // Enemy hit by player bullet
                    enemy.health -= bullet.damage;
                    bullets.splice(i, 1);
                    
                    // Check if enemy is destroyed
                    if (enemy.health <= 0) {
                        score += enemy.points;
                        updateHUD();
                        
                        // Chance to drop power-up
                        if (Math.random() < 0.1) {
                            dropPowerUp(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        }
                        
                        enemies.splice(j, 1);
                    }
                    
                    break;
                }
            }
        }
    }
}

// Update enemies
function updateEnemies() {
    let moveDown = false;
    let leftEdge = canvas.width;
    let rightEdge = 0;
    
    // Find leftmost and rightmost enemies
    for (const enemy of enemies) {
        leftEdge = Math.min(leftEdge, enemy.x);
        rightEdge = Math.max(rightEdge, enemy.x + enemy.width);
    }
    
    // Check if need to move down and change direction
    if (leftEdge <= 10 || rightEdge >= canvas.width - 10) {
        moveDown = true;
    }
    
    // Update all enemies
    for (const enemy of enemies) {
        // Move horizontally
        enemy.x += enemy.speed * (moveDown ? 0 : enemy.direction);
        
        // Move down and change direction if needed
        if (moveDown) {
            enemy.y += 20;
            enemy.direction *= -1;
        }
        
        // Random shooting
        if (Math.random() < enemy.shootChance) {
            bullets.push({
                x: enemy.x + enemy.width / 2 - 2,
                y: enemy.y + enemy.height,
                width: 4,
                height: 10,
                speed: 5,
                damage: 1,
                color: '#FF6666'
            });
        }
        
        // Check if enemy reached player level
        if (enemy.y + enemy.height >= player.y) {
            lives = 0; // Game over if enemies reach the bottom
            updateHUD();
            return;
        }
    }
}

// Drop power-up
function dropPowerUp(x, y) {
    const types = Object.values(POWER_UP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUps.push({
        x: x - 15,
        y: y,
        width: 30,
        height: 30,
        type: type,
        speed: 2
    });
}

// Update power-ups
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        
        // Move power-up
        powerUp.y += powerUp.speed;
        
        // Check if power-up is off-screen
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
            continue;
        }
        
        // Check for collision with player
        if (powerUp.x < player.x + player.width && 
            powerUp.x + powerUp.width > player.x && 
            powerUp.y < player.y + player.height && 
            powerUp.y + powerUp.height > player.y) {
            // Apply power-up effect
            applyPowerUp(powerUp.type);
            powerUps.splice(i, 1);
        }
    }
}

// Apply power-up effect
function applyPowerUp(type) {
    switch(type) {
        case POWER_UP_TYPES.EXTRA_LIFE:
            lives++;
            break;
        case POWER_UP_TYPES.TRIPLE_SHOT:
            // Next 5 shots will be triple
            player.tripleShot = 5;
            break;
        case POWER_UP_TYPES.SPEED_BOOST:
            // Temporary speed boost
            player.speed += 2;
            setTimeout(() => {
                player.speed -= 2;
            }, 10000);
            break;
        case POWER_UP_TYPES.SHIELD:
            // Shield for 10 seconds
            player.invincible = true;
            player.invincibleTime = 600;
            break;
    }
    
    updateHUD();
}

// Update stars
function updateStars() {
    for (const star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

// Draw functions
function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    drawStars();
    
    // Draw player
    drawPlayer();
    
    // Draw enemies
    drawEnemies();
    
    // Draw bullets
    drawBullets();
    
    // Draw power-ups
    drawPowerUps();
}

function drawStars() {
    ctx.fillStyle = 'white';
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    // Make player flash when invincible
    if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillStyle = '#FFFFFF';
    }
    
    // Draw player ship (triangular shape)
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
}

function drawEnemies() {
    for (const enemy of enemies) {
        // Enemy body
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        