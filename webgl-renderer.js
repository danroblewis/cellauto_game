// WebGL Renderer with Shader Support
class WebGLRenderer {
    constructor(canvas, world) {
        this.canvas = canvas;
        this.world = world;
        this.gl = null;
        this.program = null;
        this.texture = null;
        this.time = 0;
        
        // Initialize WebGL
        this.initWebGL();
        this.createShaders();
        this.createBuffers();
        this.createTexture();
        
        // Ensure viewport is set correctly
        this.updateViewport();
    }
    
    updateViewport() {
        if (this.gl && this.canvas) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    initWebGL() {
        // Request WebGL with alpha for compositing
        this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) || 
                  this.canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        // Enable blending for transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // Set viewport
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    createShaders() {
        const gl = this.gl;

        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            
            uniform vec2 u_resolution;
            uniform vec2 u_camera;
            uniform float u_cellSize;
            uniform vec2 u_worldSize;
            
            varying vec2 v_worldPos;
            varying vec2 v_screenPos;
            
            void main() {
                // Convert from pixels to clip space
                vec2 position = a_position;
                position = (position / u_resolution) * 2.0 - 1.0;
                position.y *= -1.0; // Flip Y axis
                
                gl_Position = vec4(position, 0.0, 1.0);
                
                // Calculate world position
                v_worldPos = (a_position / u_cellSize) + u_camera;
                v_screenPos = a_position;
            }
        `;

        // Fragment shader with lighting and effects
        const fragmentShaderSource = `
            precision mediump float;
            
            uniform sampler2D u_texture;
            uniform vec2 u_textureSize;
            uniform float u_time;
            uniform vec2 u_playerPos;
            uniform float u_lightRadius;
            
            varying vec2 v_worldPos;
            varying vec2 v_screenPos;
            
            // Convert hex color to vec3
            vec3 hexColor(vec3 hex) {
                return hex / 255.0;
            }
            
            // Get cell color from texture
            vec3 getCellColor(vec2 texCoord) {
                // Clamp texture coordinates to valid range
                vec2 clampedCoord = clamp(texCoord, 0.0, 1.0);
                vec4 texel = texture2D(u_texture, clampedCoord);
                
                // Decode cell data (R=type, G=temp, B=pressure, A=flags)
                float cellType = texel.r * 255.0;
                
                // Material colors
                vec3 color = vec3(0.0);
                
                if (cellType < 0.5) color = vec3(0.0, 0.0, 0.0); // Air - transparent
                else if (cellType < 1.5) color = hexColor(vec3(64.0, 64.0, 64.0)); // Stone
                else if (cellType < 2.5) color = hexColor(vec3(139.0, 69.0, 19.0)); // Dirt
                else if (cellType < 3.5) color = hexColor(vec3(210.0, 180.0, 140.0)); // Sand
                else if (cellType < 4.5) color = hexColor(vec3(139.0, 69.0, 19.0)); // Wood
                else if (cellType < 5.5) color = hexColor(vec3(30.0, 144.0, 255.0)); // Water
                else if (cellType < 6.5) color = hexColor(vec3(255.0, 69.0, 0.0)); // Lava
                else if (cellType < 7.5) color = hexColor(vec3(47.0, 27.0, 20.0)); // Oil
                else if (cellType < 8.5) color = hexColor(vec3(255.0, 255.0, 255.0)); // Steam
                else if (cellType < 9.5) color = hexColor(vec3(80.0, 80.0, 80.0)); // Smoke
                else if (cellType < 10.5) color = hexColor(vec3(28.0, 28.0, 28.0)); // Coal
                else if (cellType < 11.5) color = hexColor(vec3(101.0, 67.0, 33.0)); // Iron Ore
                else if (cellType < 12.5) color = hexColor(vec3(224.0, 246.0, 255.0)); // Ice
                else if (cellType < 13.5) color = hexColor(vec3(200.0, 220.0, 255.0)); // Glass
                else if (cellType < 14.5) color = hexColor(vec3(144.0, 238.0, 144.0)); // Acid
                else if (cellType < 15.5) color = hexColor(vec3(255.0, 105.0, 180.0)); // Crystal
                else if (cellType < 16.5) color = hexColor(vec3(34.0, 139.0, 34.0)); // Grass
                else if (cellType < 17.5) {
                    // Fire - animated with noise
                    float fireNoise = sin(v_worldPos.x * 0.5 + u_time * 2.0) * 
                                      cos(v_worldPos.y * 0.5 + u_time * 2.0);
                    color = mix(hexColor(vec3(255.0, 68.0, 0.0)), 
                               hexColor(vec3(255.0, 200.0, 0.0)), 
                               fireNoise * 0.5 + 0.5);
                }
                else if (cellType < 18.5) color = hexColor(vec3(101.0, 67.0, 33.0)); // Seed
                else if (cellType < 19.5) color = hexColor(vec3(0.0, 255.0, 255.0)); // Pump - cyan
                
                return color;
            }
            
            // Calculate distance-based lighting
            float calculateLight(vec2 pos) {
                float dist = distance(pos, u_playerPos);
                float light = 1.0 - smoothstep(0.0, u_lightRadius, dist);
                return max(light, 0.3); // Minimum ambient light
            }
            
            // Add depth/3D effect with gradient
            vec3 addDepth(vec3 color, vec2 pos) {
                float depth = sin(pos.x * 0.1) * cos(pos.y * 0.1) * 0.1;
                return color + vec3(depth);
            }
            
            void main() {
                // Calculate which cell we're in
                vec2 worldCell = floor(v_worldPos);
                vec2 cellUV = fract(v_worldPos);
                
                // Get texture coordinate for this cell
                vec2 texCoord = (worldCell + 0.5) / u_textureSize;
                
                vec3 color = getCellColor(texCoord);
                
                // Skip transparent (air)
                if (color.r + color.g + color.b < 0.01) {
                    discard;
                }
                
                // Apply lighting
                float light = calculateLight(v_worldPos);
                color *= light;
                
                // Add subtle depth gradient
                color = addDepth(color, v_worldPos);
                
                // Add border for cell edges (subtle)
                vec2 edge = min(cellUV, 1.0 - cellUV);
                float border = smoothstep(0.0, 0.15, min(edge.x, edge.y));
                color *= mix(0.85, 1.0, border);
                
                // Clamp and output
                color = clamp(color, 0.0, 1.0);
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        // Compile shaders
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw new Error('Shader program failed to link: ' + gl.getProgramInfoLog(this.program));
        }

        // Get attribute and uniform locations
        this.locations = {
            position: gl.getAttribLocation(this.program, 'a_position'),
            resolution: gl.getUniformLocation(this.program, 'u_resolution'),
            camera: gl.getUniformLocation(this.program, 'u_camera'),
            cellSize: gl.getUniformLocation(this.program, 'u_cellSize'),
            worldSize: gl.getUniformLocation(this.program, 'u_worldSize'),
            texture: gl.getUniformLocation(this.program, 'u_texture'),
            textureSize: gl.getUniformLocation(this.program, 'u_textureSize'),
            time: gl.getUniformLocation(this.program, 'u_time'),
            playerPos: gl.getUniformLocation(this.program, 'u_playerPos'),
            lightRadius: gl.getUniformLocation(this.program, 'u_lightRadius')
        };
        
        // Check for missing critical attributes/uniforms
        if (this.locations.position < 0) {
            throw new Error('Attribute a_position not found in shader');
        }
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compilation failed: ' + info);
        }

        return shader;
    }

    createBuffers() {
        const gl = this.gl;

        // Create quad covering entire canvas
        const positions = new Float32Array([
            0, 0,
            this.canvas.width, 0,
            0, this.canvas.height,
            this.canvas.width, this.canvas.height
        ]);

        // Position buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    }

    createTexture() {
        const gl = this.gl;
        
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    updateTexture() {
        const gl = this.gl;
        const width = this.world.width;
        const height = this.world.height;
        
        // Create texture data - encode cell information
        const data = new Uint8Array(width * height * 4);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = this.world.getCell(x, y);
                const idx = (y * width + x) * 4;
                
                if (cell && cell.type !== 'air') {
                    // Encode cell type as R channel
                    const typeMap = {
                        'air': 0, 'stone': 1, 'dirt': 2, 'sand': 3,
                        'wood': 4, 'water': 5, 'lava': 6, 'oil': 7,
                        'steam': 8, 'smoke': 9, 'coal': 10, 'iron_ore': 11,
                        'ice': 12, 'glass': 13, 'acid': 14, 'crystal': 15,
                        'grass': 16, 'fire': 17, 'seed': 18, 'pump': 19
                    };
                    
                    data[idx] = typeMap[cell.type] || 0; // R: cell type
                    data[idx + 1] = Math.min(255, cell.temperature / 4); // G: temperature
                    data[idx + 2] = Math.min(255, cell.pressure * 10); // B: pressure
                    data[idx + 3] = cell.stable ? 255 : 0; // A: stability flag
                } else {
                    data[idx] = 0; // Air
                    data[idx + 1] = 0;
                    data[idx + 2] = 0;
                    data[idx + 3] = 0;
                }
            }
        }
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }

    render(camera, player, time) {
        const gl = this.gl;
        this.time = time || 0;
        
        // Ensure viewport matches canvas size (in case it changed)
        if (gl.viewportWidth !== this.canvas.width || gl.viewportHeight !== this.canvas.height) {
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.viewportWidth = this.canvas.width;
            gl.viewportHeight = this.canvas.height;
        }
        
        // Update texture with world state
        this.updateTexture();
        
        // Clear canvas with background color
        gl.clearColor(0.165, 0.165, 0.165, 1.0); // #2a2a2a
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Use shader program
        gl.useProgram(this.program);
        
        // Set uniforms
        gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.locations.camera, camera.x, camera.y);
        gl.uniform1f(this.locations.cellSize, camera.cellSize);
        gl.uniform2f(this.locations.worldSize, this.world.width, this.world.height);
        gl.uniform2f(this.locations.textureSize, this.world.width, this.world.height);
        gl.uniform1f(this.locations.time, this.time);
        gl.uniform2f(this.locations.playerPos, player.x + player.width / 2, player.y + player.height / 2);
        gl.uniform1f(this.locations.lightRadius, 15.0);
        
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.locations.texture, 0);
        
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        if (this.locations.position >= 0) {
            gl.enableVertexAttribArray(this.locations.position);
            gl.vertexAttribPointer(this.locations.position, 2, gl.FLOAT, false, 0, 0);
        } else {
            throw new Error('Position attribute not found');
        }
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
        
        // Recreate buffers with new size
        const positions = new Float32Array([
            0, 0,
            width, 0,
            0, height,
            width, height
        ]);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    }
}

