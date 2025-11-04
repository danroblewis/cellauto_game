// Level Generator - Creates interesting contraptions and themed levels
// Each level tells a story through its structure

class LevelGenerator {
    constructor(world) {
        this.world = world;
        this.structures = new StructureLibrary();
    }

    // Generate a themed level
    generateLevel(theme = 'factory', difficulty = 'medium') {
        const themes = {
            'standard': this.generateStandard.bind(this),
            'factory': this.generateFactory.bind(this),
            'waterTreatment': this.generateWaterTreatment.bind(this),
            'mine': this.generateMine.bind(this),
            'laboratory': this.generateLaboratory.bind(this),
            'underground': this.generateUndergroundFacility.bind(this),
            'geothermal': this.generateGeothermalPlant.bind(this)
        };

        const generator = themes[theme] || themes['standard'];
        return generator(difficulty);
    }

    // THEME 0: Standard Random World (original generation)
    generateStandard(difficulty) {
        console.log('🌍 Generating Standard World...');
        
        // Use the world's built-in generation
        this.world.generateWorld();
        
        const story = {
            title: "Sandbox World",
            description: "A randomly generated world for exploration"
        };
        
        // Find a good spawn point (on ground)
        let spawnX = Math.floor(this.world.width / 2);
        let spawnY = 10;
        
        // Find actual ground level at spawn
        for (let y = 0; y < this.world.height; y++) {
            const cell = this.world.getCell(spawnX, y);
            if (cell && cell.isSolid()) {
                spawnY = y - 2; // Spawn above ground
                break;
            }
        }
        
        story.spawnX = spawnX;
        story.spawnY = spawnY;
        
        return story;
    }

    // THEME 1: Industrial Factory
    generateFactory(difficulty) {
        console.log('🏭 Generating Factory Level...');
        
        // Clear world
        this.clearWorld();
        
        // Build ground foundation
        this.buildGround(50);
        
        // Factory story: Production line with water cooling, steam power, stone production
        const story = {
            title: "Abandoned Factory",
            description: "A sprawling industrial complex with active machinery"
        };
        
        // Left section: Water intake and pumping station
        this.structures.placeWaterPumpStation(this.world, 10, 40);
        
        // Middle section: Stone production (water + lava)
        this.structures.placeStoneForge(this.world, 60, 35);
        
        // Right section: Steam power generator
        this.structures.placeSteamGenerator(this.world, 120, 38);
        
        // Upper level: Storage tanks
        this.structures.placeStorageTank(this.world, 40, 20, CellType.WATER);
        this.structures.placeStorageTank(this.world, 100, 20, CellType.LAVA);
        
        // Connect with platforms and ladders
        this.buildPlatform(30, 30, 80);
        this.buildPlatform(80, 25, 60);
        
        // Add structural supports
        this.addSupports(20, 30, 5);
        this.addSupports(70, 30, 5);
        this.addSupports(130, 30, 5);
        
        // Player spawn point
        story.spawnX = 5;
        story.spawnY = 45;
        
        return story;
    }

    // THEME 2: Water Treatment Plant
    generateWaterTreatment(difficulty) {
        console.log('💧 Generating Water Treatment Plant...');
        
        this.clearWorld();
        this.buildGround(50);
        
        const story = {
            title: "Water Purification Facility",
            description: "A multi-stage water treatment system"
        };
        
        // Stage 1: Intake reservoir (bottom left)
        this.structures.placeReservoir(this.world, 10, 40, 15, 8, CellType.WATER);
        
        // Stage 2: First pump station (lift to middle level)
        this.structures.placeVerticalPump(this.world, 30, 30, 12);
        
        // Stage 3: Settling tank (middle)
        this.structures.placeSettlingTank(this.world, 50, 28);
        
        // Stage 4: Second pump (lift to top)
        this.structures.placeVerticalPump(this.world, 80, 20, 10);
        
        // Stage 5: Clean water storage (top right)
        this.structures.placeReservoir(this.world, 100, 12, 20, 6, CellType.WATER);
        
        // Stage 6: Distribution pipes
        this.buildPipe(120, 15, 150, 15);
        
        // Observation platforms
        this.buildPlatform(40, 35, 30);
        this.buildPlatform(90, 25, 30);
        
        story.spawnX = 5;
        story.spawnY = 45;
        
        return story;
    }

    // THEME 3: Deep Mine
    generateMine(difficulty) {
        console.log('⛏️ Generating Mining Complex...');
        
        this.clearWorld();
        
        const story = {
            title: "Deep Mining Operation",
            description: "Excavation site with support structures"
        };
        
        // Surface level (top 1/3)
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < this.world.width; x++) {
                if (y < 3) {
                    this.world.setCell(x, y, CellType.AIR);
                } else if (y < 8) {
                    this.world.setCell(x, y, CellType.DIRT);
                } else {
                    this.world.setCell(x, y, CellType.STONE);
                }
            }
        }
        
        // Middle layer - stone with ore veins
        for (let y = 10; y < 30; y++) {
            for (let x = 0; x < this.world.width; x++) {
                this.world.setCell(x, y, CellType.STONE);
                // Add ore veins
                if (Math.random() < 0.05) {
                    this.world.setCell(x, y, CellType.IRON_ORE);
                } else if (Math.random() < 0.02) {
                    this.world.setCell(x, y, CellType.COAL);
                }
            }
        }
        
        // Deep layer - stone and lava pockets
        for (let y = 30; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                this.world.setCell(x, y, CellType.STONE);
            }
        }
        
        // Carve main shaft with supports
        this.structures.placeMiningShaft(this.world, 20, 8, 35);
        
        // Horizontal tunnels at different levels
        this.structures.placeMiningTunnel(this.world, 25, 15, 40, true);
        this.structures.placeMiningTunnel(this.world, 25, 25, 50, true);
        this.structures.placeMiningTunnel(this.world, 25, 35, 30, true);
        
        // Elevator shaft with pumps
        this.structures.placeElevatorShaft(this.world, 80, 8, 35);
        
        // Lava pocket (danger!)
        this.structures.placeLavaPocket(this.world, 100, 38, 8, 5);
        
        // Water seepage
        this.structures.placeWaterSeepage(this.world, 50, 20);
        
        story.spawnX = 15;
        story.spawnY = 5;
        
        return story;
    }

    // THEME 4: Laboratory
    generateLaboratory(difficulty) {
        console.log('🔬 Generating Research Laboratory...');
        
        this.clearWorld();
        this.buildGround(45);
        
        const story = {
            title: "Experimental Research Lab",
            description: "Hazardous materials testing facility"
        };
        
        // Multiple floors
        this.buildFloor(0, 15);   // Upper floor
        this.buildFloor(0, 30);   // Middle floor
        this.buildFloor(0, 45);   // Ground floor
        
        // Upper floor: Clean water research
        this.structures.placeContainmentChamber(this.world, 20, 8, CellType.WATER);
        this.structures.placeContainmentChamber(this.world, 50, 8, CellType.ICE);
        
        // Middle floor: Fire and lava testing
        this.structures.placeContainmentChamber(this.world, 20, 23, CellType.LAVA);
        this.structures.placeContainmentChamber(this.world, 50, 23, CellType.FIRE);
        
        // Ground floor: Mixed reactions
        this.structures.placeReactionChamber(this.world, 80, 38);
        this.structures.placeAcidTank(this.world, 120, 38);
        
        // Observation windows (glass)
        this.buildObservationWindow(15, 10, 30, 3);
        this.buildObservationWindow(15, 25, 30, 3);
        
        // Emergency cooling system
        this.structures.placeEmergencyCooling(this.world, 140, 35);
        
        story.spawnX = 5;
        story.spawnY = 42;
        
        return story;
    }

    // THEME 5: Underground Facility
    generateUndergroundFacility(difficulty) {
        console.log('🏢 Generating Underground Facility...');
        
        this.clearWorld();
        
        const story = {
            title: "Subterranean Complex",
            description: "Hidden facility deep underground"
        };
        
        // Fill entire world with stone
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                this.world.setCell(x, y, CellType.STONE);
            }
        }
        
        // Main corridor
        this.structures.placeCorridor(this.world, 10, 25, 180, 4);
        
        // Rooms branching off
        this.structures.placeRoom(this.world, 20, 15, 15, 8);   // Upper room 1
        this.structures.placeRoom(this.world, 50, 15, 20, 8);   // Upper room 2
        this.structures.placeRoom(this.world, 90, 15, 15, 10);  // Upper room 3
        
        this.structures.placeRoom(this.world, 20, 32, 15, 10);  // Lower room 1
        this.structures.placeRoom(this.world, 50, 32, 20, 12);  // Lower room 2
        this.structures.placeRoom(this.world, 100, 32, 25, 10); // Lower room 3
        
        // Connect rooms with vertical shafts
        this.structures.placeVerticalShaft(this.world, 27, 23, 9);
        this.structures.placeVerticalShaft(this.world, 60, 23, 9);
        this.structures.placeVerticalShaft(this.world, 97, 23, 9);
        
        // Add interesting features to rooms
        this.structures.placeWaterReservoir(this.world, 22, 17, 10, 5);
        this.structures.placePumpArray(this.world, 52, 17, 3, 5);
        this.structures.placeLavaForge(this.world, 92, 17, 10, 6);
        
        // Emergency systems
        this.structures.placeFireSuppression(this.world, 25, 35);
        
        story.spawnX = 12;
        story.spawnY = 27;
        
        return story;
    }

    // THEME 6: Geothermal Power Plant
    generateGeothermalPlant(difficulty) {
        console.log('🌋 Generating Geothermal Plant...');
        
        this.clearWorld();
        
        const story = {
            title: "Geothermal Energy Station",
            description: "Harnessing Earth's heat for power"
        };
        
        // Ground layer
        this.buildGround(40);
        
        // Deep lava chambers (heat source)
        this.structures.placeLavaReservoir(this.world, 30, 55, 20, 8);
        this.structures.placeLavaReservoir(this.world, 80, 55, 20, 8);
        this.structures.placeLavaReservoir(this.world, 130, 55, 20, 8);
        
        // Heat exchangers (pump water down, get steam up)
        this.structures.placeHeatExchanger(this.world, 35, 45);
        this.structures.placeHeatExchanger(this.world, 85, 45);
        this.structures.placeHeatExchanger(this.world, 135, 45);
        
        // Water input tanks (top)
        this.structures.placeReservoir(this.world, 20, 25, 15, 6, CellType.WATER);
        this.structures.placeReservoir(this.world, 70, 25, 15, 6, CellType.WATER);
        this.structures.placeReservoir(this.world, 120, 25, 15, 6, CellType.WATER);
        
        // Cooling towers
        this.structures.placeCoolingTower(this.world, 50, 15);
        this.structures.placeCoolingTower(this.world, 100, 15);
        
        // Steam collection
        this.structures.placeSteamCollector(this.world, 150, 30);
        
        // Safety features
        this.structures.placeEmergencyVent(this.world, 10, 30);
        this.structures.placeEmergencyVent(this.world, 160, 30);
        
        story.spawnX = 5;
        story.spawnY = 35;
        
        return story;
    }

    // Helper methods for building basic structures
    clearWorld() {
        // Clear active cells first to prevent invalid coordinates
        this.world.activeCells.clear();
        
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                this.world.setCell(x, y, CellType.AIR);
            }
        }
    }

    buildGround(startY) {
        for (let y = startY; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                if (y < startY + 5) {
                    this.world.setCell(x, y, CellType.DIRT);
                } else {
                    this.world.setCell(x, y, CellType.STONE);
                }
            }
        }
    }

    buildFloor(startX, y, length = null) {
        const endX = length ? startX + length : this.world.width;
        for (let x = startX; x < endX; x++) {
            this.world.setCell(x, y, CellType.STONE);
        }
    }

    buildPlatform(startX, y, length) {
        for (let x = startX; x < startX + length; x++) {
            this.world.setCell(x, y, CellType.STONE);
        }
    }

    buildPipe(startX, startY, endX, endY) {
        // Simple horizontal or vertical pipe
        if (startY === endY) {
            // Horizontal
            const y = startY;
            for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
                this.world.setCell(x, y - 1, CellType.STONE); // Top
                this.world.setCell(x, y + 1, CellType.STONE); // Bottom
            }
        } else {
            // Vertical
            const x = startX;
            for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
                this.world.setCell(x - 1, y, CellType.STONE); // Left
                this.world.setCell(x + 1, y, CellType.STONE); // Right
            }
        }
    }

    addSupports(x, startY, height) {
        for (let y = startY; y < startY + height; y++) {
            const cell = this.world.getCell(x, y);
            if (cell && cell.type === CellType.STONE) {
                cell.hasSupport = true;
            }
        }
    }

    buildObservationWindow(startX, startY, width, height) {
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                this.world.setCell(x, y, CellType.GLASS);
            }
        }
    }
}

// Library of reusable structures
class StructureLibrary {
    
    // Water Pump Station - pumps water from reservoir to higher level
    placeWaterPumpStation(world, x, y) {
        const structure = [
            '#######',
            '#WWWWW#',
            '#WWWWW#',
            '#######',
            '  PPP  ',
            '  PPP  ',
            '  PPP  ',
            '  PPP  ',
            '  PPP  ',
            '#######',
            '#     #',
            '#######'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Stone Forge - combines water and lava to produce stone
    placeStoneForge(world, x, y) {
        const structure = [
            '  #####  ',
            '  #   #  ',
            '  #####  ',
            '    |    ',
            '####|####',
            '#LL   WW#',
            '#LL   WW#',
            '#########'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Steam Generator - heats water to produce steam power
    placeSteamGenerator(world, x, y) {
        const structure = [
            '  #####  ',
            '  #EEE#  ',
            '  #####  ',
            '    |    ',
            '#########',
            '#  WWW  #',
            '# WWWWW #',
            '# LLLLL #',
            '#########'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Storage Tank
    placeStorageTank(world, x, y, liquidType = CellType.WATER) {
        const width = 12;
        const height = 8;
        
        // Walls
        for (let dy = 0; dy < height; dy++) {
            world.setCell(x, y + dy, CellType.STONE);
            world.setCell(x + width - 1, y + dy, CellType.STONE);
        }
        
        // Floor and ceiling
        for (let dx = 0; dx < width; dx++) {
            world.setCell(x + dx, y, CellType.STONE);
            world.setCell(x + dx, y + height - 1, CellType.STONE);
        }
        
        // Fill with liquid
        for (let dy = 1; dy < height - 1; dy++) {
            for (let dx = 1; dx < width - 1; dx++) {
                world.setCell(x + dx, y + dy, liquidType);
            }
        }
    }

    // Reservoir - open top container
    placeReservoir(world, x, y, width, height, liquidType = CellType.WATER) {
        // Floor
        for (let dx = 0; dx < width; dx++) {
            world.setCell(x + dx, y + height, CellType.STONE);
        }
        
        // Walls
        for (let dy = 0; dy <= height; dy++) {
            world.setCell(x, y + dy, CellType.STONE);
            world.setCell(x + width - 1, y + dy, CellType.STONE);
        }
        
        // Fill with liquid (leave top layer empty for visibility)
        for (let dy = 1; dy < height - 1; dy++) {
            for (let dx = 1; dx < width - 1; dx++) {
                world.setCell(x + dx, y + dy, liquidType);
            }
        }
    }

    // Vertical Pump - pumps liquid upward
    placeVerticalPump(world, x, y, height) {
        for (let dy = 0; dy < height; dy++) {
            world.setCell(x, y + dy, CellType.PUMP);
            world.setCell(x + 1, y + dy, CellType.PUMP);
        }
        
        // Pump housing (stone walls)
        for (let dy = 0; dy < height; dy++) {
            world.setCell(x - 1, y + dy, CellType.STONE);
            world.setCell(x + 2, y + dy, CellType.STONE);
        }
    }

    // Settling Tank - for water treatment
    placeSettlingTank(world, x, y) {
        const structure = [
            '##########',
            '#        #',
            '#        #',
            '#  WWWW  #',
            '# WWWWWW #',
            '##########'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Mining Shaft - vertical shaft with supports
    placeMiningShaft(world, x, y, depth) {
        const width = 5;
        
        for (let dy = 0; dy < depth; dy++) {
            for (let dx = 0; dx < width; dx++) {
                world.setCell(x + dx, y + dy, CellType.AIR);
            }
            
            // Add supports every 5 blocks
            if (dy % 5 === 0) {
                for (let dx = 0; dx < width; dx++) {
                    const cell = world.getCell(x + dx, y + dy);
                    if (cell) cell.hasSupport = true;
                }
            }
        }
        
        // Support pillars on sides
        for (let dy = 0; dy < depth; dy++) {
            if (dy % 3 === 0) {
                world.setCell(x, y + dy, CellType.WOOD);
                world.setCell(x + width - 1, y + dy, CellType.WOOD);
            }
        }
    }

    // Mining Tunnel - horizontal with supports
    placeMiningTunnel(world, x, y, length, addSupports = true) {
        const height = 3;
        
        for (let dx = 0; dx < length; dx++) {
            for (let dy = 0; dy < height; dy++) {
                world.setCell(x + dx, y + dy, CellType.AIR);
            }
            
            // Add ceiling supports
            if (addSupports && dx % 4 === 0) {
                const cell = world.getCell(x + dx, y);
                if (cell) cell.hasSupport = true;
            }
        }
    }

    // Elevator Shaft
    placeElevatorShaft(world, x, y, depth) {
        const width = 3;
        
        // Shaft
        for (let dy = 0; dy < depth; dy++) {
            for (let dx = 0; dx < width; dx++) {
                world.setCell(x + dx, y + dy, CellType.AIR);
            }
        }
        
        // Pump column (elevator mechanism)
        for (let dy = 0; dy < depth; dy++) {
            world.setCell(x + 1, y + dy, CellType.PUMP);
        }
        
        // Walls
        for (let dy = 0; dy < depth; dy++) {
            world.setCell(x - 1, y + dy, CellType.STONE);
            world.setCell(x + width, y + dy, CellType.STONE);
        }
    }

    // Lava Pocket
    placeLavaPocket(world, x, y, width, height) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                world.setCell(x + dx, y + dy, CellType.LAVA);
            }
        }
    }

    // Water Seepage - small water source
    placeWaterSeepage(world, x, y) {
        for (let dx = 0; dx < 3; dx++) {
            world.setCell(x + dx, y, CellType.WATER);
        }
    }

    // Containment Chamber
    placeContainmentChamber(world, x, y, materialType) {
        const structure = [
            '#########',
            '#       #',
            '#       #',
            '#  ###  #',
            '#########'
        ];
        
        this.buildFromPattern(world, structure, x, y);
        
        // Fill center with material
        for (let dy = 1; dy < 3; dy++) {
            for (let dx = 3; dx < 6; dx++) {
                world.setCell(x + dx, y + dy, materialType);
            }
        }
    }

    // Reaction Chamber - water + lava
    placeReactionChamber(world, x, y) {
        const structure = [
            '###########',
            '#         #',
            '# LL   WW #',
            '# LL   WW #',
            '###########'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Acid Tank
    placeAcidTank(world, x, y) {
        const structure = [
            '#######',
            '#AAAAA#',
            '#AAAAA#',
            '#AAAAA#',
            '#######'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Emergency Cooling System
    placeEmergencyCooling(world, x, y) {
        const structure = [
            '  ###  ',
            '  #W#  ',
            '  #W#  ',
            '  PPP  ',
            '  PPP  ',
            '#######'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Corridor
    placeCorridor(world, x, y, length, height) {
        for (let dx = 0; dx < length; dx++) {
            for (let dy = 0; dy < height; dy++) {
                world.setCell(x + dx, y + dy, CellType.AIR);
            }
        }
    }

    // Room
    placeRoom(world, x, y, width, height) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                world.setCell(x + dx, y + dy, CellType.AIR);
            }
        }
    }

    // Vertical Shaft (connecting floors)
    placeVerticalShaft(world, x, y, depth) {
        for (let dy = 0; dy < depth; dy++) {
            world.setCell(x, y + dy, CellType.AIR);
            world.setCell(x + 1, y + dy, CellType.AIR);
        }
    }

    // Water Reservoir (filled)
    placeWaterReservoir(world, x, y, width, height) {
        // Walls and floor
        for (let dy = 0; dy <= height; dy++) {
            world.setCell(x, y + dy, CellType.STONE);
            world.setCell(x + width - 1, y + dy, CellType.STONE);
        }
        for (let dx = 0; dx < width; dx++) {
            world.setCell(x + dx, y + height, CellType.STONE);
        }
        
        // Fill with water
        for (let dy = 1; dy < height; dy++) {
            for (let dx = 1; dx < width - 1; dx++) {
                world.setCell(x + dx, y + dy, CellType.WATER);
            }
        }
    }

    // Pump Array
    placePumpArray(world, x, y, columns, rows) {
        for (let dy = 0; dy < rows; dy++) {
            for (let dx = 0; dx < columns; dx++) {
                world.setCell(x + dx * 2, y + dy, CellType.PUMP);
            }
        }
    }

    // Lava Forge
    placeLavaForge(world, x, y, width, height) {
        // Container
        for (let dy = 0; dy <= height; dy++) {
            world.setCell(x, y + dy, CellType.STONE);
            world.setCell(x + width - 1, y + dy, CellType.STONE);
        }
        for (let dx = 0; dx < width; dx++) {
            world.setCell(x + dx, y + height, CellType.STONE);
        }
        
        // Lava pool
        for (let dy = height - 3; dy < height; dy++) {
            for (let dx = 1; dx < width - 1; dx++) {
                world.setCell(x + dx, y + dy, CellType.LAVA);
            }
        }
    }

    // Fire Suppression System
    placeFireSuppression(world, x, y) {
        const structure = [
            '  #W#  ',
            '  #W#  ',
            '  PPP  ',
            '  PPP  '
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Lava Reservoir (deep underground)
    placeLavaReservoir(world, x, y, width, height) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                world.setCell(x + dx, y + dy, CellType.LAVA);
            }
        }
        
        // Stone containment
        for (let dy = 0; dy < height; dy++) {
            world.setCell(x - 1, y + dy, CellType.STONE);
            world.setCell(x + width, y + dy, CellType.STONE);
        }
        for (let dx = -1; dx <= width; dx++) {
            world.setCell(x + dx, y - 1, CellType.STONE);
            world.setCell(x + dx, y + height, CellType.STONE);
        }
    }

    // Heat Exchanger
    placeHeatExchanger(world, x, y) {
        const structure = [
            '  PPP  ',
            ' ##### ',
            '  PPP  ',
            ' ##### ',
            '  PPP  '
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Cooling Tower
    placeCoolingTower(world, x, y) {
        const structure = [
            '  ###  ',
            ' #   # ',
            '#     #',
            '# WWW #',
            '#WWWWW#',
            '#######'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Steam Collector
    placeSteamCollector(world, x, y) {
        const structure = [
            '#########',
            '#       #',
            '#   E   #',
            '#  EEE  #',
            '# EEEEE #',
            '#########'
        ];
        
        this.buildFromPattern(world, structure, x, y);
    }

    // Emergency Vent
    placeEmergencyVent(world, x, y) {
        for (let dy = 0; dy < 10; dy++) {
            world.setCell(x, y + dy, CellType.AIR);
            world.setCell(x + 1, y + dy, CellType.AIR);
        }
    }

    // Helper method for safe cell placement with bounds checking
    safeSetCell(world, x, y, cellType) {
        if (x >= 0 && x < world.width && y >= 0 && y < world.height) {
            world.setCell(x, y, cellType);
            return true;
        }
        return false;
    }

    // Helper to build from ASCII pattern
    buildFromPattern(world, pattern, startX, startY) {
        const legend = {
            ' ': CellType.AIR,
            '#': CellType.STONE,
            'W': CellType.WATER,
            'L': CellType.LAVA,
            'P': CellType.PUMP,
            'E': CellType.STEAM,
            'D': CellType.DIRT,
            'S': CellType.SAND,
            'T': CellType.WOOD,
            'C': CellType.COAL,
            'I': CellType.ICE,
            'A': CellType.ACID,
            'F': CellType.FIRE,
            'G': CellType.GLASS,
            '|': CellType.AIR  // Pipe/shaft marker
        };
        
        for (let y = 0; y < pattern.length; y++) {
            const row = pattern[y];
            for (let x = 0; x < row.length; x++) {
                const char = row[x];
                const worldX = startX + x;
                const worldY = startY + y;
                
                // Bounds check
                if (worldX < 0 || worldX >= world.width || worldY < 0 || worldY >= world.height) {
                    continue;
                }
                
                if (legend[char]) {
                    world.setCell(worldX, worldY, legend[char]);
                }
            }
        }
    }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LevelGenerator, StructureLibrary };
}

