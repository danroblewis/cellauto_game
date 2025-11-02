// Player Character
class Player {
    constructor(x, y, world) {
        this.x = x;
        this.y = y;
        this.world = world;
        
        // Physical properties
        this.width = 2; // cells
        this.height = 4; // cells
        this.velocity = { x: 0, y: 0 };
        this.speed = 0.1;
        this.jumpPower = 0.4;
        this.gravity = 0.015;
        this.maxFallSpeed = 0.5;
        
        // State
        this.onGround = false;
        this.health = 100;
        this.maxHealth = 100;
        this.invincibilityFrames = 0;
        this.invincibilityDuration = 30;
        
        // Interaction
        this.reachDistance = 28; // cells (increased from 8)
        this.currentTool = 'pickaxe';
        this.areaMiningRadius = 3; // Radius for large area (Ctrl key)
        this.mediumAreaRadius = 1; // Radius for medium area (Alt key)
        
        // Inventory (start with 999 of each material)
        this.inventory = new Map();
        const allMaterials = [
            CellType.STONE, CellType.DIRT, CellType.SAND, CellType.WOOD,
            CellType.WATER, CellType.LAVA, CellType.OIL, CellType.STEAM,
            CellType.SMOKE, CellType.COAL, CellType.IRON_ORE, CellType.ICE,
            CellType.GLASS, CellType.ACID, CellType.CRYSTAL, CellType.GRASS,
            CellType.FIRE, CellType.SEED, CellType.PUMP, CellType.SUPPORT
        ];
        
        allMaterials.forEach(material => {
            this.inventory.set(material, 999);
        });
        
        this.selectedMaterial = CellType.STONE;
        
        // Animation
        this.facingDirection = 1; // 1 = right, -1 = left
    }

    update(keys) {
        // Handle input
        if (keys['a'] || keys['ArrowLeft']) {
            this.velocity.x = -this.speed;
            this.facingDirection = -1;
        } else if (keys['d'] || keys['ArrowRight']) {
            this.velocity.x = this.speed;
            this.facingDirection = 1;
        } else {
            this.velocity.x *= 0.8; // Friction
        }

        if ((keys['w'] || keys[' '] || keys['ArrowUp']) && this.onGround) {
            this.velocity.y = -this.jumpPower;
            this.onGround = false;
        }

        // Apply gravity
        if (!this.onGround) {
            this.velocity.y += this.gravity;
            if (this.velocity.y > this.maxFallSpeed) {
                this.velocity.y = this.maxFallSpeed;
            }
        }

        // Move horizontally
        const newX = this.x + this.velocity.x;
        if (!this.checkCollision(newX, this.y)) {
            this.x = newX;
        } else {
            this.velocity.x = 0;
        }

        // Move vertically
        const newY = this.y + this.velocity.y;
        if (!this.checkCollision(this.x, newY)) {
            this.y = newY;
            this.onGround = false;
        } else {
            if (this.velocity.y > 0) {
                // Hit ground
                this.onGround = true;
            }
            this.velocity.y = 0;
        }

        // Check for hazards
        this.checkHazards();

        // Update invincibility frames
        if (this.invincibilityFrames > 0) {
            this.invincibilityFrames--;
        }
    }

    checkCollision(x, y) {
        const left = Math.floor(x);
        const right = Math.ceil(x + this.width - 1);
        const top = Math.floor(y);
        const bottom = Math.ceil(y + this.height - 1);

        for (let cy = top; cy <= bottom; cy++) {
            for (let cx = left; cx <= right; cx++) {
                const cell = this.world.getCell(cx, cy);
                if (cell && cell.isSolid()) {
                    return true;
                }
            }
        }
        return false;
    }

    checkHazards() {
        const centerX = Math.floor(this.x + this.width / 2);
        const centerY = Math.floor(this.y + this.height / 2);

        // Check cells player is in contact with
        for (let y = Math.floor(this.y); y < Math.ceil(this.y + this.height); y++) {
            for (let x = Math.floor(this.x); x < Math.ceil(this.x + this.width); x++) {
                const cell = this.world.getCell(x, y);
                if (!cell) continue;

                // Lava - instant death or massive damage
                if (cell.type === CellType.LAVA) {
                    this.takeDamage(50);
                }

                // Fire - damage over time
                if (cell.type === CellType.FIRE) {
                    this.takeDamage(1);
                }

                // Acid - damage over time
                if (cell.type === CellType.ACID) {
                    this.takeDamage(2);
                }

                // Check for falling objects above player
                if (y === Math.floor(this.y)) { // Only check top row
                    const above = this.world.getCell(x, y - 1);
                    if (above && above.isSolid() && above.type !== CellType.GRASS) {
                        // Check if object has support
                        const below = this.world.getCell(x, y);
                        if (below && !below.isSolid()) {
                            // Object is falling and player is below it
                            const damage = Math.min(50, above.getDensity() * 15);
                            this.takeDamage(damage);
                        }
                    }
                }
            }
        }
    }

    takeDamage(amount) {
        if (this.invincibilityFrames > 0) return;
        
        this.health -= amount;
        this.invincibilityFrames = this.invincibilityDuration;
        
        if (this.health <= 0) {
            this.health = 0;
            return true; // Player died
        }
        return false;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    canReach(worldX, worldY) {
        const dx = worldX - (this.x + this.width / 2);
        const dy = worldY - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.reachDistance;
    }

    getReachCells() {
        const cells = [];
        const centerX = Math.floor(this.x + this.width / 2);
        const centerY = Math.floor(this.y + this.height / 2);
        
        for (let y = centerY - this.reachDistance; y <= centerY + this.reachDistance; y++) {
            for (let x = centerX - this.reachDistance; x <= centerX + this.reachDistance; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this.reachDistance) {
                    cells.push({ x, y });
                }
            }
        }
        return cells;
    }

    useTool(worldX, worldY, areaMode = false, radius = 0, replaceMode = false) {
        // areaMode: false = single, 'medium' = Alt key, 'large' = Ctrl key
        // radius: custom radius if provided, otherwise uses default based on areaMode
        // replaceMode: true = shift held, replace existing blocks
        
        if (areaMode) {
            let useRadius = radius > 0 ? radius : (areaMode === 'large' ? this.areaMiningRadius : this.mediumAreaRadius);
            
            switch (this.currentTool) {
                case 'pickaxe':
                case 'shovel':
                    return this.mineArea(worldX, worldY, 'square', useRadius);
                case 'place':
                    return this.placeArea(worldX, worldY, 'square', useRadius, replaceMode);
                default:
                    // Other tools don't support area mode - fall through to single block mode
                    return false;
            }
        }
        
        // Single block operations
        if (!this.canReach(worldX, worldY)) {
            return false;
        }

        const cell = this.world.getCell(worldX, worldY);
        if (!cell) return false;

        switch (this.currentTool) {
            case 'pickaxe':
            case 'shovel':
                return this.mineCell(worldX, worldY, cell);
            case 'bucket':
                return this.handleBucket(worldX, worldY, cell);
            case 'place':
                return this.placeCell(worldX, worldY, replaceMode);
            case 'torch':
                return this.placeTorch(worldX, worldY, cell);
        }
        return false;
    }

    mineArea(centerX, centerY, shape = 'square', radius = null) {
        let mined = false;
        if (radius === null) radius = this.areaMiningRadius;

        if (shape === 'square') {
            // Mine a square area
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                for (let x = centerX - radius; x <= centerX + radius; x++) {
                    // Check if within reach
                    if (!this.canReach(x, y)) continue;
                    
                    const cell = this.world.getCell(x, y);
                    if (cell && cell.isSolid()) {
                        // Mine the cell directly
                        if (this.mineCellDirect(x, y, cell)) {
                            mined = true;
                        }
                    }
                }
            }
        } else if (shape === 'circle') {
            // Mine a circular area
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                for (let x = centerX - radius; x <= centerX + radius; x++) {
                    // Check if within reach
                    if (!this.canReach(x, y)) continue;
                    
                    // Check if within circle radius
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= radius + 0.5) { // +0.5 for better circle coverage
                        const cell = this.world.getCell(x, y);
                        if (cell && cell.isSolid()) {
                            // Mine the cell directly
                            if (this.mineCellDirect(x, y, cell)) {
                                mined = true;
                            }
                        }
                    }
                }
            }
        }

        return mined;
    }

    mineCell(x, y, cell) {
        // Wrapper that gets cell if not provided
        if (!cell) {
            cell = this.world.getCell(x, y);
            if (!cell) return false;
        }
        return this.mineCellDirect(x, y, cell);
    }

    mineCellDirect(x, y, cell) {
        // Mine support overlay first if present
        if (cell.hasSupport) {
            const count = this.inventory.get(CellType.SUPPORT) || 0;
            this.inventory.set(CellType.SUPPORT, count + 1);
            cell.hasSupport = false;
            this.world.stabilityDirty = true;
            return true;
        }
        
        if (!cell.isSolid()) return false;
        
        // Shovel is faster for dirt/sand
        if (this.currentTool === 'shovel' && 
            (cell.type === CellType.DIRT || cell.type === CellType.SAND)) {
            // Faster mining
        } else if (cell.type === CellType.STONE || cell.type === CellType.IRON_ORE) {
            // Slower for hard materials
            if (Math.random() > 0.3) return false;
        }

        // Add to inventory
        const count = this.inventory.get(cell.type) || 0;
        this.inventory.set(cell.type, count + 1);

        // Remove cell
        this.world.setCell(x, y, CellType.AIR);
        return true;
    }

    handleBucket(x, y, cell) {
        if (cell.isLiquid()) {
            // Collect liquid
            const count = this.inventory.get(cell.type) || 0;
            this.inventory.set(cell.type, count + 1);
            this.world.setCell(x, y, CellType.AIR);
            return true;
        } else if (this.inventory.get(this.selectedMaterial) > 0) {
            // Place liquid
            if (this.world.getCell(x, y).type === CellType.AIR) {
                const count = this.inventory.get(this.selectedMaterial) || 0;
                if (count > 0) {
                    this.inventory.set(this.selectedMaterial, count - 1);
                    this.world.setCell(x, y, this.selectedMaterial);
                    return true;
                }
            }
        }
        return false;
    }

    placeCell(x, y, replaceMode = false) {
        if (!this.canReach(x, y)) return false;
        
        const cell = this.world.getCell(x, y);
        
        // Support blocks are placed as overlay
        if (this.selectedMaterial === CellType.SUPPORT) {
            const count = this.inventory.get(CellType.SUPPORT) || 0;
            
            if (replaceMode) {
                // Replace mode: remove existing block and place support
                if (count > 0) {
                    // Add existing block to inventory if it's solid
                    if (cell.isSolid()) {
                        const existingCount = this.inventory.get(cell.type) || 0;
                        this.inventory.set(cell.type, existingCount + 1);
                    }
                    // Replace with air + support
                    this.world.setCell(x, y, CellType.AIR);
                    this.world.getCell(x, y).hasSupport = true;
                    this.inventory.set(CellType.SUPPORT, count - 1);
                    this.world.stabilityDirty = true;
                    return true;
                }
            } else {
                // Normal mode: just add support overlay
                if (count > 0 && !cell.hasSupport) {
                    this.inventory.set(CellType.SUPPORT, count - 1);
                    cell.hasSupport = true;
                    this.world.stabilityDirty = true;
                    return true;
                }
            }
            return false;
        }
        
        // Regular block placement
        if (replaceMode) {
            // Replace mode: remove existing block and support, place new block
            const count = this.inventory.get(this.selectedMaterial) || 0;
            if (count > 0) {
                // Add existing block to inventory if it's solid
                if (cell.isSolid()) {
                    const existingCount = this.inventory.get(cell.type) || 0;
                    this.inventory.set(cell.type, existingCount + 1);
                }
                // Add existing support to inventory if present
                if (cell.hasSupport) {
                    const supportCount = this.inventory.get(CellType.SUPPORT) || 0;
                    this.inventory.set(CellType.SUPPORT, supportCount + 1);
                }
                // Place new block (removes support automatically)
                this.inventory.set(this.selectedMaterial, count - 1);
                this.world.setCell(x, y, this.selectedMaterial);
                return true;
            }
        } else {
            // Normal mode: requires empty space
            if (cell.type !== CellType.AIR) return false;

            const count = this.inventory.get(this.selectedMaterial) || 0;
            if (count > 0) {
                this.inventory.set(this.selectedMaterial, count - 1);
                this.world.setCell(x, y, this.selectedMaterial);
                return true;
            }
        }
        return false;
    }

    placeArea(centerX, centerY, shape = 'square', radius = null, replaceMode = false) {
        if (radius === null) radius = this.mediumAreaRadius;
        let placed = false;
        
        const isSupport = this.selectedMaterial === CellType.SUPPORT;

        if (shape === 'square') {
            // Place in a square area
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                for (let x = centerX - radius; x <= centerX + radius; x++) {
                    if (this.placeCell(x, y, replaceMode)) {
                        placed = true;
                    }
                }
            }
        } else if (shape === 'circle') {
            // Place in a circular area
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                for (let x = centerX - radius; x <= centerX + radius; x++) {
                    // Check if within circle radius
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= radius + 0.5) {
                        if (this.placeCell(x, y, replaceMode)) {
                            placed = true;
                        }
                    }
                }
            }
        }

        return placed;
    }

    placeTorch(x, y, cell) {
        if (cell.isFlammable() && Math.random() > 0.7) {
            cell.type = CellType.FIRE;
            cell.temperature = 500;
            return true;
        } else if (cell.type === CellType.AIR) {
            // Place a fire cell
            cell.type = CellType.FIRE;
            cell.temperature = 500;
            return true;
        }
        return false;
    }

    addToInventory(material, amount = 1) {
        const count = this.inventory.get(material) || 0;
        this.inventory.set(material, count + amount);
    }

    getInventoryCount(material) {
        return this.inventory.get(material) || 0;
    }

    draw(ctx, camera) {
        const screenX = (this.x - camera.x) * camera.cellSize;
        const screenY = (this.y - camera.y) * camera.cellSize;
        const screenWidth = this.width * camera.cellSize;
        const screenHeight = this.height * camera.cellSize;

        // Player body (simple rectangle for now)
        ctx.fillStyle = this.invincibilityFrames > 0 ? 'rgba(255, 0, 0, 0.5)' : '#88AAFF';
        ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
        
        // Outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, screenWidth, screenHeight);

        // Face direction indicator
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            screenX + (this.facingDirection > 0 ? screenWidth - 3 : 3),
            screenY + screenHeight / 2 - 2,
            3, 3
        );
    }
}

