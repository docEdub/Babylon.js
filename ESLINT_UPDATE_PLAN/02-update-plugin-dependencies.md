# Task 02: Update Plugin Dependencies

## Objective

Update the `package.json` dependencies for the custom `eslint-plugin-babylonjs` plugin to support ESLint 9.

## Background

The custom ESLint plugin is located at `packages/tools/eslintBabylonPlugin/`. It needs updated type definitions and peer dependencies to work with ESLint 9.

## File to Modify

`/packages/tools/eslintBabylonPlugin/package.json`

## Current State

```json
{
    "name": "eslint-plugin-babylonjs",
    "private": true,
    "version": "1.0.0",
    "description": "An ESLint plugin that validates TypeScript doc comments for the babylon repository",
    "keywords": ["TypeScript", "documentation", "doc", "comments", "JSDoc", "TSDoc", "ESLint", "plugin"],
    "license": "Apache-2.0",
    "main": "dist/index.js",
    "typings": "dist/index.d.ts",
    "scripts": {
        "build": "tsc -b tsconfig.build.json"
    },
    "dependencies": {
        "@microsoft/tsdoc": "~0.14.1",
        "@microsoft/tsdoc-config": "~0.16.1"
    },
    "devDependencies": {
        "@types/eslint": "^8.56.10"
    }
}
```

## Checklist

### 1. Update `@types/eslint`

- [ ] Change `"@types/eslint": "^8.56.10"` to `"@types/eslint": "^9.6.0"`

### 2. Add peer dependencies

- [ ] Add a `peerDependencies` section with ESLint 9 requirement:

```json
"peerDependencies": {
    "eslint": ">=9.0.0"
}
```

## Target State

```json
{
    "name": "eslint-plugin-babylonjs",
    "private": true,
    "version": "1.0.0",
    "description": "An ESLint plugin that validates TypeScript doc comments for the babylon repository",
    "keywords": ["TypeScript", "documentation", "doc", "comments", "JSDoc", "TSDoc", "ESLint", "plugin"],
    "license": "Apache-2.0",
    "main": "dist/index.js",
    "typings": "dist/index.d.ts",
    "scripts": {
        "build": "tsc -b tsconfig.build.json"
    },
    "dependencies": {
        "@microsoft/tsdoc": "~0.14.1",
        "@microsoft/tsdoc-config": "~0.16.1"
    },
    "devDependencies": {
        "@types/eslint": "^9.6.0"
    },
    "peerDependencies": {
        "eslint": ">=9.0.0"
    }
}
```

## Success Criteria

- [ ] `@types/eslint` version is updated to `^9.6.0`
- [ ] `peerDependencies` section exists with `"eslint": ">=9.0.0"`
- [ ] JSON is valid (no syntax errors)
- [ ] File can be parsed by npm (run `npm run build -w eslint-plugin-babylonjs` after root dependencies are updated)

## Testing

After making changes:

1. Validate JSON syntax:

```bash
node -e "JSON.parse(require('fs').readFileSync('packages/tools/eslintBabylonPlugin/package.json'))"
```

2. After root ESLint is updated (Task 07), verify the plugin builds:

```bash
npm run build -w eslint-plugin-babylonjs
```

Note: The plugin build may show TypeScript errors until the deprecated API changes are made in Task 03. This is expected.

## Notes

- The `@types/eslint@^9.6.0` package provides updated TypeScript definitions for ESLint 9
- The peer dependency declaration helps npm/yarn warn about incompatible ESLint versions
- This task should be completed before updating the plugin source code
