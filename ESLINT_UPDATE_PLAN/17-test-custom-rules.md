# Task 17: Test Custom Rules

## Objective

Test each custom rule in the `eslint-plugin-babylonjs` plugin to ensure they work correctly with ESLint 9.

## Background

The custom plugin has 5 rules that need to be tested:

1. `babylonjs/syntax` - Validates TSDoc comments
2. `babylonjs/available` - Ensures documentation exists for public members
3. `babylonjs/existing` - Checks that comments exist
4. `babylonjs/no-cross-package-relative-imports` - Prevents cross-package relative imports
5. `babylonjs/require-context-save-before-apply-states` - GUI-specific rule

## Prerequisites

- Task 06 complete (plugin rebuilt)
- Task 16 complete (basic linting works)

## Checklist

### 1. Test `babylonjs/syntax` rule

- [ ] Create a test file with invalid TSDoc:

```typescript
// test-syntax.ts
/**
 * @param name - missing type
 * @returns
 */
export function testFunc(name) {
    return name;
}
```

- [ ] Run ESLint on the file:

```bash
npx eslint test-syntax.ts
```

- [ ] Verify the rule reports TSDoc syntax errors
- [ ] Clean up: `rm test-syntax.ts`

### 2. Test `babylonjs/available` rule

- [ ] Create a test file with undocumented public member:

```typescript
// test-available.ts
export class TestClass {
    // Missing documentation
    public someMethod() {
        return 1;
    }
}
```

- [ ] Run ESLint:

```bash
npx eslint test-available.ts
```

- [ ] Verify the rule reports missing documentation
- [ ] Verify private members don't trigger the rule:

```typescript
export class TestClass {
    // Should not report - private
    private _privateMethod() {}
}
```

- [ ] Clean up test files

### 3. Test `babylonjs/existing` rule

Note: This rule may overlap with `available`. Test if configured.

- [ ] Verify rule reports when no comment exists for public declarations

### 4. Test `babylonjs/no-cross-package-relative-imports` rule

- [ ] Create a test file that simulates a cross-package import:

```typescript
// packages/dev/core/src/test-imports.ts
// This should trigger if it imports from another package using relative path
import { something } from "../../../gui/src/index";
```

- [ ] Run ESLint:

```bash
npx eslint packages/dev/core/src/test-imports.ts
```

- [ ] Verify the rule reports the violation
- [ ] Verify the auto-fix suggests the correct path mapping
- [ ] Test the fix:

```bash
npx eslint packages/dev/core/src/test-imports.ts --fix
```

- [ ] Clean up test file

### 5. Test `babylonjs/require-context-save-before-apply-states` rule

- [ ] Create a test file in GUI controls directory:

```typescript
// packages/dev/gui/src/2D/controls/test-control.ts
export class TestControl {
    public draw(context: CanvasRenderingContext2D) {
        // Missing context.save() - should error
        this._applyStates(context);
    }

    private _applyStates(context: CanvasRenderingContext2D) {}
}
```

- [ ] Run ESLint:

```bash
npx eslint packages/dev/gui/src/2D/controls/test-control.ts
```

- [ ] Verify the rule reports missing `context.save()`
- [ ] Test that proper usage doesn't report:

```typescript
export class TestControl {
    public draw(context: CanvasRenderingContext2D) {
        context.save(); // This should prevent the error
        this._applyStates(context);
        context.restore();
    }

    private _applyStates(context: CanvasRenderingContext2D) {}
}
```

- [ ] Clean up test file

## Success Criteria

- [ ] `babylonjs/syntax` rule correctly identifies TSDoc issues
- [ ] `babylonjs/available` rule reports undocumented public members
- [ ] `babylonjs/available` rule ignores private/protected members
- [ ] `babylonjs/no-cross-package-relative-imports` rule identifies cross-package imports
- [ ] `babylonjs/no-cross-package-relative-imports` auto-fix works correctly
- [ ] `babylonjs/require-context-save-before-apply-states` rule works in GUI controls directory
- [ ] All rules have correct error messages
- [ ] No false positives on valid code

## Testing Script

Create a comprehensive test script:

```bash
#!/bin/bash
# test-custom-rules.sh

echo "Testing babylonjs/syntax..."
cat > /tmp/test-syntax.ts << 'EOF'
/**
 * @param name
 * @returns
 */
export function test(name: string) { return name; }
EOF
npx eslint /tmp/test-syntax.ts 2>&1 | grep -i "babylonjs/syntax\|tsdoc"
rm /tmp/test-syntax.ts

echo ""
echo "Testing babylonjs/available..."
cat > /tmp/test-available.ts << 'EOF'
export class Test {
    public undocumented() { return 1; }
}
EOF
npx eslint /tmp/test-available.ts 2>&1 | grep -i "babylonjs/available\|no-doc"
rm /tmp/test-available.ts

echo ""
echo "Testing babylonjs/no-cross-package-relative-imports..."
# This test requires proper project structure, so test against existing file

echo ""
echo "Testing babylonjs/require-context-save-before-apply-states..."
mkdir -p packages/dev/gui/src/2D/controls/test
cat > packages/dev/gui/src/2D/controls/test/test-control.ts << 'EOF'
export class TestControl {
    public draw(context: CanvasRenderingContext2D) {
        this._applyStates(context);
    }
    private _applyStates(context: CanvasRenderingContext2D) {}
}
EOF
npx eslint packages/dev/gui/src/2D/controls/test/test-control.ts 2>&1 | grep -i "context.save\|missingSave"
rm -rf packages/dev/gui/src/2D/controls/test

echo ""
echo "Custom rule testing complete!"
```

## Troubleshooting

### Rule not triggering

1. Check the rule is enabled in config:

```bash
npx eslint --print-config <file> | grep babylonjs
```

2. Verify plugin is loaded:

```bash
npx eslint --print-config <file> | grep -A5 '"plugins"'
```

3. Check file matches the rule's file patterns

### Rule behavior changed

1. Check if there were changes to context APIs (Tasks 03-04)
2. Verify rule meta schema is correct (Task 05)
3. Check ESLint version compatibility

### Auto-fix not working

1. Verify `meta.fixable` is set in the rule
2. Run with `--fix-dry-run` to preview fixes
3. Check for syntax errors in the fixer function

## Notes

- Test files should be removed after testing to avoid committing them
- Some rules only apply to specific file patterns (e.g., GUI controls)
- The import rule requires proper tsconfig.json path mappings
- Consider adding automated tests for these rules in the future
