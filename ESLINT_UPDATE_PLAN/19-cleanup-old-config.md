# Task 19: Cleanup Old Config Files

## Objective

Remove the legacy ESLint configuration files now that the migration to flat config is complete.

## Background

After verifying the new `eslint.config.js` works correctly, the old configuration files should be removed to avoid confusion and potential conflicts.

## Prerequisites

- Task 18 complete (all tests pass)
- Verified that ESLint uses the new flat config
- No outstanding issues with the migration

## Files to Remove

### 1. `.eslintrc.js` (Legacy Config)

Location: `/Users/andy/-/code/Babylon.js/.eslintrc.js`

### 2. `.eslintignore` (if exists)

Location: `/Users/andy/-/code/Babylon.js/.eslintignore` (if present)

Note: Ignore patterns are now in `eslint.config.js` under the `ignores` property.

## Checklist

### 1. Final verification before deletion

- [ ] Run lint one more time to confirm flat config is working:

```bash
npm run lint:check
```

- [ ] Verify ESLint is using the flat config:

```bash
npx eslint --print-config packages/dev/core/src/index.ts | head -20
```

### 2. Backup files (optional but recommended)

- [ ] Create backups before deletion:

```bash
cp .eslintrc.js .eslintrc.js.backup
# If .eslintignore exists
cp .eslintignore .eslintignore.backup
```

### 3. Remove `.eslintrc.js`

- [ ] Delete the legacy config file:

```bash
rm .eslintrc.js
```

### 4. Remove `.eslintignore` (if exists)

- [ ] Check if file exists:

```bash
ls -la .eslintignore
```

- [ ] If exists, delete it:

```bash
rm .eslintignore
```

### 5. Verify ESLint still works after deletion

- [ ] Run lint check:

```bash
npm run lint:check
```

- [ ] Verify no "config not found" errors
- [ ] Verify same linting results as before

### 6. Clean up any backup files (if created)

- [ ] If migration is fully successful, remove backups:

```bash
rm -f .eslintrc.js.backup .eslintignore.backup
```

Or keep them until the PR is merged.

## Success Criteria

- [ ] `.eslintrc.js` is deleted
- [ ] `.eslintignore` is deleted (if it existed)
- [ ] `eslint.config.js` is the only ESLint config file
- [ ] `npm run lint:check` works correctly after deletion
- [ ] No ESLint errors about missing configuration

## Verification

```bash
# Verify old config is gone
ls -la .eslintrc* .eslintignore 2>/dev/null || echo "Old config files removed"

# Verify new config exists
ls -la eslint.config.js

# Verify ESLint works
npm run lint:check

# Check what config ESLint is using
npx eslint --debug packages/dev/core/src/index.ts 2>&1 | grep -i "config"
```

## Rollback Plan

If issues are discovered after deletion:

1. **Restore from git**:

```bash
git checkout HEAD~1 -- .eslintrc.js .eslintignore
```

2. **Or restore from backup**:

```bash
mv .eslintrc.js.backup .eslintrc.js
mv .eslintignore.backup .eslintignore
```

3. **Temporarily disable flat config**:
    - Rename `eslint.config.js` to `eslint.config.js.disabled`
    - ESLint will fall back to `.eslintrc.js`

## Notes

- ESLint 9 automatically prefers `eslint.config.js` over `.eslintrc.js`
- If both configs exist, ESLint 9 uses flat config and ignores legacy config
- The `ESLINT_USE_FLAT_CONFIG=false` env var can force legacy config (for debugging)
- After this task, only `eslint.config.js` should exist for ESLint configuration
