# Task 11: Convert Global Settings

## Objective

Add global language options to `eslint.config.js`, converting the `env`, `parser`, and `parserOptions` from the legacy config.

## Background

In ESLint 9 flat config:

- `env` is replaced by `languageOptions.globals` using the `globals` package
- `parser` moves to `languageOptions.parser`
- `parserOptions` moves to `languageOptions.parserOptions`

## File to Modify

`/eslint.config.js`

## Legacy Configuration (from .eslintrc.js)

```javascript
{
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        node: true,
        jest: true,
    },
}
```

## Checklist

### 1. Add base ESLint recommended config

- [ ] Add `js.configs.recommended` after the ignores block

### 2. Add prettier config

- [ ] Add `eslintPluginPrettier` for prettier integration

### 3. Add global language options

- [ ] Create a config object with `languageOptions`
- [ ] Add globals for browser, node, and jest environments
- [ ] Add parser configuration
- [ ] Add parserOptions

## Code to Add

Add these configuration objects after the ignores block in `eslint.config.js`:

```javascript
export default tseslint.config(
    // Global ignores
    {
        ignores: [
            // ... existing ignores
        ],
    },

    // ===========================================
    // Base recommended configurations
    // ===========================================
    js.configs.recommended,
    eslintPluginPrettier,

    // ===========================================
    // Global language options
    // ===========================================
    {
        languageOptions: {
            // Global variables (replaces 'env')
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
            },
            // Parser configuration
            parser: tseslint.parser,
            parserOptions: {
                sourceType: "module",
                ecmaVersion: 2020,
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    }
);
```

## Full File Structure After This Task

```javascript
// @ts-check
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
// ... other imports

const abbreviations = [
    /* ... */
];
const allowedNonStrictAbbreviations = abbreviations.join("|");

export default tseslint.config(
    // Global ignores
    {
        ignores: [
            /* ... */
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
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    }

    // Placeholder for plugins, settings, rules (Tasks 12-15)
);
```

## Conversion Reference

| Legacy Config                         | Flat Config Equivalent                             |
| ------------------------------------- | -------------------------------------------------- |
| `root: true`                          | Not needed (implicit at eslint.config.js location) |
| `env.browser: true`                   | `languageOptions.globals: { ...globals.browser }`  |
| `env.node: true`                      | `languageOptions.globals: { ...globals.node }`     |
| `env.jest: true`                      | `languageOptions.globals: { ...globals.jest }`     |
| `parser: "@typescript-eslint/parser"` | `languageOptions.parser: tseslint.parser`          |
| `parserOptions: {...}`                | `languageOptions.parserOptions: {...}`             |

## Success Criteria

- [ ] `js.configs.recommended` is added
- [ ] `eslintPluginPrettier` is added
- [ ] `languageOptions.globals` includes browser, node, and jest globals
- [ ] `languageOptions.parser` is set to `tseslint.parser`
- [ ] `languageOptions.parserOptions` includes sourceType, ecmaVersion, and ecmaFeatures
- [ ] File syntax is valid

## Testing

```bash
# Check syntax
node --check eslint.config.js

# Try to load the config
node -e "import('./eslint.config.js').then(c => console.log('Config objects:', c.default.length))"
```

After this task, the config should have 3+ objects (ignores, recommended, prettier, language options).

## Notes

- The `globals` spread operator merges all global variables from each environment
- `tseslint.parser` is the recommended way to reference the TypeScript parser in flat config
- The `root: true` option is not needed in flat config - ESLint automatically stops at the config file location
- Additional environments can be added by spreading more `globals.*` objects
