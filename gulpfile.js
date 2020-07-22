const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const archiver = require("archiver");
const stringify = require("json-stringify-pretty-compact");

const gulp = require("gulp");
const ts = require("gulp-typescript");

// Configuration
const distFolder = "dist"; // Output folder, will contain the full module as used by foundry.
const manifestType = "module.json"; // Type of manifest (module.json | system.json)

const zipName = manifest => `${manifest.name}-v${manifest.version}.zip`;
const permaLink = fileName =>
  `${process.env.CI_PROJECT_URL}/-/jobs/artifacts/${process.env.CI_COMMIT_REF_NAME}/raw/${fileName}?job=${process.env.CI_JOB_NAME}`;

// Manifest should point to latest in branch, not itself.
function permaLinkManifest() {
  let branch = process.env.CI_COMMIT_BRANCH || "master";
  return `${process.env.CI_PROJECT_URL}/-/jobs/artifacts/${branch}/raw/${manifestType}?job=${process.env.CI_JOB_NAME}`;
}

// Patterns for watch & compile
// TODO: File watch continuously chokes CPU if you add files that are missing
const sourceGroups = {
  ts: ["src/**/*.ts"],
  less: ["src/**/*.less"],
  sass: ["src/**/*.scss"],

  // Folders are copied as-is
  folders: ["templates"],
  // Files are copied following pattern
  statics: ["src/**/*.css"],
};

function resolveVersion(packageVersion) {
  const isTaggedRelease = process.env.CI_COMMIT_TAG;
  const isCI = process.env.CI;

  // Is a new tagged release in CI, commit should have
  // package.json with real version
  if (isTaggedRelease) {
    return packageVersion;
  }

  // Is in CI, but not a tagged release
  if (isCI) {
    // There should be some ever-increasing number in CI env
    const ciSequenceNo = process.env.CI_PIPELINE_IID;
    if (process.env.CI_COMMIT_REF_SLUG == "develop") {
      return `${packageVersion}-unstable.${ciSequenceNo}`;
    }
    return `${packageVersion}-${ciSequenceNo}`;
  }
  // Probably all local builds
  return `${packageVersion}-dirty`;
}

async function buildManifest() {
  await fs.ensureDir("dist");

  const manifest = await fs.readJSON(path.join("src", manifestType));
  const package = await fs.readJSON("package.json");

  const version = resolveVersion(package.version);

  let newManifest = {
    ...manifest,
    version: version,
    url: package.homepage,
    readme: package.homepage,
    bugs: package.bugs.url,
    license: package.license,
  };

  if (process.env.CI) {
    newManifest.manifest = permaLinkManifest();
    newManifest.download = permaLink(zipName(newManifest));

    if (process.env.CI_COMMIT_REF_SLUG === "develop") {
      newManifest.title = newManifest.title + "(unstable branch)";
    }
  }

  fs.writeFileSync(
    path.join(distFolder, manifestType),
    stringify(newManifest),
    "utf8"
  );
  return Promise.resolve();
}

function getManifest() {
  return fs.readJSONSync(path.join(distFolder, manifestType));
}

/********************/
/*		BUILD		*/
/********************/

/**
 * Build TypeScript
 */
const tsConfig = ts.createProject("tsconfig.json");
function buildTS() {
  return gulp
    .src(sourceGroups.ts, { allowEmpty: true })
    .pipe(tsConfig())
    .pipe(gulp.dest(distFolder));
}

/**
 * Copy static files
 */
async function copyFolders() {
  try {
    for (const folder of sourceGroups.folders) {
      if (fs.existsSync(folder)) {
        await fs.copy(folder, path.join("dist", folder));
      }
    }
    return Promise.resolve();
  } catch (err) {
    Promise.reject(err);
  }
}

async function copyStatics() {
  return gulp
    .src(sourceGroups.statics, { allowEmpty: true })
    .pipe(gulp.dest(distFolder));
}

/********************/
/*		CLEAN		*/
/********************/

/**
 * Remove all files from `dist`
 */
async function clean() {
  if (!fs.existsSync(distFolder)) {
    return Promise.resolve();
  }

  const files = await fs.readdir(distFolder);
  console.log(" ", chalk.yellow("Files to clean:"));
  console.log("   ", chalk.blueBright(files.join("\n    ")));

  await Promise.all(
    files.map(filePath => fs.remove(path.join(distFolder, filePath)))
  );
}

/********************/
/*		LINK		*/
/********************/

function getInstallPath() {
  const name = fs.readJSONSync("package.json").name;
  const config = fs.readJSONSync("foundryconfig.json");

  // Different types of extensions go in different destinations
  const extensionDir = {
    "module.json": "modules",
    "system.json": "systems",
  }[manifestType];

  if (!config.dataPath) {
    throw Error("No User Data path defined in foundryconfig.json");
  }

  if (!fs.existsSync(path.join(config.dataPath, "Data"))) {
    throw Error("User Data path invalid, no Data directory found");
  }

  return path.join(config.dataPath, "Data", extensionDir, name);
}

/**
 * Link build to User Data folder
 */

async function linkUserData() {
  try {
    const linkDir = getInstallPath();
    if (!fs.existsSync(linkDir)) {
      console.log(chalk.green(`Linking build to ${chalk.blueBright(linkDir)}`));
      await fs.symlink(path.resolve("./dist"), linkDir);
    }
    return Promise.resolve();
  } catch (err) {
    Promise.reject(err);
  }
}

/**
 * Unlink build to User Data folder
 */

async function unlinkUserData() {
  try {
    const linkDir = getInstallPath();
    if (!fs.existsSync(linkDir)) {
      console.log(
        chalk.yellow(`Removing build in ${chalk.blueBright(linkDir)}`)
      );
    }
    await fs.remove(linkDir);
    return Promise.resolve();
  } catch (err) {
    Promise.reject(err);
  }
}

/*********************/
/*		PACKAGE		 */
/*********************/

/**
 * Package build
 */
async function packageBuild() {
  try {
    const manifest = getManifest();
    // Ensure there is a directory to hold all the packaged versions
    const packDir = "package";
    await fs.ensureDir(packDir);

    const name = fs.readJSONSync("package.json").name;

    // Initialize the zip file
    const zipPath = path.join(packDir, zipName(manifest));

    const zipFile = fs.createWriteStream(zipPath);
    const zip = archiver("zip", { zlib: { level: 9 } });

    zipFile.on("close", () => {
      console.log(chalk.green(zip.pointer() + " total bytes"));
      console.log(chalk.green(`Zip file ${zipPath} has been written`));
      return Promise.resolve();
    });

    zip.on("error", err => {
      throw err;
    });

    zip.pipe(zipFile);

    // Add the directory with the final code
    zip.directory(distFolder, manifest.name);

    await zip.finalize();
  } catch (err) {
    Promise.reject(err);
  }
}

// TODO: Consider automating git later.

/**
 * Watch for changes for each build step
 */
function buildWatch() {
  const opts = { ignoreInitial: false };
  gulp.watch(path.join("src", manifestType), opts, buildManifest);
  gulp.watch(sourceGroups.ts, opts, buildTS);
  gulp.watch(sourceGroups.folders, opts, copyFolders);
  gulp.watch(sourceGroups.statics, opts, copyStatics);
}

const execBuild = gulp.series(
  buildManifest,
  gulp.parallel(buildTS, copyFolders, copyStatics)
);

// Single tasks
exports.clean = clean;
exports.link = linkUserData;
exports.unlink = unlinkUserData;
exports.package = packageBuild;
// Combined tasks
exports.build = execBuild;
exports.watch = buildWatch;
exports.publish = gulp.series(clean, execBuild, packageBuild);
