# Task 18: Run Full Test Suite

## Objective

Run the full project test suite to ensure the ESLint 9 migration hasn't broken anything.

## Background

ESLint is used in the build process and tests. We need to verify that:

1. All project tests still pass
2. CI linting command works
3. Visualization tests work
4. No build process issues

## Prerequisites

- Task 16 complete (linting works)
- Task 17 complete (custom rules tested)

## Checklist

### 1. Run unit tests

- [ ] Run the unit test suite:

```bash
npm run test:unit
```

- [ ] Verify all tests pass
- [ ] Note any failures and investigate if ESLint-related

### 2. Run full test suite

- [ ] Run all tests:

```bash
npm run test
```

- [ ] Verify tests complete successfully
- [ ] Check for any new failures

### 3. Run CI linting command

- [ ] Test the CI-specific lint command:

```bash
npm run lint:check-ci
```

- [ ] Verify the Azure DevOps formatter works:

```bash
npx eslint packages/dev/core/src/index.ts --format=eslint-formatter-azure-devops
```

- [ ] If formatter doesn't work with ESLint 9, document alternative approach

### 4. Run visualization tests (optional)

- [ ] If time permits, run visualization tests:

```bash
npm run test:visualization
```

### 5. Test build process

- [ ] Run a dev build to verify ESLint isn't blocking builds:

```bash
npm run build:dev
```

- [ ] Verify build completes successfully

### 6. Test lint fix

- [ ] Test that lint fix works:

```bash
npm run lint:fix
```

- [ ] Or manually:

```bash
npx eslint --fix packages/dev/core/src/
```

## Success Criteria

- [ ] `npm run test:unit` passes
- [ ] `npm run test` passes (or same failures as before migration)
- [ ] `npm run lint:check-ci` works
- [ ] `npm run build:dev` succeeds
- [ ] `npm run lint:fix` works without errors
- [ ] No ESLint-related regressions

## Troubleshooting

### Tests fail with ESLint configuration errors

1. Check test environment has access to eslint.config.js
2. Verify node_modules are installed
3. Check if tests use a different ESLint config

### CI formatter not working

If `eslint-formatter-azure-devops` doesn't work with ESLint 9:

1. Check for updated version:

```bash
npm view eslint-formatter-azure-devops versions
```

2. If no compatible version, alternatives:
    - Use default formatter
    - Use `--format stylish`
    - Create custom formatter wrapper

### Build fails

1. Check if build script runs ESLint
2. Verify ESLint exits with correct code (0 for warnings, non-0 for errors)
3. Check lint scripts in package.json

### Some tests timeout

1. ESLint with `projectService` can be slower
2. Consider adjusting test timeouts
3. Check for infinite loops in rules

## Test Commands Reference

```bash
# Unit tests
npm run test:unit

# All tests
npm run test

# Specific test project
npm run test -- --selectProjects=unit

# Integration tests
npm run test:integration

# Visualization tests
npm run test:visualization

# Memory leak tests
npm run test -w @tools/memory-leak-tests

# CI lint
npm run lint:check-ci

# Build
npm run build:dev
```

## Performance Note

ESLint 9 with type-aware linting (`projectService: true`) may be slightly slower. If tests are significantly slower:

1. Consider disabling type-aware linting for test files
2. Add test files to ignores
3. Use caching: `npx eslint --cache`

## Notes

- Some tests may have pre-existing failures unrelated to this migration
- Focus on new failures that appeared after the migration
- Document any known issues for the PR
- If tests pass locally but might fail in CI, note the difference
