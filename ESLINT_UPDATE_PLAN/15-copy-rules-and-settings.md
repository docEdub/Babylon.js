# Task 15: Copy Rules and Settings

## Objective

Copy all remaining rules from the legacy config to the flat config, including global rules and the complete naming convention rules.

## Background

This task completes the flat config by adding:

1. Global rules that apply to all files
2. The complete `@typescript-eslint/naming-convention` rule with all its cases
3. Any remaining settings

## File to Modify

`/eslint.config.js`

## Checklist

### 1. Add global rules configuration

- [ ] Create a config object for rules that apply to all files
- [ ] Copy all global rules from `.eslintrc.js`

### 2. Complete the naming convention rules

- [ ] Copy the full `@typescript-eslint/naming-convention` rule to the TypeScript override

## Global Rules to Add

Add this configuration object for global rules:

```javascript
export default tseslint.config(
    // ... previous configs

    // ===========================================
    // Global rules (apply to all matched files)
    // ===========================================
    {
        rules: {
            // No console except allowed methods
            "no-console": ["error", { allow: ["time", "timeEnd", "trace"] }],
            "block-spacing": "error",

            // Import rules
            "import/no-unresolved": "off",
            "import/named": "error",
            "import/no-cycle": [1, { maxDepth: 1, ignoreExternal: true }],
            "import/no-internal-modules": [
                "error",
                {
                    forbid: ["**/index", "**/"],
                },
            ],

            // General rules
            "no-unused-vars": "off",
            "no-empty": ["error", { allowEmptyCatch: true }],
            "space-infix-ops": "error",
            "template-curly-spacing": "error",
            "template-tag-spacing": "error",

            // Jest rules
            "jest/no-standalone-expect": ["error", { additionalTestBlockFunctions: ["afterEach"] }],
            "jest/valid-expect": "off",

            // Babylon.js custom rules
            "babylonjs/syntax": "warn",
            "babylonjs/no-cross-package-relative-imports": "error",

            // JSDoc rules
            "jsdoc/check-param-names": ["error", { checkRestProperty: false, checkDestructured: false }],
            "jsdoc/check-property-names": "error",
            "jsdoc/require-param": [
                "error",
                {
                    checkDestructured: false,
                    checkDestructuredRoots: false,
                    checkRestProperty: false,
                    enableFixer: false,
                },
            ],
            "jsdoc/require-param-name": "error",
            "jsdoc/require-returns": ["error", { checkGetters: false, checkConstructors: false }],
            "jsdoc/require-returns-check": "error",

            // Warnings
            "import/export": "warn",
            "no-useless-escape": "warn",
            "no-case-declarations": "warn",
            "no-prototype-builtins": "warn",
            "no-loss-of-precision": "warn",
            "no-fallthrough": "warn",
            "no-async-promise-executor": "warn",

            // Disabled rules
            "prefer-spread": "off",
            "prefer-rest-params": "off",

            // Errors
            "no-throw-literal": "error",
            curly: "error",
        },
    }
);
```

### 3. Complete Naming Convention Rules

Add the complete naming convention rules to the TypeScript override (Task 13). This is the full rule from `.eslintrc.js`:

```javascript
"@typescript-eslint/naming-convention": [
    "error",
    {
        selector: "default",
        format: ["strictCamelCase"],
    },
    {
        selector: "import",
        format: ["strictCamelCase", "StrictPascalCase"],
    },
    // Allow any casing for destructured variables
    {
        selector: "variable",
        format: null,
        modifiers: ["destructured"],
    },
    {
        selector: "variable",
        format: ["StrictPascalCase", "UPPER_CASE"],
        modifiers: ["global"],
        leadingUnderscore: "allow",
    },
    {
        selector: "variable",
        format: ["camelCase"],
        leadingUnderscore: "allow",
    },
    {
        selector: "parameter",
        format: ["camelCase"],
        leadingUnderscore: "allow",
    },
    {
        selector: "objectLiteralProperty",
        format: ["strictCamelCase", "snake_case", "UPPER_CASE"],
        leadingUnderscore: "allow",
    },
    {
        selector: "enumMember",
        format: ["StrictPascalCase", "UPPER_CASE"],
    },
    // Public static members of classes
    {
        selector: "memberLike",
        modifiers: ["public", "static"],
        format: ["StrictPascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
    },
    // Private static members
    {
        selector: "memberLike",
        modifiers: ["private", "static"],
        format: ["StrictPascalCase", "UPPER_CASE"],
        leadingUnderscore: "require",
    },
    // Protected static members
    {
        selector: "memberLike",
        modifiers: ["protected", "static"],
        format: ["StrictPascalCase", "UPPER_CASE"],
        leadingUnderscore: "require",
    },
    // Public instance members
    {
        selector: "memberLike",
        modifiers: ["public"],
        format: ["strictCamelCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
    },
    // Private instance members
    {
        selector: "memberLike",
        modifiers: ["private"],
        format: ["strictCamelCase"],
        leadingUnderscore: "require",
    },
    // Protected instance members
    {
        selector: "memberLike",
        modifiers: ["protected"],
        format: ["strictCamelCase"],
        leadingUnderscore: "require",
    },
    // Async suffix
    {
        selector: "memberLike",
        modifiers: ["async"],
        suffix: ["Async"],
        format: ["strictCamelCase", "StrictPascalCase"],
        leadingUnderscore: "allow",
    },
    {
        selector: "typeLike",
        format: ["StrictPascalCase"],
    },
    // Exported const variables
    {
        selector: "variable",
        modifiers: ["const", "global", "exported"],
        format: ["StrictPascalCase"],
        leadingUnderscore: "allow",
    },
    {
        selector: "function",
        modifiers: ["global"],
        format: ["StrictPascalCase"],
        leadingUnderscore: "allow",
    },
    {
        selector: "interface",
        format: ["StrictPascalCase"],
        leadingUnderscore: "allow",
        prefix: ["I"],
    },
    {
        selector: "class",
        format: ["StrictPascalCase"],
        leadingUnderscore: "allow",
    },
    // Abbreviation exceptions (uses allowedNonStrictAbbreviations variable)
    {
        selector: "default",
        format: ["camelCase"],
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
    },
    {
        selector: ["memberLike", "property", "parameter"],
        format: ["camelCase", "UPPER_CASE"],
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
        leadingUnderscore: "allow",
    },
    {
        selector: ["memberLike", "variable", "property", "class"],
        format: ["PascalCase", "UPPER_CASE"],
        modifiers: ["static"],
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
        leadingUnderscore: "allow",
    },
    {
        selector: "class",
        format: ["PascalCase"],
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
        leadingUnderscore: "allow",
    },
    {
        selector: "interface",
        format: ["PascalCase"],
        prefix: ["I"],
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
        leadingUnderscore: "allow",
    },
    {
        selector: "import",
        format: ["camelCase", "PascalCase"],
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
    },
    {
        selector: "objectLiteralProperty",
        format: ["camelCase", "snake_case", "UPPER_CASE"],
        leadingUnderscore: "allow",
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
    },
    // Exception for hooks starting with 'use'
    {
        selector: "variable",
        format: ["strictCamelCase"],
        modifiers: ["global"],
        filter: {
            regex: "^use",
            match: true,
        },
    },
    {
        selector: "function",
        format: ["strictCamelCase"],
        modifiers: ["global"],
        filter: {
            regex: "^use",
            match: true,
        },
    },
    {
        selector: "variable",
        format: ["PascalCase"],
        modifiers: ["global"],
        leadingUnderscore: "allow",
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
    },
    {
        selector: "function",
        modifiers: ["global"],
        format: ["PascalCase"],
        leadingUnderscore: "allow",
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
    },
    {
        selector: "enumMember",
        format: ["PascalCase", "UPPER_CASE"],
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
    },
    {
        selector: "typeLike",
        format: ["PascalCase"],
        filter: {
            regex: allowedNonStrictAbbreviations,
            match: true,
        },
    },
],
```

## Success Criteria

- [ ] Global rules config object is added with all rules from `.eslintrc.js`
- [ ] Complete naming convention rule is added to TypeScript override
- [ ] All rule configurations match the original `.eslintrc.js`
- [ ] File syntax is valid
- [ ] `allowedNonStrictAbbreviations` variable is used in naming convention rules

## Testing

```bash
# Check syntax
node --check eslint.config.js

# Verify rules are present
node -e "
import('./eslint.config.js').then(c => {
    const globalRules = c.default.find(cfg =>
        cfg.rules && cfg.rules['no-console'] && !cfg.files
    );
    const tsRules = c.default.find(cfg =>
        cfg.files?.some(f => f.includes('*.ts')) && cfg.rules
    );

    console.log('Global rules count:', globalRules ? Object.keys(globalRules.rules).length : 0);
    console.log('TypeScript rules count:', tsRules ? Object.keys(tsRules.rules).length : 0);

    // Check specific rules exist
    const checks = [
        ['no-console', globalRules?.rules?.['no-console']],
        ['babylonjs/syntax', globalRules?.rules?.['babylonjs/syntax']],
        ['naming-convention', tsRules?.rules?.['@typescript-eslint/naming-convention']],
    ];

    checks.forEach(([name, val]) => {
        console.log(name + ':', val ? 'present' : 'MISSING');
    });
})
"
```

## Final File Structure

After this task, `eslint.config.js` should have this structure:

```javascript
// Imports
import js from "@eslint/js";
// ... other imports

// Abbreviations array
const abbreviations = [/* ... */];
const allowedNonStrictAbbreviations = abbreviations.join("|");

export default tseslint.config(
    // 1. Global ignores
    { ignores: [/* ... */] },

    // 2. Base configs
    js.configs.recommended,
    eslintPluginPrettier,

    // 3. Global language options
    { languageOptions: { globals: {...}, parser: ..., parserOptions: {...} } },

    // 4. Plugin registrations and settings
    { plugins: {...}, settings: {...} },

    // 5. Jest config
    eslintPluginJest.configs["flat/recommended"],

    // 6. Global rules
    { rules: { /* all global rules */ } },

    // 7. TypeScript override
    {
        files: ["packages/**/src/**/*.ts", "packages/**/src/**/*.tsx"],
        extends: [/* tseslint configs */],
        languageOptions: { parserOptions: { projectService: true } },
        rules: { /* TypeScript rules including naming-convention */ },
    },

    // 8. GUI controls override
    {
        files: ["packages/dev/gui/src/2D/controls/**/*.ts", ...],
        rules: { "babylonjs/require-context-save-before-apply-states": "error" },
    },
);
```

## Notes

- The `allowedNonStrictAbbreviations` variable must be defined before the config export
- Rule order within a config object doesn't matter
- Some rules may need adjustments based on ESLint 9 compatibility
- The process.env.TF_BUILD check for no-console can be simplified to just "error"
