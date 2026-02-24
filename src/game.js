// Main Game Controller
const Game = {
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Souls Boss Game...');
        
        // Load saved game
        const loaded = GameState.load();
        if (loaded) {
            console.log('Save game loaded!');
        }
        GameState.updateSoulsPerSecond();

        // Initialize systems
        IdleSystem.init();
        
        // Setup UI event listeners
        this.setupEventListeners();
        
        // Initial UI update
        IdleSystem.updateUI();
        
        // Auto-save every 10 seconds
        setInterval(() => {
            GameState.save();
        }, 10000);
        
        this.initialized = true;
        console.log('Game initialized!');
    },
    
    setupEventListeners() {
        // Upgrade buttons
        document.querySelectorAll('[data-upgrade]').forEach(button => {
            button.addEventListener('click', () => {
                const upgradeType = button.dataset.upgrade;
                IdleSystem.buyUpgrade(upgradeType);
            });
        });
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset your progress?')) {
                    GameState.reset();
                }
            });
        }
        
        // Save button
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                GameState.save();
                saveBtn.textContent = 'Saved!';
                setTimeout(() => {
                    saveBtn.textContent = 'Save Game';
                }, 1000);
            });
        }
        
        // Gain souls button (debug)
        const gainSoulsBtn = document.getElementById('gain-souls-btn');
        if (gainSoulsBtn) {
            gainSoulsBtn.addEventListener('click', () => {
                GameState.addSouls(100);
                IdleSystem.updateUI();
                console.log('Debug: Added 100 souls');
            });
        }
    }
};

// Start game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}
