const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const gulp = require("gulp");
const ts = require("gulp-typescript");

const buildTools = require("build-tools");

// Configuration
const options = {
  outDir: path.resolve("dist"),
  manifest: "./src/module.json",
};

const packageTool = new buildTools.PackageTool(options);

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

/**
 * Build TypeScript
 */
const tsConfig = ts.createProject("tsconfig.json");
function buildTS() {
  return gulp
    .src(sourceGroups.ts, { allowEmpty: true })
    .pipe(tsConfig())
    .pipe(gulp.dest(options.outDir));
}

/**
 * Copy static files
 */
async function copyFolders() {
  for (const folder of sourceGroups.folders) {
    if (fs.existsSync(folder)) {
      await fs.copy(folder, path.join(options.outDir, folder));
    }
  }
}

async function copyStatics() {
  return gulp
    .src(sourceGroups.statics, { allowEmpty: true })
    .pipe(gulp.dest(options.outDir));
}

/**
 * Remove all files from `dist`
 */
async function clean() {
  if (!fs.existsSync(options.outDir)) {
    return Promise.resolve();
  }

  const files = await fs.readdir(options.outDir);
  console.log(" ", chalk.yellow("Files to clean:"));
  console.log("   ", chalk.blueBright(files.join("\n    ")));

  await Promise.all(
    files.map(filePath => fs.remove(path.join(options.outDir, filePath)))
  );
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
  const opts = { ignoreInitial: false };
  gulp.watch(options.manifest, opts, packageTool.buildManifest);
  gulp.watch(sourceGroups.ts, opts, buildTS);
  gulp.watch(sourceGroups.folders, opts, copyFolders);
  gulp.watch(sourceGroups.statics, opts, copyStatics);
}

const execBuild = gulp.parallel(
  packageTool.buildManifest,
  buildTS,
  copyFolders,
  copyStatics
);

// Single tasks
exports.clean = clean;
exports.link = () => buildTools.linkUserData(options.manifest, options.outDir);
exports.unlink = () => buildTools.unlinkUserData(options.manifest);
exports.package = packageTool.package;

// Combined tasks
exports.build = execBuild;
exports.watch = buildWatch;
exports.publish = gulp.series(clean, execBuild, packageTool.package);
