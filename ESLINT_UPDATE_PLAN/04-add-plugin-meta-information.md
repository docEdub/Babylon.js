# Task 04: Add Plugin Meta Information

## Objective

Add a `meta` object to the plugin export in `eslint-plugin-babylonjs` to comply with ESLint 9 best practices.

## Background

ESLint 9 recommends (but doesn't strictly require) that plugins include a `meta` object with `name` and `version` properties. This helps with debugging and tooling integration.

## File to Modify

`/packages/tools/eslintBabylonPlugin/src/index.ts`

## Current State

The plugin currently defines an interface and exports without meta information:

```typescript
interface IPlugin {
    rules: { [x: string]: eslint.Rule.RuleModule };
}

const plugin: IPlugin = {
    rules: {
        syntax: { ... },
        available: { ... },
        existing: { ... },
        "no-cross-package-relative-imports": { ... },
        "require-context-save-before-apply-states": { ... },
    },
};

export = plugin;
```

## Checklist

### 1. Update the IPlugin interface

- [ ] Find the `IPlugin` interface definition (around line 22-24):

```typescript
interface IPlugin {
    rules: { [x: string]: eslint.Rule.RuleModule };
}
```

- [ ] Update to include meta:

```typescript
interface IPlugin {
    meta: {
        name: string;
        version: string;
    };
    rules: { [x: string]: eslint.Rule.RuleModule };
}
```

### 2. Add meta object to plugin export

- [ ] Find the `const plugin: IPlugin = {` declaration (around line 218)
- [ ] Add the `meta` property at the beginning of the object:

```typescript
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

## Target Code

After changes, the plugin definition should look like:

```typescript
interface IPlugin {
    meta: {
        name: string;
        version: string;
    };
    rules: { [x: string]: eslint.Rule.RuleModule };
}

// ... (other code)

const plugin: IPlugin = {
    meta: {
        name: "eslint-plugin-babylonjs",
        version: "1.0.0",
    },
    rules: {
        syntax: {
            // ... syntax rule
        },
        available: {
            // ... available rule
        },
        existing: {
            // ... existing rule
        },
        "no-cross-package-relative-imports": {
            // ... rule
        },
        "require-context-save-before-apply-states": {
            // ... rule
        },
    },
};

export = plugin;
```

## Success Criteria

- [ ] `IPlugin` interface includes `meta` property with `name` and `version`
- [ ] Plugin object includes `meta` object with:
    - `name: "eslint-plugin-babylonjs"`
    - `version: "1.0.0"`
- [ ] TypeScript compilation succeeds
- [ ] Plugin can be imported and `plugin.meta.name` returns the correct value

## Testing

After making changes and building the plugin:

```bash
# Build the plugin
npm run build -w eslint-plugin-babylonjs

# Verify the meta property exists in the built output
node -e "const p = require('./packages/tools/eslintBabylonPlugin/dist/index.js'); console.log(p.meta);"
# Should output: { name: 'eslint-plugin-babylonjs', version: '1.0.0' }
```

## Notes

- The version `1.0.0` matches what's in the plugin's `package.json`
- In the future, consider dynamically reading the version from `package.json` if version drift becomes an issue
- The `meta` object is used by ESLint for error messages and debugging information
- This is recommended but not strictly required for ESLint 9 compatibility
