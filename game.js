// Main Game Logic
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.overlayCanvas = document.getElementById('overlay-canvas');
        
        // Set canvas size FIRST before creating renderer
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.overlayCanvas) {
            this.overlayCanvas.width = window.innerWidth;
            this.overlayCanvas.height = window.innerHeight;
        }
        
        // Try WebGL first, fall back to 2D
        try {
            this.renderer = new WebGLRenderer(this.canvas, null); // Will set world after creation
            this.useWebGL = true;
            console.log('Using WebGL renderer');
            
            // Use overlay canvas for 2D drawing when using WebGL
            this.ctx = this.overlayCanvas.getContext('2d');
        } catch (e) {
            console.warn('WebGL not available, falling back to Canvas 2D:', e);
            this.ctx = this.canvas.getContext('2d');
            this.useWebGL = false;
        }
        
        // World properties
        const worldWidth = 400;
        const worldHeight = 300;
        const cellSize = 12; // Increased from 4 for better visibility
        
        // Initialize cellular automata world
        this.world = new CellularAutomata(worldWidth, worldHeight, cellSize);
        
        // Level generator
        this.levelGenerator = new LevelGenerator(this.world);
        this.currentLevelTheme = null;
        
        // Crafting system
        this.craftingSystem = new CraftingSystem(this.world);
        
        // Set world in WebGL renderer if using WebGL
        if (this.useWebGL) {
            this.renderer.world = this.world;
            // Ensure viewport is set after world is ready
            this.renderer.updateViewport();
        }
        
        // Initialize player
        const startX = worldWidth / 2;
        const startY = this.findGroundLevel(startX);
        this.player = new Player(startX, startY - 5, this.world);
        
        // Camera
        this.camera = {
            x: this.player.x,
            y: this.player.y,
            cellSize: cellSize,
            followSpeed: 0.1
        };
        
        // Input handling
        this.keys = {};
        this.keys['control'] = false;
        this.keys['alt'] = false;
        this.mouse = { x: 0, y: 0, down: false, button: null };
        this.lastMinedPos = null; // Track last mined position for continuous mining
        this.miningCooldown = 0; // Cooldown between mining actions
        this.areaMiningShape = 'square'; // 'square' or 'circle'
        
        // Game state
        this.paused = false;
        this.gameOver = false;
        
        // Initialize UI
        this.initUI();
        this.initEventListeners();
        
        // Start game loop
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.time = 0;
        
        // Load saved state if available
        this.loadGameState();
        
        // Set up auto-save every 10 seconds
        this.lastSaveTime = Date.now();
        this.saveInterval = 10000; // 10 seconds in milliseconds
        
        // Start game loop
        requestAnimationFrame((time) => this.gameLoop(time));
        
        // Set up level selection menu (always, for event listeners)
        setTimeout(() => {
            this.setupLevelSelection();
            
            // Only show it if there's no saved state
            const savedState = localStorage.getItem('cellauto_game_state');
            if (!savedState) {
                this.showLevelSelectionMenu();
            }
        }, 100);
    }

    findGroundLevel(x) {
        for (let y = 0; y < this.world.height; y++) {
            const cell = this.world.getCell(Math.floor(x), y);
            if (cell && cell.isSolid()) {
                return y;
            }
        }
        return this.world.height - 10;
    }

    initUI() {
        // Tool selection
        const toolSlots = document.querySelectorAll('.tool-slot');
        toolSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectTool(index + 1);
            });
        });

        // Inventory
        const closeInventory = document.getElementById('close-inventory');
        closeInventory.addEventListener('click', () => {
            this.toggleInventory();
        });

        // Respawn button
        const respawnBtn = document.getElementById('respawn-btn');
        respawnBtn.addEventListener('click', () => {
            this.respawn();
        });

        // Initial tool selection
        this.selectTool(1);
    }

    initEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Track modifier keys
            if (e.ctrlKey || e.metaKey) {
                this.keys['control'] = true;
            }
            if (e.altKey) {
                this.keys['alt'] = true;
            }
            if (e.shiftKey) {
                this.keys['shift'] = true;
            }
            
            // Toggle area mining shape with C (when not holding modifiers)
            if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'C' || e.key === 'c')) {
                this.areaMiningShape = this.areaMiningShape === 'square' ? 'circle' : 'square';
            }
            
            // Tool selection
            if (e.key >= '1' && e.key <= '9') {
                this.selectTool(parseInt(e.key));
            }
            
            // Toggle inventory
            if (e.key === 'Tab') {
                e.preventDefault();
                this.toggleInventory();
            }
            
            // Close inventory with Escape
            if (e.key === 'Escape') {
                const panel = document.getElementById('inventory-panel');
                if (!panel.classList.contains('hidden')) {
                    this.toggleInventory();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            // Only clear modifier keys if they're explicitly released
            // We check the event modifiers directly
            if (!e.ctrlKey && !e.metaKey) {
                this.keys['control'] = false;
            }
            if (!e.altKey) {
                this.keys['alt'] = false;
            }
            if (!e.shiftKey) {
                this.keys['shift'] = false;
            }
        });
        
        // Also track modifier keys globally via window focus/blur and periodic checks
        // This ensures we catch modifier keys even if keyup events are missed
        window.addEventListener('blur', () => {
            // Clear modifier keys when window loses focus
            this.keys['control'] = false;
            this.keys['alt'] = false;
            this.keys['shift'] = false;
        });

        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            // Also update modifier keys from mouse event (in case they weren't tracked via keyboard events)
            if (e.ctrlKey || e.metaKey) {
                this.keys['control'] = true;
            } else {
                // Only clear if we're sure it's not pressed (check both sources)
                // We don't clear here to avoid race conditions
            }
            if (e.altKey) {
                this.keys['alt'] = true;
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
            this.mouse.button = e.button; // 0 = left, 2 = right
            this.handleMouseClick(e);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.down = false;
            this.mouse.button = null;
            this.lastMinedPos = null; // Reset when mouse released
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (this.useWebGL) {
                this.renderer.resize(window.innerWidth, window.innerHeight);
                if (this.overlayCanvas) {
                    this.overlayCanvas.width = window.innerWidth;
                    this.overlayCanvas.height = window.innerHeight;
                }
            } else {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
        });
        
        // New Game button
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
    }

    selectTool(toolNumber) {
        const tools = ['pickaxe', 'shovel', 'bucket', 'place', 'torch'];
        const toolNames = {
            'pickaxe': 'Pickaxe',
            'shovel': 'Shovel',
            'bucket': 'Bucket',
            'place': 'Placement Tool',
            'torch': 'Torch'
        };
        
        if (toolNumber >= 1 && toolNumber <= tools.length) {
            this.player.currentTool = tools[toolNumber - 1];
            
            // Update UI
            document.querySelectorAll('.tool-slot').forEach((slot, index) => {
                slot.classList.toggle('active', index + 1 === toolNumber);
            });
            
            // Update tool indicator
            const toolNameElement = document.getElementById('current-tool');
            if (toolNameElement) {
                toolNameElement.textContent = toolNames[this.player.currentTool];
            }
        }
    }

    toggleInventory() {
        const panel = document.getElementById('inventory-panel');
        panel.classList.toggle('hidden');
        
        if (!panel.classList.contains('hidden')) {
            this.updateInventoryDisplay();
        }
    }

    updateInventoryDisplay() {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';

        const materials = [
            CellType.STONE, CellType.DIRT, CellType.SAND, CellType.WOOD,
            CellType.WATER, CellType.LAVA, CellType.ICE, CellType.GLASS,
            CellType.COAL, CellType.IRON_ORE, CellType.CRYSTAL, CellType.PUMP,
            CellType.SUPPORT,
            CellType.CONVEYOR_RIGHT, CellType.CONVEYOR_LEFT, 
            CellType.CONVEYOR_UP, CellType.CONVEYOR_DOWN,
            CellType.IRON_PLATE, CellType.GEAR, CellType.CIRCUIT,
            CellType.WIRE, CellType.STEEL
        ];

        materials.forEach(material => {
            const count = this.player.getInventoryCount(material);
            const item = document.createElement('div');
            item.className = 'inventory-item';
            if (count === 0) {
                item.style.opacity = '0.4'; // Dim if no count
            }
            if (this.player.selectedMaterial === material) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <div class="inventory-item-name">${material.replace('_', ' ')}</div>
                <div class="inventory-item-count">${count > 0 ? count : '0'}</div>
            `;
            
            item.addEventListener('click', () => {
                if (count > 0) {
                    this.player.selectedMaterial = material;
                    document.getElementById('selected-material').textContent = material.replace('_', ' ');
                    this.updateInventoryDisplay();
                } else {
                    // Show hint if trying to select material they don't have
                    item.style.animation = 'shake 0.3s';
                    setTimeout(() => item.style.animation = '', 300);
                }
            });
            
            grid.appendChild(item);
        });
    }

    handleMouseClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates
        const worldX = Math.floor(screenX / this.camera.cellSize + this.camera.x);
        const worldY = Math.floor(screenY / this.camera.cellSize + this.camera.y);
        
        // Update player facing direction
        const playerCenterX = this.player.x + this.player.width / 2;
        this.player.facingDirection = worldX > playerCenterX ? 1 : -1;
        
        // Check modifier keys for area operations - check both stored keys and event modifiers
        const hasControl = this.keys['control'] || e.ctrlKey || e.metaKey;
        const hasAlt = this.keys['alt'] || e.altKey;
        const hasShift = this.keys['shift'] || e.shiftKey;
        const supportsAreaMode = this.player.currentTool === 'pickaxe' || 
                                this.player.currentTool === 'shovel' || 
                                this.player.currentTool === 'place';
        
        let areaMode = false;
        if (hasControl && supportsAreaMode) {
            areaMode = 'large'; // Large area (Ctrl)
        } else if (hasAlt && supportsAreaMode) {
            areaMode = 'medium'; // Medium area (Alt)
        }
        
        // Use tool immediately
        const success = this.player.useTool(worldX, worldY, areaMode, 0, hasShift);
        if (success && (this.player.currentTool === 'pickaxe' || this.player.currentTool === 'shovel' || this.player.currentTool === 'place')) {
            this.lastMinedPos = { x: worldX, y: worldY };
        } else {
            this.lastMinedPos = null;
        }
    }

    handleRightClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        const worldX = Math.floor(screenX / this.camera.cellSize + this.camera.x);
        const worldY = Math.floor(screenY / this.camera.cellSize + this.camera.y);
        
        // Right click for bucket collection or other secondary actions
        if (this.player.currentTool === 'bucket') {
            const cell = this.world.getCell(worldX, worldY);
            if (cell && cell.isLiquid()) {
                this.player.useTool(worldX, worldY);
            }
        }
    }

    updateCamera() {
        // Smooth camera follow
        const targetX = this.player.x - this.canvas.width / (2 * this.camera.cellSize);
        const targetY = this.player.y - this.canvas.height / (2 * this.camera.cellSize);
        
        this.camera.x += (targetX - this.camera.x) * this.camera.followSpeed;
        this.camera.y += (targetY - this.camera.y) * this.camera.followSpeed;
        
        // Keep camera within world bounds
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.world.width - this.canvas.width / this.camera.cellSize));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.world.height - this.canvas.height / this.camera.cellSize));
    }

    update() {
        if (this.paused || this.gameOver) return;

        // Update player
        const playerDied = this.player.update(this.keys);
        if (playerDied) {
            this.gameOver = true;
            document.getElementById('game-over').classList.remove('hidden');
        }

        // Handle continuous mining when mouse is held down
        if (this.mouse.down && this.mouse.button === 0) {
            // Left button held down
            if (this.miningCooldown <= 0) {
                const worldX = Math.floor(this.mouse.x / this.camera.cellSize + this.camera.x);
                const worldY = Math.floor(this.mouse.y / this.camera.cellSize + this.camera.y);
                
                // Check modifier keys for area operations
                const supportsAreaMode = this.player.currentTool === 'pickaxe' || 
                                        this.player.currentTool === 'shovel' || 
                                        this.player.currentTool === 'place';
                const hasControl = this.keys['control'];
                const hasAlt = this.keys['alt'];
                const hasShift = this.keys['shift'];
                
                let areaMode = false;
                if (hasControl && supportsAreaMode) {
                    areaMode = 'large'; // Large area (Ctrl)
                } else if (hasAlt && supportsAreaMode) {
                    areaMode = 'medium'; // Medium area (Alt)
                }
                
                if (areaMode) {
                    // Area operation
                    this.handleContinuousAction(worldX, worldY, areaMode, hasShift);
                    // Longer cooldown for area operations since they affect many blocks
                    this.miningCooldown = areaMode === 'large' ? 10 : 7;
                } else {
                    // Normal single-block operation
                    // Only continue if cursor is still over the same cell or adjacent cell
                    if (this.lastMinedPos) {
                        const dx = Math.abs(worldX - this.lastMinedPos.x);
                        const dy = Math.abs(worldY - this.lastMinedPos.y);
                        if (dx <= 1 && dy <= 1) {
                            this.handleContinuousAction(worldX, worldY, false, hasShift);
                        }
                    } else {
                        this.handleContinuousAction(worldX, worldY, false, hasShift);
                    }
                    
                    // Set cooldown based on tool (mining takes time)
                    if (this.player.currentTool === 'pickaxe' || this.player.currentTool === 'shovel') {
                        this.miningCooldown = 5; // Frames between mining attempts
                    } else {
                        this.miningCooldown = 3; // Faster for other tools
                    }
                }
            } else {
                this.miningCooldown--;
            }
        } else {
            this.miningCooldown = 0;
        }

        // Set update region to visible area + buffer for performance
        const startX = Math.max(0, Math.floor(this.camera.x) - 5);
        const endX = Math.min(this.world.width, Math.ceil(this.camera.x + this.canvas.width / this.camera.cellSize) + 5);
        const startY = Math.max(0, Math.floor(this.camera.y) - 5);
        const endY = Math.min(this.world.height, Math.ceil(this.camera.y + this.canvas.height / this.camera.cellSize) + 5);
        this.world.setUpdateRegion(startX, startY, endX, endY, 10);

        // Update world physics
        this.world.update();
        
        // Update crafting system (check for patterns)
        this.craftingSystem.update(this.camera);

        // Update camera
        this.updateCamera();

        // Update UI
        this.updateUI();

        // Auto-save every 30 seconds
        const currentTime = Date.now();
        if (currentTime - this.lastSaveTime >= this.saveInterval) {
            this.saveGameState();
            this.lastSaveTime = currentTime;
        }

        this.frameCount++;
    }

    handleContinuousAction(worldX, worldY, areaMode = false, replaceMode = false) {
        // Update player facing direction
        const playerCenterX = this.player.x + this.player.width / 2;
        this.player.facingDirection = worldX > playerCenterX ? 1 : -1;
        
        // Try to use tool
        const success = this.player.useTool(worldX, worldY, areaMode, 0, replaceMode);
        if (success) {
            this.lastMinedPos = { x: worldX, y: worldY };
        }
    }

    updateUI() {
        // Health bar
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-fill').style.width = healthPercent + '%';
        document.getElementById('health-text').textContent = Math.max(0, Math.floor(this.player.health)) + ' HP';

        // Selected material
        document.getElementById('selected-material').textContent = 
            this.player.selectedMaterial.replace('_', ' ');
    }

    render() {
        if (this.useWebGL) {
            // Use WebGL renderer (renders to main canvas)
            this.renderer.render(this.camera, this.player, this.time);
            
            // Clear overlay canvas and draw UI elements
            this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
            this.drawOverlays();
        } else {
            // Fallback to Canvas 2D rendering
            this.renderCanvas2D();
        }
    }

    renderCanvas2D() {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate visible cell range
        const startX = Math.max(0, Math.floor(this.camera.x));
        const endX = Math.min(this.world.width, Math.ceil(this.camera.x + this.canvas.width / this.camera.cellSize));
        const startY = Math.max(0, Math.floor(this.camera.y));
        const endY = Math.min(this.world.height, Math.ceil(this.camera.y + this.canvas.height / this.camera.cellSize));

        // Optimized rendering: batch same-color cells
        const cellSize = this.camera.cellSize;
        
        // Draw checkerboard pattern for air blocks
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const cell = this.world.getCell(x, y);
                const screenX = (x - this.camera.x) * cellSize;
                const screenY = (y - this.camera.y) * cellSize;
                
                if (cell && cell.type === CellType.AIR) {
                    // Checkerboard pattern for empty space
                    const isLight = (x + y) % 2 === 0;
                    this.ctx.fillStyle = isLight ? '#2a2a2a' : '#242424';
                    this.ctx.fillRect(screenX, screenY, cellSize, cellSize);
                }
            }
        }
        
        // Draw actual blocks
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const cell = this.world.getCell(x, y);
                if (cell && cell.type !== CellType.AIR) {
                    const screenX = (x - this.camera.x) * cellSize;
                    const screenY = (y - this.camera.y) * cellSize;
                    
                    // Use direct color string (avoid function call overhead)
                    const color = cell.getColor();
                    if (color !== 'transparent') {
                        this.ctx.fillStyle = color;
                        this.ctx.fillRect(screenX, screenY, cellSize, cellSize);
                    }
                }
            }
        }

        // Draw support block overlays (yellow borders)
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const cell = this.world.getCell(x, y);
                if (cell && cell.hasSupport) {
                    const screenX = (x - this.camera.x) * cellSize;
                    const screenY = (y - this.camera.y) * cellSize;
                    
                    // Draw yellow-brown border
                    this.ctx.strokeStyle = '#D4AF37'; // Gold/yellow-brown color
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(screenX, screenY, cellSize, cellSize);
                }
            }
        }

        this.drawOverlays();
        
        // Draw player
        this.player.draw(this.ctx, this.camera);
    }

    drawOverlays() {
        // Draw support block overlays (yellow borders) when using WebGL
        if (this.useWebGL) {
            const startX = Math.max(0, Math.floor(this.camera.x));
            const endX = Math.min(this.world.width, Math.ceil(this.camera.x + this.canvas.width / this.camera.cellSize));
            const startY = Math.max(0, Math.floor(this.camera.y));
            const endY = Math.min(this.world.height, Math.ceil(this.camera.y + this.canvas.height / this.camera.cellSize));
            
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const cell = this.world.getCell(x, y);
                    if (cell && cell.hasSupport) {
                        const screenX = (x - this.camera.x) * this.camera.cellSize;
                        const screenY = (y - this.camera.y) * this.camera.cellSize;
                        
                        // Draw yellow-brown border
                        this.ctx.strokeStyle = '#D4AF37'; // Gold/yellow-brown color
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect(screenX, screenY, this.camera.cellSize, this.camera.cellSize);
                    }
                }
            }
        }
        
        // Draw reach indicator
        const reachCells = this.player.getReachCells();
        reachCells.forEach(({ x, y }) => {
            const screenX = (x - this.camera.x) * this.camera.cellSize;
            const screenY = (y - this.camera.y) * this.camera.cellSize;
            
            if (screenX >= 0 && screenX < this.canvas.width &&
                screenY >= 0 && screenY < this.canvas.height) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                this.ctx.fillRect(screenX, screenY, this.camera.cellSize, this.camera.cellSize);
            }
        });

        // Draw cursor target cell
        const worldX = Math.floor(this.mouse.x / this.camera.cellSize + this.camera.x);
        const worldY = Math.floor(this.mouse.y / this.camera.cellSize + this.camera.y);
        
        // Check if area operations are active (mining or placing)
        const supportsAreaMode = this.player.currentTool === 'pickaxe' || 
                                this.player.currentTool === 'shovel' || 
                                this.player.currentTool === 'place';
        
        // Check modifier keys - use stored state, and also verify with a more reliable check
        // We can't directly access keyboard state here, but we should trust this.keys
        // However, let's make sure we're checking correctly
        const hasControl = !!this.keys['control'];
        const hasAlt = !!this.keys['alt'];
        const isLargeArea = hasControl && supportsAreaMode;
        const isMediumArea = hasAlt && supportsAreaMode;
        
        if (isLargeArea) {
            // Draw large area preview (Ctrl)
            const radius = this.player.areaMiningRadius;
            const centerScreenX = (worldX - this.camera.x) * this.camera.cellSize;
            const centerScreenY = (worldY - this.camera.y) * this.camera.cellSize;
            
            this.ctx.strokeStyle = 'rgba(255, 200, 0, 1.0)'; // Brighter, fully opaque
            this.ctx.lineWidth = 3; // Thicker line
            this.ctx.setLineDash([]); // Solid line
            
            // Always use square for area operations
            const size = radius * 2 + 1;
            const previewSize = size * this.camera.cellSize;
            this.ctx.strokeRect(
                centerScreenX - (radius * this.camera.cellSize),
                centerScreenY - (radius * this.camera.cellSize),
                previewSize,
                previewSize
            );
        } else if (isMediumArea) {
            // Draw medium area preview (Alt)
            const radius = this.player.mediumAreaRadius;
            const centerScreenX = (worldX - this.camera.x) * this.camera.cellSize;
            const centerScreenY = (worldY - this.camera.y) * this.camera.cellSize;
            
            this.ctx.strokeStyle = 'rgba(200, 150, 255, 1.0)'; // Brighter, fully opaque
            this.ctx.lineWidth = 3; // Thicker line
            this.ctx.setLineDash([]); // Solid line
            
            // Always use square for area operations
            const size = radius * 2 + 1;
            const previewSize = size * this.camera.cellSize;
            this.ctx.strokeRect(
                centerScreenX - (radius * this.camera.cellSize),
                centerScreenY - (radius * this.camera.cellSize),
                previewSize,
                previewSize
            );
        } else if (this.player.canReach(worldX, worldY)) {
            // Single block preview
            const screenX = (worldX - this.camera.x) * this.camera.cellSize;
            const screenY = (worldY - this.camera.y) * this.camera.cellSize;
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(screenX, screenY, this.camera.cellSize, this.camera.cellSize);
        }

        // Draw player (if using WebGL, draw on top)
        if (this.useWebGL) {
            this.player.draw(this.ctx, this.camera);
        }
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.time = currentTime / 1000; // Convert to seconds

        this.update();
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    respawn() {
        this.gameOver = false;
        document.getElementById('game-over').classList.add('hidden');
        
        // Reset player
        this.player.x = this.world.width / 2;
        this.player.y = this.findGroundLevel(this.player.x) - 5;
        this.player.health = this.player.maxHealth;
        this.player.velocity = { x: 0, y: 0 };
    }

    saveGameState() {
        try {
            const gameState = {
                world: this.world.serialize(),
                player: {
                    x: this.player.x,
                    y: this.player.y,
                    health: this.player.health,
                    selectedMaterial: this.player.selectedMaterial,
                    currentTool: this.player.currentTool,
                    inventory: Array.from(this.player.inventory.entries())
                },
                timestamp: Date.now()
            };

            localStorage.setItem('cellauto_game_state', JSON.stringify(gameState));
            console.log('Game state saved');
        } catch (e) {
            console.error('Failed to save game state:', e);
            // Handle quota exceeded error
            if (e.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded, unable to save');
            }
        }
    }

    loadGameState() {
        try {
            const savedState = localStorage.getItem('cellauto_game_state');
            if (!savedState) {
                console.log('No saved game state found, starting fresh');
                return;
            }

            const gameState = JSON.parse(savedState);
            
            // Load world state
            if (gameState.world) {
                const worldLoaded = this.world.loadFromData(gameState.world);
                if (worldLoaded && this.useWebGL) {
                    // Update WebGL texture after loading
                    this.renderer.updateTexture();
                }
            }

            // Load player state
            if (gameState.player) {
                const p = gameState.player;
                this.player.x = p.x || this.player.x;
                this.player.y = p.y || this.player.y;
                this.player.health = p.health !== undefined ? p.health : this.player.health;
                this.player.selectedMaterial = p.selectedMaterial || this.player.selectedMaterial;
                this.player.currentTool = p.currentTool || this.player.currentTool;
                
                // Restore inventory
                if (p.inventory) {
                    this.player.inventory = new Map(p.inventory);
                }

                // Update camera to player position
                this.camera.x = this.player.x - this.canvas.width / (2 * this.camera.cellSize);
                this.camera.y = this.player.y - this.canvas.height / (2 * this.camera.cellSize);

                // Update UI
                this.selectTool(this.getToolNumber(this.player.currentTool));
                this.updateInventoryDisplay();
                
                console.log('Game state loaded');
            }
        } catch (e) {
            console.error('Failed to load game state:', e);
        }
    }

    startNewGame() {
        // Confirm with user
        const confirmed = confirm('Start a new game? This will clear your current save.');
        if (!confirmed) {
            return;
        }
        
        console.log('Starting new game...');
        
        // Clear saved state
        localStorage.removeItem('cellauto_game_state');
        
        // Clear the active cells set to prevent invalid coordinates
        this.world.activeCells.clear();
        
        // Clear the current world
        for (let x = 0; x < this.world.width; x++) {
            for (let y = 0; y < this.world.height; y++) {
                this.world.setCell(x, y, CellType.AIR);
            }
        }
        
        // Update WebGL texture if using WebGL
        if (this.useWebGL && this.renderer.updateTexture) {
            this.renderer.updateTexture();
        }
        
        // Show level selection menu
        this.showLevelSelectionMenu();
        
        console.log('New game initialized, showing level selection');
    }

    getToolNumber(toolName) {
        const tools = ['pickaxe', 'shovel', 'bucket', 'place', 'torch'];
        return tools.indexOf(toolName) + 1 || 1;
    }

    setupLevelSelection() {
        console.log('Setting up level selection...');
        const levelSelect = document.getElementById('level-select');
        if (!levelSelect) {
            console.error('Level select element not found!');
            return;
        }
        
        // Handle level button clicks
        const levelButtons = document.querySelectorAll('.level-button');
        console.log(`Found ${levelButtons.length} level buttons`);
        
        levelButtons.forEach((button, index) => {
            // Remove any existing listeners by cloning
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', () => {
                console.log(`Button ${index} clicked`);
                const theme = newButton.getAttribute('data-theme');
                console.log(`Loading theme: ${theme}`);
                this.loadLevel(theme);
                levelSelect.classList.add('hidden');
            });
        });
        
        // Handle random level
        const randomButton = document.getElementById('random-level');
        if (randomButton) {
            console.log('Found random button');
            const newRandom = randomButton.cloneNode(true);
            randomButton.parentNode.replaceChild(newRandom, randomButton);
            
            newRandom.addEventListener('click', () => {
                console.log('Random button clicked');
                const themes = ['standard', 'factory', 'waterTreatment', 'mine', 'laboratory', 'underground', 'geothermal'];
                const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                console.log(`Random theme selected: ${randomTheme}`);
                this.loadLevel(randomTheme);
                levelSelect.classList.add('hidden');
            });
        } else {
            console.error('Random button not found!');
        }
    }
    
    showLevelSelectionMenu() {
        console.log('Showing level selection menu...');
        const levelSelect = document.getElementById('level-select');
        if (!levelSelect) {
            console.error('Level select element not found!');
            return;
        }
        
        levelSelect.classList.remove('hidden');
        this.paused = true;
    }

    loadLevel(theme) {
        console.log(`Loading level: ${theme}`);
        
        // Generate level with theme
        const levelInfo = this.levelGenerator.generateLevel(theme);
        this.currentLevelTheme = theme;
        
        // Set player position to spawn point
        if (levelInfo.spawnX !== undefined && levelInfo.spawnY !== undefined) {
            this.player.x = levelInfo.spawnX;
            this.player.y = levelInfo.spawnY;
        }
        
        // Reset player state
        this.player.health = this.player.maxHealth;
        this.player.velocity = { x: 0, y: 0 };
        
        // Update camera to player position
        this.camera.x = this.player.x - this.canvas.width / (2 * this.camera.cellSize);
        this.camera.y = this.player.y - this.canvas.height / (2 * this.camera.cellSize);
        
        // Update WebGL texture if using WebGL
        if (this.useWebGL && this.renderer.updateTexture) {
            this.renderer.updateTexture();
        }
        
        // Show level title briefly
        if (levelInfo.title) {
            this.showLevelTitle(levelInfo.title, levelInfo.description);
        }
        
        // Unpause game
        this.paused = false;
        
        // Save the game state after loading level
        setTimeout(() => {
            this.saveGameState();
        }, 500);
        
        console.log(`✅ Level loaded: ${levelInfo.title}`);
    }

    showLevelTitle(title, description) {
        // Create title overlay
        const titleEl = document.createElement('div');
        titleEl.id = 'level-title';
        titleEl.innerHTML = `
            <h2>${title}</h2>
            <p>${description}</p>
        `;
        document.body.appendChild(titleEl);
        
        // Fade out after 4 seconds
        setTimeout(() => {
            titleEl.style.opacity = '0';
            setTimeout(() => titleEl.remove(), 1000);
        }, 4000);
    }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

