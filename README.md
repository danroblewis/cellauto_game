# Terraform - Cellular Automata Game

A web-based 2D platformer/sandbox game powered by cellular automata physics.

## Features

- **Cellular Automata Physics**: Every cell in the world behaves with realistic physics
- **Player Character**: Control a character that can jump, mine, and build
- **Environmental Hazards**: Avoid falling rocks, lava, fire, and acid
- **Local Building**: Build structures within your reach (3-5 cells)
- **Tools**: Pickaxe, shovel, bucket, placement tool, and torch
- **Inventory System**: Collect materials and use them for building
- **Physics Simulation**: Water flows, fire spreads, materials fall with gravity

## How to Play

### Controls
- **A/D** or **←/→** - Move left/right
- **W** or **Space** - Jump
- **1-5** - Select tool
  - 1: Pickaxe (mine hard materials)
  - 2: Shovel (dig dirt/sand quickly)
  - 3: Bucket (collect/place liquids)
  - 4: Placement tool (build structures)
  - 5: Torch (ignite flammable materials)
- **Left Click** - Use tool at cursor position (within reach)
- **Right Click** - Secondary action (collect liquid with bucket)
- **Tab** - Toggle inventory
- **ESC** - Close menus

### Gameplay Tips
- You can only interact with cells within 3-5 cells of your character
- Be careful mining - falling rocks can damage you
- Avoid lava - it's deadly!
- Build bridges and platforms to reach new areas
- Collect resources by mining and add them to your inventory
- Use materials from inventory to build structures

## Running the Game

Simply open `index.html` in a web browser. No build process or server required!

## File Structure

- `index.html` - Main HTML file
- `style.css` - Styling and UI
- `game.js` - Main game loop and logic
- `player.js` - Player character class
- `cellular-automata.js` - Core cellular automata physics engine

## Cell Types

The game includes various cell types:
- **Solids**: Stone, Dirt, Sand, Wood, Coal, Iron Ore, Ice, Glass, Crystal
- **Liquids**: Water, Lava, Oil, Acid
- **Gases**: Steam, Smoke, Air
- **Special**: Fire, Grass, Seeds

Each cell type has unique physics properties and behaviors!

