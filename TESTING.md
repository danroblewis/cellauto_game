# Testing Documentation

## Overview

This directory contains a comprehensive unit test suite for the cellular automata simulation engine. The tests verify that the physics, interactions, and behaviors of the system work as expected.

## Running Tests

### Command Line (Recommended)

Run tests directly from the terminal using Node.js:

```bash
node cellular-automata.test.js
```

Or make it executable and run:

```bash
chmod +x cellular-automata.test.js
./cellular-automata.test.js
```

Results are displayed in the terminal with ✅ for pass and ❌ for fail.

Exit code: `0` if all tests pass, `1` if any fail (useful for CI/CD).

### Browser Console (Alternative)

1. Open `index.html` (the main game)
2. Open browser developer console (F12)
3. Run: `runner.run()`

Results will be logged to the console.

## Test Categories

### Basic Cell Tests
- Cell creation and property assignment
- Cell type changes
- Boundary checking
- Density calculations

### Gravity Tests
- Sand falling through air
- Stone stability when unsupported vs supported
- Stone stability on ground
- Stone stability on dirt/solid surfaces
- Connected stone structures sharing stability
- Solid blocks stopping falling objects

### Liquid Tests
- Water flowing horizontally
- Water + lava reactions (steam/stone)
- Dense liquids sinking in lighter liquids
- Liquid physics and spreading

### Support Block Tests
- Support block placement
- Support stability on ground
- Support stability on solid blocks
- Support providing stability to adjacent stones
- Stone not falling through support blocks
- Unstable support falling through air

### Pump Tests
- Pump blocks providing upward force
- Multiple pumps increasing force
- Liquids rising near pumps

### Phase Change Tests
- Water freezing to ice (< 0°C)
- Ice melting to water (> 0°C)
- Water boiling to steam (> 100°C)
- Steam condensing to water (cooled)
- Lava cooling to stone

### Fire and Reaction Tests
- Fire spreading to flammable materials
- Water extinguishing fire
- Lava igniting materials
- Chemical reactions between adjacent cells

### Swap Operation Tests
- Cell swapping mechanics
- Support flags staying at positions
- Active cell marking after swap

### Serialization Tests
- World save/load functionality
- Stability state preservation
- Support flag preservation

### Edge Cases
- Out of bounds operations
- Empty world handling
- Gas density vs liquid density

### Complex Scenarios
- Cascading stone collapse after support removal
- Lava pools cooling to stone over time
- Multi-step reactions and interactions

## Test Structure

Each test follows this pattern:

```javascript
runner.test('Test description', () => {
    // 1. Setup: Create world and initial state
    const world = new CellularAutomata(10, 10, 4);
    world.setCell(x, y, CellType.STONE);
    
    // 2. Action: Perform operation or run simulation
    world.markActive(x, y);
    runSimulationSteps(world, 10);
    
    // 3. Assert: Verify expected outcome
    assertEqual(world.getCell(x, y).type, CellType.EXPECTED);
});
```

## Helper Functions

### `runSimulationSteps(world, steps)`
Runs the simulation for a specified number of steps, bypassing frame skip.

### `countCellsOfType(world, type)`
Counts all cells of a specific type in the world.

### Assertion Functions
- `assertEqual(actual, expected, message)` - Checks equality
- `assertTrue(value, message)` - Checks if value is true
- `assertFalse(value, message)` - Checks if value is false
- `assertNotNull(value, message)` - Checks if value is not null

## Adding New Tests

To add a new test:

```javascript
runner.test('Your test description', () => {
    // Setup
    const world = new CellularAutomata(width, height, cellSize);
    
    // ... test logic ...
    
    // Assertions
    assertTrue(condition, 'Explanation');
});
```

Place new tests in the appropriate category section in `cellular-automata.test.js`.

## Known Issues and Limitations

### Probabilistic Behaviors
Some tests involve probabilistic behaviors (e.g., fire spreading, reactions). These tests may occasionally fail due to randomness. If a test fails intermittently, this is expected behavior.

### Simulation Timing
The number of simulation steps needed to observe certain behaviors may vary. Some tests run the simulation for many steps to ensure behaviors have time to occur.

### Frame Skip
The simulation uses frame skipping for performance. Tests bypass this by setting `world.frameSkip = 2` before each update.

## Test Coverage

Current coverage includes:
- ✅ Basic cell operations (get, set, swap)
- ✅ Gravity and falling mechanics
- ✅ Stability system for stone-like materials
- ✅ Support block mechanics
- ✅ Liquid physics and flow
- ✅ Pump mechanics
- ✅ Phase changes (ice/water/steam)
- ✅ Chemical reactions (water+lava, fire+wood)
- ✅ Serialization and loading
- ✅ Edge cases and boundary conditions

Areas for future coverage:
- ⏳ Player interactions (mining, placing)
- ⏳ Complex fluid dynamics scenarios
- ⏳ Large-scale stability cascades
- ⏳ Performance benchmarks
- ⏳ Multi-material interaction chains

## Debugging Failed Tests

If a test fails:

1. **Check the error message** - It will tell you what was expected vs what was received
2. **Add console.log statements** - Log intermediate state during the test
3. **Reduce complexity** - Simplify the test to isolate the issue
4. **Run fewer steps** - Sometimes running too many simulation steps causes unexpected interactions
5. **Check for race conditions** - Some behaviors depend on update order

### Example Debug Pattern

```javascript
runner.test('Debug test', () => {
    const world = new CellularAutomata(10, 10, 4);
    world.setCell(5, 5, CellType.STONE);
    
    console.log('Before:', world.getCell(5, 5).type);
    runSimulationSteps(world, 5);
    console.log('After:', world.getCell(5, 5).type);
    
    assertEqual(world.getCell(5, 5).type, CellType.STONE);
});
```

## Contributing

When making changes to the cellular automata engine:

1. Run all existing tests to ensure nothing breaks
2. Add new tests for new features
3. Add tests that reproduce any bugs you fix
4. Document expected behavior in test names

## Performance Considerations

The test suite creates many small worlds (typically 10x10 or 20x20) to keep tests fast. For performance testing with larger worlds, create separate benchmark tests.

## Test Statistics

Total tests: 40+
Categories: 11
Average test execution time: ~10-50ms per test
Total suite execution time: ~2-5 seconds

