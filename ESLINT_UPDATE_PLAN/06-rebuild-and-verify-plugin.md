# Task 06: Rebuild and Verify Plugin

## Objective

Rebuild the `eslint-plugin-babylonjs` plugin after making ESLint 9 compatibility changes and verify it compiles without errors.

## Background

After completing Tasks 02-05, the plugin needs to be rebuilt to:

1. Verify TypeScript compilation succeeds with new `@types/eslint@^9.6.0`
2. Generate updated JavaScript output in `dist/`
3. Confirm all changes are syntactically correct

## Prerequisites

- Task 02 complete: Plugin package.json updated
- Task 03 complete: Deprecated APIs replaced
- Task 04 complete: Meta information added
- Task 05 complete: Rule schemas added

## Checklist

### 1. Install updated dependencies

- [ ] Run npm install to get the updated `@types/eslint`:

```bash
npm install
```

### 2. Build the plugin

- [ ] Run the plugin build script:

```bash
npm run build -w eslint-plugin-babylonjs
```

or

```bash
cd packages/tools/eslintBabylonPlugin
npm run build
```

### 3. Verify TypeScript compilation

- [ ] Run TypeScript type checking:

```bash
cd packages/tools/eslintBabylonPlugin
npx tsc --noEmit
```

- [ ] Confirm no type errors are reported

### 4. Verify build output exists

- [ ] Check that `dist/index.js` was generated:

```bash
ls -la packages/tools/eslintBabylonPlugin/dist/
```

- [ ] Check that `dist/index.d.ts` was generated

### 5. Verify plugin structure

- [ ] Run verification script to check plugin exports:

```bash
node -e "
const plugin = require('./packages/tools/eslintBabylonPlugin/dist/index.js');

// Check meta exists
console.log('Meta:', plugin.meta);

// Check all rules exist
const expectedRules = [
    'syntax',
    'available',
    'existing',
    'no-cross-package-relative-imports',
    'require-context-save-before-apply-states'
];

console.log('Rules found:', Object.keys(plugin.rules));

const missing = expectedRules.filter(r => !plugin.rules[r]);
if (missing.length > 0) {
    console.error('Missing rules:', missing);
    process.exit(1);
}

// Check schemas exist
Object.keys(plugin.rules).forEach(rule => {
    const hasSchema = plugin.rules[rule].meta?.schema !== undefined;
    console.log('  ' + rule + ' - schema:', hasSchema ? 'yes' : 'NO');
});

console.log('\\nPlugin verification passed!');
"
```

## Expected Output

### Successful build output:

```
> eslint-plugin-babylonjs@1.0.0 build
> tsc -b tsconfig.build.json
```

(No output means success for tsc)

### Verification script output:

```
Meta: { name: 'eslint-plugin-babylonjs', version: '1.0.0' }
Rules found: [
  'syntax',
  'available',
  'existing',
  'no-cross-package-relative-imports',
  'require-context-save-before-apply-states'
]
  syntax - schema: yes
  available - schema: yes
  existing - schema: yes
  no-cross-package-relative-imports - schema: yes
  require-context-save-before-apply-states - schema: yes

Plugin verification passed!
```

## Troubleshooting

### TypeScript errors about `context.filename` or `context.sourceCode`

If you see errors like:

```
Property 'filename' does not exist on type 'RuleContext'
```

**Solution**: Verify `@types/eslint` is updated to `^9.6.0` in plugin's package.json and run `npm install` again.

### TypeScript errors about missing properties

If you see errors about missing meta properties:

**Solution**: Verify the `IPlugin` interface was updated correctly in Task 04.

### Module not found errors

If the build fails with module resolution errors:

**Solution**: Run `npm install` from the repository root to ensure all dependencies are installed.

### Build succeeds but verification fails

If the build succeeds but the verification script fails:

**Solution**: Check that the `dist/` folder has been updated. Delete `dist/` and rebuild:

```bash
rm -rf packages/tools/eslintBabylonPlugin/dist
npm run build -w eslint-plugin-babylonjs
```

## Success Criteria

- [ ] `npm run build -w eslint-plugin-babylonjs` completes without errors
- [ ] `npx tsc --noEmit` in plugin directory reports no errors
- [ ] `dist/index.js` and `dist/index.d.ts` files exist
- [ ] Verification script passes and shows:
    - Meta object with name and version
    - All 5 rules present
    - All rules have schema defined
- [ ] No deprecated API warnings in build output

## Testing

The plugin functionality will be tested in Task 17 after the full ESLint 9 migration is complete. This task only verifies that the plugin compiles correctly.

## Notes

- Build warnings about deprecated APIs from dependencies can be ignored
- The plugin may not work with the current ESLint 8 configuration after these changes
- Full testing will occur after the root ESLint version is updated (Task 07+)
