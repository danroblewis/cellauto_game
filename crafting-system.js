// Crafting System - Pattern-based crafting for cellular automata game
// Detects arrangements of cells and transforms them into crafted items

class CraftingSystem {
    constructor(world) {
        this.world = world;
        this.recipes = [];
        this.craftingCooldown = 0; // Prevent spam crafting
        this.initializeRecipes();
    }

    initializeRecipes() {
        // Recipe format: { pattern, result, name, description }
        // Pattern is a 2D array where each cell is a CellType or null (wildcard)
        
        // IRON PLATE: Smelt iron ore with fire
        this.addRecipe({
            name: "Iron Plate",
            description: "Smelt iron ore with fire",
            pattern: [
                ['fire'],
                ['iron_ore']
            ],
            result: CellType.IRON_PLATE
        });
        
        // STEEL: Heat iron plate with coal
        this.addRecipe({
            name: "Steel",
            description: "Heat iron plate with coal",
            pattern: [
                ['iron_plate'],
                ['coal'],
                ['fire']
            ],
            result: CellType.STEEL
        });
        
        // WIRE: Stretch iron plate horizontally
        this.addRecipe({
            name: "Wire",
            description: "Stretch iron between two stones",
            pattern: [
                ['stone', 'iron_plate', 'stone']
            ],
            result: CellType.WIRE
        });
        
        // GEAR: Arrange iron plates in a cross pattern
        this.addRecipe({
            name: "Gear",
            description: "Arrange iron plates in cross shape",
            pattern: [
                [null, 'iron_plate', null],
                ['iron_plate', 'iron_plate', 'iron_plate'],
                [null, 'iron_plate', null]
            ],
            result: CellType.GEAR,
            outputCount: 1
        });
        
        // CIRCUIT: Combine wire, iron plate, and coal
        this.addRecipe({
            name: "Circuit",
            description: "Wire, iron plate, and coal",
            pattern: [
                ['wire', 'coal'],
                ['iron_plate', 'wire']
            ],
            result: CellType.CIRCUIT
        });
        
        // SIMPLE GEAR: 2x2 iron plates
        this.addRecipe({
            name: "Simple Gear",
            description: "Four iron plates in square",
            pattern: [
                ['iron_plate', 'iron_plate'],
                ['iron_plate', 'iron_plate']
            ],
            result: CellType.GEAR
        });
    }

    addRecipe(recipe) {
        this.recipes.push(recipe);
    }

    // Check for crafting patterns in a region
    checkCraftingInRegion(startX, startY, width, height) {
        if (this.craftingCooldown > 0) {
            this.craftingCooldown--;
            return false;
        }

        for (const recipe of this.recipes) {
            const match = this.findPatternInRegion(recipe.pattern, startX, startY, width, height);
            if (match) {
                this.craft(recipe, match.x, match.y);
                this.craftingCooldown = 30; // Wait 30 frames before next craft
                return true;
            }
        }
        return false;
    }

    // Find a pattern match in a region
    findPatternInRegion(pattern, startX, startY, width, height) {
        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;

        // Scan the region for the pattern
        for (let y = startY; y < startY + height - patternHeight + 1; y++) {
            for (let x = startX; x < startX + width - patternWidth + 1; x++) {
                if (this.matchesPattern(pattern, x, y)) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    // Check if pattern matches at a specific location
    matchesPattern(pattern, startX, startY) {
        for (let py = 0; py < pattern.length; py++) {
            for (let px = 0; px < pattern[py].length; px++) {
                const expectedType = pattern[py][px];
                const cell = this.world.getCell(startX + px, startY + py);
                
                if (!cell) return false;
                
                // null in pattern means wildcard (any cell type OK)
                if (expectedType === null) continue;
                
                // Check if cell type matches
                if (cell.type !== expectedType) return false;
            }
        }
        return true;
    }

    // Perform the crafting
    craft(recipe, x, y) {
        console.log(`✨ Crafting: ${recipe.name} at (${x}, ${y})`);
        
        const patternHeight = recipe.pattern.length;
        const patternWidth = recipe.pattern[0].length;
        
        // Clear the pattern area
        for (let py = 0; py < patternHeight; py++) {
            for (let px = 0; px < patternWidth; px++) {
                this.world.setCell(x + px, y + py, CellType.AIR);
            }
        }
        
        // Place the crafted item in the center
        const centerX = x + Math.floor(patternWidth / 2);
        const centerY = y + Math.floor(patternHeight / 2);
        this.world.setCell(centerX, centerY, recipe.result);
        
        // Mark active for animation
        this.world.markActive(centerX, centerY);
        
        // Add particles effect
        this.createCraftingEffect(centerX, centerY);
    }

    // Visual effect when crafting occurs
    createCraftingEffect(x, y) {
        // Create some steam/smoke particles as visual feedback
        for (let i = 0; i < 3; i++) {
            const offsetX = x + (Math.random() - 0.5) * 2;
            const offsetY = y - 1 - i;
            if (offsetX >= 0 && offsetX < this.world.width && offsetY >= 0) {
                const cell = this.world.getCell(Math.floor(offsetX), Math.floor(offsetY));
                if (cell && cell.type === CellType.AIR) {
                    this.world.setCell(Math.floor(offsetX), Math.floor(offsetY), CellType.STEAM);
                }
            }
        }
    }

    // Check crafting in the visible/active region
    update(camera) {
        // Check crafting less frequently (every 10 frames)
        if (this.world.frameSkip % 10 !== 0) return;
        
        // Check a region around the camera/player
        const regionWidth = 40;
        const regionHeight = 30;
        const startX = Math.max(0, Math.floor(camera.x) - regionWidth / 2);
        const startY = Math.max(0, Math.floor(camera.y) - regionHeight / 2);
        
        this.checkCraftingInRegion(startX, startY, regionWidth, regionHeight);
    }

    // Get all recipe info for UI display
    getAllRecipes() {
        return this.recipes.map(r => ({
            name: r.name,
            description: r.description,
            result: r.result
        }));
    }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CraftingSystem };
}

