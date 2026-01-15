#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * TypeScript Compatibility Test Script
 *
 * Tests the built Babylon.js packages against older TypeScript versions
 * to ensure backward compatibility.
 *
 * Usage:
 *   node scripts/test-ts-compat.mjs [--versions 5.4,5.5,5.6] [--packages core,gui]
 *
 * Options:
 *   --versions  Comma-separated list of TypeScript versions to test (default: 5.0,5.2,5.4,5.6,5.7,5.8)
 *   --packages  Comma-separated list of packages to test (default: core)
 *   --verbose   Show detailed output
 *   --keep      Keep the temporary test directory after completion
 */

import { execSync, spawn } from "child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");

// Default TypeScript versions to test against
const DEFAULT_TS_VERSIONS = ["5.0", "5.2", "5.4", "5.6", "5.7", "5.8"];

// Package paths relative to ROOT_DIR
const PACKAGE_PATHS = {
    core: "packages/public/@babylonjs/core",
    gui: "packages/public/@babylonjs/gui",
    loaders: "packages/public/@babylonjs/loaders",
    materials: "packages/public/@babylonjs/materials",
    serializers: "packages/public/@babylonjs/serializers",
};

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        versions: DEFAULT_TS_VERSIONS,
        packages: ["core"],
        verbose: false,
        keep: false,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--versions":
                options.versions = args[++i].split(",").map((v) => v.trim());
                break;
            case "--packages":
                options.packages = args[++i].split(",").map((p) => p.trim());
                break;
            case "--verbose":
                options.verbose = true;
                break;
            case "--keep":
                options.keep = true;
                break;
            case "--help":
                console.log(`
TypeScript Compatibility Test Script

Tests the built Babylon.js packages against older TypeScript versions.

Usage:
  node scripts/test-ts-compat.mjs [options]

Options:
  --versions <list>  Comma-separated TS versions (default: ${DEFAULT_TS_VERSIONS.join(",")})
  --packages <list>  Comma-separated packages (default: core)
                     Available: ${Object.keys(PACKAGE_PATHS).join(", ")}
  --verbose          Show detailed output
  --keep             Keep temporary test directory
  --help             Show this help message
`);
                process.exit(0);
        }
    }

    return options;
}

function log(message, verbose = false) {
    if (!verbose || options.verbose) {
        console.log(message);
    }
}

function createTestDir() {
    const testDir = resolve(ROOT_DIR, ".ts-compat-test");
    if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true });
    }
    mkdirSync(testDir);
    return testDir;
}

function generateTestFile(packages) {
    // For each package, we create a simple reference to ensure the types parse correctly
    // The actual type checking is done by including the .d.ts files in the compilation
    return `// This file triggers type-checking of the Babylon.js declaration files
// The actual checks happen via the tsconfig.json include patterns

export {};
`;
}

function generateTsConfig(packages) {
    // Get absolute paths to packages - include all .d.ts files
    const includePatterns = packages.map((pkg) => {
        const pkgPath = resolve(ROOT_DIR, PACKAGE_PATHS[pkg]);
        return `${pkgPath}/**/*.d.ts`;
    });

    return JSON.stringify(
        {
            compilerOptions: {
                target: "ES2020",
                module: "ESNext",
                moduleResolution: "node",
                strict: true,
                noEmit: true,
                skipLibCheck: false, // We want to check our .d.ts files
                esModuleInterop: true,
                lib: ["ES2020", "DOM"],
                // Ignore errors from external modules we can't control
                paths: {
                    "entities/*": ["./node_modules/entities/dist/esm/*"],
                },
            },
            include: includePatterns,
            exclude: [
                "**/node_modules/**",
                // Exclude test files that might have different requirements
                "**/*.test.d.ts",
                "**/*.spec.d.ts",
            ],
        },
        null,
        2
    );
}

async function runTsc(testDir, tsVersion) {
    return new Promise((resolve) => {
        const tscPath = `${testDir}/node_modules/.bin/tsc`;

        const proc = spawn(tscPath, ["--noEmit"], {
            cwd: testDir,
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        proc.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        proc.on("close", (code) => {
            resolve({
                success: code === 0,
                stdout,
                stderr,
                code,
            });
        });

        proc.on("error", (err) => {
            resolve({
                success: false,
                stdout,
                stderr: err.message,
                code: -1,
            });
        });
    });
}

function filterBabylonErrors(errorOutput) {
    if (!errorOutput) {
        return { filtered: "", babylonErrors: [], otherErrors: [] };
    }

    const lines = errorOutput.split("\n");
    const babylonErrors = [];
    const otherErrors = [];
    let currentError = [];

    for (const line of lines) {
        // Check if this is a new error line (starts with a path)
        if (line.match(/^\.\.\/.*\.d\.ts\(\d+,\d+\):|^\.\.\/.*\.ts\(\d+,\d+\):/)) {
            // Save previous error if exists
            if (currentError.length > 0) {
                const errorText = currentError.join("\n");
                if (errorText.includes("@babylonjs") || errorText.includes("packages/public")) {
                    babylonErrors.push(errorText);
                } else if (!errorText.includes("node_modules")) {
                    babylonErrors.push(errorText);
                } else {
                    otherErrors.push(errorText);
                }
            }
            currentError = [line];
        } else if (currentError.length > 0) {
            currentError.push(line);
        }
    }

    // Don't forget the last error
    if (currentError.length > 0) {
        const errorText = currentError.join("\n");
        if (errorText.includes("@babylonjs") || errorText.includes("packages/public")) {
            babylonErrors.push(errorText);
        } else if (!errorText.includes("node_modules")) {
            babylonErrors.push(errorText);
        } else {
            otherErrors.push(errorText);
        }
    }

    return {
        filtered: babylonErrors.join("\n"),
        babylonErrors,
        otherErrors,
    };
}

async function testVersion(testDir, tsVersion, packages) {
    log(`\n${"=".repeat(60)}`);
    log(`Testing TypeScript ${tsVersion}...`);
    log(`${"=".repeat(60)}`);

    // Install specific TypeScript version
    log(`  Installing typescript@${tsVersion}...`, true);
    try {
        execSync(`npm install typescript@${tsVersion} --save-dev --silent`, {
            cwd: testDir,
            stdio: options.verbose ? "inherit" : "pipe",
        });
    } catch (error) {
        log(`  FAILED to install TypeScript ${tsVersion}`);
        return { version: tsVersion, success: false, error: "Installation failed" };
    }

    // Get exact installed version
    let installedVersion;
    try {
        const pkgJson = JSON.parse(readFileSync(`${testDir}/node_modules/typescript/package.json`, "utf8"));
        installedVersion = pkgJson.version;
        log(`  Installed version: ${installedVersion}`, true);
    } catch {
        installedVersion = tsVersion;
    }

    // Run tsc
    log(`  Running type check...`, true);
    const result = await runTsc(testDir, tsVersion);

    // Filter errors to only show Babylon.js related ones
    const { babylonErrors, otherErrors } = filterBabylonErrors(result.stdout);
    const hasBabylonErrors = babylonErrors.length > 0;

    if (!hasBabylonErrors) {
        log(`  PASSED - TypeScript ${installedVersion}`);
        if (otherErrors.length > 0) {
            log(`  (${otherErrors.length} external dependency errors ignored)`, true);
        }
    } else {
        log(`  FAILED - TypeScript ${installedVersion} (${babylonErrors.length} errors)`);
        log(`\n  Babylon.js Errors:`);
        for (const err of babylonErrors) {
            log(`    ${err.split("\n").join("\n    ")}`);
        }
        if (otherErrors.length > 0) {
            log(`\n  (${otherErrors.length} external dependency errors ignored)`, true);
        }
    }

    return {
        version: tsVersion,
        installedVersion,
        success: !hasBabylonErrors,
        babylonErrors,
        otherErrors,
        errors: result.stdout || result.stderr,
    };
}

let options;

async function main() {
    options = parseArgs();

    console.log("Babylon.js TypeScript Compatibility Test");
    console.log("========================================\n");
    console.log(`Packages to test: ${options.packages.join(", ")}`);
    console.log(`TypeScript versions: ${options.versions.join(", ")}`);

    // Verify packages exist
    for (const pkg of options.packages) {
        if (!PACKAGE_PATHS[pkg]) {
            console.error(`Unknown package: ${pkg}`);
            console.error(`Available packages: ${Object.keys(PACKAGE_PATHS).join(", ")}`);
            process.exit(1);
        }
        const pkgPath = resolve(ROOT_DIR, PACKAGE_PATHS[pkg], "index.d.ts");
        if (!existsSync(pkgPath)) {
            console.error(`\nPackage ${pkg} not built. Please run 'npm run build' first.`);
            console.error(`Expected: ${pkgPath}`);
            process.exit(1);
        }
    }

    // Create test directory
    const testDir = createTestDir();
    log(`\nTest directory: ${testDir}`, true);

    // Initialize package.json
    writeFileSync(
        `${testDir}/package.json`,
        JSON.stringify(
            {
                name: "ts-compat-test",
                version: "1.0.0",
                type: "module",
            },
            null,
            2
        )
    );

    // Generate test files
    writeFileSync(`${testDir}/test.ts`, generateTestFile(options.packages));
    writeFileSync(`${testDir}/tsconfig.json`, generateTsConfig(options.packages));

    log("\nGenerated test files:", true);
    log(`  - ${testDir}/test.ts`, true);
    log(`  - ${testDir}/tsconfig.json`, true);

    // Test each version
    const results = [];
    for (const version of options.versions) {
        const result = await testVersion(testDir, version, options.packages);
        results.push(result);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));

    const passed = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`\nPassed: ${passed.length}/${results.length}`);
    if (passed.length > 0) {
        console.log(`  ${passed.map((r) => `TS ${r.installedVersion || r.version}`).join(", ")}`);
    }

    if (failed.length > 0) {
        console.log(`\nFailed: ${failed.length}/${results.length}`);
        console.log(`  ${failed.map((r) => `TS ${r.installedVersion || r.version}`).join(", ")}`);
    }

    // Cleanup
    if (!options.keep) {
        log("\nCleaning up test directory...", true);
        rmSync(testDir, { recursive: true });
    } else {
        console.log(`\nTest directory kept at: ${testDir}`);
    }

    // Exit with appropriate code
    process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
});
