const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const archiver = require('archiver');
const stringify = require('json-stringify-pretty-compact');

const gulp = require('gulp');
const ts = require('gulp-typescript');
const less = require('gulp-less');
const sass = require('gulp-sass');

sass.compiler = require('sass');

// Configuration
// Output folder, will contain the full module as used by foundry.
const distFolder = 'dist';
// Type of manifest (module.json | system.json)
const manifestType = 'module.json';

// Patterns for watch & compile
// TODO: File watch continuously chokes CPU if you add files that are missing
const sourceGroups = {
	'ts': ['**/*.ts'],
	'less': ['**/*.less'],
	'sass': ['**/*.scss'],

	// Folders are copied as-is
	'folders': [
		// 'lang',
		// 'fonts',
		// 'assets',
		'templates',
	],
	// Files are copied following pattern
	'statics': [
		'**/*.css',
		// 'template.json',
	],
};

function resolveVersion(packageVersion) {
	// Dummy logic ahead
	const isTaggedRelease = false;
	const isCI = true;

	// Is a new tagged release in CI, commit should have
	// package.json with real version
	if (isTaggedRelease) {
		return packageVersion;
	}
	// Is in CI, but not a tagged release
	if (isCI) {
		// There should be some ever-increasing number in CI env
		const ciSequenceNo = new Date().getTime();
		return `${packageVersion}-${ciSequenceNo}`;
	}
	// Probably all local builds
	return `${packageVersion}-dirty`;
}

async function buildManifest() {
	// const config = await fs.readJSON('foundryconfig.json');
	const module = await fs.readJSON(path.join("src", manifestType));
	const package = await fs.readJSON('package.json');

	const version = resolveVersion(package.version);

	let newModule = {
		...module,
		version: version,
		url: package.homepage,
		readme: package.homepage,
		bugs: package.bugs.url,
		license: package.license
	};

	fs.writeFileSync(path.join(distFolder, manifestType), stringify(newModule), 'utf8');
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
const tsConfig = ts.createProject('tsconfig.json');
function buildTS() {
	return gulp
		.src(sourceGroups.ts, { allowEmpty: true, cwd: 'src' })
		.pipe(tsConfig())
		.pipe(gulp.dest(distFolder));
}

/**
 * Build Less
 */
function buildLess() {
	return gulp
		.src(sourceGroups.less, { allowEmpty: true, cwd: 'src' })
		.pipe(less())
		.pipe(gulp.dest(distFolder));
}

/**
 * Build SASS
 */
function buildSASS() {
	return gulp
		.src(sourceGroups.sass, { allowEmpty: true, cwd: 'src' })
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(distFolder));
}

/**
 * Copy static files
 */
async function copyFolders() {
	try {
		for (const folder of sourceGroups.folders) {
			if (fs.existsSync(path.join('src', folder))) {
				await fs.copy(path.join('src', folder), path.join('dist', folder));
			}
		}
		return Promise.resolve();
	} catch (err) {
		Promise.reject(err);
	}
}

async function copyStatics() {
	return gulp
		.src(sourceGroups.statics, { allowEmpty: true, cwd: 'src' })
		.pipe(gulp.dest(distFolder));
}

/**
 * Watch for changes for each build step
 */
function buildWatch() {
	const opts = { ignoreInitial: false, cwd: 'src' };
	gulp.watch(manifestType, opts, buildManifest);
	gulp.watch(sourceGroups.ts, opts, buildTS);
	gulp.watch(sourceGroups.less, opts, buildLess);
	gulp.watch(sourceGroups.sass, opts, buildSASS);
	gulp.watch(sourceGroups.folders, opts, copyFolders);
	gulp.watch(sourceGroups.statics, opts, copyStatics);
}

/********************/
/*		CLEAN		*/
/********************/

/**
 * Remove all files from `dist`
 */
async function clean() {
	if (!fs.existsSync(distFolder)) { return Promise.resolve(); }

	const files = await fs.readdir(distFolder);
	console.log(' ', chalk.yellow('Files to clean:'));
	console.log('   ', chalk.blueBright(files.join('\n    ')));

	await Promise.all(files.map(filePath => fs.remove(path.join(distFolder, filePath))));
}

/********************/
/*		LINK		*/
/********************/

function getInstallPath() {
	const name = fs.readJSONSync('package.json').name;
	const config = fs.readJSONSync('foundryconfig.json');

	// Different types of extensions go in different destinations
	const extensionDir = {
		'module.json': 'modules',
		'system.json': 'systems',
	}[manifestType];

	if (!config.dataPath) {
		throw Error('No User Data path defined in foundryconfig.json');
	}

	if (!fs.existsSync(path.join(config.dataPath, 'Data'))) {
		throw Error('User Data path invalid, no Data directory found');
	}

	return path.join(config.dataPath, 'Data', extensionDir, name);
}

/**
 * Link build to User Data folder
 */

async function linkUserData() {
	try {
		const linkDir = getInstallPath()
		if (!fs.existsSync(linkDir)) {
			console.log(chalk.green(`Linking build to ${chalk.blueBright(linkDir)}`));
			await fs.symlink(path.resolve('./dist'), linkDir);
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
		const linkDir = getInstallPath()
		if (!fs.existsSync(linkDir)) {
			console.log(chalk.yellow(`Removing build in ${chalk.blueBright(linkDir)}`));
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
		await fs.ensureDir('package');

		// Initialize the zip file
		const zipName = `${manifest.name}-v${manifest.version}.zip`;
		const zipFile = fs.createWriteStream(path.join('package', zipName));
		const zip = archiver('zip', { zlib: { level: 9 } });

		zipFile.on('close', () => {
			console.log(chalk.green(zip.pointer() + ' total bytes'));
			console.log(chalk.green(`Zip file ${zipName} has been written`));
			return Promise.resolve();
		});

		zip.on('error', err => {
			throw err;
		});

		zip.pipe(zipFile);

		// Add the directory with the final code
		zip.directory(distFolder, manifest.name);

		zip.finalize();
	} catch (err) {
		Promise.reject(err);
	}
}

// TODO: Consider automating git later.

const execBuild = gulp.parallel(
	buildManifest,
	buildTS,
	buildLess,
	buildSASS,
	copyFolders,
	copyStatics,
);

exports.manifest = buildManifest;
exports.build = gulp.series(execBuild);
exports.watch = buildWatch;
exports.clean = clean;
exports.link = linkUserData;
exports.unlink = unlinkUserData;
exports.package = packageBuild;
exports.publish = gulp.series(
	clean,
	buildManifest,
	execBuild,
	packageBuild,
);
