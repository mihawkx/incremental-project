// Number Formatting Utility
function formatNumber(num) {
    // Use scientific notation for numbers higher than trillion
    if (num >= 1e15) {
        return num.toExponential(2);
    }
    
    const abbreviations = [
        { value: 1e12, suffix: 't' },   // trillion
        { value: 1e9, suffix: 'b' },    // billion
        { value: 1e6, suffix: 'm' },    // million
        { value: 1e3, suffix: 'k' }     // thousand
    ];
    
    if (num < 1000) {
        // Show one decimal for small numbers
        return num < 10 ? num.toFixed(1) : Math.floor(num).toString();
    }
    
    for (let i = 0; i < abbreviations.length; i++) {
        if (num >= abbreviations[i].value) {
            const formatted = (num / abbreviations[i].value).toFixed(2)
                .replace(/\.00$/, '')
                .replace(/(\.\d)0$/, '$1');
            return formatted + abbreviations[i].suffix;
        }
    }
    
    return Math.floor(num).toString();
}

// Game State Management
const GameState = {
    // Currency and progression
    souls: 1,
    totalSouls: 0,
    soulsPerSecond: 0,
    
    // Boss progression
    currentBossIndex: 0,
    soulsNeededForBoss: 100,
    bossScalingFactor: 2.5,
    
    // Upgrades
    upgrades: {
        playerLevel: {
            level: 0,
            description: "Increases SPS. Cost ×10 per level. Unlocks stats."
        },
        str: {
            level: 0,
            baseCost: 10,
            costMultiplier: 1.5,
            description: "Exponentially increases base SPS"
        },
        dex: {
            level: 0,
            baseCost: 100,
            costMultiplier: 1.8,
            description: "Multiplies total SPS (1 + DEX) ×"
        },
        int: {
            level: 0,
            baseCost: 500,
            costMultiplier: 2.2,
            description: "Arcane Synergy — amplifies STR and DEX"
        }
    },
    
    // Boss fight state
    inBossFight: false,
    currentBoss: null,
    playerHealth: 3,
    maxPlayerHealth: 3,
    
    // Statistics
    stats: {
        bossesDefeated: 0,
        deaths: 0,
        totalDamageTaken: 0
    },
    
    // Calculate current upgrade cost
    getUpgradeCost(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        if (upgradeType === 'playerLevel') {
            // Cost: 1, 10, 100, 1000, ... (×10 per level)
            return Math.floor(Math.pow(10, upgrade.level));
        }
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    },

    // Check if an upgrade is unlocked based on player level
    isUpgradeUnlocked(upgradeType) {
        const pl = this.upgrades.playerLevel.level;
        if (upgradeType === 'str') return pl >= 3;
        if (upgradeType === 'dex') return pl >= 5;
        if (upgradeType === 'int') return pl >= 10;
        return true; // playerLevel always unlocked
    },

    // Calculate souls per second
    // Formula: (playerLevel + 1.5^STR) × (1 + DEX) × (1 + INT × 0.5) × bossBonus
    calculateSoulsPerSecond() {
        const pl  = this.upgrades.playerLevel.level;
        const str = this.upgrades.str.level;
        const dex = this.upgrades.dex.level;
        const int = this.upgrades.int.level;

        const playerLvlSPS = pl;                              // flat SPS per player level
        const strSPS       = str > 0 ? Math.pow(1.5, str) : 0; // exponential, only if purchased
        const baseSPS      = playerLvlSPS + strSPS;

        const dexMulti  = 1 + dex;          // linear DEX multiplier
        const intMulti  = 1 + int * 0.5;   // Arcane Synergy
        const bossBonus = 1 + this.stats.bossesDefeated * 0.1;

        const total = baseSPS * dexMulti * intMulti * bossBonus;
        return Math.max(0, Math.floor(total * 10) / 10);
    },

    // Update souls per second
    updateSoulsPerSecond() {
        this.soulsPerSecond = this.calculateSoulsPerSecond();
    },
    
    // Calculate max health
    getMaxHealth() {
        return 3; // Fixed at 3 for now
    },
    
    // Calculate player speed
    getPlayerSpeed() {
        return 3; // Fixed at 3 for now
    },
    
    // Get crit chance
    getCritChance() {
        return 0; // Disabled for now
    },
    
    // Purchase upgrade
    purchaseUpgrade(upgradeType) {
        if (!this.isUpgradeUnlocked(upgradeType)) return false;
        const cost = this.getUpgradeCost(upgradeType);
        if (this.souls >= cost) {
            this.souls -= cost;
            this.upgrades[upgradeType].level++;
            this.updateSoulsPerSecond();
            this.maxPlayerHealth = this.getMaxHealth();
            return true;
        }
        return false;
    },
    
    // Add souls (with crit chance)
    addSouls(amount) {
        const critChance = this.getCritChance();
        const isCrit = Math.random() * 100 < critChance;
        const finalAmount = isCrit ? amount * 2 : amount;
        
        this.souls += finalAmount;
        this.totalSouls += finalAmount;
        
        return isCrit;
    },
    
    // Check if boss fight should trigger
    shouldTriggerBoss() {
        return this.souls >= this.soulsNeededForBoss && !this.inBossFight;
    },
    
    // Start boss fight
    startBossFight() {
        // Spend the souls required for the fight
        this.souls -= this.soulsNeededForBoss;
        
        this.inBossFight = true;
        this.playerHealth = this.maxPlayerHealth;
    },
    
    // Complete boss fight
    completeBossFight(victory) {
        this.inBossFight = false;
        if (victory) {
            this.stats.bossesDefeated++;
            this.currentBossIndex++;
            // Only increase souls requirement if the player won
            this.soulsNeededForBoss = Math.floor(this.soulsNeededForBoss * this.bossScalingFactor);
            this.updateSoulsPerSecond();
        } else {
            this.stats.deaths++;
            // On defeat, requirement stays the same (no change needed)
        }
    },
    
    // Take damage
    takeDamage(amount = 1) {
        this.playerHealth = Math.max(0, this.playerHealth - amount);
        this.stats.totalDamageTaken += amount;
        return this.playerHealth <= 0;
    },
    
    // Save game
    save() {
        const saveData = {
            souls: this.souls,
            totalSouls: this.totalSouls,
            soulsPerSecond: this.soulsPerSecond,
            currentBossIndex: this.currentBossIndex,
            soulsNeededForBoss: this.soulsNeededForBoss,
            upgrades: this.upgrades,
            stats: this.stats
        };
        localStorage.setItem('soulsBossGameSave', JSON.stringify(saveData));
    },
    
    // Load game
    load() {
        const saveData = localStorage.getItem('soulsBossGameSave');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                
                // Validate save data isn't corrupted
                if (data.souls > 1e20 || data.soulsPerSecond > 1e20) {
                    console.warn('Save data appears corrupted, ignoring...');
                    return false;
                }
                
                this.souls = data.souls || 0;
                this.totalSouls = data.totalSouls || 0;
                this.currentBossIndex = data.currentBossIndex || 0;
                this.soulsNeededForBoss = data.soulsNeededForBoss || 100;
                // Only restore upgrades if they use the new format (has playerLevel key)
                if (data.upgrades && 'playerLevel' in data.upgrades) {
                    this.upgrades = data.upgrades;
                }
                this.stats = data.stats || this.stats;
                this.updateSoulsPerSecond();
                this.maxPlayerHealth = this.getMaxHealth();
                return true;
            } catch (e) {
                console.error('Failed to load save:', e);
                return false;
            }
        }
        return false;
    },
    
    // Reset game
    reset() {
        localStorage.removeItem('soulsBossGameSave');
        location.reload();
    }
};
