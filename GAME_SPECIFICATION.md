# Terraform: A Cellular Automata Physics Game

## Game Concept

**Terraform** is a web-based 2D platformer/sandbox game where players control a character in a living, breathing world powered by cellular automata physics. The player must navigate, mine, build, and survive in a world where every cell behaves with realistic physics - rocks fall, water flows, fire spreads, and the player must be careful not to get crushed, burned, or caught in environmental disasters. Building and mining are limited to the player's immediate reach, requiring strategic positioning and planning.

## Core Gameplay Loop

1. **Explore** the procedurally generated world as a character (not a god view)
2. **Navigate** platforms, jump over gaps, avoid falling hazards
3. **Mine** resources using tools within reach range (3-5 cells)
4. **Survive** environmental hazards - falling rocks, lava, fire, pressure
5. **Build** structures locally around player position to reach new areas
6. **Craft** tools and items from gathered materials
7. **Plan** carefully - large structures require moving around to build all parts

## Cellular Automata Engine

Every cell in the game world operates as part of a cellular automaton, where each cell's behavior depends on:
- Its own properties (type, state, temperature, pressure)
- Neighboring cells (8-way connectivity)
- Global rules (gravity, fluid dynamics, heat transfer, chemical reactions)

## Cell Types & Behaviors

### **Solid Materials**

#### **Stone**
- **Properties**: Dense, hard, non-flammable
- **Physics**: Falls when unsupported, can be crushed by heavy materials
- **Interaction**: Can be mined, creates dust particles when broken
- **Player Hazard**: Falling stone deals significant damage or can kill player if not avoided
- **Color**: Dark gray (#404040)

#### **Dirt**
- **Properties**: Soft, can support plant life, erodible
- **Physics**: Falls slower than stone, can be washed away by water
- **Interaction**: Can be tilled, supports seed growth
- **Color**: Brown (#8B4513)

#### **Sand**
- **Properties**: Granular, loose
- **Physics**: Falls quickly, flows like liquid when piled, creates slopes
- **Interaction**: Can be heated to glass, can smother fires
- **Color**: Tan (#D2B48C)

#### **Wood**
- **Properties**: Lightweight, flammable, renewable
- **Physics**: Falls slowly, floats on water
- **Interaction**: Burns when exposed to fire/lava, can be crafted into tools
- **Color**: Brown (#8B4513) with grain texture

### **Liquid Materials**

#### **Water**
- **Properties**: Fluid, transparent, conductive
- **Physics**: Flows based on gravity and pressure, freezes at low temperatures
- **Interaction**: Extinguishes fire, dissolves salt, conducts electricity
- **Color**: Blue (#1E90FF) with transparency

#### **Lava**
- **Properties**: Molten rock, extremely hot, bright
- **Physics**: Flows like thick liquid, solidifies into stone when cooled
- **Interaction**: Melts ice/snow instantly, ignites flammable materials
- **Color**: Orange-red (#FF4500) with glow effect

#### **Oil**
- **Properties**: Flammable, viscous, lighter than water
- **Physics**: Flows slower than water, floats on water
- **Interaction**: Burns intensely when ignited, can be refined
- **Color**: Dark brown/black (#2F1B14)

### **Gaseous Materials**

#### **Steam**
- **Properties**: Water vapor, transparent, hot
- **Physics**: Rises upward, condenses to water when cooled
- **Interaction**: Can turn into water, carries heat
- **Color**: Light white/transparent with motion blur

#### **Smoke**
- **Properties**: Produced by fire, dark, rising
- **Physics**: Rises and disperses, can reduce visibility
- **Interaction**: Harmful if dense, blocks light
- **Color**: Dark gray (#505050) with transparency

#### **Air**
- **Properties**: Invisible background element
- **Physics**: Creates pressure differences, allows other elements to move
- **Interaction**: Required for combustion, conducts sound
- **Color**: Transparent (background)

### **Special Materials**

#### **Coal**
- **Properties**: Fuel source, combustible, black
- **Physics**: Falls like stone, burns slower than wood
- **Interaction**: Provides fuel for furnaces, creates smoke when burned
- **Color**: Black (#1C1C1C)

#### **Iron Ore**
- **Properties**: Metallic, dense, smeltable
- **Physics**: Heavy, falls quickly
- **Interaction**: Can be smelted to iron ingots, conducts electricity
- **Color**: Dark brown/rust (#654321)

#### **Ice**
- **Properties**: Frozen water, brittle, slippery
- **Physics**: Can slide, melts to water when heated
- **Interaction**: Extinguishes fire, can be mined for water
- **Color**: Light blue/white (#E0F6FF)

#### **Glass**
- **Properties**: Transparent, brittle, fragile
- **Physics**: Breaks easily under pressure, falls like stone
- **Interaction**: Refracts light, can be crafted from heated sand
- **Color**: Transparent with light refraction

#### **Acid**
- **Properties**: Corrosive, dangerous
- **Physics**: Flows like liquid, destroys organic matter
- **Interaction**: Corrodes metals, dissolves organic materials
- **Color**: Green (#90EE90) with bubbling effect

#### **Crystal**
- **Properties**: Rare, hard, beautiful
- **Physics**: Very dense, can fall
- **Interaction**: Valuable resource, conducts energy
- **Color**: Multi-colored prismatic (#FF69B4 with rainbow)

### **Living Materials**

#### **Grass**
- **Properties**: Organic, grows on dirt
- **Physics**: Static, but can be destroyed
- **Interaction**: Spreads to nearby dirt, burns easily
- **Color**: Green (#228B22)

#### **Fire**
- **Properties**: Reactive, spreading, bright
- **Physics**: Spreads to flammable materials, needs fuel/oxygen
- **Interaction**: Consumes oxygen and fuel, produces heat and smoke
- **Color**: Red-yellow gradient with animation

#### **Seed**
- **Properties**: Plant starter, organic
- **Physics**: Falls like sand, plants when on dirt
- **Interaction**: Grows into plants with water and time
- **Color**: Small brown speck

## Player Character

### **Character Properties**

The player is a physical entity in the game world, represented as a multi-cell character sprite with physics and collision.

**Physical Properties:**
- **Size**: Approximately 2-3 cells wide, 4-5 cells tall (roughly human proportions)
- **Position**: Continuous floating-point coordinates (not grid-locked)
- **Collision**: Solid body that interacts with world cells
- **Mass**: Affected by gravity and physics
- **Health**: 100 HP (configurable)
- **Stamina**: For running/jumping (optional)

**Visual Representation:**
- Simple character sprite or simplified humanoid shape
- Faces direction of movement
- Animation states: idle, walking, jumping, mining, building, hurt
- Held tool visible in hand when equipped

### **Character Physics**

**Gravity & Movement:**
- Player falls under gravity when not on solid ground
- Terminal velocity limits falling speed
- Momentum affects movement feel
- Collision detection with solid cells (stone, dirt, wood, etc.)

**Ground Interaction:**
- Stands on solid surfaces (stone, dirt, wood, etc.)
- Sinks slightly into sand (reduced movement speed)
- Slippery surfaces (ice) affect control
- Cannot stand on liquids (water, lava) - player falls through

**Environmental Hazards:**
- **Falling Objects**: Take damage if solid cells fall on player
  - Damage based on material mass and height
  - Stone: High damage, Sand: Low damage
- **Lava**: Instant death or massive damage on contact
- **Fire**: Damage over time when in contact
- **Acid**: Damage over time, corrodes player
- **Water**: No damage, but slows movement
- **Pressure**: Damage if crushed between falling materials
- **Suffocation**: Damage if surrounded by solid materials

**Damage System:**
- Health bar displayed in UI
- Invincibility frames after taking damage (brief flash)
- Death: Respawn at last checkpoint or world start
- Regeneration: Optional health regen over time (when safe)

## Player Interaction

### **Movement Controls**

#### **Keyboard Movement**
- **`A` / `←`**: Move left
- **`D` / `→`**: Move right
- **`W` / `↑` / `Space`**: Jump
- **`S` / `↓`**: Crouch (optional) or look down
- **`Shift`**: Run (faster movement, consumes stamina if implemented)
- **`Ctrl`**: Sneak/slow movement (precise placement)

**Movement Mechanics:**
- **Walking**: Smooth horizontal movement
- **Jumping**: Arc trajectory, height affected by hold duration
- **Air Control**: Limited horizontal movement while in air
- **Wall Interaction**: Cannot pass through solid cells
- **Climbing**: Cannot climb vertical walls (must dig/build stairs)

### **Camera System**

**Camera Behavior:**
- **Follow Player**: Camera smoothly follows player character
- **Viewport**: Shows area around player (approximately 20-30 cells visible)
- **Look Ahead**: Camera slightly leads player movement direction
- **Zoom**: Mouse wheel adjusts zoom level (closer for detail, further for overview)
- **Boundaries**: Camera stops at world edges (doesn't scroll past)

**Camera Modes:**
- **Default**: Centered on player with smooth following
- **Zoom Levels**: 1x (default), 2x (close), 0.5x (far)
- **Fixed**: Player can temporarily lock camera position (hold key)

### **Interaction System**

#### **Interaction Range**

**Reach Distance:**
- Player can only interact with cells within **reach range** (approximately 3-5 cells)
- Visual indicator shows reachable area (subtle highlight or circle)
- Cursor/mouse position converted to world coordinates
- Only cells within reach can be modified

**Placement Range:**
- Building/placing limited to cells within 3-5 cells of player
- Cannot place materials far from character
- Creates strategic gameplay: must position carefully to build structures

#### **Mouse Interactions**

**Left Click** - Use Tool/Action
- **Action**: Uses currently equipped tool at mouse position (within reach)
- **Direction**: Player faces toward click position
- **Animation**: Character performs action (swing pickaxe, place block)
- **Range**: Only works if target cell is within reach distance

**Right Click** - Secondary Action
- **Material Selection**: Pick up material from world into inventory (if tool allows)
- **Interaction**: Open container, use item, etc.
- **Context**: Different actions based on what's being clicked

**Mouse Position**
- Cursor shows where player is looking/aiming
- Highlight cell under cursor (if within reach)
- Crosshair or indicator shows interaction point

#### **Tool Usage**

**Tool Equipping:**
- **Number Keys (`1-9`)**: Quick-select tools from hotbar
- **Mouse Wheel**: Cycle through equipped tools (when not zooming)
- **Tab**: Open inventory/tool selection menu

**Tool Actions (all within reach range):**

**Pickaxe (`1`)**
- **Action**: Swing at cell player is facing
- **Range**: 1-2 cells in front of player
- **Mining**: Breaks cells and adds to inventory
- **Speed**: Depends on material hardness (stone slower than dirt)
- **Animation**: Swinging motion, particles on impact
- **Durability**: Tool wears out with use

**Shovel (`2`)**
- **Action**: Dig dirt/sand in front of player
- **Faster**: Much faster than pickaxe for soft materials
- **Slower**: Ineffective on hard materials (stone)

**Bucket (`3`)**
- **Action**: 
  - Left-click: Place liquid from inventory in front of player
  - Right-click: Collect liquid from world
- **Range**: Must be adjacent to liquid source
- **Capacity**: Limited liquid storage

**Placement Tool (`4`)**
- **Action**: Place material from inventory at cursor position (within reach)
- **Material Selection**: Use number keys or material palette to select material
- **Preview**: Ghost outline shows where material will be placed
- **Range**: Only places within 3-5 cells of player
- **Direction**: Player faces placement direction

**Torch (`5`)**
- **Action**: Place torch in front of player or ignite nearby materials
- **Range**: Adjacent cells only
- **Light**: Provides light radius around placement

**TNT/Dynamite (`6`)**
- **Action**: Place explosive within reach
- **Range**: Must be within reach to place safely
- **Warning**: Blast radius indicator shown
- **Danger**: Player can be killed by own explosions if too close

### **Building System**

**Local Building Constraints:**
- **Range Limit**: Can only build within 3-5 cells of player position
- **Strategic Positioning**: Must move player to build larger structures
- **Scaffolding**: Player can build temporary platforms to reach higher areas
- **Accessibility**: Structures must allow player to reach all parts for construction

**Building Mechanics:**
1. Select material from inventory (keyboard shortcuts or UI)
2. Select placement tool
3. Position player near where you want to build
4. Click to place cells within reach
5. Move to new position to continue building larger structures

**Creative Building:**
- Build bridges to cross gaps
- Create shelters for protection
- Construct staircases to climb
- Build platforms to access higher areas
- Place supports to prevent cave-ins while mining

### **Combat & Survival**

**Avoiding Hazards:**
- **Falling Rocks**: Watch for unstable ceilings while mining
- **Lava Flows**: Jump over or build barriers
- **Fires**: Clear flammable materials before they spread
- **Flooding**: Build drainage or barriers

**Environmental Awareness:**
- Visual indicators for dangerous cells nearby
- Sound cues for falling materials
- Screen shake or effects when taking damage
- Health bar visible at all times

### **UI Elements**

#### **HUD (Heads-Up Display)**
- **Health Bar**: Top-left corner, visible at all times
- **Stamina Bar**: Below health (if stamina system used)
- **Tool Hotbar**: Bottom center, shows equipped tools (1-9)
- **Material Indicator**: Shows currently selected material for building
- **Reach Indicator**: Subtle visual showing interaction range

#### **Inventory Panel** (`Tab` or `I`)
- Grid layout showing collected materials
- Quantities for each material
- Click to select material for building
- Drag and drop organization
- Material categories/tabs

#### **Status Display**
- Coordinates (optional, for debugging)
- FPS counter (optional)
- Current tool durability
- Number of materials in inventory

### **Visual Feedback Systems**

#### **Character Feedback**
- **Damage Flash**: Character briefly flashes red when hit
- **Animation States**: Walking, jumping, mining animations
- **Tool Visual**: Equipped tool visible in hand
- **Direction Indicator**: Character faces movement/interaction direction

#### **Interaction Feedback**
- **Reach Highlight**: Cells within reach show subtle highlight
- **Invalid Action**: Visual feedback when trying to interact out of range
- **Placement Preview**: Ghost outline shows material placement
- **Mining Progress**: Visual indicator for mining progress on cell

#### **Environmental Feedback**
- **Danger Zones**: Visual warnings near lava, acid, fire
- **Stability Indicators**: Visual cues for unstable structures (optional)
- **Particle Effects**: Dust from mining, sparks from tools
- **Sound Cues**: Distinct sounds for different actions and hazards

### **Gameplay Implications**

**Strategic Positioning:**
- Players must carefully position themselves to build effectively
- Cannot build huge structures from one location
- Encourages planning and scaffolding

**Risk vs. Reward:**
- Mining requires getting close to materials
- Building near hazards (lava, falling rocks) is dangerous
- Explosives require safe positioning before detonation

**Puzzle Solving:**
- Must figure out how to reach areas using building/mining
- Platforming challenges (jump gaps, climb structures)
- Engineering solutions (build bridges, supports, barriers)

### **Controls Summary**

**Movement:**
- `A/D` or `←/→` - Walk left/right
- `W` or `Space` - Jump
- `Shift` - Run
- `Ctrl` - Precise/slow movement

**Tools:**
- `1-9` - Select tools
- Mouse wheel - Cycle tools (when not zooming)
- Left-click - Use tool at cursor (within reach)
- Right-click - Secondary action

**Building:**
- Select material from inventory
- `4` - Placement tool
- Left-click - Place material (within reach)

**UI:**
- `Tab` / `I` - Toggle inventory
- `Esc` - Close menus
- Mouse wheel - Zoom camera (hold modifier to distinguish from tool cycling)

## Game Mechanics

### **Physics Simulation**

1. **Gravity**: All non-gaseous materials fall downward
2. **Fluid Dynamics**: Liquids flow based on pressure gradients
3. **Heat Transfer**: Temperature spreads to adjacent cells
4. **Pressure**: Dense materials above create pressure on materials below
5. **Phase Changes**: Water ↔ Ice, Water ↔ Steam, Lava → Stone

### **Tools & Interaction**

- **Pickaxe**: Mines solid materials, creates particles
- **Shovel**: Faster mining of dirt/sand
- **Bucket**: Collects and places liquids
- **TNT/Dynamite**: Explosive destruction in radius, creates shockwaves
- **Torch**: Lights fires, provides light
- **Pump**: Moves liquids against gravity

### **Resource Management**

- **Inventory System**: Limited capacity for materials
- **Crafting**: Combine materials to create tools and structures
- **Energy**: Some actions require energy/fuel

### **World Generation**

- **Layers**: Surface (dirt/grass), underground (stone/ore), deep (lava/crystals)
- **Caves**: Procedurally generated with resources
- **Biomes**: Different cell distributions (desert=sand, forest=wood, arctic=ice)

## Technical Implementation

### **Cell State Structure**
```
Cell {
  type: CellType,
  temperature: number,      // 0-1000 (affects phase changes)
  pressure: number,         // Affects compression
  velocity: Vector2,        // For fluid dynamics
  age: number,              // For time-based behaviors (growth, decay)
  metadata: object          // Type-specific data
}
```

### **Update Rules**
1. **Gravity**: Check support, fall if unsupported
2. **Fluid Flow**: Calculate pressure, move toward lower pressure
3. **Heat Transfer**: Average temperature with neighbors
4. **Chemical Reactions**: Check adjacent cells for reaction conditions
5. **Phase Changes**: Change type based on temperature/pressure
6. **Growth/Decay**: Update age-based properties

### **Performance Optimizations**
- Chunk-based rendering (only render visible cells)
- Spatial partitioning for neighbor queries
- Frame rate limiting for update cycles
- Adaptive update rate (slow down when many cells active)

## Game Objectives & Modes

### **Sandbox Mode**
- Free play with all materials available
- Creative building and destruction
- No objectives, pure experimentation

### **Survival Mode**
- Resource constraints
- Health/energy system
- Objectives: Build shelter, gather resources, craft tools
- Environmental hazards (fire, acid, pressure)

### **Puzzle Mode**
- Specific challenges (e.g., "Collect all crystals without touching lava")
- Time limits
- Limited resources

### **Mining Mode**
- Focus on resource extraction
- Profit/efficiency goals
- Environmental management (prevent cave-ins, flooding)

## Visual Design

- **Pixel Art Style**: Classic cellular automata aesthetic
- **Particle Effects**: Dust, sparks, smoke trails
- **Animation**: Fluid flow, fire flickering, material transitions
- **Color Coding**: Intuitive colors for material identification
- **UI**: Minimal overlay showing inventory, tools, stats

## Future Expansion Ideas

- **Multiplayer**: Cooperative or competitive mining/building
- **More Materials**: Concrete, rubber, plastic, electronics
- **Machines**: Pumps, conveyors, processors
- **Automation**: Programmable cell behaviors
- **Adventure Elements**: Enemies, quests, story mode
- **Advanced Physics**: Electricity, magnetism, radiation

---

## Getting Started

This specification will guide the implementation of a modern web-based cellular automata game using HTML5 Canvas and JavaScript, with potential for WebGL acceleration if needed.

