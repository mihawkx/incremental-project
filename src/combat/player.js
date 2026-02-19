// Player Combat System
const Player = {
    x: 0,
    y: 0,
    size: 8,
    speed: 3,
    invulnerable: false,
    invulnerabilityTime: 1000, // 1 second of invulnerability after hit
    
    // Input handling
    keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        ArrowUp: false,
        ArrowLeft: false,
        ArrowDown: false,
        ArrowRight: false
    },
    
    init(arenaWidth, arenaHeight) {
        this.x = arenaWidth / 2;
        this.y = arenaHeight / 2;
        this.speed = GameState.getPlayerSpeed();
        this.setupControls();
    },
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = true;
                e.preventDefault();
            }
            // Also handle lowercase
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                this.keys[key] = true;
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = false;
            }
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                this.keys[key] = false;
            }
        });
    },
    
    update(deltaTime, arenaWidth, arenaHeight) {
        // Calculate movement
        let dx = 0;
        let dy = 0;
        
        if (this.keys.a || this.keys.ArrowLeft) dx -= 1;
        if (this.keys.d || this.keys.ArrowRight) dx += 1;
        if (this.keys.w || this.keys.ArrowUp) dy -= 1;
        if (this.keys.s || this.keys.ArrowDown) dy += 1;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // 1/sqrt(2)
            dy *= 0.707;
        }
        
        // Apply movement with speed
        this.x += dx * this.speed * deltaTime * 60;
        this.y += dy * this.speed * deltaTime * 60;
        
        // Keep player in bounds
        const padding = this.size;
        this.x = Math.max(padding, Math.min(arenaWidth - padding, this.x));
        this.y = Math.max(padding, Math.min(arenaHeight - padding, this.y));
    },
    
    checkCollision(bullet) {
        if (this.invulnerable) return false;
        
        const dx = this.x - bullet.x;
        const dy = this.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.size + bullet.size);
    },
    
    takeDamage() {
        if (this.invulnerable) return false;
        
        this.invulnerable = true;
        setTimeout(() => {
            this.invulnerable = false;
        }, this.invulnerabilityTime);
        
        return GameState.takeDamage(1);
    },
    
    draw(ctx) {
        // Draw player (red square for the soul/heart)
        ctx.save();
        
        // Flashing effect when invulnerable
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
        
        ctx.restore();
    },
    
    reset(arenaWidth, arenaHeight) {
        this.x = arenaWidth / 2;
        this.y = arenaHeight / 2;
        this.invulnerable = false;
        this.speed = GameState.getPlayerSpeed();
    }
};
