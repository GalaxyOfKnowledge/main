import pygame
import random
import sys

# Initialize pygame
pygame.init()

# Screen dimensions
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)

# Create the screen
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Space Invaders")

# Clock for controlling game speed
clock = pygame.time.Clock()

class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((50, 40))
        self.image.fill(GREEN)
        self.rect = self.image.get_rect()
        self.rect.centerx = SCREEN_WIDTH // 2
        self.rect.bottom = SCREEN_HEIGHT - 10
        self.speed = 8
        
    def update(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] and self.rect.right < SCREEN_WIDTH:
            self.rect.x += self.speed
            
    def shoot(self):
        bullet = Bullet(self.rect.centerx, self.rect.top)
        all_sprites.add(bullet)
        bullets.add(bullet)

class Enemy(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((40, 40))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        self.speed = 2
        self.direction = 1
        
    def update(self):
        self.rect.x += self.speed * self.direction
        if self.rect.right > SCREEN_WIDTH or self.rect.left < 0:
            self.rect.y += 20
            self.direction *= -1

class Bullet(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((5, 10))
        self.image.fill(WHITE)
        self.rect = self.image.get_rect()
        self.rect.centerx = x
        self.rect.bottom = y
        self.speed = -10
        
    def update(self):
        self.rect.y += self.speed
        if self.rect.bottom < 0:
            self.kill()

# Create sprite groups
all_sprites = pygame.sprite.Group()
enemies = pygame.sprite.Group()
bullets = pygame.sprite.Group()

# Create player
player = Player()
all_sprites.add(player)

# Create enemies
for row in range(5):
    for column in range(8):
        enemy = Enemy(column * 80 + 50, row * 60 + 50)
        all_sprites.add(enemy)
        enemies.add(enemy)

# Game variables
score = 0
game_over = False
font = pygame.font.Font(None, 36)

# Main game loop
running = True
while running:
    # Keep the game running at a constant speed
    clock.tick(60)
    
    # Process events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and not game_over:
                player.shoot()
            if event.key == pygame.K_r and game_over:
                # Reset the game
                game_over = False
                score = 0
                all_sprites = pygame.sprite.Group()
                enemies = pygame.sprite.Group()
                bullets = pygame.sprite.Group()
                player = Player()
                all_sprites.add(player)
                for row in range(5):
                    for column in range(8):
                        enemy = Enemy(column * 80 + 50, row * 60 + 50)
                        all_sprites.add(enemy)
                        enemies.add(enemy)
    
    if not game_over:
        # Update
        all_sprites.update()
        
        # Check if bullets hit enemies
        hits = pygame.sprite.groupcollide(bullets, enemies, True, True)
        for hit in hits:
            score += 10
        
        # Check if enemies reached the bottom or hit the player
        for enemy in enemies:
            if enemy.rect.bottom >= SCREEN_HEIGHT or pygame.sprite.collide_rect(enemy, player):
                game_over = True
        
        # Check if all enemies are gone
        if len(enemies) == 0:
            game_over = True
    
    # Draw / render
    screen.fill(BLACK)
    all_sprites.draw(screen)
    
    # Draw score
    score_text = font.render(f"Score: {score}", True, WHITE)
    screen.blit(score_text, (10, 10))
    
    # Game over message
    if game_over:
        game_over_text = font.render("Game Over - Press R to Restart", True, WHITE)
        screen.blit(game_over_text, (SCREEN_WIDTH // 2 - 180, SCREEN_HEIGHT // 2))
    
    # Flip the display
    pygame.display.flip()

# Quit pygame
pygame.quit()
sys.exit()
