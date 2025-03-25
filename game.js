// [Previous variable declarations remain the same]

// Event listeners
playBtn.addEventListener('click', () => {
    isCoopMode = false;
    startGame();
});

// Co-op button is disabled
// coopBtn.addEventListener('click', () => {
//     isCoopMode = true;
//     startGame();
// });

highscoreBtn.addEventListener('click', showHighscores);
settingsBtn.addEventListener('click', showSettings);

// Improved key handling
const keyState = {};

document.addEventListener('keydown', (e) => {
    keyState[e.key] = true;
    
    // Space to shoot
    if ((gameState === 'playing') && e.key === ' ') {
        if (!isCoopMode && (playerBulletCount > 0 || specialAmmo > 0)) {
            shoot(false);
            e.preventDefault(); // Prevent spacebar from scrolling page
        }
    }
});

document.addEventListener('keyup', (e) => {
    keyState[e.key] = false;
});

// [Previous game initialization remains the same]

function update() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw star background
    drawStars();
    
    // Check level completion
    if (Date.now() - levelStartTime > levelTime) {
        if (level % 3 === 0) {
            startBossBattle();
        } else {
            showTrivia();
        }
        return;
    }
    
    // Improved player movement handling
    if (keyState['ArrowLeft'] || keyState['a']) {
        player.x -= player.speed * (playerPower === "speed" ? 1.5 : 1);
        if (player.x < 0) player.x = 0;
    }
    if (keyState['ArrowRight'] || keyState['d']) {
        player.x += player.speed * (playerPower === "speed" ? 1.5 : 1);
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    }
    
    // [Rest of the update function remains the same]
}

function shoot(isCoop) {
    if (isCoop) {
        // Co-op shooting logic (disabled for now)
        return;
    }

    // Check for special ammo first
    if (specialAmmo > 0) {
        // Fire adobo bomb
        bullets.push({
            x: player.x + player.width/2 - 8,
            y: player.y,
            width: 16,
            height: 16,
            speed: 5,
            isSpecial: true
        });
        specialAmmo--;
        sounds.shoot.play();
        return;
    }

    // Normal shooting
    if (playerBulletCount <= 0) return;
    
    playerBulletCount--;
    sounds.shoot.play();
    
    if (playerPower === "double") {
        bullets.push({
            x: player.x + 10,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            isSpecial: false
        });
        bullets.push({
            x: player.x + player.width - 14,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            isSpecial: false
        });
    } else if (playerPower === "triple") {
        bullets.push({
            x: player.x + player.width/2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            isSpecial: false
        });
        bullets.push({
            x: player.x + 10,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            angle: -0.2,
            isSpecial: false
        });
        bullets.push({
            x: player.x + player.width - 14,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            angle: 0.2,
            isSpecial: false
        });
    } else {
        bullets.push({
            x: player.x + player.width/2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7,
            isSpecial: false
        });
    }

    // Rapid fire power-up
    if (playerPower === "rapid") {
        setTimeout(() => {
            if (gameState === 'playing') {
                playerBulletCount++;
            }
        }, 300);
    }
}

// [Rest of the game functions remain the same]
