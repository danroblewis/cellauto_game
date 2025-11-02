// Main Game Logic
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // World properties
        const worldWidth = 400;
        const worldHeight = 300;
        const cellSize = 12; // Increased from 4 for better visibility
        
        // Initialize cellular automata world
        this.world = new CellularAutomata(worldWidth, worldHeight, cellSize);
        this.world.generateWorld();
        
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
        requestAnimationFrame((time) => this.gameLoop(time));
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
            
            // Toggle area mining shape with C (when not holding Ctrl)
            if (!e.ctrlKey && !e.metaKey && (e.key === 'C' || e.key === 'c')) {
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
            if (!e.ctrlKey && !e.metaKey) {
                this.keys['control'] = false;
            }
        });

        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
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
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    selectTool(toolNumber) {
        const tools = ['pickaxe', 'shovel', 'bucket', 'place', 'torch'];
        if (toolNumber >= 1 && toolNumber <= tools.length) {
            this.player.currentTool = tools[toolNumber - 1];
            
            // Update UI
            document.querySelectorAll('.tool-slot').forEach((slot, index) => {
                slot.classList.toggle('active', index + 1 === toolNumber);
            });
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
            CellType.COAL, CellType.IRON_ORE, CellType.CRYSTAL
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
        
        // Check if Ctrl is held for area mining
        const isAreaMining = this.keys['control'] && 
                             (this.player.currentTool === 'pickaxe' || this.player.currentTool === 'shovel');
        
        // Use tool immediately
        const success = this.player.useTool(worldX, worldY, isAreaMining, this.areaMiningShape);
        if (success && (this.player.currentTool === 'pickaxe' || this.player.currentTool === 'shovel')) {
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
                
                // Check if Ctrl is held for area mining
                const isAreaMining = this.keys['control'] && 
                                     (this.player.currentTool === 'pickaxe' || this.player.currentTool === 'shovel');
                
                if (isAreaMining) {
                    // Area mining - mine larger area
                    this.handleContinuousAction(worldX, worldY, true);
                    // Longer cooldown for area mining since it mines many blocks
                    this.miningCooldown = 10;
                } else {
                    // Normal single-block mining
                    // Only continue mining if cursor is still over the same cell or adjacent cell
                    if (this.lastMinedPos) {
                        const dx = Math.abs(worldX - this.lastMinedPos.x);
                        const dy = Math.abs(worldY - this.lastMinedPos.y);
                        if (dx <= 1 && dy <= 1) {
                            this.handleContinuousAction(worldX, worldY, false);
                        }
                    } else {
                        this.handleContinuousAction(worldX, worldY, false);
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

        // Update camera
        this.updateCamera();

        // Update UI
        this.updateUI();

        this.frameCount++;
    }

    handleContinuousAction(worldX, worldY, areaMining = false) {
        // Update player facing direction
        const playerCenterX = this.player.x + this.player.width / 2;
        this.player.facingDirection = worldX > playerCenterX ? 1 : -1;
        
        // Try to use tool
        const success = this.player.useTool(worldX, worldY, areaMining, this.areaMiningShape);
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
        // Clear canvas
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate visible cell range
        const startX = Math.max(0, Math.floor(this.camera.x));
        const endX = Math.min(this.world.width, Math.ceil(this.camera.x + this.canvas.width / this.camera.cellSize));
        const startY = Math.max(0, Math.floor(this.camera.y));
        const endY = Math.min(this.world.height, Math.ceil(this.camera.y + this.canvas.height / this.camera.cellSize));

        // Optimized rendering: batch same-color cells
        const cellSize = this.camera.cellSize;
        
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
        
        // Check if area mining is active
        const isAreaMining = this.keys['control'] && 
                            (this.player.currentTool === 'pickaxe' || this.player.currentTool === 'shovel');
        
        if (isAreaMining) {
            // Draw area mining preview
            const radius = this.player.areaMiningRadius;
            const centerScreenX = (worldX - this.camera.x) * this.camera.cellSize;
            const centerScreenY = (worldY - this.camera.y) * this.camera.cellSize;
            
            this.ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
            this.ctx.lineWidth = 2;
            
            if (this.areaMiningShape === 'square') {
                const size = radius * 2 + 1;
                const previewSize = size * this.camera.cellSize;
                this.ctx.strokeRect(
                    centerScreenX - (radius * this.camera.cellSize),
                    centerScreenY - (radius * this.camera.cellSize),
                    previewSize,
                    previewSize
                );
            } else {
                // Circle preview
                this.ctx.beginPath();
                this.ctx.arc(centerScreenX + this.camera.cellSize / 2, 
                           centerScreenY + this.camera.cellSize / 2, 
                           (radius + 0.5) * this.camera.cellSize, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        } else if (this.player.canReach(worldX, worldY)) {
            const screenX = (worldX - this.camera.x) * this.camera.cellSize;
            const screenY = (worldY - this.camera.y) * this.camera.cellSize;
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(screenX, screenY, this.camera.cellSize, this.camera.cellSize);
        }

        // Draw player
        this.player.draw(this.ctx, this.camera);
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

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
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

