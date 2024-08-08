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
function showConfig(callback) {
  console.log(config.toString());
  callback();
}
showConfig.description = "Show the configuration object."
gulp.task('config', showConfig);

/**
 * Clean styles.
 */
function cleanStyles(callback) {
  config.styleDestinations.forEach((pattern) => {
    globSync(pattern).forEach((path) => {
      fs.unlinkSync(path);
      logger.debug(`Deleted: ${path}`);
    });
  });

  callback();
}
cleanStyles.description = 'Clean style output directories.';
gulp.task('clean:styles', cleanStyles);

/**
 * Clean scripts.
 */
function cleanScripts(callback) {
  config.scriptDestinations.forEach((pattern) => {
    globSync(pattern).forEach((path) => {
      fs.unlinkSync(path);
      logger.debug(`Deleted: ${path}`);
    });
  });

  callback();
}
cleanScripts.description = 'Clean script output directories.';
gulp.task('clean:scripts', cleanScripts);

/**
 * Build styles.
 */
function buildStyles() {
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
        // Non-component styles go into the "dist" directory.
        // @todo Is this convention necessary?
        const dirnameParts = file.dirname.split(path.sep);
        if (dirnameParts[0] === 'styles') {
          dirnameParts[0] = 'dist';
          file.dirname = dirnameParts.join(path.sep);
        }

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
buildStyles.description = 'Build styles.';
gulp.task('build:styles', buildStyles);

/**
 * Build scripts.
 */
function buildScripts() {
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
        // Non-component scripts go into the "dist" directory.
        // @todo Is this convention necessary?
        const dirnameParts = file.dirname.split(path.sep);
        if (dirnameParts[0] === 'scripts') {
          dirnameParts[0] = 'dist';
          file.dirname = dirnameParts.join(path.sep);
        }

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
buildScripts.description = 'Build scripts.';
gulp.task('build:scripts', buildScripts);

/**
 * Lint styles.
 */
function lintStyles() {
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
lintStyles.description = 'Lint all styles.';
gulp.task('lint:styles', lintStyles);

/**
 * Watch styles.
 */
function watchStyles() {
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
watchStyles.description = 'Watch style sources and rebuild when they change.';
gulp.task('watch:styles', watchStyles);

/**
 * Lint scripts.
 */
function lintScripts() {
  return gulp
    .src(config.scriptSources, {
      allowEmpty: true,
      debug: true,
      ignore: config.scriptIgnores,
      sourcemaps: true,
    })
    .pipe(eslint({
      files: config.scriptSources,
      ignores: config.scriptIgnores,
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}
lintScripts.description = 'Lint all scripts.';
gulp.task('lint:scripts', lintScripts);

/**
 * Watch scripts.
 */
function watchScripts() {
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
watchScripts.description = 'Watch script sources and rebuild when they change.';
gulp.task('watch:scripts', watchScripts);

/**
 * Build SVG Sprites.
 */
function buildSvgSprites(callback) {
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
buildSvgSprites.description = 'Unify multiple SVG files into SVG sprites.';
gulp.task('build:svg-sprites', buildSvgSprites);

/**
 * Composite tasks.
 */
gulp.task('build', gulp.parallel('build:styles', 'build:scripts'));
gulp.task('clean', gulp.parallel('clean:styles', 'clean:scripts'));
gulp.task('default', gulp.series('clean', 'build'));
gulp.task('lint', gulp.series('lint:styles', 'lint:scripts'));
gulp.task('watch', gulp.parallel('watch:styles', 'watch:scripts'));
