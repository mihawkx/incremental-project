// Bullet System for Boss Attacks
const BulletManager = {
    bullets: [],
    
    init() {
        this.bullets = [];
    },
    
    createBullet(x, y, vx, vy, size = 6, color = '#ffffff') {
        this.bullets.push({
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            size: size,
            color: color,
            active: true
        });
    },
    
    createCircle(centerX, centerY, radius, count, speed, color = '#ffffff') {
        const angleStep = (Math.PI * 2) / count;
        for (let i = 0; i < count; i++) {
            const angle = angleStep * i;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.createBullet(centerX, centerY, vx, vy, 6, color);
        }
    },
    
    createSpiral(centerX, centerY, angleOffset, armCount, speed, size = 6, color = '#ffffff') {
        const angleStep = (Math.PI * 2) / armCount;
        for (let i = 0; i < armCount; i++) {
            const angle = angleStep * i + angleOffset;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.createBullet(centerX, centerY, vx, vy, size, color);
        }
    },
    
    createWave(startX, y, direction, count, spacing, speed, color = '#ffffff') {
        for (let i = 0; i < count; i++) {
            const x = startX + (direction > 0 ? i * spacing : -i * spacing);
            this.createBullet(x, y, 0, speed, 6, color);
        }
    },
    
    createTargeted(startX, startY, targetX, targetY, speed, color = '#ffffff') {
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        this.createBullet(startX, startY, vx, vy, 6, color);
    },
    
    update(deltaTime, arenaWidth, arenaHeight) {
        const dt = deltaTime * 60; // Normalize to 60fps
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update position
            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;
            
            // Remove bullets that are off screen
            if (bullet.x < -50 || bullet.x > arenaWidth + 50 ||
                bullet.y < -50 || bullet.y > arenaHeight + 50) {
                this.bullets.splice(i, 1);
            }
        }
    },
    
    checkCollisions(player) {
        for (const bullet of this.bullets) {
            if (player.checkCollision(bullet)) {
                return true;
            }
        }
        return false;
    },
    
    draw(ctx) {
        for (const bullet of this.bullets) {
            ctx.fillStyle = bullet.color;
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    clear() {
        this.bullets = [];
    },
    
    getCount() {
        return this.bullets.length;
    }
};
