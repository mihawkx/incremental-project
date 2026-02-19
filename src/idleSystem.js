// Idle Progression System
const IdleSystem = {
    lastUpdate: Date.now(),
    updateInterval: 100, // Update every 100ms for smooth progression
    
    init() {
        this.lastUpdate = Date.now();
        this.startLoop();
        console.log('IdleSystem initialized');
    },
    
    startLoop() {
        setInterval(() => this.update(), this.updateInterval);
    },
    
    update() {
        if (GameState.inBossFight) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
        this.lastUpdate = now;
        
        // Generate souls based on souls per second
        const soulsGained = GameState.soulsPerSecond * deltaTime;
        GameState.addSouls(soulsGained);
        
        // Update UI in real-time
        this.updateUI();
    },
    
    triggerBoss() {
        console.log('Triggering boss fight...');
        
        // Hide idle UI and show boss UI
        const idleScreen = document.getElementById('idle-screen');
        const bossScreen = document.getElementById('boss-screen');
        
        if (!idleScreen || !bossScreen) {
            console.error('Screen elements not found!');
            return;
        }
        
        idleScreen.classList.add('hidden');
        bossScreen.classList.remove('hidden');
        
        // Start boss fight
        GameState.startBossFight();
        BossSystem.startBoss();
    },
    
    // Handle upgrade purchase
    buyUpgrade(upgradeType) {
        if (GameState.purchaseUpgrade(upgradeType)) {
            this.updateUI();
            GameState.save();
            
            // Visual feedback
            const button = document.querySelector(`[data-upgrade="${upgradeType}"]`);
            if (button) {
                button.classList.add('pulse');
                setTimeout(() => button.classList.remove('pulse'), 300);
            }
        }
    },
    
    updateUI() {
        // Update souls display
        const soulsDisplay = document.getElementById('souls-count');
        if (soulsDisplay) {
            soulsDisplay.textContent = formatNumber(GameState.souls);
        }
        
        const spsDisplay = document.getElementById('souls-per-second');
        if (spsDisplay) {
            spsDisplay.textContent = formatNumber(GameState.soulsPerSecond);
        }
        
        // Update upgrade buttons
        Object.keys(GameState.upgrades).forEach(upgradeType => {
            const upgrade = GameState.upgrades[upgradeType];
            const button = document.querySelector(`[data-upgrade="${upgradeType}"]`);
            
            if (button) {
                const cost = GameState.getUpgradeCost(upgradeType);
                const canAfford = GameState.souls >= cost;
                
                button.disabled = !canAfford;
                button.classList.toggle('affordable', canAfford);
                
                // Update button text
                const levelSpan = button.querySelector('.upgrade-level');
                const costSpan = button.querySelector('.upgrade-cost');
                
                if (levelSpan) levelSpan.textContent = upgrade.level;
                if (costSpan) costSpan.textContent = formatNumber(cost);
            }
        });
        
        // Update stats
        const statsElement = document.getElementById('stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-item">Bosses Defeated: ${GameState.stats.bossesDefeated}</div>
                <div class="stat-item">Deaths: ${GameState.stats.deaths}</div>
                <div class="stat-item">Total Souls: ${formatNumber(GameState.totalSouls)}</div>
            `;
        }
        
        // Update fight boss button
        const fightBossBtn = document.getElementById('fight-boss-btn');
        if (fightBossBtn) {
            const canFight = GameState.shouldTriggerBoss();
            fightBossBtn.disabled = !canFight;
            fightBossBtn.classList.toggle('ready', canFight);
            
            if (canFight) {
                fightBossBtn.textContent = `⚔️ Fight Boss - Spend ${formatNumber(GameState.soulsNeededForBoss)} souls`;
            } else {
                const remaining = Math.floor(GameState.soulsNeededForBoss - GameState.souls);
                fightBossBtn.textContent = `⚔️ Fight Boss (${formatNumber(remaining)} souls needed)`;
            }
        }
    }
};
