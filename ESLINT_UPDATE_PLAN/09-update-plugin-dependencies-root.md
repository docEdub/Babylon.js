# Task 09: Update Plugin Dependencies in Root

## Objective

Update or replace ESLint plugins in the root `package.json` to versions that support ESLint 9 flat config.

## Background

Based on compatibility research from Task 01, some plugins need to be upgraded:

- `eslint-plugin-jsdoc`: Current ~46.2.6 → Need ^50.0.0 for flat config
- `eslint-plugin-import`: Current ~2.26.0 → Need ^2.31.0 OR replace with `eslint-plugin-import-x`

## File to Modify

`/package.json`

## Current State

```json
{
    "devDependencies": {
        "eslint-plugin-github": "5.0.2",
        "eslint-plugin-import": "~2.26.0",
        "eslint-plugin-jest": "~28.11.0",
        "eslint-plugin-jsdoc": "~46.2.6",
        "eslint-plugin-prettier": "~5.0.0",
        "eslint-plugin-tsdoc": "~0.2.14"
    }
}
```

## Checklist

### 1. Update `eslint-plugin-jsdoc`

- [ ] Change from `"~46.2.6"` to `"^50.0.0"`:

```json
"eslint-plugin-jsdoc": "^50.0.0"
```

### 2. Update or Replace `eslint-plugin-import`

**Option A: Update to latest** (recommended if you want minimal changes)

- [ ] Change from `"~2.26.0"` to `"^2.31.0"`:

```json
"eslint-plugin-import": "^2.31.0"
```

**Option B: Replace with `eslint-plugin-import-x`** (better flat config support)

- [ ] Remove `eslint-plugin-import`
- [ ] Add `eslint-plugin-import-x`:

```json
"eslint-plugin-import-x": "^4.6.0"
```

**Decision**: Choose Option A for minimal changes during migration. Option B can be done as a follow-up if needed.

### 3. Verify other plugins are compatible

Based on Task 01 research, these should already be compatible:

- [ ] `eslint-plugin-prettier`: `~5.0.0` ✓ (supports ESLint 9)
- [ ] `eslint-plugin-jest`: `~28.11.0` ✓ (supports ESLint 9)
- [ ] `@typescript-eslint/*`: `^8.29.0` ✓ (supports ESLint 9)

### 4. Update `eslint-plugin-github` if needed

- [ ] Check Task 01 findings for `eslint-plugin-github` compatibility
- [ ] Update version if required, or note if workarounds needed

### 5. Update `eslint-plugin-tsdoc` if needed

- [ ] Check Task 01 findings for `eslint-plugin-tsdoc` compatibility
- [ ] Note: This plugin may be deprecated in favor of the custom babylonjs/syntax rule

## Target State

```json
{
    "devDependencies": {
        "eslint-plugin-github": "5.0.2", // or updated version
        "eslint-plugin-import": "^2.31.0", // updated
        "eslint-plugin-jest": "~28.11.0", // unchanged
        "eslint-plugin-jsdoc": "^50.0.0", // updated
        "eslint-plugin-prettier": "~5.0.0", // unchanged
        "eslint-plugin-tsdoc": "~0.2.14" // or updated/removed
    }
}
```

## Success Criteria

- [ ] `eslint-plugin-jsdoc` is updated to `^50.0.0`
- [ ] `eslint-plugin-import` is updated to `^2.31.0` (or replaced with import-x)
- [ ] All other plugins remain compatible
- [ ] JSON is valid (no syntax errors)

## Testing

After completing Tasks 07, 08, and 09, run:

```bash
# Install all dependencies
npm install

# Verify ESLint version
npx eslint --version
# Should output: v9.39.1 (or similar 9.x)

# Check installed plugin versions
npm ls eslint-plugin-jsdoc
npm ls eslint-plugin-import
```

## Handling Peer Dependency Warnings

You may see peer dependency warnings during `npm install`. Common resolutions:

1. **eslint-plugin-import peer warning**:

    - The plugin may warn about ESLint version
    - This is usually safe to ignore if using v2.31.0+

2. **typescript-eslint warnings**:
    - Ensure `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` are same version

## Post-Task Actions

After this task, run npm install:

```bash
npm install
```

If there are peer dependency conflicts, resolve them before proceeding.

## Notes

- Plugin versions may have newer releases by the time this task is executed
- Check npm for latest compatible versions if the specified versions cause issues
- The `~` prefix limits updates to patch versions, `^` allows minor updates
- Consider using `^` for plugins to get bug fixes automatically
