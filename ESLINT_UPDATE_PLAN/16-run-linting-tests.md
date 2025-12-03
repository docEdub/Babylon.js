# Task 16: Run Linting Tests

## Objective

Run ESLint with the new flat config and verify it works correctly. Compare output with the old config if needed.

## Background

After completing the flat config migration (Tasks 10-15), we need to verify that:

1. ESLint runs without configuration errors
2. The new config produces similar results to the old config
3. No unexpected errors or missing rules

## Prerequisites

- Tasks 10-15 complete (flat config created)
- `npm install` has been run (Tasks 07-09)
- Plugin has been rebuilt (Task 06)

## Checklist

### 1. Run basic ESLint check

- [ ] Run ESLint on the codebase:

```bash
npm run lint:check
```

### 2. Check for configuration errors

- [ ] Verify no "config not found" errors
- [ ] Verify no "plugin not found" errors
- [ ] Verify no "rule not found" errors
- [ ] Verify parser is working (no parse errors on valid TypeScript)

### 3. Compare with old config (optional but recommended)

- [ ] Temporarily enable old config to compare output:

```bash
# Backup new config
mv eslint.config.js eslint.config.js.new

# Restore old config (make sure .eslintrc.js exists)
npm run lint:check > old-lint-output.txt 2>&1

# Restore new config
mv eslint.config.js.new eslint.config.js
# Remove or rename old config to disable it
mv .eslintrc.js .eslintrc.js.bak

# Run with new config
npm run lint:check > new-lint-output.txt 2>&1

# Compare outputs
diff old-lint-output.txt new-lint-output.txt
```

### 4. Fix any discrepancies

- [ ] Address configuration errors found
- [ ] Investigate any new unexpected errors
- [ ] Investigate any missing expected errors

## Expected Behavior

The new config should produce:

- Same or similar number of errors/warnings
- Same types of errors for the same code issues
- No new configuration-related errors

## Common Issues and Solutions

### "Cannot find module 'eslint-plugin-babylonjs'"

**Cause**: The plugin import path is wrong or plugin isn't built.

**Solution**:

```bash
# Rebuild plugin
npm run build -w eslint-plugin-babylonjs

# Check the import path in eslint.config.js
# Should be: "./packages/tools/eslintBabylonPlugin/dist/index.js"
```

### "Parsing error: Cannot read file 'tsconfig.json'"

**Cause**: `projectService` can't find TypeScript config.

**Solution**: Verify `parserOptions.projectService` is set correctly. May need to add `tsconfigRootDir`:

```javascript
parserOptions: {
    projectService: true,
    tsconfigRootDir: import.meta.dirname,
}
```

### "Definition for rule 'xxx' was not found"

**Cause**: Plugin not registered or rule name changed.

**Solution**: Verify plugin is in the `plugins` object and rule prefix matches.

### "Configuration for rule 'xxx' is invalid"

**Cause**: Rule options format changed in new plugin version.

**Solution**: Check plugin documentation for correct option format.

### Import plugin errors

**Cause**: `eslint-plugin-import` may have limited flat config support.

**Solution**:

- Try upgrading to latest version
- Or replace with `eslint-plugin-import-x`
- Or configure import rules manually without using extends

## Success Criteria

- [ ] `npm run lint:check` runs without configuration errors
- [ ] ESLint processes files without parser errors
- [ ] All expected rules are active (verified by checking specific rule violations)
- [ ] No new unexpected errors introduced by config migration
- [ ] Output is comparable to old config (same general violations reported)

## Testing Commands

```bash
# Basic lint check
npm run lint:check

# Lint single file to verify rules
npx eslint packages/dev/core/src/index.ts

# Show active config for a file (useful for debugging)
npx eslint --print-config packages/dev/core/src/index.ts

# Run with debug output
DEBUG=eslint:* npm run lint:check

# Count errors/warnings
npm run lint:check 2>&1 | grep -c "error\|warning"
```

## Verification Script

Create a test script to verify specific rules are working:

```bash
# Create a test file with known violations
cat > /tmp/eslint-test.ts << 'EOF'
// This file has intentional errors for testing

// Should trigger: no-console
console.log("test");

// Should trigger: prefer-const (if enabled)
let unused = 5;

// Should trigger: naming convention (wrong format)
const badName = 1;

export {};
EOF

# Run ESLint on it
npx eslint /tmp/eslint-test.ts

# Clean up
rm /tmp/eslint-test.ts
```

## Notes

- Some rules may have slightly different behavior between ESLint 8 and 9
- Plugin version updates may have changed rule behavior
- Focus on ensuring critical rules (naming, imports, async) work correctly
- Minor differences in output format are acceptable
