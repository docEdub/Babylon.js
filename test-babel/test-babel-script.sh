#!/bin/bash

INPUT_DIR="./test-babel"
OUTPUT_DIR="./test-babel-out"

# Clean output directory
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Run babel to compile .ts to .js with source maps
npx babel "$INPUT_DIR" \
    --out-dir "$OUTPUT_DIR" \
    --extensions ".ts" \
    --source-maps \
    --ignore "**/*.d.ts,**/test-babel-script.sh"

# Run tsc to generate .d.ts declaration files only
# Use rootDir to flatten output structure, suppress module resolution errors (expected for isolated test files)
npx tsc "$INPUT_DIR"/*.ts \
    --declaration \
    --emitDeclarationOnly \
    --outDir "$OUTPUT_DIR" \
    --rootDir "$INPUT_DIR" \
    --isolatedDeclarations \
    --skipLibCheck \
    2>&1 | grep -v "error TS" || true

echo "Done! Output in $OUTPUT_DIR"
