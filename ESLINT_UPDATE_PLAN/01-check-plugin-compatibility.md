# Task 01: Check Plugin Compatibility

## Objective

Research and verify that all ESLint plugins used in the Babylon.js project are compatible with ESLint 9 and support the flat config format.

## Background

ESLint 9 introduces breaking changes that may affect plugin compatibility. Before proceeding with the migration, we need to verify that all plugins either:

1. Support ESLint 9 natively
2. Have updated versions that support ESLint 9
3. Need to be replaced with alternatives

## Current Plugin Versions

From `/package.json`:

```json
{
    "@typescript-eslint/eslint-plugin": "^8.29.0",
    "@typescript-eslint/parser": "^8.29.0",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "~9.0.0",
    "eslint-formatter-azure-devops": "^1.2.0",
    "eslint-plugin-github": "5.0.2",
    "eslint-plugin-import": "~2.26.0",
    "eslint-plugin-jest": "~28.11.0",
    "eslint-plugin-jsdoc": "~46.2.6",
    "eslint-plugin-prettier": "~5.0.0",
    "eslint-plugin-tsdoc": "~0.2.14"
}
```

## Checklist

### 1. Check `@typescript-eslint/*` compatibility

- [ ] Visit https://github.com/typescript-eslint/typescript-eslint/releases
- [ ] Verify that v8.29.0+ supports ESLint 9 (it does - v8+ supports ESLint 9)
- [ ] Document the minimum required version: **v8.0.0+**
- [ ] Confirm flat config support: **Yes**

### 2. Check `eslint-plugin-prettier` compatibility

- [ ] Visit https://github.com/prettier/eslint-plugin-prettier/releases
- [ ] Verify v5.0.0+ supports ESLint 9 (it does)
- [ ] Document flat config export path: `eslint-plugin-prettier/recommended`
- [ ] Confirm current version is sufficient: **Yes, ~5.0.0 works**

### 3. Check `eslint-plugin-jest` compatibility

- [ ] Visit https://github.com/jest-community/eslint-plugin-jest/releases
- [ ] Verify v28+ supports ESLint 9 (it does)
- [ ] Document flat config export: `eslint-plugin-jest/configs["flat/recommended"]`
- [ ] Confirm current version is sufficient: **Yes, ~28.11.0 works**

### 4. Check `eslint-plugin-jsdoc` compatibility

- [ ] Visit https://github.com/gajus/eslint-plugin-jsdoc/releases
- [ ] Current version ~46.2.6 does NOT fully support ESLint 9 flat config
- [ ] Required version: **v48.0.0+** for full flat config support
- [ ] Document the upgrade needed: `npm install --save-dev eslint-plugin-jsdoc@^50.0.0`

### 5. Check `eslint-plugin-github` compatibility

- [ ] Visit https://github.com/github/eslint-plugin-github
- [ ] Check if v5.0.2 supports ESLint 9 flat config
- [ ] Document findings and any required upgrades
- [ ] If not compatible, research alternatives or workarounds

### 6. Check `eslint-plugin-import` compatibility

- [ ] Visit https://github.com/import-js/eslint-plugin-import
- [ ] Current version ~2.26.0 has limited flat config support
- [ ] v2.29.0+ has experimental flat config support
- [ ] Alternative: `eslint-plugin-import-x` has better flat config support
- [ ] **Decision needed**: Upgrade to v2.31.0+ OR replace with `eslint-plugin-import-x`

### 7. Check `eslint-plugin-tsdoc` compatibility

- [ ] Visit https://github.com/microsoft/tsdoc/tree/main/eslint-plugin
- [ ] Check if ~0.2.14 supports ESLint 9
- [ ] Document findings and any required upgrades

### 8. Check `eslint-formatter-azure-devops` compatibility

- [ ] Visit https://github.com/mfederczuk/eslint-formatter-azure-devops
- [ ] Check if ^1.2.0 works with ESLint 9
- [ ] This is used for CI/CD linting output formatting

### 9. Check `eslint-config-prettier` compatibility

- [ ] Visit https://github.com/prettier/eslint-config-prettier
- [ ] Verify ~9.0.0 supports ESLint 9
- [ ] Document flat config usage

## Output

Create a compatibility report in the following format:

```markdown
## Plugin Compatibility Report

| Plugin                        | Current  | Min for ESLint 9 | Flat Config | Action             |
| ----------------------------- | -------- | ---------------- | ----------- | ------------------ |
| @typescript-eslint/\*         | ^8.29.0  | v8.0.0+          | Yes         | None               |
| eslint-plugin-prettier        | ~5.0.0   | v5.0.0+          | Yes         | None               |
| eslint-plugin-jest            | ~28.11.0 | v28.0.0+         | Yes         | None               |
| eslint-plugin-jsdoc           | ~46.2.6  | v48.0.0+         | Yes         | Upgrade to ^50.0.0 |
| eslint-plugin-github          | 5.0.2    | TBD              | TBD         | TBD                |
| eslint-plugin-import          | ~2.26.0  | v2.29.0+         | Partial     | Upgrade or Replace |
| eslint-plugin-tsdoc           | ~0.2.14  | TBD              | TBD         | TBD                |
| eslint-formatter-azure-devops | ^1.2.0   | TBD              | N/A         | TBD                |
| eslint-config-prettier        | ~9.0.0   | v9.0.0+          | Yes         | None               |
```

## Success Criteria

- [ ] All plugins have been researched for ESLint 9 compatibility
- [ ] A compatibility report has been created documenting:
    - Current version of each plugin
    - Minimum version required for ESLint 9
    - Whether flat config is supported
    - Required action (none, upgrade, replace)
- [ ] Decisions have been made for plugins requiring action (especially `eslint-plugin-import`)
- [ ] Report has been reviewed and saved

## Testing

To verify research is complete:

1. Each plugin should have a clear action item
2. Version numbers should be documented from official sources
3. Any plugins requiring replacement should have alternatives identified

## Notes

- The custom `eslint-plugin-babylonjs` plugin will be updated in subsequent tasks
- Some plugins may work with ESLint 9 even without explicit flat config support via compatibility layers
- The `@eslint/eslintrc` package provides `FlatCompat` for gradual migration if needed
