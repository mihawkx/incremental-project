// Boss Attack Patterns
const AttackPatterns = {
    // Pattern: Simple straight bullets from top (beginner)
    straightDown: {
        name: "Straight Down",
        execute(arenaWidth, arenaHeight, time) {
            const spacing = 80;
            const count = Math.floor(arenaWidth / spacing);
            const offset = (arenaWidth - (count - 1) * spacing) / 2;
            
            for (let i = 0; i < count; i++) {
                const x = offset + i * spacing;
                BulletManager.createBullet(x, -10, 0, 2, 6, '#8395a7');
            }
        },
        interval: 2000
    },
    
    // Pattern: Slow wave from top (beginner)
    slowWave: {
        name: "Slow Wave",
        execute(arenaWidth, arenaHeight, time) {
            const spacing = 50;
            const count = Math.floor(arenaWidth / spacing) + 1;
            
            for (let i = 0; i < count; i++) {
                const x = i * spacing;
                BulletManager.createBullet(x, -10, 0, 1.5, 6, '#a0a0a0');
            }
        },
        interval: 3000
    },
    
    // Pattern: Three bullets from top (beginner)
    tripleShot: {
        name: "Triple Shot",
        execute(arenaWidth, arenaHeight, time) {
            const centerX = arenaWidth / 2;
            const spacing = 80;
            
            // Left, center, right
            BulletManager.createBullet(centerX - spacing, -10, 0, 2.5, 7, '#6c7a89');
            BulletManager.createBullet(centerX, -10, 0, 2.5, 7, '#6c7a89');
            BulletManager.createBullet(centerX + spacing, -10, 0, 2.5, 7, '#6c7a89');
        },
        interval: 1800
    },
    
    // Pattern: Circular bullet spray from edges
    circleSpray: {
        name: "Circle Spray",
        execute(arenaWidth, arenaHeight, time) {
            const centerX = arenaWidth / 2;
            const centerY = arenaHeight / 2;
            const count = 12;
            const angleStep = (Math.PI * 2) / count;
            
            for (let i = 0; i < count; i++) {
                const angle = angleStep * i;
                // Spawn from edges, shoot toward center
                let startX, startY;
                
                // Determine which edge to spawn from based on angle
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                
                if (Math.abs(cos) > Math.abs(sin)) {
                    // Spawn from left or right edge
                    startX = cos > 0 ? arenaWidth + 10 : -10;
                    startY = centerY - (sin / cos) * (cos > 0 ? (arenaWidth / 2 + 10) : -(arenaWidth / 2 + 10));
                } else {
                    // Spawn from top or bottom edge
                    startY = sin > 0 ? arenaHeight + 10 : -10;
                    startX = centerX - (cos / sin) * (sin > 0 ? (arenaHeight / 2 + 10) : -(arenaHeight / 2 + 10));
                }
                
                BulletManager.createBullet(startX, startY, -cos * 2.5, -sin * 2.5, 6, '#ff6b6b');
            }
        },
        interval: 1500
    },
    
    // Pattern: Rotating spiral from edges
    spiral: {
        name: "Spiral",
        execute(arenaWidth, arenaHeight, time) {
            const centerX = arenaWidth / 2;
            const centerY = arenaHeight / 2;
            const angle = time * 0.05;
            const armCount = 4;
            const angleStep = (Math.PI * 2) / armCount;
            
            for (let i = 0; i < armCount; i++) {
                const currentAngle = angleStep * i + angle;
                const cos = Math.cos(currentAngle);
                const sin = Math.sin(currentAngle);
                
                // Spawn from edges based on angle
                let startX, startY;
                if (Math.abs(cos) > Math.abs(sin)) {
                    startX = cos > 0 ? arenaWidth + 10 : -10;
                    startY = centerY - (sin / cos) * (cos > 0 ? (arenaWidth / 2 + 10) : -(arenaWidth / 2 + 10));
                } else {
                    startY = sin > 0 ? arenaHeight + 10 : -10;
                    startX = centerX - (cos / sin) * (sin > 0 ? (arenaHeight / 2 + 10) : -(arenaHeight / 2 + 10));
                }
                
                BulletManager.createBullet(startX, startY, -cos * 2, -sin * 2, 6, '#4ecdc4');
            }
        },
        interval: 200
    },
    
    // Pattern: Walls from sides
    walls: {
        name: "Walls",
        execute(arenaWidth, arenaHeight, time) {
            const side = Math.floor(time / 2000) % 4;
            const spacing = 40;
            const speed = 3;
            
            if (side === 0) { // Top
                BulletManager.createWave(0, 0, 1, Math.floor(arenaWidth / spacing), spacing, speed, '#f9ca24');
            } else if (side === 1) { // Right
                for (let i = 0; i < arenaHeight / spacing; i++) {
                    BulletManager.createBullet(arenaWidth, i * spacing, -speed, 0, 6, '#f9ca24');
                }
            } else if (side === 2) { // Bottom
                BulletManager.createWave(0, arenaHeight, 1, Math.floor(arenaWidth / spacing), spacing, -speed, '#f9ca24');
            } else { // Left
                for (let i = 0; i < arenaHeight / spacing; i++) {
                    BulletManager.createBullet(0, i * spacing, speed, 0, 6, '#f9ca24');
                }
            }
        },
        interval: 2000
    },
    
    // Pattern: Target player
    homing: {
        name: "Homing",
        execute(arenaWidth, arenaHeight, time, player) {
            const edges = [
                { x: Math.random() * arenaWidth, y: 0 },
                { x: arenaWidth, y: Math.random() * arenaHeight },
                { x: Math.random() * arenaWidth, y: arenaHeight },
                { x: 0, y: Math.random() * arenaHeight }
            ];
            
            const spawn = edges[Math.floor(Math.random() * edges.length)];
            BulletManager.createTargeted(spawn.x, spawn.y, player.x, player.y, 2.5, '#e056fd');
        },
        interval: 600
    },
    
    // Pattern: Cross pattern from edges
    cross: {
        name: "Cross",
        execute(arenaWidth, arenaHeight, time) {
            const centerX = arenaWidth / 2;
            const centerY = arenaHeight / 2;
            const speed = 3;
            
            // From left edge
            BulletManager.createBullet(-10, centerY, speed, 0, 8, '#ff6348');
            // From right edge
            BulletManager.createBullet(arenaWidth + 10, centerY, -speed, 0, 8, '#ff6348');
            // From top edge
            BulletManager.createBullet(centerX, -10, 0, speed, 8, '#ff6348');
            // From bottom edge
            BulletManager.createBullet(centerX, arenaHeight + 10, 0, -speed, 8, '#ff6348');
            
            // Diagonals from corners
            BulletManager.createBullet(-10, -10, speed * 0.707, speed * 0.707, 8, '#ff6348');
            BulletManager.createBullet(arenaWidth + 10, -10, -speed * 0.707, speed * 0.707, 8, '#ff6348');
            BulletManager.createBullet(-10, arenaHeight + 10, speed * 0.707, -speed * 0.707, 8, '#ff6348');
            BulletManager.createBullet(arenaWidth + 10, arenaHeight + 10, -speed * 0.707, -speed * 0.707, 8, '#ff6348');
        },
        interval: 800
    },
    
    // Pattern: Random scatter from edges
    scatter: {
        name: "Scatter",
        execute(arenaWidth, arenaHeight, time) {
            const centerX = arenaWidth / 2;
            const centerY = arenaHeight / 2;
            
            for (let i = 0; i < 5; i++) {
                // Pick random edge
                const edge = Math.floor(Math.random() * 4);
                let x, y, vx, vy;
                
                if (edge === 0) { // Top
                    x = Math.random() * arenaWidth;
                    y = -10;
                    const targetX = centerX + (Math.random() - 0.5) * arenaWidth;
                    const targetY = centerY + (Math.random() - 0.5) * arenaHeight;
                    const angle = Math.atan2(targetY - y, targetX - x);
                    const speed = 1.5 + Math.random();
                    vx = Math.cos(angle) * speed;
                    vy = Math.sin(angle) * speed;
                } else if (edge === 1) { // Right
                    x = arenaWidth + 10;
                    y = Math.random() * arenaHeight;
                    const targetX = centerX + (Math.random() - 0.5) * arenaWidth;
                    const targetY = centerY + (Math.random() - 0.5) * arenaHeight;
                    const angle = Math.atan2(targetY - y, targetX - x);
                    const speed = 1.5 + Math.random();
                    vx = Math.cos(angle) * speed;
                    vy = Math.sin(angle) * speed;
                } else if (edge === 2) { // Bottom
                    x = Math.random() * arenaWidth;
                    y = arenaHeight + 10;
                    const targetX = centerX + (Math.random() - 0.5) * arenaWidth;
                    const targetY = centerY + (Math.random() - 0.5) * arenaHeight;
                    const angle = Math.atan2(targetY - y, targetX - x);
                    const speed = 1.5 + Math.random();
                    vx = Math.cos(angle) * speed;
                    vy = Math.sin(angle) * speed;
                } else { // Left
                    x = -10;
                    y = Math.random() * arenaHeight;
                    const targetX = centerX + (Math.random() - 0.5) * arenaWidth;
                    const targetY = centerY + (Math.random() - 0.5) * arenaHeight;
                    const angle = Math.atan2(targetY - y, targetX - x);
                    const speed = 1.5 + Math.random();
                    vx = Math.cos(angle) * speed;
                    vy = Math.sin(angle) * speed;
                }
                
                BulletManager.createBullet(x, y, vx, vy, 5, '#95e1d3');
            }
        },
        interval: 400
    },
    
    // Pattern: Expanding rings from edges
    rings: {
        name: "Rings",
        execute(arenaWidth, arenaHeight, time) {
            const centerX = arenaWidth / 2;
            const centerY = arenaHeight / 2;
            const count = 16;
            const angleStep = (Math.PI * 2) / count;
            
            // First ring
            for (let i = 0; i < count; i++) {
                const angle = angleStep * i;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                
                let startX, startY;
                if (Math.abs(cos) > Math.abs(sin)) {
                    startX = cos > 0 ? arenaWidth + 10 : -10;
                    startY = centerY - (sin / cos) * (cos > 0 ? (arenaWidth / 2 + 10) : -(arenaWidth / 2 + 10));
                } else {
                    startY = sin > 0 ? arenaHeight + 10 : -10;
                    startX = centerX - (cos / sin) * (sin > 0 ? (arenaHeight / 2 + 10) : -(arenaHeight / 2 + 10));
                }
                
                BulletManager.createBullet(startX, startY, -cos * 2, -sin * 2, 6, '#a29bfe');
            }
            
            // Second ring delayed
            setTimeout(() => {
                for (let i = 0; i < count; i++) {
                    const angle = angleStep * i + 0.1;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    
                    let startX, startY;
                    if (Math.abs(cos) > Math.abs(sin)) {
                        startX = cos > 0 ? arenaWidth + 10 : -10;
                        startY = centerY - (sin / cos) * (cos > 0 ? (arenaWidth / 2 + 10) : -(arenaWidth / 2 + 10));
                    } else {
                        startY = sin > 0 ? arenaHeight + 10 : -10;
                        startX = centerX - (cos / sin) * (sin > 0 ? (arenaHeight / 2 + 10) : -(arenaHeight / 2 + 10));
                    }
                    
                    BulletManager.createBullet(startX, startY, -cos * 2.5, -sin * 2.5, 6, '#a29bfe');
                }
            }, 300);
        },
        interval: 2000
    }
};

// Boss Definitions
const BossData = [
    {
        name: "Hollow Knight",
        health: 100,
        patterns: ['straightDown', 'slowWave', 'tripleShot'],
        color: '#8395a7',
        description: "A lost soul, first of many..."
    },
    {
        name: "Corrupted Warrior",
        health: 250,
        patterns: ['tripleShot', 'scatter', 'straightDown'],
        color: '#4834d4',
        description: "Consumed by darkness..."
    },
    {
        name: "Soul Collector",
        health: 500,
        patterns: ['circleSpray', 'scatter', 'slowWave'],
        color: '#f39c12',
        description: "It hungers for more souls..."
    },
    {
        name: "Dark Phantom",
        health: 1000,
        patterns: ['homing', 'spiral', 'cross'],
        color: '#e84393',
        description: "A manifestation of despair..."
    },
    {
        name: "Abyssal Guardian",
        health: 2000,
        patterns: ['walls', 'rings', 'homing', 'spiral'],
        color: '#0984e3',
        description: "Guardian of the abyss..."
    },
    {
        name: "Lord of Cinder",
        health: 5000,
        patterns: ['cross', 'spiral', 'rings', 'homing', 'circleSpray'],
        color: '#d63031',
        description: "The first flame incarnate..."
    }
];
