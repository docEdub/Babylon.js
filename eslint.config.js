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
    eslintPluginJest.configs["flat/recommended"],

    // ===========================================
    // TypeScript files override
    // ===========================================
    {
        files: ["packages/**/src/**/*.ts", "packages/**/src/**/*.tsx"],
        extends: [...tseslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            // babylonjs/available rule
            "babylonjs/available": [
                "warn",
                {
                    contexts: [
                        'PropertyDefinition:not([accessibility="private"]):not([accessibility="protected"])',
                        'MethodDefinition:not([accessibility="private"]):not([accessibility="protected"])',
                    ],
                },
            ],

            // jsdoc/require-jsdoc rule
            "jsdoc/require-jsdoc": [
                "warn",
                {
                    contexts: [
                        "TSInterfaceDeclaration",
                        "TSPropertySignature",
                        'PropertyDefinition:not([accessibility="private"]):not([accessibility="protected"])',
                        'ArrowFunctionExpression:not([accessibility="private"]):not([accessibility="protected"])',
                        "ClassDeclaration",
                        "ClassExpression",
                        "TSInterfaceDeclaration",
                        'FunctionDeclaration:not([accessibility="private"]):not([accessibility="protected"])',
                    ],
                    publicOnly: true,
                },
            ],

            // Disabled recommended rules
            "prefer-rest-params": "off",
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-enum-comparison": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/no-base-to-string": "off",
            "@typescript-eslint/restrict-plus-operands": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unsafe-declaration-merging": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-unnecessary-type-constraint": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-array-delete": "off",
            "@typescript-eslint/no-implied-eval": "off",
            "@typescript-eslint/no-duplicate-enum-values": "off",
            "@typescript-eslint/only-throw-error": "off",
            "@typescript-eslint/no-for-in-array": "off",
            "@typescript-eslint/no-deprecated": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",

            // Async/Promise rules
            "@typescript-eslint/promise-function-async": "error",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksConditionals: false,
                    checksVoidReturn: {
                        arguments: false,
                        attributes: false,
                    },
                },
            ],
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/return-await": ["error", "always"],
            "no-await-in-loop": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/prefer-promise-reject-errors": "error",
            "require-atomic-updates": "warn",
            "github/no-then": "error",

            // Other TypeScript rules
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/consistent-type-imports": ["error", { disallowTypeAnnotations: false, fixStyle: "separate-type-imports" }],
            "@typescript-eslint/no-this-alias": "error",

            // Restricted syntax
            "no-restricted-syntax": [
                "error",
                {
                    selector: "FunctionDeclaration[async=false][id.name=/Async$/]",
                    message: "Function ending in 'Async' must be declared async",
                },
                {
                    selector: "MethodDefinition[value.async=false][key.name=/Async$/]",
                    message: "Method ending in 'Async' must be declared async",
                },
                {
                    selector: "Property[value.type=/FunctionExpression$/][value.async=false][key.name=/Async$/]",
                    message: "Function ending in 'Async' must be declared async",
                },
                {
                    selector: "VariableDeclarator[init.type=/FunctionExpression$/][init.async=false][id.name=/Async$/]",
                    message: "Function ending in 'Async' must be declared async",
                },
                {
                    selector: "VariableDeclarator[init.type=/FunctionExpression$/][init.async=true][id.name!=/Async$/]",
                    message: "Async function name must end in 'Async'",
                },
            ],

            // Import restrictions for TypeScript
            "@typescript-eslint/no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["**/index"],
                            message: "Do not import from index files",
                            allowTypeImports: true,
                        },
                    ],
                },
            ],

            "import/no-internal-modules": [
                "error",
                {
                    forbid: ["**/"],
                },
            ],

            // Naming conventions (placeholder - full content in Task 15)
            "@typescript-eslint/naming-convention": ["error", { selector: "default", format: ["strictCamelCase"] }],
        },
    }
);
