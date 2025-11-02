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
    }

    isSolid() {
        return [CellType.STONE, CellType.DIRT, CellType.SAND, CellType.WOOD,
                CellType.COAL, CellType.IRON_ORE, CellType.ICE, CellType.GLASS,
                CellType.CRYSTAL, CellType.GRASS].includes(this.type);
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
            [CellType.SEED]: 0.5
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
            [CellType.SEED]: '#654321'
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
        cell.type = type;
        cell.temperature = 20;
        cell.velocity = { x: 0, y: 0 };
        cell.age = 0;
        return true;
    }

    swap(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= this.width || y1 < 0 || y1 >= this.height ||
            x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) {
            return false;
        }
        const temp = this.grid[y1][x1];
        this.grid[y1][x1] = this.grid[y2][x2];
        this.grid[y2][x2] = temp;
        
        // Update positions
        this.grid[y1][x1].x = x1;
        this.grid[y1][x1].y = y1;
        this.grid[y2][x2].x = x2;
        this.grid[y2][x2].y = y2;
        return true;
    }

    update() {
        // Process physics from bottom to top, alternating left-right
        const directions = [
            { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: -1, y: 1 }, { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: -1, y: -1 }, { x: 1, y: -1 }
        ];

        // Process cells in random order to avoid artifacts
        const cellsToProcess = [];
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                if (Math.random() > 0.5) {
                    cellsToProcess.push({ x, y });
                } else {
                    cellsToProcess.unshift({ x, y });
                }
            }
        }

        for (const { x, y } of cellsToProcess) {
            const cell = this.grid[y][x];
            if (cell.type === CellType.AIR) continue;

            // Gravity for solids and liquids
            if (cell.isSolid() || cell.isLiquid()) {
                this.applyGravity(cell, x, y);
            }

            // Fluid dynamics for liquids
            if (cell.isLiquid()) {
                this.applyFluidDynamics(cell, x, y);
            }

            // Gas behavior
            if (cell.isGas() && cell.type !== CellType.AIR) {
                this.applyGasBehavior(cell, x, y);
            }

            // Chemical reactions
            this.applyReactions(cell, x, y);

            // Heat transfer
            this.applyHeatTransfer(cell, x, y);

            // Phase changes
            this.applyPhaseChanges(cell, x, y);

            // Special behaviors
            this.applySpecialBehaviors(cell, x, y);
        }
    }

    applyGravity(cell, x, y) {
        const below = this.getCell(x, y + 1);
        if (!below) return;

        // Can fall through air or lighter materials
        if (below.type === CellType.AIR || 
            (below.isLiquid() && cell.getDensity() > below.getDensity()) ||
            (below.isGas() && cell.getDensity() > below.getDensity())) {
            this.swap(x, y, x, y + 1);
            return;
        }

        // Check diagonals for solids
        if (cell.isSolid()) {
            const dirs = [{ x: -1, y: 1 }, { x: 1, y: 1 }];
            for (const dir of dirs) {
                const diag = this.getCell(x + dir.x, y + dir.y);
                const belowDiag = this.getCell(x + dir.x, y + dir.y + 1);
                if (diag && belowDiag && 
                    (diag.type === CellType.AIR || diag.isLiquid()) &&
                    (belowDiag.type === CellType.AIR || belowDiag.isLiquid())) {
                    this.swap(x, y, x + dir.x, y + dir.y);
                    return;
                }
            }
        }
    }

    applyFluidDynamics(cell, x, y) {
        if (cell.type === CellType.LAVA) {
            // Lava flows slowly
            if (Math.random() > 0.3) return;
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
    }
}

