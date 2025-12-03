# ESLint 9 Migration - Task Overview

This folder contains sequentially numbered task files for migrating Babylon.js from ESLint 8.57.1 to ESLint 9.39.1.

## Task Order

Execute tasks in numerical order. Some tasks can be done in parallel where noted.

| Task | File                                    | Description                                   | Dependencies |
| ---- | --------------------------------------- | --------------------------------------------- | ------------ |
| 01   | `01-check-plugin-compatibility.md`      | Research and verify plugin compatibility      | None         |
| 02   | `02-update-plugin-dependencies.md`      | Update eslint-plugin-babylonjs package.json   | Task 01      |
| 03   | `03-update-plugin-deprecated-apis.md`   | Replace deprecated context APIs in plugin     | Task 02      |
| 04   | `04-add-plugin-meta-information.md`     | Add meta object to plugin export              | Task 03      |
| 05   | `05-add-rule-meta-schemas.md`           | Add schema definitions to rules               | Task 04      |
| 06   | `06-rebuild-and-verify-plugin.md`       | Build plugin and verify TypeScript compiles   | Task 05      |
| 07   | `07-update-root-eslint-version.md`      | Update ESLint to v9 in root package.json      | Task 06      |
| 08   | `08-add-new-dependencies.md`            | Add globals, @eslint/js packages              | Task 07      |
| 09   | `09-update-plugin-dependencies-root.md` | Update/replace eslint plugins for flat config | Task 08      |
| 10   | `10-create-flat-config-structure.md`    | Create eslint.config.js with basic structure  | Task 09      |
| 11   | `11-convert-global-settings.md`         | Convert env, parser, parserOptions            | Task 10      |
| 12   | `12-convert-plugins-and-extends.md`     | Convert plugins array and extends             | Task 11      |
| 13   | `13-convert-typescript-override.md`     | Convert TypeScript files override             | Task 12      |
| 14   | `14-convert-gui-override.md`            | Convert GUI controls override                 | Task 13      |
| 15   | `15-copy-rules-and-settings.md`         | Copy all rules and settings                   | Task 14      |
| 16   | `16-run-linting-tests.md`               | Run ESLint and compare output                 | Task 15      |
| 17   | `17-test-custom-rules.md`               | Test each babylonjs custom rule               | Task 16      |
| 18   | `18-run-full-test-suite.md`             | Run full project test suite                   | Task 17      |
| 19   | `19-cleanup-old-config.md`              | Remove .eslintrc.js and .eslintignore         | Task 18      |
| 20   | `20-update-documentation.md`            | Update any docs referencing old config        | Task 19      |

## Current State

- **ESLint Version**: 8.57.1
- **Config Format**: Legacy `.eslintrc.js` (CommonJS)
- **Custom Plugin**: `eslint-plugin-babylonjs` at `packages/tools/eslintBabylonPlugin/`
- **Plugin Rules**: `syntax`, `available`, `existing`, `no-cross-package-relative-imports`, `require-context-save-before-apply-states`

## Target State

- **ESLint Version**: 9.39.1
- **Config Format**: Flat config `eslint.config.js`
- **Custom Plugin**: Updated for ESLint 9 compatibility with `meta` object

## Key Resources

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [ESLint Flat Config Documentation](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [typescript-eslint Flat Config](https://typescript-eslint.io/getting-started/typed-linting)

## Working Branch

All work should be done on the `251203-eslint-update` branch (or `chore/eslint-9-migration`).
