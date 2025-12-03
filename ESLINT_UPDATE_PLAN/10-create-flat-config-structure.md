# Task 10: Create Flat Config Structure

## Objective

Create the new `eslint.config.js` file with the basic structure and global ignores.

## Background

ESLint 9 uses a "flat config" format where configuration is an array of config objects exported from `eslint.config.js`. This replaces the legacy `.eslintrc.js` format.

## File to Create

`/eslint.config.js` (at repository root)

## Checklist

### 1. Create the file with imports

- [ ] Create `eslint.config.js` at the repository root
- [ ] Add required imports at the top

### 2. Add global ignores

- [ ] Convert patterns from `.eslintignore` or the ignore configuration

### 3. Add the abbreviations array

- [ ] Copy the abbreviations array from `.eslintrc.js`

### 4. Set up the basic export structure

- [ ] Export using `tseslint.config()` helper

## File Content

Create `/eslint.config.js` with this content:

```javascript
// @ts-check
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginJest from "eslint-plugin-jest";
import eslintPluginJsdoc from "eslint-plugin-jsdoc";
import eslintPluginGithub from "eslint-plugin-github";
import eslintPluginImport from "eslint-plugin-import";
import babylonjsPlugin from "./packages/tools/eslintBabylonPlugin/dist/index.js";

// Allowed abbreviations for naming conventions (copied from .eslintrc.js)
const abbreviations = [
    "[XYZ][A-Z][a-z]",
    "HTML",
    "UI",
    "LOD",
    "XR",
    "PBR",
    "IBL",
    "HDR",
    "FFT",
    "CB",
    "RTW",
    "SSR",
    "RHS",
    "LHS",
    "LTC",
    "CDN",
    "ARIA",
    "IES",
    "RLE",
    "SSAO",
    "NME",
    "NGE",
    "SMAA",
    "RT",
    "TAA",
    "PT",
    "PP",
    "GI",
    "GBuffer",
    "[Bb]lur[XY]",
    "upsampling[XY]",
    "RSM",
    "DoF",
    "MSAA",
    "FXAA",
    "TBN",
    "GPU",
    "CPU",
    "FPS",
    "CSS",
    "MP3",
    "OGG",
    "HRTF",
    "JSON",
    "ZOffset",
    "IK",
    "UV",
    "[XYZ]Axis",
    "VR",
    "axis[XYZ]",
    "UBO",
    "URL",
    "RGB",
    "RGBD",
    "GL",
    "[23]D",
    "MRT",
    "RTT",
    "WGSL",
    "GLSL",
    "OS",
    "NDCH",
    "CSM",
    "POT",
    "DOM",
    "WASM",
    "BRDF",
    "wheel[XYZ]",
    "PLY",
    "STL",
    "[AB]Texture",
    "CSG",
    "DoN",
    "RAW",
    "ZIP",
    "PIZ",
    "VAO",
    "JS",
    "DB",
    "XHR",
    "POV",
    "BABYLON",
    "HSV",
    "[VUW](Offset|Rotation|Scale|Ang)",
    "DDS",
    "NaN",
    "SVG",
    "MRDL",
    "MTL",
    "OBJ",
    "SPLAT",
    "PLY",
    "glTF",
    "GLTF",
    "MSFT",
    "MSC",
    "QR",
    "BGR",
    "SFE",
    "BVH",
];

// Join abbreviations into regex string for naming convention rules
const allowedNonStrictAbbreviations = abbreviations.join("|");

export default tseslint.config(
    // ===========================================
    // Global ignores (replaces .eslintignore)
    // ===========================================
    {
        ignores: [
            // Build outputs
            "dist/**",
            "**/dist/**",
            ".snapshot/**",

            // Test files (handled separately or not linted)
            "**/tests/**",

            // Generated shader files
            "**/Shaders/**/*.ts",
            "**/ShadersWGSL/**/*.ts",
            "**/*.fragment.ts",
            "**/*.vertex.ts",

            // Public/LTS packages (generated)
            "packages/public/**",
            "packages/lts/**",

            // Non-JS files
            "**/*.md",
            "**/*.fx",
            "**/*.scss",
            "**/*.css",
            "**/*.html",

            // Config files at root
            "*.config.js",
            "*.config.ts",
            ".eslintrc.js",

            // Node modules
            "node_modules/**",
            "**/node_modules/**",
        ],
    }

    // Placeholder for additional configuration objects
    // These will be added in subsequent tasks
);
```

## Success Criteria

- [ ] File `eslint.config.js` exists at repository root
- [ ] All imports are present and correct
- [ ] Abbreviations array is copied from `.eslintrc.js`
- [ ] Global ignores are defined
- [ ] File has valid JavaScript/ESM syntax
- [ ] File uses `export default` (ESM format)

## Testing

```bash
# Verify file exists
ls -la eslint.config.js

# Check syntax is valid (this will fail until config is complete, but should parse)
node --check eslint.config.js

# Alternatively, try to import the module
node -e "import('./eslint.config.js').then(c => console.log('Config loaded, length:', c.default.length))"
```

Expected output (once imports are available):

```
Config loaded, length: 1
```

(The length will be 1 because we only have the ignores config object so far)

## Notes

- The file uses ESM (`import`/`export`) format
- The `// @ts-check` comment enables TypeScript checking in VS Code
- The `tseslint.config()` helper provides better TypeScript support
- Additional configuration objects will be added in Tasks 11-15
- The ignores patterns may need adjustment based on actual project structure

## Import Notes

If any import fails:

- Check that the package is installed (`npm ls <package>`)
- Some packages may need different import paths for flat config
- The babylonjs plugin import path assumes it's been built

## Next Steps

Tasks 11-15 will add:

- Global language options (env → globals)
- Parser configuration
- Plugin registrations
- Extended configurations
- Rule definitions
