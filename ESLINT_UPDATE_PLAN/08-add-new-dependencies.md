# Task 08: Add New Required Dependencies

## Objective

Add the new packages required for ESLint 9 flat config: `globals` and `@eslint/js`.

## Background

ESLint 9's flat config format requires:

- `globals` - Provides global variable definitions (replaces `env` in legacy config)
- `@eslint/js` - Provides ESLint's recommended configuration for flat config

Optional:

- `@eslint/eslintrc` - Provides `FlatCompat` for gradual migration (may not be needed)

## File to Modify

`/package.json`

## Checklist

### 1. Add `globals` package

- [ ] Add to `devDependencies`:

```json
"globals": "^16.0.0"
```

### 2. Add `@eslint/js` package

- [ ] Add to `devDependencies`:

```json
"@eslint/js": "^9.18.0"
```

### 3. Optionally add `@eslint/eslintrc` (for compatibility layer)

- [ ] Consider adding if gradual migration is needed:

```json
"@eslint/eslintrc": "^3.2.0"
```

Note: This may not be necessary if doing a full migration.

## Target Changes

Add these entries to the `devDependencies` section in `/package.json`:

```json
{
    "devDependencies": {
        // ... existing dependencies ...
        "@eslint/js": "^9.18.0",
        "globals": "^16.0.0"
        // ... rest of dependencies ...
    }
}
```

Keep dependencies in alphabetical order if the existing file follows that convention.

## Recommended Placement

Looking at the existing package.json structure, add:

- `@eslint/js` after `@alex_neo/jest-expect-message` (or with other @-scoped packages)
- `globals` in alphabetical order (after `glob`)

## Success Criteria

- [ ] `@eslint/js` is added with version `^9.18.0`
- [ ] `globals` is added with version `^16.0.0`
- [ ] JSON is valid (no syntax errors)
- [ ] Dependencies are in logical order (alphabetical preferred)

## Testing

Validate JSON syntax:

```bash
# Check JSON is valid
node -e "JSON.parse(require('fs').readFileSync('package.json'))"

# Verify the packages are added
grep -E '"@eslint/js"|"globals"' package.json
```

Expected output:

```
    "@eslint/js": "^9.18.0",
    "globals": "^16.0.0",
```

## Package Purposes

### `globals`

Provides predefined global variables for different environments:

```javascript
import globals from "globals";

// In eslint.config.js:
{
    languageOptions: {
        globals: {
            ...globals.browser,  // window, document, etc.
            ...globals.node,     // process, __dirname, etc.
            ...globals.jest,     // jest, expect, describe, etc.
        }
    }
}
```

### `@eslint/js`

Provides ESLint's recommended rules configuration:

```javascript
import js from "@eslint/js";

// In eslint.config.js:
export default [
    js.configs.recommended,
    // ... other configs
];
```

## Post-Task Actions

After completing Tasks 07, 08, and 09:

```bash
npm install
```

## Notes

- The `globals` package version ^16.0.0 is compatible with ESLint 9
- `@eslint/js` version should match or be compatible with ESLint version
- These packages are small and have minimal impact on install size
