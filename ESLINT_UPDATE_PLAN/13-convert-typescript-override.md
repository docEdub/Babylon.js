# Task 13: Convert TypeScript Override

## Objective

Convert the TypeScript files override block from legacy config to flat config format.

## Background

In legacy config, TypeScript-specific rules are in an `overrides` array. In flat config, these become separate config objects with `files` patterns.

## File to Modify

`/eslint.config.js`

## Legacy Configuration (from .eslintrc.js)

```javascript
overrides: [
    {
        files: ["packages/**/src/**/*.{ts,tsx}"],
        extends: [
            "plugin:@typescript-eslint/eslint-recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:@typescript-eslint/recommended-requiring-type-checking",
        ],
        parserOptions: {
            projectService: true,
        },
        parser: "@typescript-eslint/parser",
        rules: {
            // Many TypeScript-specific rules...
        },
    },
],
```

## Checklist

### 1. Create TypeScript files config object

- [ ] Add a config object with `files` pattern for TypeScript files
- [ ] Use `extends` with typescript-eslint configs
- [ ] Add `languageOptions` with parser options

### 2. Add TypeScript-specific rules

- [ ] Copy all rules from the TypeScript override

## Code to Add

Add this configuration object to `eslint.config.js`:

```javascript
export default tseslint.config(
    // ... previous configs

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

            // Naming conventions (uses allowedNonStrictAbbreviations)
            "@typescript-eslint/naming-convention": [
                "error",
                // ... (This is a large rule - see Task 15 for full content)
            ],
        },
    }
);
```

## Naming Convention Rules

The `@typescript-eslint/naming-convention` rule is extensive. Due to its size, the full content will be copied in Task 15. For now, add a placeholder:

```javascript
"@typescript-eslint/naming-convention": [
    "error",
    // Full naming convention rules to be added in Task 15
    { selector: "default", format: ["strictCamelCase"] },
],
```

## Success Criteria

- [ ] TypeScript override config object exists with `files` pattern
- [ ] `extends` includes typescript-eslint recommended configs
- [ ] `languageOptions` includes parser and `projectService: true`
- [ ] All TypeScript-specific rules are copied
- [ ] File syntax is valid

## Testing

```bash
# Check syntax
node --check eslint.config.js

# Verify the config includes TypeScript files pattern
node -e "
import('./eslint.config.js').then(c => {
    const tsConfig = c.default.find(cfg =>
        cfg.files?.some(f => f.includes('*.ts'))
    );
    if (tsConfig) {
        console.log('TypeScript config found');
        console.log('Files:', tsConfig.files);
        console.log('Rules count:', Object.keys(tsConfig.rules || {}).length);
    } else {
        console.log('TypeScript config NOT found');
    }
})
"
```

## Notes

- The `files` pattern uses two separate strings instead of `{ts,tsx}` glob
- `projectService: true` enables TypeScript project service for type-aware linting
- The typescript-eslint configs use spread operator to expand the arrays
- The naming convention rule references `allowedNonStrictAbbreviations` variable
