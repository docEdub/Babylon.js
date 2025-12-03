# Task 07: Update Root ESLint Version

## Objective

Update ESLint from version 8.57.1 to version 9.39.1 in the root `package.json`.

## Background

This is the core change for the migration. ESLint 9 is a major version with breaking changes, primarily around the configuration format (flat config vs legacy config).

## File to Modify

`/package.json`

## Current State

```json
{
    "devDependencies": {
        "eslint": "^8.57.1"
        // ... other dependencies
    }
}
```

## Checklist

### 1. Update ESLint version

- [ ] Find the `eslint` entry in `devDependencies`
- [ ] Change from `"^8.57.1"` to `"^9.39.1"`

### 2. Verify the change

- [ ] Ensure the version string is exactly `"^9.39.1"`
- [ ] Ensure no typos in the package name

## Target State

```json
{
    "devDependencies": {
        "eslint": "^9.39.1"
        // ... other dependencies
    }
}
```

## Important Note

**Do NOT run `npm install` yet!**

Wait until Task 08 and Task 09 are complete to avoid multiple dependency resolution cycles. The new dependencies need to be added first to ensure compatibility.

## Success Criteria

- [ ] `package.json` contains `"eslint": "^9.39.1"` in devDependencies
- [ ] JSON is valid (no syntax errors)
- [ ] The change is the only modification to the ESLint version line

## Testing

Validate JSON syntax only (do not install yet):

```bash
# Check JSON is valid
node -e "JSON.parse(require('fs').readFileSync('package.json'))"

# Verify the change
grep -A1 '"eslint"' package.json
# Should show: "eslint": "^9.39.1",
```

## Post-Task Actions

After completing Tasks 07, 08, and 09:

```bash
npm install
```

This will install ESLint 9 along with all the required new dependencies.

## Notes

- ESLint 9.39.1 is the target version as specified in the migration plan
- The `^` prefix allows minor and patch updates (9.39.x and above within 9.x)
- ESLint 9 requires Node.js 18.18.0 or later
- Verify Node.js version if you encounter installation issues:
    ```bash
    node --version
    # Should be v18.18.0 or higher
    ```
