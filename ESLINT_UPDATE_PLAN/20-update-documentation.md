# Task 20: Update Documentation

## Objective

Update any documentation that references the old ESLint configuration format.

## Background

With the migration to ESLint 9 flat config complete, documentation should be updated to reflect:

1. New configuration file location and format
2. How to add new rules
3. How to modify existing rules
4. Any changes to the development workflow

## Prerequisites

- Task 19 complete (old config files removed)
- Migration fully verified and working

## Files to Check and Update

### 1. CONTRIBUTING.md or contributing.md

- [ ] Search for ESLint references:

```bash
grep -i eslint contributing.md CONTRIBUTING.md 2>/dev/null
```

- [ ] Update any references to `.eslintrc.js` → `eslint.config.js`
- [ ] Update instructions for adding ESLint rules

### 2. README.md

- [ ] Check for ESLint setup instructions:

```bash
grep -i eslint readme.md README.md 2>/dev/null
```

- [ ] Update if any ESLint configuration is mentioned

### 3. Package.json scripts documentation

- [ ] Verify lint scripts are documented correctly
- [ ] Update any inline comments about ESLint

### 4. .github/ directory (if exists)

- [ ] Check for workflow files that reference ESLint:

```bash
grep -r "eslint" .github/ 2>/dev/null
```

- [ ] Update CI/CD documentation if needed

### 5. docs/ directory (if exists)

- [ ] Search for ESLint documentation:

```bash
find docs -name "*.md" -exec grep -l "eslint" {} \; 2>/dev/null
```

- [ ] Update any developer guides

## Checklist

### 1. Update main documentation

- [ ] Search for all ESLint references in markdown files:

```bash
grep -r "eslintrc\|\.eslintrc" --include="*.md" .
```

- [ ] Update each reference to mention `eslint.config.js`

### 2. Update inline code comments

- [ ] Check for references in source files:

```bash
grep -r "eslintrc" --include="*.ts" --include="*.js" .
```

- [ ] Update any relevant comments

### 3. Update this migration plan

- [ ] Mark all tasks as complete in ESLINT_UPDATE_PLAN.md
- [ ] Add a "Completed" section noting the migration date
- [ ] Document any deviations from the original plan

### 4. Create/Update ESLint documentation

If not already present, consider adding a section about ESLint configuration:

````markdown
## ESLint Configuration

This project uses ESLint 9 with flat configuration format.

### Configuration File

The ESLint configuration is in `eslint.config.js` at the repository root.

### Adding New Rules

To add a new rule, modify `eslint.config.js`:

1. For global rules, add to the rules object that applies to all files
2. For TypeScript-specific rules, add to the TypeScript override config
3. For file-specific rules, create a new config object with a `files` pattern

### Running ESLint

```bash
# Check for errors
npm run lint:check

# Auto-fix issues
npm run lint:fix
```
````

### Custom Plugin

The `eslint-plugin-babylonjs` custom plugin is located at:
`packages/tools/eslintBabylonPlugin/`

To modify custom rules, edit `src/index.ts` and rebuild:

```bash
npm run build -w eslint-plugin-babylonjs
```

````

### 5. Update CI/CD documentation (if applicable)

- [ ] Check Azure DevOps pipeline files
- [ ] Check GitHub Actions workflows
- [ ] Update any ESLint-related steps

## Success Criteria

- [ ] No documentation references `.eslintrc.js`
- [ ] New configuration format is documented
- [ ] Developer guide updated with ESLint 9 information
- [ ] CI/CD documentation is current
- [ ] ESLINT_UPDATE_PLAN.md updated with completion notes

## Testing

```bash
# Search for any remaining references to old config
grep -r "eslintrc" --include="*.md" --include="*.txt" .

# Should return no results or only historical references
````

## Example Documentation Updates

### Before:

```markdown
ESLint configuration is in `.eslintrc.js`. To add a new rule,
modify the `rules` object in that file.
```

### After:

```markdown
ESLint configuration is in `eslint.config.js` (flat config format).
To add a new rule:

- For global rules: Add to the appropriate rules object
- For TypeScript rules: Add to the TypeScript files override
- For specific files: Create a new config object with `files` pattern

See [ESLint Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new) for more details.
```

## Final Steps

### 1. Commit documentation changes

```bash
git add -A
git commit -m "docs: update ESLint documentation for flat config migration"
```

### 2. Create pull request

- [ ] Create PR with all migration changes
- [ ] Include summary of changes in PR description
- [ ] Request review from team members

### 3. PR Description Template

```markdown
## ESLint 8 to ESLint 9 Migration

This PR migrates the project from ESLint 8.57.1 to ESLint 9.39.1 with flat config.

### Changes

- Updated ESLint to v9.39.1
- Converted `.eslintrc.js` to `eslint.config.js` (flat config format)
- Updated `eslint-plugin-babylonjs` for ESLint 9 compatibility
- Updated plugin dependencies for flat config support
- Removed legacy config files

### Custom Plugin Changes

- Replaced deprecated `context.getFilename()` with `context.filename`
- Replaced deprecated `context.getSourceCode()` with `context.sourceCode`
- Added `meta` object with name and version
- Added `schema` definitions to all rules

### Testing

- [x] `npm run lint:check` passes
- [x] All custom rules tested and working
- [x] Unit tests pass
- [x] Build succeeds

### Documentation

- Updated ESLINT_UPDATE_PLAN.md
- [List any other docs updated]
```

## Notes

- Keep ESLINT_UPDATE_PLAN.md for historical reference
- Consider archiving the task files in ESLINT_UPDATE_PLAN/ folder
- Document any known limitations or follow-up tasks needed
