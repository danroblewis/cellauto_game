// Cellular Automata Engine
class CellType {
    static AIR = 'air';
    static STONE = 'stone';
    static DIRT = 'dirt';
    static SAND = 'sand';
    static WOOD = 'wood';
    static WATER = 'water';
    static LAVA = 'lava';
    static OIL = 'oil';
    static STEAM = 'steam';
    static SMOKE = 'smoke';
    static COAL = 'coal';
    static IRON_ORE = 'iron_ore';
    static ICE = 'ice';
    static GLASS = 'glass';
    static ACID = 'acid';
    static CRYSTAL = 'crystal';
    static GRASS = 'grass';
    static FIRE = 'fire';
    static SEED = 'seed';
    static PUMP = 'pump';
    static SUPPORT = 'support';
    
    // Conveyor belts (directional)
    static CONVEYOR_RIGHT = 'conveyor_right';
    static CONVEYOR_LEFT = 'conveyor_left';
    static CONVEYOR_UP = 'conveyor_up';
    static CONVEYOR_DOWN = 'conveyor_down';
    
    // Crafted items
    static IRON_PLATE = 'iron_plate';
    static GEAR = 'gear';
    static CIRCUIT = 'circuit';
    static WIRE = 'wire';
    static STEEL = 'steel';
}

class Cell {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.temperature = 20; // Room temperature
        this.pressure = 0;
        this.velocity = { x: 0, y: 0 };
        this.age = 0;
        this.updateCount = 0;
        this.stable = false; // Structural stability (for stone)
        this.hasSupport = false; // Support block overlay
        this.supportStable = false; // Stability for support blocks
        this.conveyorCooldown = 0; // Cooldown for conveyor movement
    }

    isStoneLike() {
        // Materials that need structural stability checking (won't fall if stable)
        return this.type === CellType.STONE || this.type === CellType.IRON_ORE || 
               this.type === CellType.CRYSTAL || this.type === CellType.GLASS ||
               this.type === CellType.PUMP ||
               this.isConveyor() || this.isCraftedItem();
    }

    isSolid() {
        return [CellType.STONE, CellType.DIRT, CellType.SAND, CellType.WOOD,
                CellType.COAL, CellType.IRON_ORE, CellType.ICE, CellType.GLASS,
                CellType.CRYSTAL, CellType.GRASS, CellType.PUMP,
                CellType.CONVEYOR_RIGHT, CellType.CONVEYOR_LEFT, 
                CellType.CONVEYOR_UP, CellType.CONVEYOR_DOWN,
                CellType.IRON_PLATE, CellType.GEAR, CellType.CIRCUIT,
                CellType.WIRE, CellType.STEEL].includes(this.type);
        // Note: SUPPORT is intentionally not solid - it doesn't block movement
    }
    
    isConveyor() {
        return [CellType.CONVEYOR_RIGHT, CellType.CONVEYOR_LEFT,
                CellType.CONVEYOR_UP, CellType.CONVEYOR_DOWN].includes(this.type);
    }
    
    isCraftedItem() {
        return [CellType.IRON_PLATE, CellType.GEAR, CellType.CIRCUIT,
                CellType.WIRE, CellType.STEEL].includes(this.type);
    }
    
    providesStability() {
        // Blocks that provide structural stability support
        // Support is now a property, not a type
        return this.isSolid() || this.hasSupport;
    }

    isLiquid() {
        return [CellType.WATER, CellType.LAVA, CellType.OIL, CellType.ACID].includes(this.type);
    }

    isGas() {
        return [CellType.AIR, CellType.STEAM, CellType.SMOKE].includes(this.type);
    }

    isFlammable() {
        return [CellType.WOOD, CellType.COAL, CellType.OIL, CellType.GRASS].includes(this.type);
    }

    getDensity() {
        const densities = {
            [CellType.AIR]: 0.001,
            [CellType.STEAM]: 0.0006,
            [CellType.SMOKE]: 0.0005,
            [CellType.WATER]: 1.0,
            [CellType.OIL]: 0.9,
            [CellType.ACID]: 1.1,
            [CellType.LAVA]: 3.0,
            [CellType.ICE]: 0.9,
            [CellType.SAND]: 1.6,
            [CellType.DIRT]: 1.5,
            [CellType.STONE]: 2.6,
            [CellType.WOOD]: 0.6,
            [CellType.COAL]: 1.3,
            [CellType.IRON_ORE]: 3.5,
            [CellType.GLASS]: 2.5,
            [CellType.CRYSTAL]: 2.8,
            [CellType.GRASS]: 0.3,
            [CellType.FIRE]: 0.0001,
            [CellType.SEED]: 0.5,
            [CellType.PUMP]: 2.0,
            [CellType.SUPPORT]: 0.1
        };
        return densities[this.type] || 1.0;
    }

    getColor() {
        const colors = {
            [CellType.AIR]: 'transparent',
            [CellType.STONE]: '#404040',
            [CellType.DIRT]: '#8B4513',
            [CellType.SAND]: '#D2B48C',
            [CellType.WOOD]: '#8B4513',
            [CellType.WATER]: '#1E90FF',
            [CellType.LAVA]: '#FF4500',
            [CellType.OIL]: '#2F1B14',
            [CellType.STEAM]: 'rgba(255, 255, 255, 0.3)',
            [CellType.SMOKE]: 'rgba(80, 80, 80, 0.5)',
            [CellType.COAL]: '#1C1C1C',
            [CellType.IRON_ORE]: '#654321',
            [CellType.ICE]: '#E0F6FF',
            [CellType.GLASS]: 'rgba(200, 220, 255, 0.7)',
            [CellType.ACID]: '#90EE90',
            [CellType.CRYSTAL]: '#FF69B4',
            [CellType.GRASS]: '#228B22',
            [CellType.FIRE]: '#FF4400',
            [CellType.SEED]: '#654321',
            [CellType.PUMP]: '#00FFFF',
            [CellType.SUPPORT]: '#FFFF00',
            
            // Conveyor belts
            [CellType.CONVEYOR_RIGHT]: '#FFB000',
            [CellType.CONVEYOR_LEFT]: '#FFB000',
            [CellType.CONVEYOR_UP]: '#FFB000',
            [CellType.CONVEYOR_DOWN]: '#FFB000',
            
            // Crafted items
            [CellType.IRON_PLATE]: '#B8B8B8',
            [CellType.GEAR]: '#CCAA00',
            [CellType.CIRCUIT]: '#00FF00',
            [CellType.WIRE]: '#FF6600',
            [CellType.STEEL]: '#C0C0C0'
        };
        return colors[this.type] || '#FFFFFF';
    }
}

class CellularAutomata {
    constructor(width, height, cellSize = 4) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.grid = [];
        this.nextGrid = [];
        this.updateQueue = [];
        this.activeCells = new Set(); // Track cells that need updates
        this.frameSkip = 0; // Skip frames for performance
        this.updateRegion = null; // Only update visible region + buffer
        this.stabilityDirty = true; // Stability needs recalculation
        this.stabilityFrameSkip = 0; // Don't recalculate stability every frame
        
        // Initialize grids
        for (let y = 0; y < height; y++) {
            this.grid[y] = [];
            this.nextGrid[y] = [];
            for (let x = 0; x < width; x++) {
                this.grid[y][x] = new Cell(CellType.AIR, x, y);
                this.nextGrid[y][x] = new Cell(CellType.AIR, x, y);
            }
        }
    }

    markActive(x, y) {
        // Mark cell and neighbors as active
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    this.activeCells.add(`${nx},${ny}`);
                }
            }
        }
    }

    setUpdateRegion(startX, startY, endX, endY, buffer = 10) {
        this.updateRegion = {
            startX: Math.max(0, startX - buffer),
            startY: Math.max(0, startY - buffer),
            endX: Math.min(this.width, endX + buffer),
            endY: Math.min(this.height, endY + buffer)
        };
    }

    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.grid[y][x];
    }

    setCell(x, y, type) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        const cell = this.grid[y][x];
        const wasAir = cell.type === CellType.AIR;
        const wasStoneLike = cell.isStoneLike();
        
        cell.type = type;
        cell.temperature = 20;
        cell.velocity = { x: 0, y: 0 };
        cell.age = 0;
        cell.stable = false; // Reset stability
        
        // Mark as active if changed from/to air
        if (wasAir !== (type === CellType.AIR)) {
            this.markActive(x, y);
        }
        
        // If stone-like material was added/removed, mark stability as dirty
        if (wasStoneLike !== cell.isStoneLike()) {
            this.stabilityDirty = true;
            // Mark neighbors for stability recalculation
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                        const neighbor = this.grid[ny][nx];
                        if (neighbor.isStoneLike()) {
                            neighbor.stable = false; // Invalidate neighbor stability
                        }
                    }
                }
            }
        }
        
        return true;
    }

    swap(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= this.width || y1 < 0 || y1 >= this.height ||
            x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) {
            return false;
        }
        
        const cell1 = this.grid[y1][x1];
        const cell2 = this.grid[y2][x2];
        
        // Preserve support properties at their original locations
        const support1 = cell1.hasSupport;
        const support2 = cell2.hasSupport;
        const supportStable1 = cell1.supportStable;
        const supportStable2 = cell2.supportStable;
        
        // Swap the cells
        const temp = this.grid[y1][x1];
        this.grid[y1][x1] = this.grid[y2][x2];
        this.grid[y2][x2] = temp;
        
        // Restore support properties to their original locations
        this.grid[y1][x1].hasSupport = support1;
        this.grid[y2][x2].hasSupport = support2;
        this.grid[y1][x1].supportStable = supportStable1;
        this.grid[y2][x2].supportStable = supportStable2;
        
        // Update positions
        this.grid[y1][x1].x = x1;
        this.grid[y1][x1].y = y1;
        this.grid[y2][x2].x = x2;
        this.grid[y2][x2].y = y2;
        
        // Mark both cells as active
        this.markActive(x1, y1);
        this.markActive(x2, y2);
        
        // If stone-like materials moved or support flags exist, mark stability as dirty
        if (this.grid[y1][x1].isStoneLike() || this.grid[y2][x2].isStoneLike() || 
            support1 || support2) {
            this.stabilityDirty = true;
        }
        
        return true;
    }

    update() {
        // Skip frames for performance (process every 2-3 frames)
        this.frameSkip++;
        if (this.frameSkip < 2) return;
        this.frameSkip = 0;

        // Determine update region
        let startX = 0, startY = 0, endX = this.width, endY = this.height;
        if (this.updateRegion) {
            startX = this.updateRegion.startX;
            startY = this.updateRegion.startY;
            endX = this.updateRegion.endX;
            endY = this.updateRegion.endY;
        }

        // Process from bottom to top for gravity
        // Use a deterministic pattern to avoid random array creation
        const pattern = Math.floor(Date.now() / 100) % 2; // Alternates
        
        for (let y = endY - 1; y >= startY; y--) {
            const rowStart = pattern === 0 ? startX : endX - 1;
            const rowEnd = pattern === 0 ? endX : startX - 1;
            const step = pattern === 0 ? 1 : -1;
            
            for (let x = rowStart; (pattern === 0 ? x < rowEnd : x >= rowEnd); x += step) {
                const cell = this.grid[y][x];
                
                // Safety check - skip if cell doesn't exist
                if (!cell) {
                    console.warn(`Invalid cell at ${x}, ${y}`);
                    this.activeCells.delete(`${x},${y}`);
                    continue;
                }
                
                // Skip air cells (major performance boost)
                if (cell.type === CellType.AIR) continue;
                
                // Only process active cells or visible region
                const isActive = this.activeCells.has(`${x},${y}`);
                if (!isActive && this.updateRegion && 
                    (x < this.updateRegion.startX || x >= this.updateRegion.endX ||
                     y < this.updateRegion.startY || y >= this.updateRegion.endY)) {
                    continue;
                }

                let changed = false;
                
                // Conveyor belt logic - check if cell is ON a conveyor
                const cellBelow = this.getCell(x, y + 1);
                if (cellBelow && cellBelow.isConveyor && cellBelow.isConveyor() && 
                    cell.isConveyor && !cell.isConveyor()) {
                    // Check cooldown before moving
                    if (cell.conveyorCooldown <= 0) {
                        // Item on a conveyor belt - move it
                        changed = this.applyConveyorMovement(cell, x, y, cellBelow.type) || changed;
                        if (changed) {
                            // Set cooldown for next movement (adjust this value to change speed)
                            cell.conveyorCooldown = 3; // Wait 3 frames between moves
                        }
                    } else {
                        // Decrease cooldown
                        cell.conveyorCooldown--;
                    }
                }

                // Gravity for solids, liquids, and stone-like materials (includes support blocks)
                // Skip gravity if just moved by conveyor
                if (!changed && (cell.isSolid() || cell.isLiquid() || cell.isStoneLike())) {
                    changed = this.applyGravity(cell, x, y) || changed;
                }

                // Only do expensive checks if cell didn't move
                if (!changed) {
                    // Fluid dynamics for liquids (less frequent)
                    if (cell.isLiquid() && Math.random() > 0.3) {
                        this.applyFluidDynamics(cell, x, y);
                    }

                    // Gas behavior (even less frequent)
                    if (cell.isGas() && cell.type !== CellType.AIR && Math.random() > 0.5) {
                        this.applyGasBehavior(cell, x, y);
                    }

                    // Chemical reactions (rare, check less frequently)
                    if (Math.random() > 0.7) {
                        this.applyReactions(cell, x, y);
                    }

                    // Heat transfer (can be expensive, reduce frequency)
                    if (Math.random() > 0.5) {
                        this.applyHeatTransfer(cell, x, y);
                    }

                    // Phase changes (infrequent)
                    if (Math.random() > 0.8) {
                        this.applyPhaseChanges(cell, x, y);
                    }

                    // Special behaviors (infrequent)
                    if (Math.random() > 0.9) {
                        this.applySpecialBehaviors(cell, x, y);
                    }
                }
            }
        }
        
        // Process support block gravity (support flags can fall when not stable)
        for (let y = endY - 1; y >= startY; y--) {
            for (let x = startX; x < endX; x++) {
                const cell = this.grid[y][x];
                if (cell.hasSupport && !cell.supportStable) {
                    const below = this.getCell(x, y + 1);
                    // Support falls if not stable and cell below exists, doesn't have support, and isn't solid
                    if (below && !below.hasSupport && !below.isSolid()) {
                        cell.hasSupport = false;
                        below.hasSupport = true;
                        this.markActive(x, y);
                        this.markActive(x, y + 1);
                        this.stabilityDirty = true;
                    }
                }
            }
        }

        // Clear some active cells (keep recently active ones)
        if (this.activeCells.size > 1000) {
            const toRemove = Array.from(this.activeCells).slice(0, 500);
            toRemove.forEach(key => this.activeCells.delete(key));
        }

        // Update stability system (less frequently for performance)
        this.stabilityFrameSkip++;
        if (this.stabilityFrameSkip >= 3 || this.stabilityDirty) {
            this.updateStability();
            this.stabilityFrameSkip = 0;
            this.stabilityDirty = false;
        }
    }

    updateStability() {
        // Reset all stone-like stability and support stability
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (cell.isStoneLike()) {
                    cell.stable = false;
                }
                if (cell.hasSupport) {
                    cell.supportStable = false;
                }
            }
        }

        // Pass 1: Mark stones directly on ground or on solid non-stone materials
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (!cell.isStoneLike()) continue;

                // Check if on ground (bottom of world) or on solid surface
                if (y === this.height - 1) {
                    cell.stable = true;
                } else {
                    const below = this.grid[y + 1][x];
                    // Stable if standing on solid non-stone material (dirt, etc.), stable stone, or stable support
                    if (below.isSolid() && !below.isStoneLike()) {
                        cell.stable = true;
                    } else if (below.isStoneLike() && below.stable) {
                        cell.stable = true;
                    } else if (below.hasSupport && below.supportStable) {
                        // Stable support provides stability
                        cell.stable = true;
                    }
                }
            }
        }
        
        // Pass 1b: Mark support blocks directly on ground or solid surfaces
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (!cell.hasSupport) continue;

                // Support is stable if on ground or on solid block or on stable support
                if (y === this.height - 1) {
                    cell.supportStable = true;
                } else {
                    const below = this.grid[y + 1][x];
                    if (below.isSolid()) {
                        cell.supportStable = true;
                    } else if (below.hasSupport && below.supportStable) {
                        cell.supportStable = true;
                    }
                }
            }
        }

        // Pass 2+: Propagate stability through connected stones and supports (4-directional)
        // Run multiple passes to handle long chains
        let changed = true;
        let iterations = 0;
        const maxIterations = Math.max(this.width, this.height); // Safety limit

        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;

            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const cell = this.grid[y][x];
                    
                    // Propagate stone stability
                    if (cell.isStoneLike() && !cell.stable) {
                        // Check if any neighbor stone or support is stable
                        const neighbors = [
                            { x: x - 1, y: y }, { x: x + 1, y: y },
                            { x: x, y: y - 1 }, { x: x, y: y + 1 }
                        ];

                        for (const n of neighbors) {
                            if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height) {
                                const neighbor = this.grid[n.y][n.x];
                                if (neighbor.isStoneLike() && neighbor.stable) {
                                    cell.stable = true;
                                    changed = true;
                                    break;
                                } else if (neighbor.hasSupport && neighbor.supportStable) {
                                    // Stable support provides stability to adjacent stones
                                    cell.stable = true;
                                    changed = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Propagate support stability
                    if (cell.hasSupport && !cell.supportStable) {
                        const neighbors = [
                            { x: x - 1, y: y }, { x: x + 1, y: y },
                            { x: x, y: y - 1 }, { x: x, y: y + 1 }
                        ];

                        for (const n of neighbors) {
                            if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height) {
                                const neighbor = this.grid[n.y][n.x];
                                // Support gets stability from stable stones or stable supports
                                if ((neighbor.isStoneLike() && neighbor.stable) || 
                                    (neighbor.hasSupport && neighbor.supportStable)) {
                                    cell.supportStable = true;
                                    changed = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    applyConveyorMovement(cell, x, y, conveyorType) {
        // Move cell in the direction of the conveyor belt
        let targetX = x;
        let targetY = y;
        
        switch (conveyorType) {
            case CellType.CONVEYOR_RIGHT:
                targetX = x + 1;
                break;
            case CellType.CONVEYOR_LEFT:
                targetX = x - 1;
                break;
            case CellType.CONVEYOR_UP:
                targetY = y - 1;
                break;
            case CellType.CONVEYOR_DOWN:
                targetY = y + 1;
                break;
        }
        
        // Check if target is valid and empty (or air/gas)
        const target = this.getCell(targetX, targetY);
        if (!target) return false;
        
        // Can move into air or gas (with safety check for method existence)
        if (target.type === CellType.AIR || (target.isGas && target.isGas())) {
            if (this.swap(x, y, targetX, targetY)) {
                this.markActive(targetX, targetY);
                return true;
            }
        }
        
        return false;
    }

    applyGravity(cell, x, y) {
        const below = this.getCell(x, y + 1);
        if (!below) return false;

        // Stone-like materials check stability before falling
        if (cell.isStoneLike()) {
            // Don't fall if stable OR if standing on support
            if (cell.stable || below.hasSupport) {
                return false;
            }
        }

        // Liquids adjacent to pump blocks don't fall - they're being pulled up
        if (cell.isLiquid()) {
            const pumpForce = this.getPumpForce(x, y);
            if (pumpForce > 0) {
                return false; // Don't fall if there's a pump nearby
            }
        }

        // Can fall through air or lighter materials (but not through support for stone-like blocks)
        if (below.type === CellType.AIR ||
            (below.isLiquid() && cell.getDensity() > below.getDensity()) ||
            (below.isGas() && cell.getDensity() > below.getDensity())) {
            // Stone-like materials shouldn't fall through support
            if (cell.isStoneLike() && below.hasSupport) {
                return false;
            }
            if (this.swap(x, y, x, y + 1)) {
                this.markActive(x, y + 1);
                // If stone moved, mark stability as dirty
                if (cell.isStoneLike()) {
                    this.stabilityDirty = true;
                }
                return true;
            }
            return false;
        }

        // Check diagonals for solids (only check one diagonal per frame to reduce work)
        // But not for stone-like materials (stone, pump, etc.) - they only fall straight down
        if (cell.isSolid() && !cell.isStoneLike()) {
            // Use cell position as seed for deterministic randomness
            const seed = (x + y * this.width) % 4;
            if (seed < 2) { // Only check 50% of the time
                const dir = seed === 0 ? { x: -1, y: 1 } : { x: 1, y: 1 };
                const diag = this.getCell(x + dir.x, y + dir.y);
                const belowDiag = this.getCell(x + dir.x, y + dir.y + 1);
                if (diag && belowDiag && 
                    (diag.type === CellType.AIR || diag.isLiquid()) &&
                    (belowDiag.type === CellType.AIR || belowDiag.isLiquid())) {
                    if (this.swap(x, y, x + dir.x, y + dir.y)) {
                        this.markActive(x + dir.x, y + dir.y);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    applyFluidDynamics(cell, x, y) {
        if (cell.type === CellType.LAVA) {
            // Lava flows slowly
            if (Math.random() > 0.3) return;
        }

        // Check for nearby pump blocks that apply upward force
        const pumpForce = this.getPumpForce(x, y);
        
        // If there's upward pump force, try to move up with higher priority
        if (pumpForce > 0) {
            const above = this.getCell(x, y - 1);
            if (above && above.type === CellType.AIR) {
                // Stronger pump force = higher probability of moving up
                // With 2 pump blocks nearby (one on each side), should be very likely to rise
                const moveUpProbability = Math.min(0.95, 0.3 + pumpForce * 0.25);
                if (Math.random() < moveUpProbability) {
                    if (this.swap(x, y, x, y - 1)) {
                        this.markActive(x, y - 1);
                        return;
                    }
                }
            }
        }

        const dirs = [
            { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: -1, y: 1 }, { x: 1, y: 1 }
        ];

        for (const dir of dirs) {
            const target = this.getCell(x + dir.x, y + dir.y);
            if (!target) continue;

            // Flow to empty space or lighter fluids
            if (target.type === CellType.AIR ||
                (target.isLiquid() && cell.getDensity() > target.getDensity())) {
                if (Math.random() > 0.5) {
                    this.swap(x, y, x + dir.x, y + dir.y);
                    return;
                }
            }
        }
    }

    getPumpForce(x, y) {
        // Check 8-directional neighbors for pump blocks
        // Count how many pump blocks are nearby
        let pumpCount = 0;
        const neighbors = [
            { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
            { x: -1, y: 0 },                    { x: 1, y: 0 },
            { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
        ];

        for (const neighbor of neighbors) {
            const cell = this.getCell(x + neighbor.x, y + neighbor.y);
            if (cell && cell.type === CellType.PUMP) {
                pumpCount++;
            }
        }

        // Return pump force based on number of nearby pumps
        // More pumps = stronger upward force
        // Also consider diagonal pumps slightly less effective
        return pumpCount;
    }

    applyGasBehavior(cell, x, y) {
        // Gases rise
        const above = this.getCell(x, y - 1);
        if (above && above.type === CellType.AIR) {
            this.swap(x, y, x, y - 1);
        } else {
            // Spread horizontally
            const dirs = [{ x: -1, y: 0 }, { x: 1, y: 0 }];
            for (const dir of dirs) {
                const target = this.getCell(x + dir.x, y + dir.y);
                if (target && target.type === CellType.AIR && Math.random() > 0.7) {
                    this.swap(x, y, x + dir.x, y + dir.y);
                    return;
                }
            }
        }
    }

    applyReactions(cell, x, y) {
        const neighbors = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        for (const n of neighbors) {
            const neighbor = this.getCell(x + n.x, y + n.y);
            if (!neighbor) continue;

            // Water + Lava = Steam + Stone
            if ((cell.type === CellType.WATER && neighbor.type === CellType.LAVA) ||
                (cell.type === CellType.LAVA && neighbor.type === CellType.WATER)) {
                cell.type = CellType.STEAM;
                neighbor.type = CellType.STONE;
                neighbor.temperature = 100;
                return;
            }

            // Fire spreads to flammable materials
            if (neighbor.type === CellType.FIRE && cell.isFlammable() && Math.random() > 0.95) {
                cell.type = CellType.FIRE;
                cell.temperature = 500;
                return;
            }

            // Lava ignites flammable materials
            if (neighbor.type === CellType.LAVA && cell.isFlammable() && Math.random() > 0.9) {
                cell.type = CellType.FIRE;
                cell.temperature = 500;
                return;
            }

            // Fire consumes fuel and produces smoke
            if (cell.type === CellType.FIRE) {
                if (neighbor.isFlammable() && Math.random() > 0.98) {
                    neighbor.type = CellType.SMOKE;
                    neighbor.temperature = 200;
                }
            }

            // Acid corrodes organic materials
            if (cell.type === CellType.ACID && 
                (neighbor.type === CellType.WOOD || neighbor.type === CellType.GRASS)) {
                if (Math.random() > 0.95) {
                    neighbor.type = CellType.AIR;
                }
            }

            // Water extinguishes fire
            if (cell.type === CellType.WATER && neighbor.type === CellType.FIRE) {
                neighbor.type = CellType.STEAM;
                neighbor.temperature = 100;
            }
        }
    }

    applyHeatTransfer(cell, x, y) {
        const neighbors = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        for (const n of neighbors) {
            const neighbor = this.getCell(x + n.x, y + n.y);
            if (!neighbor) continue;

            // Average temperatures
            const avgTemp = (cell.temperature + neighbor.temperature) / 2;
            cell.temperature = cell.temperature * 0.9 + avgTemp * 0.1;
            neighbor.temperature = neighbor.temperature * 0.9 + avgTemp * 0.1;
        }

        // Cool down over time
        cell.temperature = cell.temperature * 0.999;
    }

    applyPhaseChanges(cell, x, y) {
        // Water <-> Ice
        if (cell.type === CellType.WATER && cell.temperature < 0) {
            cell.type = CellType.ICE;
        }
        if (cell.type === CellType.ICE && cell.temperature > 0) {
            cell.type = CellType.WATER;
        }

        // Water <-> Steam
        if (cell.type === CellType.WATER && cell.temperature > 100) {
            cell.type = CellType.STEAM;
        }
        if (cell.type === CellType.STEAM && cell.temperature < 100) {
            cell.type = CellType.WATER;
        }

        // Lava -> Stone (when cooled)
        if (cell.type === CellType.LAVA && cell.temperature < 500) {
            if (Math.random() > 0.99) {
                cell.type = CellType.STONE;
                cell.temperature = 20;
            }
        }
    }

    applySpecialBehaviors(cell, x, y) {
        cell.age++;
        cell.updateCount++;

        // Fire needs fuel
        if (cell.type === CellType.FIRE) {
            const hasFuel = this.checkNeighbors(x, y, c => c.isFlammable());
            if (!hasFuel && Math.random() > 0.995) {
                cell.type = CellType.SMOKE;
                cell.temperature = 100;
            }
        }

        // Smoke disperses
        if (cell.type === CellType.SMOKE && cell.age > 300) {
            if (Math.random() > 0.998) {
                cell.type = CellType.AIR;
            }
        }

        // Steam condenses
        if (cell.type === CellType.STEAM && cell.temperature < 50 && Math.random() > 0.99) {
            cell.type = CellType.WATER;
        }
    }

    checkNeighbors(x, y, predicate) {
        const neighbors = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];
        for (const n of neighbors) {
            const cell = this.getCell(x + n.x, y + n.y);
            if (cell && predicate(cell)) {
                return true;
            }
        }
        return false;
    }

    // Generate initial world
    generateWorld() {
        const groundLevel = Math.floor(this.height * 0.7);
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (y > groundLevel) {
                    // Ground layer
                    if (y === groundLevel + 1) {
                        this.setCell(x, y, CellType.GRASS);
                    } else if (y < groundLevel + 5) {
                        this.setCell(x, y, CellType.DIRT);
                    } else {
                        this.setCell(x, y, CellType.STONE);
                    }
                } else if (y === groundLevel && Math.random() > 0.95) {
                    // Occasional trees
                    this.setCell(x, y, CellType.WOOD);
                }
            }
        }

        // Add some resources
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = groundLevel + 5 + Math.floor(Math.random() * 20);
            if (y < this.height) {
                this.setCell(x, y, Math.random() > 0.5 ? CellType.COAL : CellType.IRON_ORE);
            }
        }

        // Add some water
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = groundLevel - Math.floor(Math.random() * 10);
            if (y >= 0 && this.getCell(x, y).type === CellType.AIR) {
                for (let j = 0; j < 10; j++) {
                    if (y + j < this.height) {
                        this.setCell(x, y + j, CellType.WATER);
                    }
                }
            }
        }
        
        // Mark entire visible/important region as active initially
        // This ensures physics works correctly at game start
        const visibleHeight = Math.floor(this.height * 0.5);
        for (let y = 0; y < visibleHeight; y++) {
            for (let x = 0; x < this.width; x++) {
                this.markActive(x, y);
            }
        }
    }

    serialize() {
        // Serialize world state to JSON
        const data = {
            width: this.width,
            height: this.height,
            cellSize: this.cellSize,
            cells: []
        };

        // Only save non-air cells or cells with support to reduce data size
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.grid[y][x];
                if (cell.type !== CellType.AIR || cell.temperature !== 20 || cell.stable !== false || cell.hasSupport) {
                    data.cells.push({
                        x: x,
                        y: y,
                        type: cell.type,
                        temperature: Math.round(cell.temperature * 10) / 10, // Round to 1 decimal
                        stable: cell.stable,
                        hasSupport: cell.hasSupport,
                        supportStable: cell.supportStable
                    });
                }
            }
        }

        return JSON.stringify(data);
    }

    loadFromData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate dimensions
            if (data.width !== this.width || data.height !== this.height) {
                console.warn('Saved world dimensions do not match current world');
                return false;
            }

            // Reset all cells to air
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const cell = this.grid[y][x];
                    cell.type = CellType.AIR;
                    cell.temperature = 20;
                    cell.pressure = 0;
                    cell.velocity = { x: 0, y: 0 };
                    cell.age = 0;
                    cell.stable = false;
                    cell.hasSupport = false;
                    cell.supportStable = false;
                }
            }

            // Restore saved cells
            data.cells.forEach(cellData => {
                if (cellData.x >= 0 && cellData.x < this.width &&
                    cellData.y >= 0 && cellData.y < this.height) {
                    const cell = this.grid[cellData.y][cellData.x];
                    cell.type = cellData.type;
                    cell.temperature = cellData.temperature || 20;
                    cell.stable = cellData.stable || false;
                    cell.hasSupport = cellData.hasSupport || false;
                    cell.supportStable = cellData.supportStable || false;
                    
                    // Mark as active to trigger physics updates
                    this.markActive(cellData.x, cellData.y);
                }
            });

            // Mark stability as dirty to recalculate
            this.stabilityDirty = true;
            
            console.log('World loaded from save data');
            return true;
        } catch (e) {
            console.error('Failed to load world data:', e);
            return false;
        }
    }
}

// Export for Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CellType, Cell, CellularAutomata };
}

