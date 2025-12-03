# Task 05: Add Rule Meta Schemas

## Objective

Add `schema` property definitions to ESLint rules in the custom plugin that accept options. This is a recommended practice for ESLint 9.

## Background

ESLint 9 recommends that rules define their accepted options using JSON Schema in the `meta.schema` property. This enables:

- Better IDE support and autocompletion
- Runtime validation of rule options
- Improved error messages for misconfigured rules

## File to Modify

`/packages/tools/eslintBabylonPlugin/src/index.ts`

## Rules Analysis

| Rule                                       | Accepts Options?       | Schema Needed    |
| ------------------------------------------ | ---------------------- | ---------------- |
| `syntax`                                   | No                     | Empty array `[]` |
| `available`                                | Yes - `contexts` array | Yes              |
| `existing`                                 | No                     | Empty array `[]` |
| `no-cross-package-relative-imports`        | No                     | Empty array `[]` |
| `require-context-save-before-apply-states` | No                     | Empty array `[]` |

## Checklist

### 1. Add schema to `syntax` rule

- [ ] Find the `syntax` rule's `meta` object (around line 225-235)
- [ ] Add `schema: []` to indicate no options:

```typescript
syntax: {
    meta: {
        messages: {
            // ... existing messages
        },
        type: "problem",
        docs: {
            description: "Validates that TypeScript documentation comments conform to the TSDoc standard",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://tsdoc.org/pages/packages/eslint-plugin-tsdoc",
        },
        schema: [],  // ADD THIS LINE
    },
    create: (context: eslint.Rule.RuleContext) => {
        // ...
    },
},
```

### 2. Add schema to `available` rule

The `available` rule accepts options in `.eslintrc.js`:

```javascript
"babylonjs/available": [
    "warn",
    {
        contexts: [
            'PropertyDefinition:not([accessibility="private"])...',
            'MethodDefinition:not([accessibility="private"])...',
        ],
    },
],
```

- [ ] Find the `available` rule's `meta` object (around line 340-355)
- [ ] Add the schema definition:

```typescript
available: {
    meta: {
        messages: {
            "error-no-doc-found": "Issue finding code doc for: {{name}}",
            // ... other messages
        },
        type: "problem",
        docs: {
            description: "Make sure documentation is available for public members",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://tsdoc.org/pages/packages/eslint-plugin-tsdoc",
        },
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
        ],  // ADD THIS SCHEMA
    },
    create: (context: eslint.Rule.RuleContext) => {
        // ...
    },
},
```

### 3. Add schema to `existing` rule

- [ ] Find the `existing` rule's `meta` object (around line 405-420)
- [ ] Add `schema: []`:

```typescript
existing: {
    meta: {
        messages: {
            "error-no-tsdoc-found": "No TSDoc Found for {{details}}",
        },
        type: "problem",
        docs: {
            description: "Make sure a comment exists",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://tsdoc.org/pages/packages/eslint-plugin-tsdoc",
        },
        schema: [],  // ADD THIS LINE
    },
    create: (context: eslint.Rule.RuleContext) => {
        // ...
    },
},
```

### 4. Add schema to `no-cross-package-relative-imports` rule

- [ ] Find the rule's `meta` object (around line 475-490)
- [ ] Add `schema: []`:

```typescript
"no-cross-package-relative-imports": {
    meta: {
        type: "problem",
        docs: {
            description: "Prevent relative imports that should use TypeScript path mappings",
        },
        fixable: "code",
        messages: {
            usePathMapping: 'Use path mapping "{{suggestion}}" instead of relative import "{{importPath}}".',
        },
        schema: [],  // ADD THIS LINE
    },
    create(context) {
        // ...
    },
},
```

### 5. Add schema to `require-context-save-before-apply-states` rule

- [ ] Find the rule's `meta` object (around line 515-530)
- [ ] Add `schema: []`:

```typescript
"require-context-save-before-apply-states": {
    meta: {
        type: "problem",
        docs: {
            description: "Require context.save() and context.restore() to be called around this._applyStates(context) calls",
        },
        messages: {
            missingSave: "Unless this is a temporary context, context.save() must be called before this._applyStates(context)...",
        },
        schema: [],  // ADD THIS LINE
    },
    create(context) {
        // ...
    },
},
```

## Success Criteria

- [ ] All 5 rules have a `schema` property in their `meta` object
- [ ] `syntax`, `existing`, `no-cross-package-relative-imports`, and `require-context-save-before-apply-states` have `schema: []`
- [ ] `available` rule has proper JSON schema for `contexts` option
- [ ] TypeScript compilation succeeds
- [ ] No ESLint errors when running with the updated plugin

## Testing

After making changes:

```bash
# Build the plugin
npm run build -w eslint-plugin-babylonjs

# Verify schemas exist in the built output
node -e "
const p = require('./packages/tools/eslintBabylonPlugin/dist/index.js');
Object.keys(p.rules).forEach(rule => {
    const schema = p.rules[rule].meta?.schema;
    console.log(rule + ': schema=' + JSON.stringify(schema));
});
"
```

Expected output:

```
syntax: schema=[]
available: schema=[{"type":"object","properties":{"contexts":{"type":"array","items":{"type":"string"}}},"additionalProperties":false}]
existing: schema=[]
no-cross-package-relative-imports: schema=[]
require-context-save-before-apply-states: schema=[]
```

## JSON Schema Reference

For the `available` rule's schema:

- `type: "object"` - The options must be an object
- `properties.contexts` - Defines the `contexts` property
- `type: "array"` - contexts must be an array
- `items: { type: "string" }` - Each item must be a string
- `additionalProperties: false` - No other properties allowed

## Notes

- Empty schema `[]` means the rule accepts no options
- The schema is validated at runtime by ESLint
- Invalid options will produce clear error messages
- This is optional but recommended for ESLint 9 compatibility
