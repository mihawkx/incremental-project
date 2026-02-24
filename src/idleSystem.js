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
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
        this.lastUpdate = now;
        
        // Generate souls based on souls per second
        const soulsGained = GameState.soulsPerSecond * deltaTime;
        GameState.addSouls(soulsGained);
        
        // Update UI in real-time
        this.updateUI();
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
                const unlocked = GameState.isUpgradeUnlocked(upgradeType);
                const costDisplay = button.querySelector('.upgrade-cost-display');
                const levelSpan = button.querySelector('.upgrade-level-value');

                if (!unlocked) {
                    button.disabled = true;
                    button.classList.remove('affordable');
                    if (costDisplay) {
                        const req = upgradeType === 'str' ? 3 : upgradeType === 'dex' ? 5 : 10;
                        costDisplay.innerHTML = `🔒 Locked (Player Lv. ${req} required)`;
                    }
                } else {
                    const cost = GameState.getUpgradeCost(upgradeType);
                    const canAfford = GameState.souls >= cost;
                    button.disabled = !canAfford;
                    button.classList.toggle('affordable', canAfford);
                    if (costDisplay) {
                        costDisplay.innerHTML = `Cost: <span class="upgrade-cost">${formatNumber(cost)}</span> souls`;
                    }
                }

                if (levelSpan) levelSpan.textContent = upgrade.level;
            }
        });
    }
};
