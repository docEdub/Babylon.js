// @ts-check
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
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
    },

    // ===========================================
    // Base recommended configurations
    // ===========================================
    js.configs.recommended,
    eslintConfigPrettier,

    // ===========================================
    // Global language options
    // ===========================================
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
            parser: tseslint.parser,
            parserOptions: {
                sourceType: "module",
                ecmaVersion: 2020,
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            prettier: eslintPluginPrettier,
        },
        rules: {
            "prettier/prettier": "error",
            "arrow-body-style": "off",
            "prefer-arrow-callback": "off",
        },
    },

    // ===========================================
    // Plugin registrations and settings
    // ===========================================
    {
        plugins: {
            babylonjs: babylonjsPlugin,
            jsdoc: eslintPluginJsdoc,
            github: eslintPluginGithub,
            import: eslintPluginImport,
            jest: eslintPluginJest,
        },
        settings: {
            react: {
                pragma: "h",
                createClass: "",
            },
            jsdoc: {
                ignorePrivate: true,
                ignoreInternal: true,
            },
        },
    },

    // ===========================================
    // Jest plugin config
    // ===========================================
    eslintPluginJest.configs["flat/recommended"]
);
