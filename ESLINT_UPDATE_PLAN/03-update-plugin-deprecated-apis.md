# Task 03: Update Plugin Deprecated Context APIs

## Objective

Replace deprecated ESLint context API methods with their ESLint 9 equivalents in the custom `eslint-plugin-babylonjs` plugin.

## Background

ESLint 9 deprecates several `context` methods. While they may still work, they will be removed in future versions. The custom plugin uses these deprecated methods:

| Deprecated (ESLint 8)     | Replacement (ESLint 9) |
| ------------------------- | ---------------------- |
| `context.getFilename()`   | `context.filename`     |
| `context.getSourceCode()` | `context.sourceCode`   |

## File to Modify

`/packages/tools/eslintBabylonPlugin/src/index.ts`

## Checklist

### 1. Replace `context.getFilename()` in `syntax` rule

- [ ] Find line ~239 in the `syntax` rule `create` function:

```typescript
const sourceFilePath: string = context.getFilename();
```

- [ ] Replace with:

```typescript
const sourceFilePath: string = context.filename;
```

### 2. Replace `context.getFilename()` in `existing` rule

- [ ] Find line ~417 in the `existing` rule `create` function:

```typescript
const sourceFilePath: string = context.getFilename();
```

- [ ] Replace with:

```typescript
const sourceFilePath: string = context.filename;
```

### 3. Replace `context.getSourceCode()` in `syntax` rule

- [ ] Find line ~280 in the `syntax` rule:

```typescript
const sourceCode: eslint.SourceCode = context.getSourceCode();
```

- [ ] Replace with:

```typescript
const sourceCode: eslint.SourceCode = context.sourceCode;
```

### 4. Replace `context.getSourceCode()` in `available` rule

- [ ] Find line ~355 in the `available` rule `create` function:

```typescript
const sourceCode: eslint.SourceCode = context.getSourceCode();
```

- [ ] Replace with:

```typescript
const sourceCode: eslint.SourceCode = context.sourceCode;
```

### 5. Replace `context.getSourceCode()` in `existing` rule

- [ ] Find line ~430 in the `existing` rule:

```typescript
const sourceCode: eslint.SourceCode = context.getSourceCode();
```

- [ ] Replace with:

```typescript
const sourceCode: eslint.SourceCode = context.sourceCode;
```

### 6. Verify `no-cross-package-relative-imports` rule

- [ ] Check the `no-cross-package-relative-imports` rule (around line 493)
- [ ] Verify it already uses `context.filename` (not the deprecated method)
- [ ] No changes needed if already using the new API

## Code Locations Reference

The file structure for `/packages/tools/eslintBabylonPlugin/src/index.ts`:

```
Line ~220-320: syntax rule
  - Line ~239: context.getFilename() → context.filename
  - Line ~280: context.getSourceCode() → context.sourceCode

Line ~340-400: available rule
  - Line ~355: context.getSourceCode() → context.sourceCode

Line ~405-470: existing rule
  - Line ~417: context.getFilename() → context.filename
  - Line ~430: context.getSourceCode() → context.sourceCode

Line ~475-510: no-cross-package-relative-imports rule
  - Already uses context.filename ✓

Line ~515-650: require-context-save-before-apply-states rule
  - Uses context.report() which is still valid ✓
```

## Success Criteria

- [ ] All instances of `context.getFilename()` replaced with `context.filename`
- [ ] All instances of `context.getSourceCode()` replaced with `context.sourceCode`
- [ ] No deprecated context methods remain in the file
- [ ] TypeScript compilation succeeds (run after Task 06)
- [ ] Plugin functions correctly (verified in Task 17)

## Testing

After making changes, verify with grep that no deprecated methods remain:

```bash
# Check for deprecated getFilename
grep -n "getFilename()" packages/tools/eslintBabylonPlugin/src/index.ts
# Should return no results

# Check for deprecated getSourceCode
grep -n "getSourceCode()" packages/tools/eslintBabylonPlugin/src/index.ts
# Should return no results

# Verify new APIs are used
grep -n "context\.filename" packages/tools/eslintBabylonPlugin/src/index.ts
# Should show the replacements

grep -n "context\.sourceCode" packages/tools/eslintBabylonPlugin/src/index.ts
# Should show the replacements
```

## Reference: All Deprecated Context Methods

For reference, here are all deprecated context methods in ESLint 9 (only some are used in this plugin):

| Deprecated                      | Replacement                         |
| ------------------------------- | ----------------------------------- |
| `context.getFilename()`         | `context.filename`                  |
| `context.getSourceCode()`       | `context.sourceCode`                |
| `context.getPhysicalFilename()` | `context.physicalFilename`          |
| `context.getCwd()`              | `context.cwd`                       |
| `context.parserServices`        | `context.sourceCode.parserServices` |

## Notes

- Line numbers are approximate and may vary slightly
- The `context.report()` method is NOT deprecated and should not be changed
- The new property-based APIs are available in ESLint 8.40+ and are the only option in ESLint 9+
