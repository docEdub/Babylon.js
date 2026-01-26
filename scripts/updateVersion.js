/* eslint-disable no-console */
const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const generateChangelog = require("./generateChangelog");

const branchName = process.argv[2];
const dryRun = process.argv[3];

const config = require(path.resolve("./.build/config.json"));

const baseDirectory = path.resolve(".");

async function runCommand(command) {
    return new Promise((resolve, reject) => {
        console.log(command);
        exec(command, function (error, stdout, stderr) {
            if (error || typeof stderr !== "string") {
                console.log(error);
                return reject(error || stderr);
            }
            console.log(stderr || stdout);
            return resolve(stderr || stdout);
        });
    });
}

// Parse a semver version string into its components
const parseVersion = (version) => {
    const prereleaseMatch = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+)\.(\d+))?$/);
    if (!prereleaseMatch) {
        throw new Error(`Invalid version format: ${version}`);
    }
    return {
        major: parseInt(prereleaseMatch[1], 10),
        minor: parseInt(prereleaseMatch[2], 10),
        patch: parseInt(prereleaseMatch[3], 10),
        prerelease: prereleaseMatch[4] || null,
        prereleaseNum: prereleaseMatch[5] !== undefined ? parseInt(prereleaseMatch[5], 10) : null,
    };
};

// Increment version based on version definition and optional preid
const incrementVersion = (currentVersion, versionDefinition, preid) => {
    const parsed = parseVersion(currentVersion);

    // If already a prerelease with the same preid, just bump the prerelease number
    if (parsed.prerelease && preid && parsed.prerelease === preid) {
        return `${parsed.major}.${parsed.minor}.${parsed.patch}-${preid}.${parsed.prereleaseNum + 1}`;
    }

    // Increment based on version definition
    let { major, minor, patch } = parsed;
    switch (versionDefinition) {
        case "major":
            major++;
            minor = 0;
            patch = 0;
            break;
        case "minor":
            minor++;
            patch = 0;
            break;
        case "patch":
            patch++;
            break;
        default:
            throw new Error(`Unknown version definition: ${versionDefinition}`);
    }

    // Add prerelease suffix if preid is provided
    if (preid) {
        return `${major}.${minor}.${patch}-${preid}.0`;
    }

    return `${major}.${minor}.${patch}`;
};

// Update version in all non-private package.json files
const updateAllPackageVersions = (versionDefinition, preid) => {
    // Get all package.json files in the packages directory (excluding node_modules)
    const packageJsonFiles = glob.globSync(path.join(baseDirectory, "packages", "**", "package.json"), {
        ignore: ["**/node_modules/**"],
    });

    // Find a non-private package to get the current version
    let currentVersion = null;
    for (const file of packageJsonFiles) {
        const data = fs.readFileSync(file, "utf-8");
        const packageJson = JSON.parse(data);
        if (!packageJson.private && packageJson.version) {
            currentVersion = packageJson.version;
            break;
        }
    }

    if (!currentVersion) {
        throw new Error("Could not find current version from any non-private package");
    }

    const newVersion = incrementVersion(currentVersion, versionDefinition, preid);
    console.log(`Incrementing version from ${currentVersion} to ${newVersion}`);

    // Update all non-private packages
    for (const file of packageJsonFiles) {
        const data = fs.readFileSync(file, "utf-8");
        const packageJson = JSON.parse(data);

        if (!packageJson.private) {
            packageJson.version = newVersion;
            fs.writeFileSync(file, JSON.stringify(packageJson, null, 4));
            console.log(`Updated ${file} to version ${newVersion}`);
        }
    }

    return newVersion;
};

const updateEngineVersion = async (version) => {
    // get thinEngine.ts
    const abstractEngineFile = path.join(baseDirectory, "packages", "dev", "core", "src", "Engines", "abstractEngine.ts");
    const abstractEngineData = fs.readFileSync(abstractEngineFile, "utf-8");
    const array = /"babylonjs@(.*)"/.exec(abstractEngineData);
    if (!array) {
        throw new Error("Could not find babylonjs version in abstractEngine.ts");
    }

    const regexp = new RegExp(array[1] + '"', "g");
    const newAbstractEngineData = abstractEngineData.replace(regexp, version + '"');
    fs.writeFileSync(abstractEngineFile, newAbstractEngineData);
};

const updateSinceTag = (version) => {
    // get all typescript files in the dev folder
    const files = glob.globSync(path.join(baseDirectory, "packages", "dev", "**", "*.ts"));
    files.forEach((file) => {
        try {
            // check if file contains @since\n
            const data = fs.readFileSync(file, "utf-8").replace(/\r/gm, "");
            if (data.indexOf("* @since\n") !== -1) {
                console.log(`Updating @since tag in ${file} to ${version}`);
                // replace @since with @since version
                const newData = data.replace(
                    /\* @since\n/gm,
                    `* @since ${version}
`
                );

                // write file
                fs.writeFileSync(file, newData);
            }
        } catch (e) {
            console.log(e);
        }
    });
    // run formatter to make sure the package.json files are formatted
    runCommand("npx prettier --write packages/public/**/package.json");
};

const updatePeerDependencies = async (version) => {
    // get all package.json files in the dev folder
    const files = glob.globSync(path.join(baseDirectory, "packages", "public", "**", "package.json"));
    files.forEach((file) => {
        try {
            // check if file contains @since\n
            const data = fs.readFileSync(file, "utf-8").replace(/\r/gm, "");
            const packageJson = JSON.parse(data);
            // check each peer dependency, if it is babylon, update it with the new version
            let changed = false;
            if (packageJson.peerDependencies) {
                Object.keys(packageJson.peerDependencies).forEach((dependency) => {
                    if (dependency.startsWith("babylonjs") || dependency.startsWith("@babylonjs")) {
                        packageJson.peerDependencies[dependency] = version;
                        changed = true;
                    }
                });
            }
            if (changed) {
                console.log(`Updating Babylon peerDependencies in ${file} to ${version}`);
                // write file
                fs.writeFileSync(file, JSON.stringify(packageJson, null, 4));
            }
        } catch (e) {
            console.log(e);
        }
    });
};

async function runTagsUpdate() {
    // Update version in all non-private package.json files
    const version = updateAllPackageVersions(config.versionDefinition, config.preid);
    // update engine version
    await updateEngineVersion(version);
    // generate changelog
    await generateChangelog(version);
    // update since tags
    updateSinceTag(version);
    // if major, update peer dependencies
    if (config.versionDefinition === "major") {
        await updatePeerDependencies(`^${version}`);
    }
    if (dryRun) {
        console.log("skipping", `git commit -m "Version update ${version}"`);
        console.log("skipping", `git tag -a ${version} -m ${version}`);
    } else {
        await runCommand("git add .");
        await runCommand(`git commit -m "Version update ${version}"`);
        await runCommand(`git tag -a ${version} -m ${version}`);
    }
}
if (!branchName) {
    console.log("Please provide a branch name");
    process.exit(1);
} else {
    runTagsUpdate();
}
