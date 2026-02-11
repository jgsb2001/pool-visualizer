# Unreal Engine Workflow Guide
## From Web App to Interactive Unreal Application (GTA-Style)

---

## Part 1: Export & Import

### 1. Export from Web App
1. Configure your pool (shape, tiles, dimensions)
2. Click **"Export 3D Scene"** → **"Export FBX (Unreal)"**
3. Save `pool-visualizer.fbx` to your Desktop

### 2. Setup Unreal Project
```
1. Epic Games Launcher → Unreal Engine → Launch 5.3+
2. New Project:
   - Template: Blank
   - Blueprint (not C++)
   - Desktop/Console, Maximum Quality
   - Raytracing: Enabled (if GPU supports)
   - Starter Content: Yes
3. Project Name: PoolVisualizer
4. Create
```

### 3. Import FBX to Unreal
```
1. Content Browser → Right-click → Import to /Content/Pool/
2. Select pool-visualizer.fbx
3. Import Settings:
   ✓ Import Mesh: ON
   ✓ Import Materials: ON
   ✓ Import Textures: ON
   ✓ Skeletal Mesh: OFF
   ✓ Combine Meshes: OFF (keep pool parts separate)
   ✓ Auto Generate Collision: ON
   ✓ Generate Lightmap UVs: ON
   ✓ Transform:
     - Import Uniform Scale: 100 (FBX uses cm, Unreal uses cm, but web uses meters)
     - OR: Keep at 1.0 if scale looks correct
4. Import All
```

---

## Part 2: Build GTA-Style Environment

### 1. Setup Landscape (Grass Terrain)

**Create Landscape:**
```
1. Mode panel → Landscape Mode
2. New Landscape:
   - Section Size: 63x63 quads
   - Sections Per Component: 1x1
   - Number of Components: 8x8 (512m x 512m)
   - Material: We'll create custom grass
3. Fill World (scales to fit)
4. Create
```

**Grass Material (Quixel Megascans - Free):**
```
1. Window → Quixel Bridge (sign in with Epic account)
2. Search: "grass" or "lawn"
3. Download: "Short Grass" or "Garden Grass"
4. Add to Project (4K resolution)
5. Drag material onto landscape
```

**Manual Grass Material (if not using Megascans):**
```
1. Content Browser → Right-click → Material → M_Grass
2. Open material editor
3. Texture samples:
   - BaseColor (sRGB)
   - Normal (Linear, Normal map)
   - Roughness (Linear)
   - AmbientOcclusion (Linear)
4. Import grass textures from polyhaven.com
5. Connect:
   - BaseColor → Base Color
   - Normal → Normal
   - Roughness → Roughness
   - AO → Ambient Occlusion
6. UV: Add TextureCoordinate → multiply by 50 (tile grass)
7. Save
8. Apply to landscape
```

### 2. Build House Exterior

**Using Modular Building Pack (Free):**
```
1. Epic Games Launcher → Marketplace
2. Search: "Modular Building" or "Suburban House"
3. Free options: "Modular Neighborhood Pack" (free monthly)
4. Add to Library → Add to Project
5. Content Browser → Browse to pack
6. Drag wall pieces, roof, windows into scene
7. Snap together: Hold "End" key while moving (snaps to grid)
```

**Manual House Creation:**
```
1. Place → Basic → Cube
2. Scale: X=1000, Y=20, Z=300 (10m long wall, 3m tall)
3. Position behind pool: Y=-1000 (10m back)
4. Material: Content/StarterContent/Materials/M_Concrete_Poured
5. Customize:
   - Open material
   - Change Base Color to beige
   - Adjust roughness to 0.8
```

**Add Windows:**
```
1. Place → Basic → Cube (window frame)
2. Scale smaller: X=100, Y=10, Z=150
3. Position in wall
4. Material: M_Glass (from starter content)
5. Duplicate (Alt+Drag) for multiple windows
```

### 3. Add Vegetation & Foliage

**Using Quixel Megascans (Ultra Realistic - Free):**
```
1. Quixel Bridge → Vegetation → Search: "tree", "bush", "plant"
2. Download assets:
   - Palm Trees (for tropical look)
   - Shrubs/Bushes
   - Potted Plants
3. Add to Project
4. Drag into scene from Content Browser
5. Scale/position around pool
```

**Foliage Painting Tool (Grass/Ground Cover):**
```
1. Mode → Foliage
2. + Add Foliage Type → Search "Grass"
3. Or drag custom grass mesh
4. Paint settings:
   - Brush Size: 512
   - Paint Density: 1.0
   - Scale: Min 0.8, Max 1.2 (variation)
5. Click+Drag on landscape to paint grass patches
```

### 4. Pool Props (if not already in FBX)

**Lounge Chairs:**
```
Option A: Megascans
- Search: "chair outdoor" → Download → Place

Option B: Marketplace
- Free "Outdoor Furniture Pack"
```

**Umbrellas, Tables:**
```
- Megascans: "patio" or "outdoor"
- Or model in Blender and import
```

---

## Part 3: Lighting & Atmosphere (GTA Look)

### 1. Directional Light (Sun)
```
1. Place → Lights → Directional Light
2. Details panel:
   - Intensity: 10.0
   - Light Color: Warm white #fff5e6
   - Rotation: X=-45, Y=45 (afternoon sun angle)
   - Atmosphere Sun Light: ON
   - Cast Shadows: ON
   - Dynamic Shadow Distance: 20000 (sharp shadows far away)
```

### 2. Sky Atmosphere
```
1. Place → Visual Effects → Sky Atmosphere
2. Automatic (linked to Directional Light)
3. Details:
   - Rayleigh Scattering: 0.033 (blue sky)
   - Mie Scattering: 0.003 (haze)
   - Absorption: Slight (for depth)
```

### 3. Sky Light (Ambient)
```
1. Place → Lights → Sky Light
2. Details:
   - Source Type: SLS Captured Scene
   - Intensity: 1.0
   - Real Time Capture: ON (dynamic)
```

### 4. Volumetric Clouds
```
1. Place → Visual Effects → Volumetric Cloud
2. Details:
   - Layer Bottom Altitude: 500
   - Layer Height: 1000
   - View Sample Count Scale: 1.0 (quality)
3. Place → Visual Effects → Sky Atmosphere (if not already)
```

### 5. Post Processing (Cinematic Look)
```
1. Place → Visual Effects → Post Process Volume
2. Details → Infinite Extent (Unbound): ON
3. Settings:
   Exposure:
     - Method: Manual
     - Exposure Compensation: 0.5

   Color Grading:
     - Temperature: 6500 (warm daylight)
     - Tint: Slight green (-2 to -5) for outdoor look
     - Saturation: 1.15 (slightly vibrant like GTA)
     - Contrast: 1.05

   Bloom:
     - Intensity: 0.5
     - Threshold: 0.8

   Lens:
     - Chromatic Aberration: 0.2 (subtle)
     - Vignette Intensity: 0.3

   Motion Blur: OFF (for interactive)
```

### 6. Lumen (Real-Time GI - UE5)
```
1. Project Settings → Engine → Rendering
2. Global Illumination:
   - Method: Lumen
3. Reflections:
   - Method: Lumen
4. Post Process Volume → Lumen:
   - Final Gather Quality: 1.0
   - Ray Lighting Mode: Surface Cache (fast) or Hit Lighting (quality)
```

---

## Part 4: Interactive Orbit Camera System

### Method 1: Blueprint Orbit Camera (BEST for exported apps)

**Create Orbit Camera Blueprint:**
```
1. Content Browser → Add → Blueprint Class → Actor
2. Name: BP_OrbitCamera
3. Open blueprint
4. Components panel:
   - Add Component → Scene (root) - rename "OrbitRoot"
   - Add Component → Spring Arm (child of OrbitRoot)
   - Add Component → Camera (child of Spring Arm)
```

**Configure Spring Arm:**
```
Details panel (Spring Arm selected):
- Target Arm Length: 1500 (15m from pool - adjust as needed)
- Use Pawn Control Rotation: OFF
- Inherit Pitch: OFF
- Inherit Yaw: OFF
- Inherit Roll: OFF
- Enable Camera Lag: ON
- Camera Lag Speed: 3.0 (smooth follow)
- Do Collision Test: OFF (or ON if you want camera to avoid walls)
```

**Add Orbit Controls (Event Graph):**
```blueprint
1. Event Graph tab
2. Right-click → Add Custom Event → "OrbitCamera"
3. Add nodes (visual scripting):

// Mouse Orbit Control
Event Tick
  ├─ Get Input Mouse Delta
  │   ├─ Delta X → Multiply (scale: 2.0)
  │   │   └─ Add Local Rotation (OrbitRoot)
  │   │       └─ Make Rotator (Z = Delta X * 2)
  │   └─ Delta Y → Multiply (scale: 2.0)
  │       └─ Add Local Rotation (Spring Arm)
  │           └─ Make Rotator (Y = Delta Y * 2, clamped -80 to 80)
  │
  └─ Get Mouse Wheel Axis
      └─ Multiply (-100)
          └─ Add Local Offset (Spring Arm)
              └─ Make Vector (Y = MouseWheel * -100)
              └─ Clamp (min: 500, max: 3000)

// WASD Orbit Control (Alternative)
Event Tick
  ├─ Get Input Axis Value "MoveRight"
  │   └─ Multiply (DeltaTime * 90)
  │       └─ Add Local Rotation (OrbitRoot, Yaw)
  └─ Get Input Axis Value "MoveForward"
      └─ Multiply (DeltaTime * 50)
          └─ Add to Spring Arm Length
          └─ Clamp (500 to 3000)
```

**Simplified Text Instructions (if visual confusing):**
```
1. Right-click → Input → Get Input Mouse Delta
2. Break vector → X pin
3. Multiply by 2.0 (sensitivity)
4. Connect to AddActorLocalRotation (Yaw)
5. Same for Y → Pitch (but for Spring Arm, not root)
6. Clamp pitch between -80 and 80 (prevent flipping)
7. Mouse Wheel → Spring Arm target length (zoom)
```

**Position in Level:**
```
1. Drag BP_OrbitCamera into viewport
2. Position OrbitRoot at pool center: (0, 0, 0)
3. Rotation: (0, 0, 0)
4. Spring Arm will extend from here
```

**Set as Player Camera:**
```
1. Select BP_OrbitCamera in World Outliner
2. Details → Auto Possess Player: Player 0
3. OR in Level Blueprint:
   - Event BeginPlay
   - Set View Target with Blend
     - Target: BP_OrbitCamera
     - Player Controller: 0
```

### Method 2: Automatic Rotation (Turntable)

**Add to BP_OrbitCamera Event Graph:**
```
Event Tick
  └─ Add Local Rotation
      ├─ Target: OrbitRoot
      └─ Rotation: Make Rotator
          └─ Yaw: DeltaSeconds * 20 (adjust speed)

// This rotates camera 20°/second around pool
```

### Method 3: Cinematic Camera (Pre-made path)

```
1. Place → Cinematic → Cine Camera Actor
2. Window → Sequencer → New Level Sequence
3. Add camera to sequencer
4. Animate:
   - Frame 0: Position camera at starting point
   - Frame 300: Rotate camera 360° around pool
5. Auto-play in level: Sequencer → Auto Play: ON
```

---

## Part 5: Package Interactive Application

### Export as Standalone Windows/Mac Application

**Package Settings:**
```
1. Edit → Project Settings → Project → Packaging
2. Build Configuration: Shipping (optimized)
3. Full Rebuild: ON (first time)
4. For Distribution: ON
5. Include Crash Reporter: OFF (for cleaner build)
```

**Package for Windows:**
```
1. File → Package Project → Windows → Windows (64-bit)
2. Select output folder: Desktop/PoolVisualizerBuild/
3. Wait 5-20 minutes (first build)
4. Output: .exe in WindowsNoEditor/ folder
5. Entire folder must stay together (assets)
6. Run .exe - camera orbit should work!
```

**Package for Mac:**
```
1. File → Package Project → Mac
2. Select output folder
3. Wait for build
4. Output: .app bundle
5. Zip before distributing
```

**Controls in Packaged App:**
```
- Mouse Left Click + Drag: Orbit camera
- Mouse Wheel: Zoom in/out
- WASD: Optional orbit (if you added those inputs)
- ESC: Quit (default)
```

### Export as WebGL (Browser-Based)

**Install Pixel Streaming Plugin:**
```
1. Edit → Plugins → Search "Pixel Streaming"
2. Enable → Restart editor
3. This streams Unreal to browser (like Stadia/GeForce Now)
```

**Alternative: WebGL Export (Limited):**
```
Note: Unreal's HTML5 export was deprecated in UE 4.24
For web deployment, use Pixel Streaming or:

Option A: Sketchfab Upload
1. Export scene as FBX
2. Upload to sketchfab.com
3. Embed viewer on website

Option B: Three.js (stay in web)
- Keep using your current React/Three.js app!
- Deploy to Vercel/Netlify
```

---

## Part 6: Advanced Unreal Features

### Water System (UE5 Water Plugin)

**Replace imported water with UE5 Water:**
```
1. Edit → Plugins → Water (enable)
2. Place → Water → Water Body Ocean
3. Scale to pool size
4. Material: Customize transparency, color, normals
5. Post Process Material: Underwater effects
```

**Caustics (animated light patterns):**
```
1. Material Editor → Water material
2. Add Panner node (scrolling texture)
3. Caustic texture → Multiply → Emissive Color
4. Projects onto pool floor via light function
```

### Niagara Water Effects

**Ripples/Splashes:**
```
1. Place → Effects → Niagara System
2. Template: Simple Sprite Burst
3. Customize for water splash
4. Trigger on interaction
```

### Dynamic Weather

**Time of Day System:**
```
1. Place → Blueprints → Actor
2. Name: BP_TimeOfDay
3. Event Graph:
   - Timeline (0 to 24 hours, 120 seconds)
   - Lerp sun rotation (sunrise to sunset)
   - Update Directional Light rotation
   - Update Sky Atmosphere
```

### Megascans Integration (Photorealistic)

```
1. Quixel Bridge → 3D Assets
2. Search: "suburban", "backyard", "patio"
3. Download full asset packs:
   - Vegetation
   - Props (furniture, decor)
   - Surfaces (concrete, wood decking)
4. Auto-imports with LODs and materials
5. Drag into scene - instant realism
```

---

## Part 7: Performance Optimization

### For Real-Time Interactive App:

**LODs (Level of Detail):**
```
1. Select mesh → Details → LOD Settings
2. Auto-generate LODs: 4 levels
3. Reduction: 50%, 75%, 90%
4. Simplification: Quality (slider)
```

**Culling:**
```
1. Select actors → Details → Rendering
2. Cull Distance: 10000 (objects disappear beyond 100m)
```

**Lighting:**
```
1. Build → Build Lighting Only
2. Lightmass Settings → Higher quality for final
3. Or use Lumen (no bake needed, real-time)
```

**Nanite (UE5 - automatic LOD):**
```
1. Select static mesh
2. Details → Nanite → Enable Nanite Support
3. Build (processes mesh)
4. Automatic LOD streaming
```

**Textures:**
```
1. Select texture → Details
2. Compression: BC7 (high quality) or BC1 (smaller)
3. Max Texture Size: 2048 or 4096
4. LOD Bias: 0 (sharp) or 1 (optimized)
```

---

## Part 8: Troubleshooting

**Issue: FBX imports tiny or huge**
```
Solution:
- Reimport → Import Uniform Scale: 100 (or 0.01)
- Or in web export, multiply scene scale before export
```

**Issue: Materials are gray/missing textures**
```
Solution:
- Reimport with "Import Textures" ON
- Manually assign textures: Material Editor → Texture Sample nodes
- Check texture import settings (sRGB vs Linear)
```

**Issue: Orbit camera not working**
```
Solution:
- Check "Auto Possess Player" is set on BP_OrbitCamera
- OR Set View Target in Level Blueprint (BeginPlay)
- Verify Input Mappings: Edit → Project Settings → Input
```

**Issue: Water not transparent**
```
Solution:
- Material → Blend Mode: Translucent
- Opacity: 0.95
- Refraction: Slight (1.05)
```

**Issue: Packaged game crashes**
```
Solution:
- Package with "Full Rebuild"
- Check Output Log for missing assets
- Include all content in packaging settings
```

**Issue: Shadows look bad**
```
Solution:
- Directional Light → Cascaded Shadow Maps: 4
- Dynamic Shadow Distance: 20000
- Or enable Raytraced Shadows (RTX GPUs)
```

---

## Keyboard Shortcuts Reference

```
W/A/S/D - Move camera (viewport)
E/Q - Up/Down
Right Mouse + Drag - Rotate viewport
Middle Mouse + Drag - Pan
Scroll - Zoom
F - Focus on selected object
G - Game view (hide editor widgets)
F11 - Fullscreen
Alt + P - Play in viewport
ESC - Stop play
Ctrl+S - Save
Ctrl+Shift+S - Save all
```

---

## Export Checklist

Before packaging:
- ✓ Orbit camera blueprint positioned at pool center
- ✓ Auto Possess Player set to Player 0
- ✓ All meshes have collision (for accurate placement)
- ✓ Lighting is built (or Lumen enabled)
- ✓ Post-processing looks good from all angles
- ✓ Water transparency working
- ✓ Textures not missing (check materials)
- ✓ No errors in Output Log
- ✓ Test in "Play" mode (Alt+P) before packaging

---

## Resources

- **Free Assets:** Quixel Megascans (bridge.quixel.com)
- **Marketplace:** unrealengine.com/marketplace (free monthly content)
- **Tutorials:** docs.unrealengine.com, YouTube: Unreal Sensei
- **HDRIs:** polyhaven.com
- **Community:** forums.unrealengine.com

---

## Comparison: Blender vs Unreal

**Use Blender if:**
- You want full artistic control
- Need to model custom elements
- Lighter weight application
- Faster iteration on assets

**Use Unreal if:**
- You want AAA game-quality realism
- Real-time lighting (Lumen)
- Easy Megascans integration
- Cinematic rendering quality
- Planning to expand into game/interactive experience

**Best Workflow:**
1. Model custom pieces in Blender
2. Import to Unreal
3. Use Megascans for realistic environment
4. Light/render in Unreal
5. Package as standalone app
