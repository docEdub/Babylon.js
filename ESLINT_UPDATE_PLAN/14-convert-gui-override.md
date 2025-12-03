# Task 14: Convert GUI Override

## Objective

Convert the GUI controls override block from legacy config to flat config format.

## Background

There's a specific override for GUI control files that enables the `require-context-save-before-apply-states` rule.

## File to Modify

`/eslint.config.js`

## Legacy Configuration (from .eslintrc.js)

```javascript
overrides: [
    // ... TypeScript override
    {
        files: ["packages/dev/gui/src/2D/controls/**/*.{ts,tsx}"],
        rules: {
            "babylonjs/require-context-save-before-apply-states": "error",
        },
    },
],
```

## Checklist

### 1. Create GUI controls config object

- [ ] Add a config object with `files` pattern for GUI control files
- [ ] Add the `require-context-save-before-apply-states` rule

## Code to Add

Add this configuration object after the TypeScript override in `eslint.config.js`:

```javascript
export default tseslint.config(
    // ... previous configs (ignores, recommended, plugins, TypeScript override)

    // ===========================================
    // GUI Controls override
    // Requires context.save() before _applyStates()
    // ===========================================
    {
        files: ["packages/dev/gui/src/2D/controls/**/*.ts", "packages/dev/gui/src/2D/controls/**/*.tsx"],
        rules: {
            "babylonjs/require-context-save-before-apply-states": "error",
        },
    }
);
```

## File Pattern Conversion

| Legacy Pattern                                     | Flat Config Pattern                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `"packages/dev/gui/src/2D/controls/**/*.{ts,tsx}"` | `["packages/dev/gui/src/2D/controls/**/*.ts", "packages/dev/gui/src/2D/controls/**/*.tsx"]` |

Note: Flat config doesn't support the `{ts,tsx}` brace expansion in file patterns, so we split it into two patterns.

## Success Criteria

- [ ] GUI controls config object exists with correct `files` pattern
- [ ] `babylonjs/require-context-save-before-apply-states` rule is set to "error"
- [ ] File patterns cover both `.ts` and `.tsx` files
- [ ] File syntax is valid

## Testing

```bash
# Check syntax
node --check eslint.config.js

# Verify the GUI override exists
node -e "
import('./eslint.config.js').then(c => {
    const guiConfig = c.default.find(cfg =>
        cfg.files?.some(f => f.includes('gui/src/2D/controls'))
    );
    if (guiConfig) {
        console.log('GUI controls config found');
        console.log('Files:', guiConfig.files);
        console.log('Rules:', guiConfig.rules);
    } else {
        console.log('GUI controls config NOT found');
    }
})
"
```

Expected output:

```
GUI controls config found
Files: [ 'packages/dev/gui/src/2D/controls/**/*.ts', 'packages/dev/gui/src/2D/controls/**/*.tsx' ]
Rules: { 'babylonjs/require-context-save-before-apply-states': 'error' }
```

## Rule Purpose

The `require-context-save-before-apply-states` rule ensures that when `this._applyStates(context)` is called in GUI control code, `context.save()` has been called first. This is important for proper canvas state management.

Example violation:

```typescript
// BAD - missing context.save()
public draw(context: CanvasRenderingContext2D) {
    this._applyStates(context);  // Error: context.save() must be called first
}

// GOOD
public draw(context: CanvasRenderingContext2D) {
    context.save();
    this._applyStates(context);  // OK
    // ... drawing code
    context.restore();
}
```

## Notes

- This override only applies to files in `packages/dev/gui/src/2D/controls/`
- The rule is specific to the Babylon.js custom plugin
- The rule helps prevent canvas state corruption in GUI rendering
