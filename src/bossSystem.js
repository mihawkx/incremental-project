// Boss Fight System
const BossSystem = {
    canvas: null,
    ctx: null,
    animationFrame: null,
    lastTime: 0,
    
    currentBoss: null,
    bossHealth: 0,
    maxBossHealth: 0,
    lastPlayerHealth: 0, // Track player health to avoid unnecessary DOM updates
    
    arenaWidth: 600,
    arenaHeight: 400,
    
    patternTimers: {},
    fightStartTime: 0,
    
    init() {
        this.canvas = document.getElementById('boss-canvas');
        if (!this.canvas) {
            console.error('Boss canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = this.arenaWidth;
        this.canvas.height = this.arenaHeight;
        
        Player.init(this.arenaWidth, this.arenaHeight);
        BulletManager.init();
        
        console.log('BossSystem initialized');
    },
    
    startBoss() {
        if (!this.canvas || !this.ctx) {
            console.error('Canvas not initialized, reinitializing...');
            this.init();
        }
        
        console.log('Starting boss fight...');
        
        // Get boss data
        const bossIndex = GameState.currentBossIndex % BossData.length;
        const bossTemplate = BossData[bossIndex];
        
        // Scale boss health based on souls cost for proper balance
        // Base health is 100, and it scales with the souls cost
        // Each boss requires more souls, so health should scale similarly
        const healthMultiplier = GameState.soulsNeededForBoss / 100;
        
        this.currentBoss = {
            ...bossTemplate,
            health: 100 * healthMultiplier
        };
        
        this.maxBossHealth = this.currentBoss.health;
        this.bossHealth = this.maxBossHealth;
        
        // Reset systems
        Player.reset(this.arenaWidth, this.arenaHeight);
        BulletManager.clear();
        
        // Initialize pattern timers
        this.patternTimers = {};
        this.currentBoss.patterns.forEach(patternName => {
            this.patternTimers[patternName] = 0;
        });
        
        this.fightStartTime = performance.now();
        this.lastTime = performance.now();
        this.lastPlayerHealth = GameState.playerHealth;
        
        // Initialize UI (one-time setup)
        this.initializeBossUI();
        
        // Start game loop
        this.startGameLoop();
    },
    
    startGameLoop() {
        this.lastTime = performance.now();
        const gameLoop = (timestamp) => {
            this.update(timestamp);
            this.draw();
            this.animationFrame = requestAnimationFrame(gameLoop);
        };
        this.animationFrame = requestAnimationFrame(gameLoop);
    },
    
    update(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Clamp delta time to prevent huge jumps
        const clampedDelta = Math.min(deltaTime, 0.1);
        
        // Update player
        Player.update(clampedDelta, this.arenaWidth, this.arenaHeight);
        
        // Update bullets
        BulletManager.update(clampedDelta, this.arenaWidth, this.arenaHeight);
        
        // Check collisions
        if (BulletManager.checkCollisions(Player)) {
            const dead = Player.takeDamage();
            // Only update if health changed
            if (GameState.playerHealth !== this.lastPlayerHealth) {
                this.updatePlayerHealthUI();
                this.lastPlayerHealth = GameState.playerHealth;
            }
            
            if (dead) {
                this.endBoss(false);
                return;
            }
        }
        
        // Execute attack patterns
        const timeSinceFightStart = timestamp - this.fightStartTime;
        this.currentBoss.patterns.forEach(patternName => {
            const pattern = AttackPatterns[patternName];
            if (pattern && timeSinceFightStart - this.patternTimers[patternName] >= pattern.interval) {
                pattern.execute(this.arenaWidth, this.arenaHeight, timeSinceFightStart, Player);
                this.patternTimers[patternName] = timeSinceFightStart;
            }
        });
        
        // Deal damage to boss based on souls per second
        const damagePerSecond = GameState.soulsPerSecond;
        this.bossHealth -= damagePerSecond * clampedDelta;
        
        // Update only boss health (lightweight update)
        this.updateBossHealthUI();
        
        // Check if boss is defeated
        if (this.bossHealth <= 0) {
            this.endBoss(true);
            return; // Stop processing immediately
        }
    },
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);
        
        // Draw arena border
        this.ctx.strokeStyle = '#444444';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.arenaWidth, this.arenaHeight);
        
        // Draw bullets
        BulletManager.draw(this.ctx);
        
        // Draw player
        Player.draw(this.ctx);
    },
    
    // Initialize boss UI (called once at start of fight)
    initializeBossUI() {
        // Set boss info (doesn't change during fight)
        const bossName = document.getElementById('boss-name');
        if (bossName) {
            bossName.textContent = this.currentBoss.name;
            bossName.style.color = this.currentBoss.color;
        }
        
        const bossDesc = document.getElementById('boss-description');
        if (bossDesc) {
            bossDesc.textContent = this.currentBoss.description;
        }
        
        // Set DPS display
        const dpsDisplay = document.getElementById('player-dps');
        if (dpsDisplay) {
            dpsDisplay.textContent = `${formatNumber(GameState.soulsPerSecond)} DPS`;
        }
        
        // Initialize health displays
        this.updateBossHealthUI();
        this.updatePlayerHealthUI();
    },
    
    // Update only boss health bar (called every frame)
    updateBossHealthUI() {
        const healthBar = document.getElementById('boss-health-bar');
        const healthText = document.getElementById('boss-health-text');
        if (healthBar) {
            const healthPercent = Math.max(0, (this.bossHealth / this.maxBossHealth) * 100);
            healthBar.style.width = healthPercent + '%';
        }
        if (healthText) {
            const healthPercent = Math.max(0, Math.floor((this.bossHealth / this.maxBossHealth) * 100));
            healthText.textContent = `${healthPercent}%`;
        }
    },
    
    // Update player health (only when it changes)
    updatePlayerHealthUI() {
        const healthContainer = document.getElementById('player-health');
        if (healthContainer) {
            healthContainer.innerHTML = '';
            for (let i = 0; i < GameState.maxPlayerHealth; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                if (i < GameState.playerHealth) {
                    heart.classList.add('filled');
                }
                healthContainer.appendChild(heart);
            }
        }
    },
    
    endBoss(victory) {
        // Prevent multiple calls
        if (!GameState.inBossFight) return;
        
        // Stop game loop immediately
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Update game state
        GameState.completeBossFight(victory);
        
        // Show result screen
        this.showResult(victory);
    },
    
    showResult(victory) {
        const resultScreen = document.getElementById('boss-result');
        const resultText = document.getElementById('result-text');
        const resultMessage = document.getElementById('result-message');
        
        if (victory) {
            resultText.textContent = 'VICTORY';
            resultText.style.color = '#2ecc71';
            resultMessage.textContent = `You defeated ${this.currentBoss.name}!`;
        } else {
            resultText.textContent = 'YOU DIED';
            resultText.style.color = '#e74c3c';
            resultMessage.textContent = 'The boss remains...';
        }
        
        resultScreen.classList.remove('hidden');
        
        // Auto-continue after 3 seconds
        setTimeout(() => {
            this.returnToIdle();
        }, 3000);
    },
    
    returnToIdle() {
        // Hide boss screen
        document.getElementById('boss-screen').classList.add('hidden');
        document.getElementById('boss-result').classList.add('hidden');
        
        // Show idle screen
        document.getElementById('idle-screen').classList.remove('hidden');
        
        // Clear bullets
        BulletManager.clear();
        
        // Update idle UI
        IdleSystem.updateUI();
        
        // Save game
        GameState.save();
    }
};
