# Blender Workflow Guide
## From Web App to Interactive Blender Application

---

## Part 1: Export & Import

### 1. Export from Web App
1. Configure your pool (shape, tiles, dimensions)
2. Click **"Export 3D Scene"** → **"Export GLB (Blender)"**
3. Save `pool-visualizer.glb` to your Desktop

### 2. Import to Blender
```
1. Open Blender (3.6+ recommended)
2. File → Import → glTF 2.0 (.glb/.gltf)
3. Select pool-visualizer.glb
4. Import Settings:
   ✓ Shading: Smooth
   ✓ Normals: Import Custom Normals
   ✓ Materials: Import Materials & Textures
   ✓ Guess Original Bind Pose: ON
```

---

## Part 2: Build GTA-Style Environment

### 1. Add Realistic Landscape

**Ground Plane:**
```
1. Add → Mesh → Plane (Shift+A)
2. Scale: S, then type 50 (50x50 meter yard)
3. Apply scale: Ctrl+A → Scale
4. Position: G, Z, -0.05 (slightly below pool deck)
```

**Add Grass Material:**
```
1. Switch to Shading workspace
2. Select ground plane
3. Add material: Use Shader Editor
4. Download free grass from: polyhaven.com/a/aerial_grass_rock
5. Texture Setup:
   - Diffuse → Base Color
   - Normal Map → Normal (set to Non-Color)
   - Roughness → Roughness
   - Displacement → Height (Displacement node)
```

### 2. Build House Exterior (GTA Reference)

**Create House Wall:**
```
1. Add → Mesh → Cube
2. Scale: S, X, 10; S, Z, 3 (long wall, 3m tall)
3. Position behind pool: G, Y, -10
4. Material: Stucco/concrete
   - Base Color: Light beige #e8dcc8
   - Roughness: 0.8-0.9
   - Add Bump map for texture
```

**Add Windows:**
```
1. Edit Mode (Tab)
2. Select wall face
3. Inset (I) → Extrude (E) → Delete faces
4. Add glass material to window frames
```

**Add Roof:**
```
1. Add → Mesh → Cube
2. Scale flat: S, Z, 0.1
3. Position on top of wall
4. Material: Terracotta/shingles
```

### 3. Add Vegetation & Props

**Trees (using Sapling Add-on):**
```
1. Edit → Preferences → Add-ons
2. Enable: "Add Curve: Sapling Tree Gen"
3. Add → Curve → Sapling Tree Gen
4. Presets: Choose palm tree or oak
5. Scale & position around yard
```

**Bushes/Shrubs:**
```
Option A - Simple:
1. Add → Mesh → UV Sphere
2. Modifiers → Subdivision Surface
3. Material: Green foliage shader
4. Particle system for leaves

Option B - Asset Library:
1. Edit → Preferences → File Paths
2. Add Asset Library → Browse to folder
3. Download free plants from BlenderKit or Botaniq
```

**Outdoor Furniture:**
```
- Use existing pool props from export OR
- Download free models from:
  * Sketchfab (CC0 license)
  * BlenderKit
  * Quixel Megascans (free with Epic account)
```

---

## Part 3: Lighting & Rendering (Match GTA Look)

### 1. Setup HDRI Lighting
```
1. Switch to Shading workspace
2. Click "World" properties
3. Add Environment Texture:
   - Download HDRI from polyhaven.com (outdoor/park)
   - Connect to Background shader
4. Adjust strength: 0.8-1.2
```

### 2. Sun Light (Directional)
```
1. Add → Light → Sun
2. Rotation: Point from angle (R, Y, 45)
3. Energy: 3.5-4.5
4. Color: Warm daylight (#fff5e6)
```

### 3. Render Settings (Realistic)
```
Render Engine: Cycles
Device: GPU Compute (if available)
Samples: 256-512 (viewport), 1024-2048 (final)
Denoising: ON (Intel OpenImageDenoise)
Color Management:
  - View Transform: Filmic
  - Look: Medium High Contrast
```

---

## Part 4: Add Interactive Orbit Camera

### Method 1: Turntable Animation (Auto-Rotate)

```python
# 1. Select Camera
# 2. Scripting workspace → New script
# 3. Paste this code:

import bpy
from math import radians

# Camera settings
camera = bpy.data.objects['Camera']
target = bpy.context.scene.cursor.location  # Orbit around 3D cursor
radius = 15  # Distance from pool
height = 5   # Camera height

# Position camera
camera.location = (radius, 0, height)

# Track to constraint (camera always looks at pool)
constraint = camera.constraints.new('TRACK_TO')
empty = bpy.data.objects.new("CameraTarget", None)
bpy.context.collection.objects.link(empty)
empty.location = (0, 0, 0)  # Pool center
constraint.target = empty
constraint.up_axis = 'UP_Y'
constraint.track_axis = 'TRACK_NEGATIVE_Z'

# Animate rotation (360° in 300 frames = 12 seconds at 25fps)
empty.rotation_euler = (0, 0, 0)
empty.keyframe_insert('rotation_euler', frame=1)
empty.rotation_euler = (0, 0, radians(360))
empty.keyframe_insert('rotation_euler', frame=300)

# Linear interpolation
for fc in empty.animation_data.action.fcurves:
    for kf in fc.keyframe_points:
        kf.interpolation = 'LINEAR'

print("Camera orbit setup complete!")
```

Run script: Click ▶️ button
Now scrub timeline to see camera orbit!

### Method 2: Manual Orbit Control (Interactive)

**Setup:**
```
1. Select Camera
2. Add → Empty → Plain Axes (at pool center 0,0,0)
3. Select Camera → Add Constraint → Track To
   - Target: Empty
4. Parent camera to empty: Select Camera, Shift+Select Empty
   - Ctrl+P → Object (Keep Transform)
```

**Control:**
- Rotate Empty: Camera orbits pool
- Move Empty: Camera follows
- Move Camera along local Y: Zoom in/out

---

## Part 5: Export Interactive Application

### Option A: Blender Standalone App (Windows/Mac)

**Export as Runtime:**
```
1. File → Export → Blender Runtime (.exe or .app)
2. Settings:
   - Start Frame: 1
   - Auto Play: ON
   - Mouse Look: ON (WASD controls)
   - Camera Override: Your orbit camera
3. Save as: PoolVisualizer.exe (Windows) or .app (Mac)
```

**Controls in exported app:**
- Mouse: Look around
- WASD: Move camera
- Shift: Move faster
- Space: Jump/Up
- Ctrl: Down

### Option B: Web Export (Interactive Viewer)

**Using Verge3D (Blender Add-on):**
```
1. Download Verge3D Blender edition (free trial)
2. Install add-on: Edit → Preferences → Add-ons → Install
3. Verge3D → Export → Web Interactive
4. Settings:
   - Orbit Camera: ON
   - Auto-rotate: Optional
   - Compression: Enabled
5. Export → Creates HTML + assets folder
6. Upload to web hosting (Netlify/Vercel)
```

**Controls in web app:**
- Left Click + Drag: Rotate camera
- Right Click + Drag: Pan
- Scroll: Zoom
- Touch (mobile): Pinch zoom, swipe rotate

---

## Part 6: Advanced Tips

### Make Water Animated
```
1. Select water surface mesh
2. Modifiers → Add Modifier → Ocean
3. Settings:
   - Resolution: 15
   - Depth: 0.05 (shallow pool ripples)
   - Wave Scale: 0.5
   - Choppiness: 0.3
4. Animate time: Keyframe Time value at frame 1 and 250
```

### Add Caustics (Light patterns on pool floor)
```
1. Select water mesh
2. Material: Enable Screen Space Refraction
3. Add Volume Scatter node
4. Light Path node → Is Camera Ray → Mix Shader
5. Render with high samples (1024+)
```

### Add Realistic Sky
```
Option 1: Dynamic Sky Add-on
1. Enable "Dynamic Sky" add-on
2. Add → Light → Sky
3. Adjust time of day slider

Option 2: Physical Sky
1. World → Background
2. Add Sky Texture node
3. Set sun position (matches your sun light)
```

---

## Keyboard Shortcuts Reference

```
G - Grab/Move
R - Rotate
S - Scale
Tab - Edit Mode toggle
Shift+A - Add menu
Ctrl+S - Save
F12 - Render image
Ctrl+F12 - Render animation
Numpad 0 - Camera view
Shift+Middle Mouse - Pan view
Scroll - Zoom view
```

---

## Export Checklist

Before exporting application:
- ✓ All textures embedded/packed (File → External Data → Pack Resources)
- ✓ Camera orbit works in viewport
- ✓ Lighting looks good from all angles
- ✓ Water material has transparency
- ✓ No missing textures (purple materials)
- ✓ Scene scale is correct (pool ~10m length)
- ✓ All modifiers applied
- ✓ Normals facing correct direction

---

## Troubleshooting

**Issue: Imported model is tiny**
- Solution: Scale import by 100 during import, or select all (A) → Scale (S) → 100

**Issue: Textures missing/purple**
- Solution: File → External Data → Find Missing Files → Browse to texture folder

**Issue: Camera too close/far**
- Solution: Adjust radius in orbit script, or move camera in/out

**Issue: Water not transparent**
- Solution: Material → Blend Mode → Alpha Blend, Transmission: 0.95

**Issue: Slow viewport**
- Solution: Viewport Shading → Solid mode while editing, switch to Rendered for preview

---

## Resources

- **Free Assets:** polyhaven.com, blenderkit.com, sketchfab.com
- **Tutorials:** blender.org/support/tutorials, youtube.com/BlenderGuru
- **HDRI Skies:** polyhaven.com/hdris
- **Materials:** ambientcg.com, freepbr.com
