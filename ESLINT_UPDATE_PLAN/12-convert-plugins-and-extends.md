# Task 12: Convert Plugins and Extends

## Objective

Convert the `plugins` array and `extends` array from legacy config to flat config format.

## Background

In ESLint 9 flat config:

- `plugins` changes from an array of strings to an object with plugin references
- `extends` is replaced by spreading config arrays

## File to Modify

`/eslint.config.js`

## Legacy Configuration (from .eslintrc.js)

```javascript
{
    plugins: [
        "prettier",
        "jest",
        "babylonjs",
        "jsdoc",
        "github",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:jest/recommended",
        "plugin:prettier/recommended",
    ],
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
}
```

## Checklist

### 1. Add plugins object

- [ ] Create a config object with `plugins` property
- [ ] Register all plugins as key-value pairs

### 2. Add settings

- [ ] Add `settings` object for react and jsdoc configurations

### 3. Handle extended configs

Note: Most extended configs are already handled:

- `eslint:recommended` → `js.configs.recommended` (added in Task 11)
- `plugin:prettier/recommended` → `eslintPluginPrettier` (added in Task 11)
- TypeScript configs will be added in Task 13 (override-specific)
- Import and Jest configs need to be added

## Code to Add

Add this configuration object after the language options in `eslint.config.js`:

```javascript
export default tseslint.config(
    // ... previous configs (ignores, recommended, prettier, language options)

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
    // Import plugin configs
    // ===========================================
    // Note: Check if these work with your version of eslint-plugin-import
    // If using eslint-plugin-import-x, the syntax may differ

    // ===========================================
    // Jest plugin config
    // ===========================================
    eslintPluginJest.configs["flat/recommended"]
);
```

## Plugin Registration Reference

| Legacy (string) | Flat Config (object)                                    |
| --------------- | ------------------------------------------------------- |
| `"prettier"`    | Handled via `eslint-plugin-prettier/recommended` import |
| `"jest"`        | `jest: eslintPluginJest`                                |
| `"babylonjs"`   | `babylonjs: babylonjsPlugin`                            |
| `"jsdoc"`       | `jsdoc: eslintPluginJsdoc`                              |
| `"github"`      | `github: eslintPluginGithub`                            |
| `"import"`      | `import: eslintPluginImport`                            |

## Extends Conversion Reference

| Legacy Extends                                                    | Flat Config Equivalent                              |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| `"eslint:recommended"`                                            | `js.configs.recommended`                            |
| `"plugin:@typescript-eslint/eslint-recommended"`                  | Part of `tseslint.configs.recommended`              |
| `"plugin:@typescript-eslint/recommended"`                         | `...tseslint.configs.recommended`                   |
| `"plugin:@typescript-eslint/recommended-requiring-type-checking"` | `...tseslint.configs.recommendedTypeChecked`        |
| `"plugin:import/errors"`                                          | Handled in rules or via flat config if available    |
| `"plugin:import/warnings"`                                        | Handled in rules or via flat config if available    |
| `"plugin:import/typescript"`                                      | Handled in rules or via flat config if available    |
| `"plugin:jest/recommended"`                                       | `eslintPluginJest.configs["flat/recommended"]`      |
| `"plugin:prettier/recommended"`                                   | `eslintPluginPrettier` (imported from /recommended) |

## Import Plugin Note

The `eslint-plugin-import` may not have full flat config support. Options:

1. **Use available flat configs** (if supported):

```javascript
// Check if these exist in your version
eslintPluginImport.flatConfigs?.errors,
eslintPluginImport.flatConfigs?.warnings,
```

2. **Configure rules manually** instead of using extends (fallback):

```javascript
{
    rules: {
        "import/no-unresolved": "off",
        "import/named": "error",
        "import/no-cycle": [1, { maxDepth: 1, ignoreExternal: true }],
        // ... other import rules
    }
}
```

3. **Use `eslint-plugin-import-x`** which has better flat config support

## Success Criteria

- [ ] All plugins are registered in the `plugins` object
- [ ] Settings for react and jsdoc are defined
- [ ] Jest recommended config is included
- [ ] Import rules are handled (either via flat config or manual rules)
- [ ] File syntax is valid

## Testing

```bash
# Check syntax
node --check eslint.config.js

# Try to load and verify config
node -e "
import('./eslint.config.js').then(c => {
    console.log('Config objects:', c.default.length);
    const withPlugins = c.default.find(cfg => cfg.plugins);
    if (withPlugins) {
        console.log('Registered plugins:', Object.keys(withPlugins.plugins));
    }
})
"
```

Expected output should show the registered plugins: `babylonjs`, `jsdoc`, `github`, `import`, `jest`.

## Notes

- Plugin names in the object can be any string, but conventionally match the npm package suffix
- The prettier plugin is handled differently (via `/recommended` import)
- Some plugins may need `@eslint/eslintrc` FlatCompat if they don't support flat config natively
- If import plugin causes issues, it can be configured via rules only (see Task 15)
