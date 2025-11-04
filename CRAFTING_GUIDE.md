# Crafting System Guide 🔧

## Overview

The crafting system allows you to create advanced items by arranging cells in specific patterns. The system automatically detects these patterns and transforms them into crafted items with a visual steam effect!

## New Cell Types

### Conveyor Belts 📦
Conveyor belts automatically move items placed on top of them.

- **Conveyor Right** (→) - Orange belt, moves items to the right
- **Conveyor Left** (←) - Orange belt, moves items to the left  
- **Conveyor Up** (↑) - Orange belt, moves items upward
- **Conveyor Down** (↓) - Orange belt, moves items downward

**Usage:**
1. Place a conveyor belt (solid block)
2. Place any item on top of it
3. The item will automatically move in the conveyor's direction
4. Items can move into air or gas spaces

### Crafted Items ⚙️

- **Iron Plate** (Gray) - Basic processed iron
- **Steel** (Silver) - Strong alloy material
- **Wire** (Orange) - Conductive material
- **Gear** (Gold) - Mechanical component
- **Circuit** (Green) - Electronic component

## Crafting Recipes

### Basic Recipes

#### Iron Plate
**Pattern:**
```
Fire
Iron Ore
```
**Description:** Smelt iron ore with fire to create an iron plate

---

#### Wire  
**Pattern:**
```
Stone + Iron Plate + Stone
```
**Description:** Stretch iron between two stones horizontally

---

### Intermediate Recipes

#### Steel
**Pattern:**
```
Iron Plate
Coal
Fire
```
**Description:** Heat iron plate with coal and fire to create steel

---

#### Simple Gear
**Pattern:**
```
Iron Plate + Iron Plate
Iron Plate + Iron Plate
```
**Description:** Four iron plates arranged in a 2x2 square

---

#### Advanced Gear
**Pattern:**
```
    Iron Plate
Iron Plate + Iron Plate + Iron Plate
    Iron Plate
```
**Description:** Iron plates arranged in a cross/plus shape (uses 5 plates)

---

### Advanced Recipes

#### Circuit
**Pattern:**
```
Wire + Coal
Iron Plate + Wire
```
**Description:** Combine wires, coal, and iron plate to create a circuit

---

## How Crafting Works

### Automatic Detection
- The crafting system scans a region around the player/camera
- Checks occur every 10 frames for performance
- When a valid pattern is detected, crafting happens automatically

### Crafting Process
1. **Pattern Match** - System finds the recipe pattern in the world
2. **Clear Area** - All cells in the pattern are cleared to air
3. **Create Item** - Crafted item appears in the center of the pattern
4. **Visual Effect** - Steam particles rise from the crafted item
5. **Console Log** - "✨ Crafting: [Item Name]" message appears

### Cooldown
- 30 frame cooldown between crafts prevents spam
- Allows time to see the crafting animation

## Building Contraptions

### Example: Iron Smelter
```
[Stone] [Stone] [Stone] [Stone] [Stone]
[Stone] [Fire] [Fire] [Fire] [Stone]
[Stone] [Iron] [Iron] [Iron] [Stone]
[Stone] [Stone] [Stone] [Stone] [Stone]
```
Place iron ore above fire to automatically smelt into plates!

### Example: Conveyor Assembly Line
```
Fire
Iron Ore
[Conveyor Right] → [Conveyor Right] → [Conveyor Right]
```
Smelt iron and have it automatically move along the conveyor!

### Example: Steel Production
```
[Conveyor Right] → [Iron Plate]
[Conveyor Right] → [Coal]
[Conveyor Right] → [Fire]
```
Automated steel production line!

## Tips & Tricks

### Efficient Crafting
- **Use Conveyors** - Automate item placement for recipes
- **Vertical Stacking** - Many recipes work vertically
- **Space Planning** - Leave room for items to fall/move

### Automation
- Place items on conveyors above crafting patterns
- Items will drop into position and auto-craft
- Chain multiple recipes together

### Pattern Recognition
- Patterns can appear anywhere in the world
- Rotation doesn't matter (vertical/horizontal work)
- Null cells (empty spaces) in recipes are wildcards

## All Available Items

| Item | Color | Type | How to Get |
|------|-------|------|------------|
| Stone | Gray | Natural | Mine terrain |
| Dirt | Brown | Natural | Mine terrain |
| Sand | Tan | Natural | Found in terrain |
| Wood | Brown | Natural | Mine trees |
| Coal | Black | Natural | Mine ore |
| Iron Ore | Dark Brown | Natural | Mine ore |
| Iron Plate | Light Gray | Crafted | Smelt iron ore |
| Steel | Silver | Crafted | Heat iron plate + coal |
| Wire | Orange | Crafted | Stretch iron with stones |
| Gear | Gold | Crafted | Arrange iron plates |
| Circuit | Green | Crafted | Combine wire + iron + coal |
| Pump | Cyan | Special | Available in inventory |
| Conveyor → | Orange | Mechanical | Available in inventory |
| Conveyor ← | Orange | Mechanical | Available in inventory |
| Conveyor ↑ | Orange | Mechanical | Available in inventory |
| Conveyor ↓ | Orange | Mechanical | Available in inventory |

## Technical Details

### Performance
- Crafting checks are rate-limited to every 10 frames
- Only scans a 40x30 cell region around the player
- Efficient pattern matching algorithm

### Integration
- Crafting system runs after world physics update
- Works seamlessly with gravity and other mechanics
- Items can be crafted while falling or moving

### Extensibility
- Easy to add new recipes via `initializeRecipes()`
- Patterns support any cell type
- Null cells allow flexible pattern matching

## Future Possibilities

Potential additions:
- More complex crafted items (engines, batteries, etc.)
- Multi-step crafting chains
- Timed recipes (require heat for X seconds)
- Recipe discovery system
- Crafting stations/workbenches
- Automatic crafting machines

---

**Start Crafting!** Open your inventory (Tab/E) and select conveyor belts or fire to start experimenting! 🔥⚙️

