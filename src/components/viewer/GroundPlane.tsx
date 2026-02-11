'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { PoolShape } from '@/types/pool';
import { generatePoolPerimeterPoints } from '@/lib/geometry/perimeterPoints';
import { computeTangents } from '@/lib/geometry/computeTangents';
import { deckVertexShader, deckFragmentShader } from '@/shaders/deckPBR';

const COPING_OUTER_OFFSET = 0.42;
/** Width of the patio/deck band around the pool (meters) */
const DECK_WIDTH = 2.5;
const DECK_OUTER_OFFSET = COPING_OUTER_OFFSET + DECK_WIDTH;
/** Thickness of the deck slab — ~5cm like real stone pavers */
const DECK_THICKNESS = 0.05;

interface GroundPlaneProps {
  shape: PoolShape;
  length: number;
  width: number;
  height: number;
}

/**
 * Load a PBR texture set from the public/textures directory.
 * Each set contains: diff.jpg, nor_gl.jpg, rough.jpg, ao.jpg
 * These are photoscanned materials from Poly Haven / ambientCG (CC0).
 */
function loadPBRTextureSet(
  folder: string,
  repeatX: number,
  repeatY: number,
): {
  diffuse: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
  ao: THREE.Texture;
} {
  const loader = new THREE.TextureLoader();

  const configure = (tex: THREE.Texture, isSRGB: boolean): THREE.Texture => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    if (isSRGB) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    // Max anisotropic filtering reduces blur at grazing angles
    tex.anisotropy = 16;
    return tex;
  };

  return {
    diffuse: configure(loader.load(`/textures/${folder}/diff.jpg`), true),
    normal: configure(loader.load(`/textures/${folder}/nor_gl.jpg`), false),
    roughness: configure(loader.load(`/textures/${folder}/rough.jpg`), false),
    ao: configure(loader.load(`/textures/${folder}/ao.jpg`), false),
  };
}

/**
 * Compute offset points pushed outward from the pool perimeter.
 * Uses miter-join math so that sharp corners (like rectangle 90°) produce
 * a proper right-angle offset instead of chamfered/diagonal cuts.
 *
 * For each vertex, we find the two adjacent edge normals and compute the
 * miter direction. The miter length is `offset / cos(halfAngle)` which
 * ensures the offset distance from both edges is exactly `offset`.
 */
function computeOffsetPoints(
  perimeterPoints: THREE.Vector3[],
  offset: number,
): THREE.Vector2[] {
  const offsetPoints: THREE.Vector2[] = [];
  const n = perimeterPoints.length;

  for (let i = 0; i < n; i++) {
    const curr = perimeterPoints[i];
    const prev = perimeterPoints[(i - 1 + n) % n];
    const next = perimeterPoints[(i + 1) % n];

    const dir1 = new THREE.Vector3().subVectors(curr, prev).normalize();
    const dir2 = new THREE.Vector3().subVectors(next, curr).normalize();

    // Outward normals for CCW perimeter: (dir.z, 0, -dir.x)
    const n1x = dir1.z, n1z = -dir1.x;
    const n2x = dir2.z, n2z = -dir2.x;

    // Average normal (miter direction)
    const mx = n1x + n2x;
    const mz = n1z + n2z;
    const mLen = Math.sqrt(mx * mx + mz * mz);

    if (mLen < 0.001) {
      // Collinear edges — just use one normal
      offsetPoints.push(new THREE.Vector2(
        curr.x + n1x * offset,
        curr.z + n1z * offset,
      ));
    } else {
      // Miter offset: scale by 1/dot(miterDir, edgeNormal) to get exact offset distance
      const miterX = mx / mLen;
      const miterZ = mz / mLen;
      const dot = miterX * n1x + miterZ * n1z;
      const miterScale = dot > 0.1 ? offset / dot : offset;

      offsetPoints.push(new THREE.Vector2(
        curr.x + miterX * miterScale,
        curr.z + miterZ * miterScale,
      ));
    }
  }

  return offsetPoints;
}

/** Create a Shape path from points, optionally reversed for hole winding */
function pointsToPath(points: THREE.Vector2[], reverse: boolean): THREE.Path {
  const path = new THREE.Path();
  const pts = reverse ? [...points].reverse() : points;
  path.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    path.lineTo(pts[i].x, pts[i].y);
  }
  path.closePath();
  return path;
}

/**
 * Ground plane with real PBR travertine/stone patio deck ring (2.5m band around coping).
 * Has pool-shaped cutout so the pool appears in-ground.
 * Blends seamlessly with HDRI background environment.
 *
 * Textures sourced from Poly Haven, CC0 licensed.
 */
export function GroundPlane({ shape, length, width, height }: GroundPlaneProps) {
  const perimeterPoints = useMemo(
    () => generatePoolPerimeterPoints(shape, length, width, 64),
    [shape, length, width],
  );

  // Inner edge of deck should be at pool perimeter (no offset)
  const copingEdge = useMemo(
    () => computeOffsetPoints(perimeterPoints, 0),
    [perimeterPoints],
  );

  // Outer edge of deck extends DECK_WIDTH beyond the pool
  const deckEdge = useMemo(
    () => computeOffsetPoints(perimeterPoints, DECK_WIDTH),
    [perimeterPoints],
  );

  // Deck geometry: extruded ring between coping outer edge and deck outer edge
  // ExtrudeGeometry gives real thickness so the deck reads as a raised stone slab
  const deckGeometry = useMemo(() => {
    const deckShape = new THREE.Shape();

    // Outer boundary = deck edge (CCW)
    deckShape.moveTo(deckEdge[0].x, deckEdge[0].y);
    for (let i = 1; i < deckEdge.length; i++) {
      deckShape.lineTo(deckEdge[i].x, deckEdge[i].y);
    }
    deckShape.closePath();

    // Inner hole = coping edge (CW = reversed CCW)
    const holePath = pointsToPath(copingEdge, true);
    deckShape.holes.push(holePath);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: DECK_THICKNESS,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 1,
    };

    const geo = new THREE.ExtrudeGeometry(deckShape, extrudeSettings);

    // ExtrudeGeometry extrudes along Z in shape-space.
    // We need UV2 for AO maps — copy UV to UV2
    const uv = geo.getAttribute('uv');
    if (uv) {
      geo.setAttribute('uv2', uv.clone());
    }

    // Compute tangents for parallax occlusion mapping (required for TBN matrix)
    // Use BufferGeometryUtils for MikkTSpace-compliant tangent computation
    computeTangents(geo);

    return geo;
  }, [copingEdge, deckEdge]);

  // Vertical skirt around the deck inner edge to seal gap between coping and deck
  const skirtGeometry = useMemo(() => {
    const SKIRT_DEPTH = 0.3;
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    for (let i = 0; i < copingEdge.length; i++) {
      const curr = copingEdge[i];
      const next = copingEdge[(i + 1) % copingEdge.length];

      positions.push(curr.x, 0, curr.y);
      positions.push(curr.x, -SKIRT_DEPTH, curr.y);
      positions.push(next.x, 0, next.y);

      positions.push(curr.x, -SKIRT_DEPTH, curr.y);
      positions.push(next.x, -SKIRT_DEPTH, next.y);
      positions.push(next.x, 0, next.y);

      const dx = next.x - curr.x;
      const dz = next.y - curr.y;
      const segLen = Math.sqrt(dx * dx + dz * dz) || 1;
      const nx = dz / segLen;
      const nz = -dx / segLen;

      // UVs for the skirt face (horizontal = along edge, vertical = height)
      const u0 = i / copingEdge.length;
      const u1 = (i + 1) / copingEdge.length;
      uvs.push(u0, 1, u0, 0, u1, 1);
      uvs.push(u0, 0, u1, 0, u1, 1);

      for (let j = 0; j < 6; j++) {
        normals.push(nx, 0, nz);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geo;
  }, [copingEdge]);

  // No outer edge skirt needed — deck sits flush with background
  // The HDRI environment provides natural ground context

  // Load real PBR texture sets (cached by Three.js TextureLoader)
  // PavingStones128 covers ~3.5m per tile — 3x3 gives natural scale for the deck ring
  const deckTextures = useMemo(
    () => loadPBRTextureSet('deck', 3, 3),
    [],
  );

  // Deck shader uniforms with parallax occlusion mapping parameters
  const deckUniforms = useMemo(() => ({
    uDiffuse: { value: deckTextures.diffuse },
    uNormal: { value: deckTextures.normal },
    uRoughness: { value: deckTextures.roughness },
    uAO: { value: deckTextures.ao },
    // Use inverted roughness map as height proxy (smoother areas = higher)
    uHeight: { value: deckTextures.roughness },
    uNormalScale: { value: 1.5 },
    uRoughnessScale: { value: 1.0 },
    uAOIntensity: { value: 0.8 },
    uMetalness: { value: 0.0 },
    uEnvMapIntensity: { value: 0.6 },
    // Parallax parameters: height scale controls displacement depth
    uHeightScale: { value: 0.08 },
    uMinLayers: { value: 8.0 },
    uMaxLayers: { value: 32.0 },
  }), [deckTextures]);

  /**
   * Textured ground plane extending around the pool.
   * Creates environmental context like the GTA V pool scene.
   * Extends to horizon with fog handling distance fade naturally.
   */
  const environmentGroundGeometry = useMemo(() => {
    // Very large plane extending to horizon (200m)
    return new THREE.PlaneGeometry(400, 400, 64, 64);
  }, []);

  // Shader for ground with radial fade and deck texture
  const envGroundVertexShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const envGroundFragmentShader = /* glsl */ `
    uniform sampler2D uDiffuse;
    uniform sampler2D uNormal;
    uniform sampler2D uRoughness;
    uniform float uPoolHalfLength;
    uniform float uPoolHalfWidth;

    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      // Tile the deck texture across the ground
      vec2 tiledUv = vUv * 15.0;

      vec3 color = texture2D(uDiffuse, tiledUv).rgb;
      float roughness = texture2D(uRoughness, tiledUv).r;

      // Natural ground color variation - darker for grass/earth appearance
      color *= 0.75;

      // Add subtle color tint for natural grass/earth
      color *= vec3(0.85, 0.9, 0.8);

      // Check if we're inside the pool + deck area (rectangular bounds)
      float absX = abs(vWorldPosition.x);
      float absZ = abs(vWorldPosition.z);

      // SHARP cutoff at pool edge + deck width - no fade into water
      if (absX < uPoolHalfLength + 2.5 && absZ < uPoolHalfWidth + 2.5) {
        discard;
      }

      // Subtle distance-based color variation for depth
      float dist = length(vWorldPosition.xz);
      float distFade = smoothstep(80.0, 120.0, dist);
      color = mix(color, color * 0.9, distFade);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const envGroundUniforms = useMemo(() => {
    if (!deckTextures.diffuse) return null;
    // Calculate pool half-dimensions for rectangular cutout
    return {
      uDiffuse: { value: deckTextures.diffuse },
      uNormal: { value: deckTextures.normal },
      uRoughness: { value: deckTextures.roughness },
      uPoolHalfLength: { value: length / 2 },
      uPoolHalfWidth: { value: width / 2 },
    };
  }, [deckTextures, length, width]);

  return (
    <group>
      {/* Patio deck slab — extruded for real thickness with AAA-quality PBR */}
      <mesh
        geometry={deckGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, height + 0.02, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={deckTextures.diffuse}
          normalMap={deckTextures.normal}
          normalScale={new THREE.Vector2(3.0, 3.0)}
          roughnessMap={deckTextures.roughness}
          roughness={0.85}
          aoMap={deckTextures.ao}
          aoMapIntensity={2.0}
          metalness={0.0}
          envMapIntensity={1.2}
          color={0xf8f0e3}
          transparent={false}
          opacity={1.0}
        />
      </mesh>
    </group>
  );
}
