# ESLint 8 to ESLint 9 Migration Guide

This document outlines the steps required to migrate the Babylon.js project from ESLint 8.57.1 to ESLint 9.39.1. The migration involves updating the custom `eslint-plugin-babylonjs` plugin and converting the project configuration from the legacy `.eslintrc.js` format to the new flat config format (`eslint.config.js`).

## Table of Contents

1. [Overview of Changes](#overview-of-changes)
2. [Phase 1: Research & Preparation](#phase-1-research--preparation)
3. [Phase 2: Update Custom ESLint Plugin](#phase-2-update-custom-eslint-plugin)
4. [Phase 3: Update Root Dependencies](#phase-3-update-root-dependencies)
5. [Phase 4: Convert Configuration to Flat Config](#phase-4-convert-configuration-to-flat-config)
6. [Phase 5: Testing & Validation](#phase-5-testing--validation)
7. [Phase 6: Cleanup](#phase-6-cleanup)
8. [Reference: API Changes](#reference-api-changes)
9. [Reference: Plugin Compatibility](#reference-plugin-compatibility)

---

## Overview of Changes

### Current State

- **ESLint Version**: 8.57.1
- **Config Format**: Legacy `.eslintrc.js` (CommonJS)
- **Custom Plugin**: `eslint-plugin-babylonjs` with 5 rules
- **Plugin Export**: CommonJS (`export = plugin`)

### Target State

- **ESLint Version**: 9.39.1
- **Config Format**: Flat config `eslint.config.js` (ESM or CommonJS)
- **Custom Plugin**: Updated for ESLint 9 compatibility
- **Plugin Export**: Updated with `meta` object

### Key Breaking Changes in ESLint 9

1. Configuration format changed from `.eslintrc.*` to `eslint.config.js`
2. `env` replaced with `globals` package
3. `extends` replaced with config array spreading
4. `plugins` now import plugins directly as objects
5. Several `context` API methods deprecated
6. Rule meta structure recommendations updated

---

## Phase 1: Research & Preparation

### 1.1 Check Plugin Compatibility

- [ ] **Check `@typescript-eslint/*` compatibility**

    - Current: `^8.29.0`
    - Required: Verify ESLint 9 support (v8+ supports ESLint 9)
    - Action: Check [typescript-eslint releases](https://github.com/typescript-eslint/typescript-eslint/releases)

- [ ] **Check `eslint-plugin-prettier` compatibility**

    - Current: `~5.0.0`
    - Required: v5.0.0+ supports ESLint 9
    - Action: Verify flat config support

- [ ] **Check `eslint-plugin-jest` compatibility**

    - Current: `~28.11.0`
    - Required: v28+ supports ESLint 9
    - Action: Verify flat config support

- [ ] **Check `eslint-plugin-jsdoc` compatibility**

    - Current: `~46.2.6`
    - Required: v48+ fully supports ESLint 9 flat config
    - Action: May need to upgrade to v48+

- [ ] **Check `eslint-plugin-github` compatibility**

    - Current: `5.0.2`
    - Required: Check if flat config is supported
    - Action: Review [eslint-plugin-github](https://github.com/github/eslint-plugin-github)

- [ ] **Check `eslint-plugin-import` compatibility**

    - Current: `~2.26.0`
    - Required: v2.29.0+ has experimental flat config support
    - Alternative: Consider `eslint-plugin-import-x` for better flat config support
    - Action: Decide between upgrading or replacing

- [ ] **Check `eslint-plugin-tsdoc` compatibility**
    - Current: `~0.2.14`
    - Action: Verify ESLint 9 support

### 1.2 Create Backup Branch

- [ ] **Create a dedicated migration branch**

    ```bash
    git checkout -b chore/eslint-9-migration
    ```

- [ ] **Ensure all tests pass before starting migration**
    ```bash
    npm run lint:check
    npm run test
    ```

---

## Phase 2: Update Custom ESLint Plugin

The custom plugin is located at `packages/tools/eslintBabylonPlugin/`.

### 2.1 Update Plugin Dependencies

- [ ] **Update `@types/eslint` in `packages/tools/eslintBabylonPlugin/package.json`**

    - Change from: `"@types/eslint": "^8.56.10"`
    - Change to: `"@types/eslint": "^9.6.0"`

- [ ] **Add `eslint` as a peer dependency** (recommended)
    ```json
    "peerDependencies": {
      "eslint": ">=9.0.0"
    }
    ```

### 2.2 Update Deprecated Context APIs

In `packages/tools/eslintBabylonPlugin/src/index.ts`, update the following deprecated APIs:

#### 2.2.1 Replace `context.getFilename()`

- [ ] **In `syntax` rule (around line 239)**

    - Find: `const sourceFilePath: string = context.getFilename();`
    - Replace with: `const sourceFilePath: string = context.filename;`

- [ ] **In `existing` rule (around line 417)**
    - Find: `const sourceFilePath: string = context.getFilename();`
    - Replace with: `const sourceFilePath: string = context.filename;`

#### 2.2.2 Replace `context.getSourceCode()`

- [ ] **In `syntax` rule (around line 280)**

    - Find: `const sourceCode: eslint.SourceCode = context.getSourceCode();`
    - Replace with: `const sourceCode: eslint.SourceCode = context.sourceCode;`

- [ ] **In `available` rule (around line 355)**

    - Find: `const sourceCode: eslint.SourceCode = context.getSourceCode();`
    - Replace with: `const sourceCode: eslint.SourceCode = context.sourceCode;`

- [ ] **In `existing` rule (around line 430)**
    - Find: `const sourceCode: eslint.SourceCode = context.getSourceCode();`
    - Replace with: `const sourceCode: eslint.SourceCode = context.sourceCode;`

#### 2.2.3 Verify `context.filename` usage in other rules

- [ ] **In `no-cross-package-relative-imports` rule (around line 493)**
    - Already uses `context.filename` ✓ - No change needed

### 2.3 Add Plugin Meta Information (Recommended)

- [ ] **Add `meta` object to the plugin export** in `packages/tools/eslintBabylonPlugin/src/index.ts`

    Update the interface and plugin object:

    ```typescript
    interface IPlugin {
        meta: {
            name: string;
            version: string;
        };
        rules: { [x: string]: eslint.Rule.RuleModule };
    }

    const plugin: IPlugin = {
        meta: {
            name: "eslint-plugin-babylonjs",
            version: "1.0.0",
        },
        rules: {
            // ... existing rules
        },
    };
    ```

### 2.4 Update Rule Meta Schemas (Optional but Recommended)

- [ ] **Add `schema` property to rules that accept options**

    For the `syntax` rule (if it accepts options):

    ```typescript
    meta: {
        // ... existing meta
        schema: [], // empty array if no options
    },
    ```

- [ ] **Add `schema` to `available` rule** (it accepts options via `contexts`)
    ```typescript
    meta: {
        // ... existing meta
        schema: [
            {
                type: "object",
                properties: {
                    contexts: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    ```

### 2.5 Rebuild the Plugin

- [ ] **Rebuild the plugin after making changes**

    ```bash
    npm run build -w eslint-plugin-babylonjs
    ```

- [ ] **Run TypeScript type checking**
    ```bash
    cd packages/tools/eslintBabylonPlugin
    npx tsc --noEmit
    ```

---

## Phase 3: Update Root Dependencies

### 3.1 Update ESLint

- [ ] **Update ESLint version in root `package.json`**
    - Change from: `"eslint": "^8.57.1"`
    - Change to: `"eslint": "^9.39.1"`

### 3.2 Add Required New Dependencies

- [ ] **Add `globals` package** (replaces `env` in flat config)

    ```bash
    npm install --save-dev globals
    ```

- [ ] **Add `@eslint/js`** (provides recommended config for flat config)

    ```bash
    npm install --save-dev @eslint/js
    ```

- [ ] **Add `@eslint/eslintrc`** (optional - for compatibility layer)
    ```bash
    npm install --save-dev @eslint/eslintrc
    ```
    Note: Only needed if using FlatCompat for gradual migration

### 3.3 Update Plugin Dependencies

- [ ] **Update `eslint-plugin-jsdoc`** (if needed for flat config support)

    ```bash
    npm install --save-dev eslint-plugin-jsdoc@^50.0.0
    ```

- [ ] **Update or replace `eslint-plugin-import`**

    Option A: Update to latest with flat config support

    ```bash
    npm install --save-dev eslint-plugin-import@^2.31.0
    ```

    Option B: Replace with `eslint-plugin-import-x` (better flat config support)

    ```bash
    npm uninstall eslint-plugin-import
    npm install --save-dev eslint-plugin-import-x
    ```

### 3.4 Install All Dependencies

- [ ] **Run npm install after all package.json changes**
    ```bash
    npm install
    ```

---

## Phase 4: Convert Configuration to Flat Config

### 4.1 Create New Config File

- [ ] **Create `eslint.config.js`** at the repository root

    Start with this basic structure:

    ```javascript
    import js from "@eslint/js";
    import globals from "globals";
    import tseslint from "typescript-eslint";
    import eslintPluginPrettier from "eslint-plugin-prettier";
    import eslintPluginJest from "eslint-plugin-jest";
    import eslintPluginJsdoc from "eslint-plugin-jsdoc";
    import eslintPluginGithub from "eslint-plugin-github";
    import eslintPluginImport from "eslint-plugin-import";
    import babylonjsPlugin from "eslint-plugin-babylonjs";

    export default [
        // Global ignores (replaces .eslintignore)
        {
            ignores: [
                "dist/**/*.*",
                ".snapshot/**/*.*",
                "**/tests/**/*.*",
                "**/Shaders/**/*.ts",
                "**/ShadersWGSL/**/*.ts",
                "**/*.fragment.ts",
                "**/*.vertex.ts",
                "packages/public/**/*.*",
                "packages/lts/**/*.*",
                "**/*.md",
                "**/*.fx",
                "**/*.scss",
                "**/*.css",
                "**/*.html",
            ],
        },
        // Base config
        js.configs.recommended,
        // ... more configs
    ];
    ```

### 4.2 Convert Global Settings

- [ ] **Convert `env` to `globals`**

    Old (`.eslintrc.js`):

    ```javascript
    env: {
        browser: true,
        node: true,
        jest: true,
    },
    ```

    New (`eslint.config.js`):

    ```javascript
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
        },
    },
    ```

### 4.3 Convert Parser Configuration

- [ ] **Convert `parser` and `parserOptions`**

    Old:

    ```javascript
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
        ecmaFeatures: { jsx: true },
    },
    ```

    New:

    ```javascript
    {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                sourceType: "module",
                ecmaVersion: 2020,
                ecmaFeatures: { jsx: true },
            },
        },
    },
    ```

### 4.4 Convert Plugins

- [ ] **Convert `plugins` array to object**

    Old:

    ```javascript
    plugins: ["prettier", "jest", "babylonjs", "jsdoc", "github"],
    ```

    New:

    ```javascript
    {
        plugins: {
            prettier: eslintPluginPrettier,
            jest: eslintPluginJest,
            babylonjs: babylonjsPlugin,
            jsdoc: eslintPluginJsdoc,
            github: eslintPluginGithub,
        },
    },
    ```

### 4.5 Convert `extends`

- [ ] **Convert `extends` to spread arrays**

    Old:

    ```javascript
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:jest/recommended",
        "plugin:prettier/recommended",
    ],
    ```

    New:

    ```javascript
    export default [
        js.configs.recommended,
        ...tseslint.configs.recommended,
        eslintPluginImport.flatConfigs.errors,
        eslintPluginImport.flatConfigs.warnings,
        eslintPluginImport.flatConfigs.typescript,
        eslintPluginJest.configs["flat/recommended"],
        eslintPluginPrettier.configs.recommended,
        // ... rest of config
    ];
    ```

### 4.6 Convert First Override (TypeScript files)

- [ ] **Convert the TypeScript override block**

    Old:

    ```javascript
    overrides: [
        {
            files: ["packages/**/src/**/*.{ts,tsx}"],
            extends: [...],
            parserOptions: { projectService: true },
            parser: "@typescript-eslint/parser",
            rules: { ... },
        },
    ],
    ```

    New:

    ```javascript
    {
        files: ["packages/**/src/**/*.ts", "packages/**/src/**/*.tsx"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            // ... TypeScript-specific rules
        },
    },
    ```

### 4.7 Convert Second Override (GUI Controls)

- [ ] **Convert the GUI controls override**

    Old:

    ```javascript
    {
        files: ["packages/dev/gui/src/2D/controls/**/*.{ts,tsx}"],
        rules: {
            "babylonjs/require-context-save-before-apply-states": "error",
        },
    },
    ```

    New:

    ```javascript
    {
        files: ["packages/dev/gui/src/2D/controls/**/*.ts", "packages/dev/gui/src/2D/controls/**/*.tsx"],
        rules: {
            "babylonjs/require-context-save-before-apply-states": "error",
        },
    },
    ```

### 4.8 Convert Settings

- [ ] **Convert `settings` to config object property**

    Old:

    ```javascript
    settings: {
        react: { pragma: "h", createClass: "" },
        jsdoc: { ignorePrivate: true, ignoreInternal: true },
    },
    ```

    New:

    ```javascript
    {
        settings: {
            react: { pragma: "h", createClass: "" },
            jsdoc: { ignorePrivate: true, ignoreInternal: true },
        },
    },
    ```

### 4.9 Copy All Rules

- [ ] **Copy the `abbreviations` array** from `.eslintrc.js` to the new config

- [ ] **Copy the `allowedNonStrictAbbreviations` regex construction**

- [ ] **Copy all rules from the `rules` object** to the appropriate config objects

### 4.10 Full Config File Template

- [ ] **Use this template as a starting point** for `eslint.config.js`:

    ```javascript
    // eslint.config.js
    import js from "@eslint/js";
    import globals from "globals";
    import tseslint from "typescript-eslint";
    import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
    import eslintPluginJest from "eslint-plugin-jest";
    import eslintPluginJsdoc from "eslint-plugin-jsdoc";
    import eslintPluginGithub from "eslint-plugin-github";
    import eslintPluginImport from "eslint-plugin-import";
    import babylonjsPlugin from "./packages/tools/eslintBabylonPlugin/dist/index.js";

    // Copy the abbreviations array from .eslintrc.js
    const abbreviations = [
        "[XYZ][A-Z][a-z]",
        "HTML",
        // ... rest of abbreviations
    ];
    const allowedNonStrictAbbreviations = abbreviations.join("|");

    export default tseslint.config(
        // Global ignores
        {
            ignores: [
                "dist/**",
                ".snapshot/**",
                "**/tests/**",
                "**/Shaders/**/*.ts",
                "**/ShadersWGSL/**/*.ts",
                "**/*.fragment.ts",
                "**/*.vertex.ts",
                "packages/public/**",
                "packages/lts/**",
                "**/*.md",
                "**/*.fx",
                "**/*.scss",
                "**/*.css",
                "**/*.html",
            ],
        },

        // Base configs
        js.configs.recommended,
        eslintPluginPrettier,

        // Global language options
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
                    ecmaFeatures: { jsx: true },
                },
            },
            plugins: {
                babylonjs: babylonjsPlugin,
                jsdoc: eslintPluginJsdoc,
                github: eslintPluginGithub,
                import: eslintPluginImport,
                jest: eslintPluginJest,
            },
            settings: {
                react: { pragma: "h", createClass: "" },
                jsdoc: { ignorePrivate: true, ignoreInternal: true },
            },
            rules: {
                // Global rules from .eslintrc.js
            },
        },

        // TypeScript files override
        {
            files: ["packages/**/src/**/*.ts", "packages/**/src/**/*.tsx"],
            extends: [...tseslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
            languageOptions: {
                parserOptions: {
                    projectService: true,
                },
            },
            rules: {
                // TypeScript-specific rules from .eslintrc.js
            },
        },

        // GUI controls override
        {
            files: ["packages/dev/gui/src/2D/controls/**/*.ts", "packages/dev/gui/src/2D/controls/**/*.tsx"],
            rules: {
                "babylonjs/require-context-save-before-apply-states": "error",
            },
        }
    );
    ```

---

## Phase 5: Testing & Validation

### 5.1 Run Linting

- [ ] **Run ESLint with the new config**

    ```bash
    npm run lint:check
    ```

- [ ] **Compare output with old config** (if needed, temporarily rename files)

    ```bash
    # Run with old config
    mv eslint.config.js eslint.config.js.new
    npm run lint:check > old-lint-output.txt 2>&1

    # Run with new config
    mv eslint.config.js.new eslint.config.js
    rm .eslintrc.js  # or rename
    npm run lint:check > new-lint-output.txt 2>&1

    # Compare
    diff old-lint-output.txt new-lint-output.txt
    ```

### 5.2 Test Each Custom Rule

- [ ] **Test `babylonjs/syntax` rule**

    - Create a test file with invalid TSDoc
    - Verify the rule reports correctly

- [ ] **Test `babylonjs/available` rule**

    - Create a test file with missing documentation
    - Verify the rule reports correctly

- [ ] **Test `babylonjs/no-cross-package-relative-imports` rule**

    - Create a cross-package relative import
    - Verify the rule reports and auto-fix works

- [ ] **Test `babylonjs/require-context-save-before-apply-states` rule**
    - Create a test file in GUI controls path
    - Add `_applyStates` without `save()`
    - Verify the rule reports correctly

### 5.3 Run Full Test Suite

- [ ] **Run all project tests**

    ```bash
    npm run test
    ```

- [ ] **Run visualization tests**
    ```bash
    npm run test:visualization
    ```

### 5.4 Test CI Linting

- [ ] **Test the CI linting command**
    ```bash
    npm run lint:check-ci
    ```
    Note: Verify `eslint-formatter-azure-devops` works with ESLint 9

---

## Phase 6: Cleanup

### 6.1 Remove Old Config Files

- [ ] **Delete `.eslintrc.js`** after verifying new config works

- [ ] **Delete `.eslintignore`** (ignores are now in `eslint.config.js`)

### 6.2 Update Documentation

- [ ] **Update any documentation** that references `.eslintrc.js`

- [ ] **Update contributing guide** if it mentions ESLint configuration

### 6.3 Update CI/CD

- [ ] **Verify CI/CD pipelines** work with the new config

- [ ] **Update any ESLint-related CI scripts** if needed

### 6.4 Commit and Create PR

- [ ] **Commit all changes**

    ```bash
    git add -A
    git commit -m "chore: migrate to ESLint 9 with flat config"
    ```

- [ ] **Create pull request** for review

---

## Reference: API Changes

### Deprecated Context Methods

| Deprecated (ESLint 8)           | Replacement (ESLint 9)              |
| ------------------------------- | ----------------------------------- |
| `context.getFilename()`         | `context.filename`                  |
| `context.getSourceCode()`       | `context.sourceCode`                |
| `context.getPhysicalFilename()` | `context.physicalFilename`          |
| `context.getCwd()`              | `context.cwd`                       |
| `context.parserServices`        | `context.sourceCode.parserServices` |

### Rule Meta Changes

ESLint 9 recommends (but doesn't require) including:

- `meta.schema` - JSON Schema for rule options
- `meta.hasSuggestions` - If rule provides suggestions
- `meta.defaultOptions` - Default values for options

### SourceCode Method Changes

| Deprecated                     | Replacement                                                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `sourceCode.getComments(node)` | `sourceCode.getCommentsBefore(node)` / `sourceCode.getCommentsAfter(node)` / `sourceCode.getCommentsInside(node)` |

---

## Reference: Plugin Compatibility

### Known Compatible Plugins (ESLint 9)

| Plugin                   | Min Version for ESLint 9 | Flat Config Support      |
| ------------------------ | ------------------------ | ------------------------ |
| `@typescript-eslint/*`   | v8.0.0+                  | Yes                      |
| `eslint-plugin-prettier` | v5.0.0+                  | Yes                      |
| `eslint-plugin-jest`     | v28.0.0+                 | Yes (`flat/recommended`) |
| `eslint-plugin-jsdoc`    | v48.0.0+                 | Yes                      |
| `eslint-plugin-import`   | v2.29.0+                 | Partial                  |
| `eslint-plugin-import-x` | v0.5.0+                  | Yes                      |

### Plugins Requiring Research

| Plugin                          | Current Version | Action Needed       |
| ------------------------------- | --------------- | ------------------- |
| `eslint-plugin-github`          | 5.0.2           | Check compatibility |
| `eslint-plugin-tsdoc`           | ~0.2.14         | Check compatibility |
| `eslint-formatter-azure-devops` | ^1.2.0          | Check compatibility |

---

## Troubleshooting

### Common Issues

1. **"ESLint couldn't find the config"**

    - Ensure `eslint.config.js` is in the repository root
    - Check file extension (must be `.js`, `.mjs`, or `.cjs`)

2. **"Plugin not found"**

    - Plugins must be imported, not strings
    - Check import paths are correct

3. **"Invalid config"**

    - Flat config uses arrays, not objects
    - Check that all config objects have valid properties

4. **"Cannot use 'extends' in flat config"**

    - Replace `extends` with spread operator
    - Import configs and spread them: `...tseslint.configs.recommended`

5. **TypeScript errors after updating @types/eslint**
    - Some rule types may have changed
    - Check the [ESLint 9 migration guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)

---

## Resources

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [ESLint Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [typescript-eslint Flat Config](https://typescript-eslint.io/getting-started/typed-linting)
- [ESLint Rule Context API](https://eslint.org/docs/latest/extend/custom-rules#the-context-object)
