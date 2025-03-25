// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const highscoreBtn = document.getElementById('highscoreBtn');
const settingsBtn = document.getElementById('settingsBtn');
const menu = document.getElementById('menu');
const triviaModal = document.getElementById('triviaModal');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');

// Game state
let gameState = 'menu'; // menu, playing, trivia
let score = 0;
let lives = 3;
let level = 1;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    color: '#3498db'
};
let keys = {};
let gameLoop;
let enemySpeed = 1;
let enemySpawnRate = 1000; // ms
let lastEnemySpawn = 0;
let levelTime = 30000; // 30 seconds per level
let levelStartTime = 0;
let triviaQuestions = [
    {
        question: "What is the national flower of the Philippines?",
        options: ["Sampaguita", "Rose", "Orchid", "Sunflower"],
        answer: 0,
        correctBonus: { score: 100, lives: 0, power: "double" },
        wrongPenalty: { speed: 1.2, bullets: -1 }
    },
    {
        question: "Which Philippine hero is known as the 'Sublime Paralytic'?",
        options: ["Jose Rizal", "Andres Bonifacio", "Apolinario Mabini", "Emilio Aguinaldo"],
        answer: 2,
        correctBonus: { score: 150, lives: 1, power: "shield" },
        wrongPenalty: { speed: 1.5, bullets: 0 }
    },
    {
        question: "What is the oldest city in the Philippines?",
        options: ["Manila", "Cebu", "Vigan", "Davao"],
        answer: 1,
        correctBonus: { score: 200, lives: 0, power: "triple" },
        wrongPenalty: { speed: 1.3, bullets: -1 }
    },
    {
        question: "Which Philippine island is known as the 'Wreck Diving Capital of the Philippines'?",
        options: ["Boracay", "Palawan", "Coron", "Siargao"],
        answer: 2,
        correctBonus: { score: 250, lives: 0, power: "rapid" },
        wrongPenalty: { speed: 1.4, bullets: -2 }
    },
    {
        question: "What is the traditional Filipino art of hand-to-hand combat?",
        options: ["Arnis", "Karate", "Taekwondo", "Kung Fu"],
        answer: 0,
        correctBonus: { score: 300, lives: 1, power: "shield" },
        wrongPenalty: { speed: 1.5, bullets: -1 }
    }
];
let currentTrivia = null;
let playerBulletCount = 3;
let playerPower = "normal";

// Event listeners
playBtn.addEventListener('click', startGame);
highscoreBtn.addEventListener('click', showHighscores);
settingsBtn.addEventListener('click', showSettings);

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Space to shoot
    if (gameState === 'playing' && e.key === ' ' && playerBulletCount > 0) {
        shoot();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game functions
function startGame() {
    gameState = 'playing';
    menu.style.display = 'none';
    score = 0;
    lives = 3;
    level = 1;
    enemies = [];
    bullets = [];
    enemyBullets = [];
    player.x = canvas.width / 2 - 25;
    playerBulletCount = 3;
    playerPower = "normal";
    enemySpeed = 1;
    levelStartTime = Date.now();
    
    gameLoop = setInterval(update, 16); // ~60fps
}

function showHighscores() {
    alert("Highscores will be displayed here!");
}

function showSettings() {
    alert("Game settings will be displayed here!");
}

function update() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Check level completion
    if (Date.now() - levelStartTime > levelTime) {
        showTrivia();
        return;
    }
    
    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    
    // Spawn enemies
    if (Date.now() - lastEnemySpawn > enemySpawnRate) {
        spawnEnemy();
        lastEnemySpawn = Date.now();
    }
    
    // Update enemies
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemy.y += enemySpeed;
        
        // Enemy shoots randomly
        if (Math.random() < 0.01) {
            enemyBullets.push({
                x: enemy.x + enemy.width / 2 - 2,
                y: enemy.y + enemy.height,
                width: 4,
                height: 10,
                speed: 3
            });
        }
        
        // Draw enemy
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Check if enemy reached bottom
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
            i--;
            lives--;
            if (lives <= 0) {
                gameOver();
                return;
            }
        }
    }
    
    // Update bullets
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        
        // Draw bullet
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Check if bullet hit enemy
        let hit = false;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Collision detected
                enemies.splice(j, 1);
                j--;
                hit = true;
                score += 10 * level;
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
        
        // Check if bullet hit player
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            // Player hit
            enemyBullets.splice(i, 1);
            i--;
            lives--;
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
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
    ctx.fillText(`Level: ${level}`, 10, 90);
    ctx.fillText(`Bullets: ${playerBulletCount}`, 10, 120);
    
    // Draw power-up status
    if (playerPower !== "normal") {
        ctx.fillText(`Power: ${playerPower}`, 10, 150);
    }
    
    // Draw time remaining
    const timeLeft = Math.ceil((levelTime - (Date.now() - levelStartTime)) / 1000);
    ctx.fillText(`Time: ${timeLeft}s`, canvas.width - 100, 30);
}

function spawnEnemy() {
    const width = 40;
    const height = 40;
    const x = Math.random() * (canvas.width - width);
    const colors = ['#e74c3c', '#9b59b6', '#1abc9c', '#f1c40f'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    enemies.push({
        x: x,
        y: -height,
        width: width,
        height: height,
        color: color
    });
}

function shoot() {
    if (playerBulletCount <= 0) return;
    
    playerBulletCount--;
    
    if (playerPower === "double") {
        bullets.push({
            x: player.x + 10,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
        bullets.push({
            x: player.x + player.width - 14,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
    } else if (playerPower === "triple") {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
        bullets.push({
            x: player.x + 10,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            angle: -0.2
        });
        bullets.push({
            x: player.x + player.width - 14,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            angle: 0.2
        });
    } else {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
    }
    
    // Rapid fire power-up
    if (playerPower === "rapid") {
        setTimeout(() => {
            if (gameState === 'playing') {
                playerBulletCount++;
            }
        }, 500);
    }
}

function showTrivia() {
    clearInterval(gameLoop);
    gameState = 'trivia';
    
    // Select a random trivia question
    currentTrivia = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
    questionElement.textContent = currentTrivia.question;
    
    // Clear previous options
    optionsElement.innerHTML = '';
    
    // Add new options
    currentTrivia.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => checkAnswer(index));
        optionsElement.appendChild(optionElement);
    });
    
    triviaModal.style.display = 'flex';
}

function checkAnswer(selectedIndex) {
    triviaModal.style.display = 'none';
    
    if (selectedIndex === currentTrivia.answer) {
        // Correct answer
        alert("Correct! You earned bonuses!");
        
        // Apply bonuses
        score += currentTrivia.correctBonus.score;
        lives += currentTrivia.correctBonus.lives;
        playerPower = currentTrivia.correctBonus.power;
        
        if (playerPower === "shield") {
            // Shield power - temporary invincibility
            const originalColor = player.color;
            player.color = '#00ff00';
            setTimeout(() => {
                player.color = originalColor;
                playerPower = "normal";
            }, 5000);
        }
    } else {
        // Wrong answer
        alert(`Wrong! The correct answer was: ${currentTrivia.options[currentTrivia.answer]}`);
        
        // Apply penalties
        enemySpeed *= currentTrivia.wrongPenalty.speed;
        playerBulletCount = Math.max(1, playerBulletCount + currentTrivia.wrongPenalty.bullets);
    }
    
    // Start next level
    level++;
    levelStartTime = Date.now();
    enemies = [];
    bullets = [];
    enemyBullets = [];
    playerBulletCount = 3;
    if (playerPower !== "shield") playerPower = "normal";
    
    gameState = 'playing';
    gameLoop = setInterval(update, 16);
}

function gameOver() {
    clearInterval(gameLoop);
    alert(`Game Over! Your score: ${score}`);
    menu.style.display = 'flex';
    gameState = 'menu';
}
