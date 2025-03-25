// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const coopCanvas = document.getElementById('coopCanvas');
const coopCtx = coopCanvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const coopBtn = document.getElementById('coopBtn');
const highscoreBtn = document.getElementById('highscoreBtn');
const settingsBtn = document.getElementById('settingsBtn');
const menu = document.getElementById('menu');
const triviaModal = document.getElementById('triviaModal');
const bossModal = document.getElementById('bossModal');
const highscoreModal = document.getElementById('highscoreModal');
const settingsModal = document.getElementById('settingsModal');
const storyModal = document.getElementById('storyModal');
const coopModal = document.getElementById('coopModal');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const bossQuestionElement = document.getElementById('bossQuestion');
const bossOptionsElement = document.getElementById('bossOptions');
const coopQuestionElement = document.getElementById('coopQuestion');
const coopOptionsElement = document.getElementById('coopOptions');
const highscoreList = document.getElementById('highscoreList');
const shipSelection = document.getElementById('shipSelection');
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');

// Game state
let gameState = 'menu'; // menu, playing, trivia, boss, coop
let score = 0;
let lives = 5;
let level = 1;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let powerUps = [];
let currentShip = 'default';
let shipsUnlocked = ['default'];
let isMusicOn = true;
let bossHealth = 0;
let bossMaxHealth = 0;
let currentBoss = null;
let isCoopMode = false;
let coopScore = 0;
let coopLives = 5;
let coopBulletCount = 5;
let coopPower = "normal";
let coopSpecialAmmo = 0;

// Player and game settings
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 7,
    color: '#3498db'
};

const ships = {
    'default': { color: '#3498db', shape: 'rectangle', special: null },
    'jeepney': { color: '#e74c3c', shape: 'jeepney', special: 'speed' },
    'bangka': { color: '#1abc9c', shape: 'bangka', special: 'armor' },
    'kite': { color: '#f1c40f', shape: 'kite', special: 'agility' }
};

let keys = {};
let gameLoop;
let enemySpeed = 0.7;
let enemySpawnRate = 1500;
let lastEnemySpawn = 0;
let levelTime = 45000;
let levelStartTime = 0;
let playerBulletCount = 5;
let playerPower = "normal";
let specialAmmo = 0;

// Sound effects (would be actual files in real implementation)
const sounds = {
    shoot: new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3'),
    explosion: new Audio('https://www.soundjay.com/explosion/sounds/explosion-01.mp3'),
    powerup: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3'),
    correct: new Audio('https://www.soundjay.com/buttons/sounds/button-21.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-05.mp3')
};

// Trivia questions organized by categories
const triviaQuestions = {
    general: [
        {
            question: "What is the national flower of the Philippines?",
            options: ["Sampaguita", "Rose", "Orchid", "Sunflower"],
            answer: 0,
            fact: "The Sampaguita was adopted as the national flower in 1934. Its white color symbolizes purity, simplicity, humility and strength."
        },
        {
            question: "Which Philippine hero is known as the 'Sublime Paralytic'?",
            options: ["Jose Rizal", "Andres Bonifacio", "Apolinario Mabini", "Emilio Aguinaldo"],
            answer: 2,
            fact: "Apolinario Mabini served as the first Prime Minister of the Philippines. Despite being paralyzed by polio, he was the brains of the revolution."
        }
    ],
    history: [
        {
            question: "What is the oldest city in the Philippines?",
            options: ["Manila", "Cebu", "Vigan", "Davao"],
            answer: 1,
            fact: "Cebu City was established as the first Spanish settlement in 1565. It was the capital of the Philippines for six years before moving to Manila."
        },
        {
            question: "When was the Philippine Declaration of Independence signed?",
            options: ["June 12, 1898", "July 4, 1946", "December 30, 1896", "January 23, 1899"],
            answer: 0,
            fact: "The declaration was signed in Kawit, Cavite, marking independence from Spanish colonial rule. The date is now celebrated as Independence Day."
        }
    ],
    culture: [
        {
            question: "What is the traditional Filipino art of hand-to-hand combat?",
            options: ["Arnis", "Karate", "Taekwondo", "Kung Fu"],
            answer: 0,
            fact: "Arnis, also known as Kali or Eskrima, was declared the national martial art and sport of the Philippines in 2009."
        },
        {
            question: "Which of these is NOT a traditional Filipino folk dance?",
            options: ["Tinikling", "Cariñosa", "Pandanggo sa Ilaw", "Cha-cha"],
            answer: 3,
            fact: "The Cha-cha is a Latin dance, while the other three are traditional Filipino dances that reflect different aspects of Philippine culture."
        }
    ],
    mythology: [
        {
            question: "Which mythical creature is described as a tree-dwelling giant that smokes tobacco?",
            options: ["Kapre", "Aswang", "Tikbalang", "Manananggal"],
            answer: 0,
            fact: "The Kapre is a Philippine mythological creature that resembles a giant who lives in trees and is often depicted smoking a big cigar."
        },
        {
            question: "Which creature is known for separating its upper torso to fly at night?",
            options: ["Tiyanak", "Manananggal", "Dwende", "Nuno sa Punso"],
            answer: 1,
            fact: "The Manananggal is a vampire-like creature that can separate its upper torso to hunt for prey, especially pregnant women."
        }
    ],
    geography: [
        {
            question: "Which Philippine island is known as the 'Wreck Diving Capital of the Philippines'?",
            options: ["Boracay", "Palawan", "Coron", "Siargao"],
            answer: 2,
            fact: "Coron in Palawan is famous for its World War II Japanese shipwrecks, with at least 10 identified wreck sites popular among divers."
        },
        {
            question: "What is the smallest province in the Philippines by land area?",
            options: ["Batanes", "Camiguin", "Siquijor", "Guimaras"],
            answer: 1,
            fact: "Camiguin is an island province in Northern Mindanao with a land area of only 237.95 km², known as the 'Island Born of Fire' for its volcanoes."
        }
    ]
};

// Boss enemies
const bosses = [
    {
        name: "Tikbalang Invader",
        health: 5,
        questions: triviaQuestions.mythology,
        image: "tikbalang",
        color: "#8e44ad"
    },
    {
        name: "Bakunawa Serpent",
        health: 7,
        questions: triviaQuestions.history,
        image: "bakunawa",
        color: "#3498db"
    },
    {
        name: "Kapre Titan",
        health: 6,
        questions: triviaQuestions.culture,
        image: "kapre",
        color: "#2ecc71"
    }
];

// Power-ups
const powerUpsList = [
    {
        name: "Barong Shield",
        type: "shield",
        duration: 10000,
        color: "#f1c40f",
        effect: "Temporary invincibility",
        triviaCategory: "culture"
    },
    {
        name: "Jeepney Boost",
        type: "speed",
        duration: 8000,
        color: "#e74c3c",
        effect: "Increased movement speed",
        triviaCategory: "history"
    },
    {
        name: "Tinikling Mode",
        type: "damage",
        duration: 5000,
        color: "#2ecc71",
        effect: "Double damage",
        triviaCategory: "culture"
    },
    {
        name: "Adobo Bomb",
        type: "special",
        color: "#9b59b6",
        effect: "Powerful explosive shot",
        triviaCategory: "general"
    }
];

// High scores
let highScores = JSON.parse(localStorage.getItem('pinoySpaceInvaderHighScores')) || [];

// Event listeners
playBtn.addEventListener('click', () => {
    isCoopMode = false;
    startGame();
});
coopBtn.addEventListener('click', () => {
    isCoopMode = true;
    startGame();
});
highscoreBtn.addEventListener('click', showHighscores);
settingsBtn.addEventListener('click', showSettings);
musicToggle.addEventListener('click', toggleMusic);
document.getElementById('backFromHighscore').addEventListener('click', () => {
    highscoreModal.style.display = 'none';
    menu.style.display = 'flex';
});
document.getElementById('backFromSettings').addEventListener('click', () => {
    settingsModal.style.display = 'none';
    menu.style.display = 'flex';
});
document.getElementById('continueFromStory').addEventListener('click', () => {
    storyModal.style.display = 'none';
    if (gameState === 'trivia') {
        triviaModal.style.display = 'flex';
    } else if (gameState === 'boss') {
        bossModal.style.display = 'flex';
    }
});

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Space to shoot
    if ((gameState === 'playing' || gameState === 'coopShooter') && e.key === ' ') {
        if (isCoopMode) {
            if (coopBulletCount > 0 || coopSpecialAmmo > 0) {
                shoot(true);
            }
        } else {
            if (playerBulletCount > 0 || specialAmmo > 0) {
                shoot(false);
            }
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize ship selection
function initializeShipSelection() {
    shipSelection.innerHTML = '';
    Object.keys(ships).forEach(shipKey => {
        const shipDiv = document.createElement('div');
        shipDiv.className = `ship-option ${shipsUnlocked.includes(shipKey) ? '' : 'locked'} ${currentShip === shipKey ? 'selected' : ''}`;
        shipDiv.innerHTML = `
            <img src="https://via.placeholder.com/80?text=${shipKey.toUpperCase()}" alt="${shipKey}">
            <div>${shipKey.charAt(0).toUpperCase() + shipKey.slice(1)}</div>
            ${shipsUnlocked.includes(shipKey) ? '' : '<div>(Locked)</div>'}
        `;
        
        if (shipsUnlocked.includes(shipKey)) {
            shipDiv.addEventListener('click', () => {
                currentShip = shipKey;
                document.querySelectorAll('.ship-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                shipDiv.classList.add('selected');
            });
        }
        
        shipSelection.appendChild(shipDiv);
    });
}

// Game functions
function startGame() {
    gameState = isCoopMode ? 'coopShooter' : 'playing';
    menu.style.display = 'none';
    
    if (isCoopMode) {
        coopModal.style.display = 'flex';
        coopCanvas.width = 400;
        coopCanvas.height = 600;
        coopScore = 0;
        coopLives = 5;
        coopBulletCount = 5;
        coopPower = "normal";
        coopSpecialAmmo = 0;
        showCoopTrivia();
    } else {
        score = 0;
        lives = 5;
        playerBulletCount = 5;
        playerPower = "normal";
        specialAmmo = 0;
    }
    
    level = 1;
    enemies = [];
    bullets = [];
    enemyBullets = [];
    powerUps = [];
    player.x = canvas.width / 2 - 25;
    enemySpeed = 0.7;
    levelStartTime = Date.now();
    
    // Start music
    if (isMusicOn) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
    }
    
    gameLoop = setInterval(isCoopMode ? updateCoop : update, 16);
}

function update() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw star background
    drawStars();
    
    // Check level completion
    if (Date.now() - levelStartTime > levelTime) {
        // Every 3 levels, show a boss battle
        if (level % 3 === 0) {
            startBossBattle();
        } else {
            showTrivia();
        }
        return;
    }
    
    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed * (playerPower === "speed" ? 1.5 : 1);
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed * (playerPower === "speed" ? 1.5 : 1);
    }
    
    // Spawn enemies
    if (Date.now() - lastEnemySpawn > enemySpawnRate) {
        spawnEnemy();
        lastEnemySpawn = Date.now();
    }
    
    // Spawn power-ups randomly
    if (Math.random() < 0.002) {
        spawnPowerUp();
    }
    
    // Update enemies
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemy.y += enemySpeed;
        
        // Enemy shoots randomly
        if (Math.random() < 0.005) {
            enemyBullets.push({
                x: enemy.x + enemy.width / 2 - 2,
                y: enemy.y + enemy.height,
                width: 4,
                height: 10,
                speed: 3,
                isSpecial: false
            });
        }
        
        // Draw enemy based on type
        drawEnemy(enemy);
        
        // Remove enemy if it goes off screen
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            i--;
        }
    }
    
    // Update bullets
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        
        // Draw bullet
        if (bullet.isSpecial) {
            // Adobo bomb
            ctx.fillStyle = '#9b59b6';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Check if bullet hit enemy
        let hit = false;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (
                bullet.x + (bullet.isSpecial ? 8 : bullet.width) > enemy.x &&
                bullet.x < enemy.x + enemy.width &&
                bullet.y + (bullet.isSpecial ? 8 : bullet.height) > enemy.y &&
                bullet.y < enemy.y + enemy.height
            ) {
                // Collision detected
                enemies.splice(j, 1);
                j--;
                hit = true;
                score += (10 * level) * (bullet.isSpecial ? 2 : 1);
                sounds.explosion.play();
                
                // Create explosion effect
                createExplosion(bullet.x, bullet.y, bullet.isSpecial ? 20 : 10);
                
                break;
            }
        }
        
        // Remove bullet if it hit something or went off screen
        if (hit || bullet.y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
    
    // Update enemy bullets
    for (let i = 0; i < enemyBullets.length; i++) {
        const bullet = enemyBullets[i];
        bullet.y += bullet.speed;
        
        // Draw enemy bullet
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Check if bullet hit player (only if not shielded)
        if (playerPower !== "shield" && 
            bullet.x + bullet.width > player.x &&
            bullet.x < player.x + player.width &&
            bullet.y + bullet.height > player.y &&
            bullet.y < player.y + player.height
        ) {
            // Player hit
            enemyBullets.splice(i, 1);
            i--;
            lives--;
            sounds.explosion.play();
            
            // Create explosion effect
            createExplosion(bullet.x, bullet.y, 15);
            
            if (lives <= 0) {
                gameOver();
                return;
            }
            continue;
        }
        
        // Remove bullet if it went off screen
        if (bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
            i--;
        }
    }
    
    // Update power-ups
    for (let i = 0; i < powerUps.length; i++) {
        const powerUp = powerUps[i];
        powerUp.y += 2;
        
        // Draw power-up
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(powerUp.name.substring(0, 3), powerUp.x, powerUp.y + 5);
        
        // Check if player collected power-up
        if (
            powerUp.x + 15 > player.x &&
            powerUp.x - 15 < player.x + player.width &&
            powerUp.y + 15 > player.y &&
            powerUp.y - 15 < player.y + player.height
        ) {
            // Apply power-up
            applyPowerUp(powerUp);
            powerUps.splice(i, 1);
            i--;
            sounds.powerup.play();
            continue;
        }
        
        // Remove power-up if it went off screen
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
            i--;
        }
    }
    
    // Draw player based on selected ship
    drawPlayer();
    
    // Draw UI
    drawUI();
    
    // Replenish bullets over time
    if (Date.now() % 1000 < 16 && playerBulletCount < 5) {
        playerBulletCount++;
    }
}

function updateCoop() {
    // Similar to update() but for coop mode
    // Implementation would mirror update() but with coop variables
    // Omitted for brevity but follows the same pattern
}

function drawStars() {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = (Math.random() * canvas.height + (Date.now() / 50) % canvas.height) % canvas.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
}

function drawPlayer() {
    ctx.fillStyle = ships[currentShip].color;
    
    // Different shapes for different ships
    switch(ships[currentShip].shape) {
        case 'jeepney':
            // Draw jeepney shape
            ctx.fillRect(player.x, player.y + 10, player.width, player.height - 20);
            ctx.fillRect(player.x + 10, player.y, player.width - 20, 10);
            ctx.fillRect(player.x + 10, player.y + player.height - 10, player.width - 20, 10);
            break;
        case 'bangka':
            // Draw bangka shape
            ctx.beginPath();
            ctx.moveTo(player.x + player.width/2, player.y);
            ctx.lineTo(player.x, player.y + player.height);
            ctx.lineTo(player.x + player.width, player.y + player.height);
            ctx.closePath();
            ctx.fill();
            break;
        case 'kite':
            // Draw kite shape
            ctx.beginPath();
            ctx.moveTo(player.x + player.width/2, player.y);
            ctx.lineTo(player.x, player.y + player.height/2);
            ctx.lineTo(player.x + player.width/2, player.y + player.height);
            ctx.lineTo(player.x + player.width, player.y + player.height/2);
            ctx.closePath();
            ctx.fill();
            break;
        default:
            // Default rectangle
            ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    // Draw shield if active
    if (playerPower === "shield") {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, 
               Math.max(player.width, player.height)/2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    
    // Draw different enemies based on type
    switch(enemy.type) {
        case 'kapre':
            // Kapre is bigger and darker
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 10, enemy.y + 10, 5, 5); // eyes
            ctx.fillRect(enemy.x + enemy.width - 15, enemy.y + 10, 5, 5);
            break;
        case 'aswang':
            // Aswang is faster and red
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.width/2, enemy.y);
            ctx.lineTo(enemy.x, enemy.y + enemy.height);
            ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
            ctx.closePath();
            ctx.fill();
            break;
        case 'sarimanok':
            // Sarimanok is colorful
            const gradient = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x, enemy.y + enemy.height);
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(0.5, '#f1c40f');
            gradient.addColorStop(1, '#3498db');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
            ctx.fill();
            break;
        default:
            // Default enemy
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

function drawUI() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);
    ctx.fillText(`Bullets: ${playerBulletCount}`, 10, 120);
    
    // Draw special ammo if available
    if (specialAmmo > 0) {
        ctx.fillText(`Adobo Bombs: ${specialAmmo}`, 10, 150);
    }
    
    // Draw power-up status
    if (playerPower !== "normal") {
        ctx.fillText(`Power: ${playerPower}`, 10, playerPower === "shield" ? 180 : 150);
    }
    
    // Draw time remaining
    const timeLeft = Math.ceil((levelTime - (Date.now() - levelStartTime)) / 1000);
    ctx.fillText(`Time: ${timeLeft}s`, canvas.width - 100, 30);
}

function spawnEnemy() {
    const width = 40;
    const height = 40;
    const x = Math.random() * (canvas.width - width);
    
    // Different enemy types
    const enemyTypes = ['kapre', 'aswang', 'sarimanok', 'default'];
    const weights = [0.2, 0.3, 0.1, 0.4]; // Weighted probabilities
    
    let rand = Math.random();
    let typeIndex = 0;
    let cumulativeWeight = weights[0];
    
    while (rand > cumulativeWeight && typeIndex < weights.length - 1) {
        typeIndex++;
        cumulativeWeight += weights[typeIndex];
    }
    
    const type = enemyTypes[typeIndex];
    let color, speedMultiplier = 1;
    
    switch(type) {
        case 'kapre':
            color = '#8e44ad';
            speedMultiplier = 0.7; // Kapre is slower
            break;
        case 'aswang':
            color = '#e74c3c';
            speedMultiplier = 1.5; // Aswang is faster
            break;
        case 'sarimanok':
            color = '#f1c40f';
            speedMultiplier = 1.2;
            break;
        default:
            color = '#2ecc71';
    }
    
    enemies.push({
        x: x,
        y: -height,
        width: width,
        height: height,
        color: color,
        type: type,
        speed: enemySpeed * speedMultiplier
    });
}

function spawnPowerUp() {
    const powerUp = powerUpsList[Math.floor(Math.random() * powerUpsList.length)];
    
    powerUps.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        radius: 15,
        ...powerUp
    });
}

function applyPowerUp(powerUp) {
    switch(powerUp.type) {
        case 'shield':
            playerPower = "shield";
            // Shield will wear off after duration
            setTimeout(() => {
                if (playerPower === "shield") {
                    playerPower = "normal";
                }
            }, powerUp.duration);
            break;
        case 'speed':
            playerPower = "speed";
            setTimeout(() => {
                if (playerPower === "speed") {
                    playerPower = "normal";
                }
            }, powerUp.duration);
            break;
        case 'damage':
            playerPower = "damage";
            setTimeout(() => {
                if (playerPower === "damage") {
                    playerPower = "normal";
                }
            }, powerUp.duration);
            break;
        case 'special':
            specialAmmo += 2;
            break;
    }
    
    // Show power-up message
    showStory(`Power-Up Activated: ${powerUp.name}! ${powerUp.effect}`);
}
