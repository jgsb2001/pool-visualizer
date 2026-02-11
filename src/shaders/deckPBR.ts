/**
 * Enhanced PBR shader for deck/patio surfaces with parallax occlusion mapping.
 *
 * Parallax occlusion mapping (POM) samples the height map multiple times along
 * the view ray to create the illusion of surface depth. This makes flat geometry
 * appear to have real 3D relief, showing correct occlusion and self-shadowing.
 *
 * The technique is more expensive than normal mapping alone, but produces
 * significantly more realistic stone/paver surfaces, especially at grazing angles.
 */

export const deckVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vTangent;
  varying vec3 vBitangent;

  attribute vec4 tangent;

  void main() {
    vUv = uv;

    // World position for lighting calculations
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;

    // View-space position for parallax
    vec4 mvPosition = viewMatrix * worldPos;
    vViewPosition = -mvPosition.xyz;

    // Transform normal to world space
    vNormal = normalize(normalMatrix * normal);

    // Compute TBN basis for tangent-space calculations
    // tangent.w contains the handedness (+1 or -1)
    vTangent = normalize(normalMatrix * tangent.xyz);
    vBitangent = normalize(cross(vNormal, vTangent) * tangent.w);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const deckFragmentShader = /* glsl */ `
  uniform sampler2D uDiffuse;
  uniform sampler2D uNormal;
  uniform sampler2D uRoughness;
  uniform sampler2D uAO;
  uniform sampler2D uHeight;

  uniform float uNormalScale;
  uniform float uRoughnessScale;
  uniform float uAOIntensity;
  uniform float uMetalness;
  uniform float uEnvMapIntensity;

  // Parallax occlusion mapping parameters
  uniform float uHeightScale;
  uniform float uMinLayers;
  uniform float uMaxLayers;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vTangent;
  varying vec3 vBitangent;

  // Standard PBR functions (simplified for performance)
  const float PI = 3.14159265359;

  /**
   * Parallax Occlusion Mapping
   * Traces along the view ray through the height field to find the intersection point.
   * Uses adaptive layer count based on viewing angle for performance optimization.
   *
   * @param uv - Base texture coordinates
   * @param viewDirTangent - View direction in tangent space
   * @return Offset UV coordinates accounting for parallax displacement
   */
  vec2 parallaxOcclusionMapping(vec2 uv, vec3 viewDirTangent) {
    // Adaptive layer count: more layers at grazing angles, fewer when viewing straight-on
    float numLayers = mix(uMaxLayers, uMinLayers, abs(viewDirTangent.z));

    // Height of each layer
    float layerHeight = 1.0 / numLayers;
    float currentLayerHeight = 0.0;

    // Shift UV by viewDir scaled by height — this is the parallax offset per layer
    vec2 deltaUV = viewDirTangent.xy * uHeightScale / (viewDirTangent.z * numLayers);

    vec2 currentUV = uv;
    float currentHeight = texture2D(uHeight, currentUV).r;

    // Ray-march through height field
    // We step down through layers until the height map value is below our current layer
    for(float i = 0.0; i < 32.0; i++) {
      if(i >= numLayers) break;

      if(currentLayerHeight >= currentHeight) break;

      currentUV -= deltaUV;
      currentHeight = texture2D(uHeight, currentUV).r;
      currentLayerHeight += layerHeight;
    }

    // Occlusion: refine with linear interpolation between last two samples
    // This reduces stepping artifacts and gives smoother displacement
    vec2 prevUV = currentUV + deltaUV;
    float afterHeight = currentHeight - currentLayerHeight;
    float beforeHeight = texture2D(uHeight, prevUV).r - currentLayerHeight + layerHeight;
    float weight = afterHeight / (afterHeight - beforeHeight);

    return mix(currentUV, prevUV, weight);
  }

  /**
   * Reconstruct world-space normal from tangent-space normal map.
   * Uses the TBN matrix constructed from vertex tangent/bitangent/normal.
   */
  vec3 perturbNormal(vec2 uv, vec3 N, vec3 T, vec3 B) {
    // Sample normal map (OpenGL convention: Y-up)
    vec3 mapN = texture2D(uNormal, uv).rgb * 2.0 - 1.0;
    mapN.xy *= uNormalScale;

    // Transform from tangent space to world space
    mat3 TBN = mat3(T, B, N);
    return normalize(TBN * mapN);
  }

  /**
   * GGX normal distribution function (specular D term)
   * Models microfacet distribution — determines specular lobe shape
   */
  float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return a2 / max(denom, 0.001);
  }

  /**
   * Schlick-GGX geometry function (specular G term)
   * Models self-shadowing and masking of microfacets
   */
  float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
  }

  float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx1 = GeometrySchlickGGX(NdotV, roughness);
    float ggx2 = GeometrySchlickGGX(NdotL, roughness);
    return ggx1 * ggx2;
  }

  /**
   * Fresnel-Schlick approximation (specular F term)
   * Models how reflectance increases at grazing angles
   */
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
  }

  void main() {
    // Construct TBN matrix for tangent-space calculations
    vec3 N = normalize(vNormal);
    vec3 T = normalize(vTangent);
    vec3 B = normalize(vBitangent);

    // View direction in world space
    vec3 V = normalize(vViewPosition);

    // Transform view direction to tangent space for parallax
    mat3 TBN = mat3(T, B, N);
    vec3 viewDirTangent = normalize(transpose(TBN) * V);

    // Apply parallax occlusion mapping to displace UVs
    vec2 uv = parallaxOcclusionMapping(vUv, viewDirTangent);

    // Sample textures with displaced UVs
    vec3 albedo = texture2D(uDiffuse, uv).rgb;
    float roughness = texture2D(uRoughness, uv).r * uRoughnessScale;
    float ao = texture2D(uAO, uv).r;

    // Perturb normal using the displaced UVs
    vec3 normal = perturbNormal(uv, N, T, B);

    // Directional sun light (matches HDRI environment)
    vec3 sunDir = normalize(vec3(0.5, 1.0, 0.3));
    vec3 sunColor = vec3(1.0, 0.98, 0.95) * 3.0;

    // Ambient lighting (HDRI contribution approximation)
    vec3 ambient = albedo * 0.4 * mix(0.6, 1.0, ao);

    // --- PBR Direct Lighting (Sun) ---
    vec3 L = sunDir;
    vec3 H = normalize(V + L);

    float NdotL = max(dot(normal, L), 0.0);

    // Cook-Torrance BRDF
    float NDF = DistributionGGX(normal, H, roughness);
    float G = GeometrySmith(normal, V, L, roughness);

    // F0 for dielectrics (stone) is ~0.04; metals would be albedo color
    vec3 F0 = mix(vec3(0.04), albedo, uMetalness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

    // Specular component
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(normal, V), 0.0) * NdotL + 0.001;
    vec3 specular = numerator / denominator;

    // Energy conservation: kS + kD = 1 (Fresnel is kS)
    vec3 kD = (vec3(1.0) - F) * (1.0 - uMetalness);

    // Lambertian diffuse
    vec3 diffuse = kD * albedo / PI;

    vec3 directLight = (diffuse + specular) * sunColor * NdotL;

    // Environment reflection (simplified — assumes HDRI is available via envMap)
    // In full PBR, we'd sample a pre-filtered environment map here
    vec3 R = reflect(-V, normal);
    vec3 envReflection = F * uEnvMapIntensity * 0.5; // Placeholder — R3F will provide envMap

    // Combine lighting
    vec3 color = ambient + directLight + envReflection;

    // Apply ambient occlusion to reduce lighting in crevices
    color *= mix(1.0 - uAOIntensity, 1.0, ao);

    gl_FragColor = vec4(color, 1.0);
  }
`;
