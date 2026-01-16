/**
 * @file
 * Gulp file provided by jigarius/drupal-gulp.
 */

import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import csso from 'gulp-csso';
import * as dartSass from 'sass'
import eslint from 'gulp-eslint';
import fs from 'fs';
import { globSync } from 'glob';
import * as gulp from 'gulp';
import gulpSass from 'gulp-sass';
import logger from 'gulplog';
import path from 'path';
import rename from 'gulp-rename';
import sassLint from 'gulp-sass-lint';
import svgstore from 'svgstore';
import uglify from 'gulp-uglify';

import config from './gulp.config.mjs';

logger.debug('Configuration:', config.toString());

/**
 * Show configuration.
 */
export function showConfig(callback) {
  console.log(config.toString());
  callback();
}
showConfig.displayName = 'config';
showConfig.description = "Show the configuration object."

/**
 * Clean styles.
 */
export function cleanStyles(callback) {
  config.styleDestinations.forEach((pattern) => {
    globSync(pattern).forEach((path) => {
      fs.unlinkSync(path);
      logger.debug(`Deleted: ${path}`);
    });
  });

  callback();
}
cleanStyles.displayName = 'clean:styles';
cleanStyles.description = 'Clean style output directories.';

/**
 * Clean scripts.
 */
export function cleanScripts(callback) {
  config.scriptDestinations.forEach((pattern) => {
    globSync(pattern).forEach((path) => {
      fs.unlinkSync(path);
      logger.debug(`Deleted: ${path}`);
    });
  });

  callback();
}
cleanScripts.displayName = 'clean:scripts';
cleanScripts.description = 'Clean script output directories.';

/**
 * Build styles.
 */
export function buildStyles(callback) {
  if (config.styleSources.length === 0) {
    return callback();
  }

  const sass = gulpSass(dartSass);
  return gulp
    .src(config.styleSources, {
      allowEmpty: true,
      debug: true,
      ignore: config.styleIgnores,
      sourcemaps: true,
    })
    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(csso())
    .pipe(
      rename((file) => {
        // Output files are named *.min.ext.
        file.extname = '.min' + file.extname;
      })
    )
    .pipe(
      gulp.dest((file) => {
        logger.debug(`Built: ${file.path}`);
        return file.base;
      }, {
        sourcemaps: '.'
      })
    );
}
buildStyles.displayName = 'build:styles';
buildStyles.description = 'Build styles.';

/**
 * Build scripts.
 */
export function buildScripts(callback) {
  if (config.scriptSources.length === 0) {
    return callback();
  }

  return gulp
    .src(config.scriptSources, {
      allowEmpty: true,
      debug: true,
      ignore: config.scriptIgnores,
      sourcemaps: true,
    })
    .pipe(babel(config.optionsFor('babel', {})))
    .pipe(uglify(config.optionsFor('uglify', {})))
    .pipe(
      rename((file) => {
        // Output files are named *.min.ext.
        file.extname = '.min' + file.extname;
      })
    )
    .pipe(
      gulp.dest((file) => {
        logger.debug(`Built: ${file.path}`);
        return file.base;
      }, {
        sourcemaps: '.',
      })
    );
}
buildScripts.displayName = 'build:scripts';
buildScripts.description = 'Build scripts.';

/**
 * Lint styles.
 */
export function lintStyles(callback) {
  if (config.styleSources.length === 0) {
    return callback();
  }

  return gulp
    .src(config.styleSources, {
      allowEmpty: true,
      debug: true,
      ignore: config.styleIgnores,
      sourcemaps: true,
    })
    .pipe(sassLint({
      configFile: '.sass-lint.yml',
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
}
lintStyles.displayName = 'lint:styles';
lintStyles.description = 'Lint all styles.';

/**
 * Watch styles.
 */
export function watchStyles() {
  gulp.watch(
    config.styleSources,
    {
      delay: 500,
      depth: 3,
      ignoreInitial: false,
      ignored: config.styleIgnores,
      queue: true,
    },
    gulp.series('clean:styles', 'build:styles'),
  );
}
watchStyles.displayName = 'watch:styles';
watchStyles.description = 'Watch style sources and rebuild when they change.';

/**
 * Lint scripts.
 */
export function lintScripts(callback) {
  if (config.scriptSources.length === 0) {
    return callback();
  }

  return gulp
    .src(config.scriptSources, {
      allowEmpty: true,
      debug: true,
      ignore: config.scriptIgnores,
      sourcemaps: true,
    })
    .pipe(eslint({
      files: config.scriptSources,
      globals: config.optionsFor('globals', []),
      ignores: config.scriptIgnores,
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}
lintScripts.displayName = 'lint:scripts';
lintScripts.description = 'Lint all scripts.';

/**
 * Watch scripts.
 */
export function watchScripts() {
  gulp.watch(
    config.scriptSources,
    {
      delay: 500,
      depth: 3,
      ignoreInitial: false,
      ignored: config.scriptIgnores,
      queue: true,
    },
    gulp.series('clean:scripts', 'build:scripts'),
  );
}
watchScripts.displayName = 'watch:scripts';
watchScripts.description = 'Watch script sources and rebuild when they change.';

/**
 * Build SVG Sprites.
 */
export function buildSvgSprites(callback) {
  const mapping = config.optionsFor('svg-sprites', {});

  for (let dest in mapping) {
    let patterns = mapping[dest];
    let sprites = svgstore();

    globSync(patterns).forEach((entry) => {
      let id = path.basename(entry, '.svg')
        .replace(/(\W)/gi, '-');

      sprites.add(id, fs.readFileSync(entry, 'utf-8'));
    });

    fs.writeFileSync(dest, sprites.toString({
      inline: true,
    }));
  }

  callback();
}
buildSvgSprites.displayName = 'build:svg-sprites';
buildSvgSprites.description = 'Unify multiple SVG files into SVG sprites.';

/**
 * Composite tasks.
 */
export const build = gulp.parallel(buildStyles, buildScripts);
export const clean = gulp.parallel(cleanStyles, cleanScripts);
export const lint = gulp.series(lintStyles, lintScripts);
export const watch = gulp.parallel(watchStyles, watchScripts);

/**
 * Default task.
 */
export default gulp.series(clean, build);
