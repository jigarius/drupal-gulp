/**
 * Drupal Gulp: Entry Point.
 */

"use strict";

import path from "node:path";
import fs from "node:fs";
import {globSync} from "glob";

/**
 * Auto-detect Drupal root.
 *
 * @param {string} projectRoot Project root.
 *   The directory containing the project's composer.json.
 *
 * @returns {string}
 */
function detectDrupalRoot(projectRoot) {
  const entries = ['web', 'docroot'];

  for (const entry of entries) {
    const candidate = path.resolve(path.join(projectRoot, entry));
    if (fs.existsSync(candidate) && fs.lstatSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  throw "Drupal root not detected at: " + entries.join(', ') + ".";
}

/**
 * Get a list of all Drupal extensions in a given set of paths.
 *
 * @param {string[]} paths Directories in which to look for extensions.
 *   Extensions are detected using their *.info.yml file.
 *
 * @returns {DrupalExtension[]}
 */
function detectDrupalExtensions(paths) {
  let patterns = paths.map(p => path.join(p, '*.info.yml'));
  let result = globSync(patterns);

  return result.map((item) => {
    return new DrupalExtension(path.dirname(item));
  });
}

/**
 * Drupal Extension.
 */
export class DrupalExtension {

  constructor(path) {
    this.path = path;

    if (!fs.existsSync(path) && !fs.lstatSync(path).isDirectory()) {
      throw new Error(`Drupal Extension not detected in ${path}`);
    }
  }

  /**
   * Get glob patterns for style sources.
   *
   * @returns {string[]} Glob patterns.
   */
  getStyleSourcePatterns() {
    return [
      path.join(this.path, '**', '*.scss'),
    ];
  }

  /**
   * Get glob patterns for script sources.
   *
   * @returns {string[]} Glob patterns.
   */
  getScriptSources() {
    return [
      path.join(this.path, '**', '*.js'),
    ];
  }

  /**
   * Get glob patterns for style destinations.
   *
   * Matched files are deemed suitable for deletion as they can be
   * re-generated with Gulp.
   *
   * @returns {string[]} Glob patterns.
   */
  getStyleDestinationPatterns() {
    return [
      path.join(this.path, 'dist', '*.min.css'),
      path.join(this.path, 'dist', '*.css.map'),
      path.join(this.path, 'components', '**', '*.min.css'),
      path.join(this.path, 'components', '**', '*.css.map'),
    ];
  }

  /**
   * Get glob patterns for script destinations.
   *
   * Matched files are deemed suitable for deletion as they can be
   * re-generated with Gulp.
   *
   * @returns {string[]} Glob patterns.
   */
  getScriptDestinations() {
    return [
      path.join(this.path, 'dist', '*.min.js'),
      path.join(this.path, 'dist', '*.js.map'),
      path.join(this.path, 'components', '**', '*.min.js'),
      path.join(this.path, 'components', '**', '*.js.map'),
    ];
  }

}

/**
 * Configuration Object.
 */
class Config {

  /**
   * Configuration data.
   *
   * @type {{}}
   * @private
   */
  #_data = {};
  
  /**
   * Create a configuration object.
   *
   * Use ConfigBuilder to create Config objects.
   *
   * @param {{}} data Configuration data.
   */
  constructor(data) {
    this._data = data;
  }

  toString() {
    return JSON.stringify(this._data, null, 2);
  }

  /**
   * Path to the directory containing the project's composer.json.
   *
   * @returns {*}
   */
  get projectRoot() {
    return this._data.projectRoot;
  }

  /**
   * Path to the directory containing Drupal's index.php.
   *
   * @returns {*}
   */
  get drupalRoot() {
    return this._data.drupalRoot;
  }

  /**
   * Glob patterns for style sources.
   *
   * @returns {string[]}
   */
  get styleSources() {
    return this._data.styleSources;
  }

  /**
   * Glob patterns for style destinations.
   *
   * @returns {string[]}
   */
  get styleDestinations() {
    return this._data.styleDestinations;
  }

  /**
   * Glob patterns for style ignores.
   *
   * @returns {string[]}
   */
  get styleIgnores() {
    return this._data.styleIgnores;
  }

  /**
   * Glob patterns for script sources.
   *
   * @returns {string[]}
   */
  get scriptSources() {
    return this._data.scriptSources;
  }

  /**
   * Glob patterns for script destinations.
   *
   * @returns {string[]}
   */
  get scriptDestinations() {
    return this._data.scriptDestinations;
  }

  /**
   * Glob patterns for style ignores.
   *
   * @returns {string[]}
   */
  get scriptIgnores() {
    return this._data.scriptIgnores;
  }


  /**
   * Get options for a plugin.
   *
   * @param {string} key Options key.
   *   Usually, this is the name of a plugin. Example: uglify.
   * @param {any} fallback A fallback value.
   *   If the option is not set, this value is returned.
   *
   * @return {any} Options object.
   */
  optionsFor(key, fallback = null) {
    if (key in this._data.options) {
      return this._data.options[key];
    }

    return fallback;
  }

}

/**
 * Configuration Builder.
 */
export class ConfigBuilder {

  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    /**
     * Path to the directory containing the Drupal's index.php.
     *
     * @type {null|string}
     * @private
     */
    this._drupalRoot = null;
    this.styleSources = [];
    this.styleDestinations = [];
    this.styleIgnores = [];
    this.scriptSources = [];
    this.scriptDestinations = [];
    this.scriptIgnores = [];
    this.options = {};
  }

  get drupalRoot() {
    if (!this._drupalRoot) {
      this._drupalRoot = detectDrupalRoot(this.projectRoot);
    }

    return this._drupalRoot;
  }

  /**
   * Set the Drupal directory.
   *
   * @example builder.setDrupalDirectory('web');
   *
   * @param name
   * @returns {this}
   */
  setDrupalDirectory(name) {
    if (this._drupalRoot) {
      throw new Error(`Drupal root already defined: ${this._drupalRoot}`);
    }

    this._drupalRoot = path.join(this.projectRoot, name);
    return this;
  }

  /**
   * Add one or more globs for where style sources are.
   *
   * @param patterns
   * @returns {ConfigBuilder}
   */
  addStyleSources(patterns) {
    this.styleSources = this.styleSources.concat(patterns);
    return this;
  }

  /**
   * Add one or more globs for where style destinations are.
   *
   * Files matching these globs are deemed safe to delete and are deleted by
   * the "clean" operation before they are regenerated by "build".
   *
   * @param patterns
   * @returns {this}
   */
  addStyleDestinations(patterns) {
    this.styleDestinations = this.styleDestinations.concat(patterns);
    return this;
  }

  /**
   * Files matching these globs will not be treated as sources.
   *
   * @param patterns
   * @returns {this}
   */
  addStyleIgnores(patterns) {
    this.styleIgnores = this.styleIgnores.concat(patterns);
    return this;
  }

  /**
   * Add one or more globs for where style sources are.
   *
   * @param patterns
   * @returns {ConfigBuilder}
   */
  addScriptSources(patterns) {
    this.scriptSources = this.scriptSources.concat(patterns);
    return this;
  }

  /**
   * Add one or more globs for where script destinations are.
   *
   * Files matching these globs are deemed safe to delete and are deleted by
   * the "clean" operation before they are regenerated by "build".
   *
   * @param patterns
   * @returns {this}
   */
  addScriptDestinations(patterns) {
    this.scriptDestinations = this.scriptDestinations.concat(patterns);
    return this;
  }

  /**
   * Files matching these globs will not be treated as sources.
   *
   * @param patterns
   * @returns {this}
   */
  addScriptIgnores(patterns) {
    this.scriptIgnores = this.scriptIgnores.concat(patterns);
    return this;
  }

  /**
   * Add styles and scripts for a Drupal extension.
   *
   * @param {DrupalExtension} ext
   * @param {boolean} addStyles Whether to add styles.
   * @param {boolean} addScripts Whether to add scripts.
   * @returns {this}
   */
  addExtension(ext, addStyles = true, addScripts = true) {
    if (addStyles) {
      this.addStyleSources(ext.getStyleSourcePatterns());
      this.addStyleDestinations(ext.getStyleDestinationPatterns());
    }

    if (addScripts) {
      this.addScriptSources(ext.getScriptSources());
      this.addScriptDestinations(ext.getScriptDestinations());
    }

    return this;
  }

  /**
   * Add styles and scripts for all custom modules.
   *
   * @param {boolean} addStyles Whether to add styles.
   * @param {boolean} addScripts Whether to add scripts.
   * @returns {this}
   */
  addAllCustomModules(addStyles = true, addScripts = true) {
    for (let ext of detectDrupalExtensions([
      path.join(this.drupalRoot, 'modules/custom/**'),
      path.join(this.drupalRoot, 'sites/*/modules/custom/**'),
    ])) {
      this.addExtension(ext, addStyles, addScripts);
    }

    return this;
  }

  /**
   * Add styles and scripts for all custom themes.
   *
   * @param {boolean} addStyles Whether to add styles.
   * @param {boolean} addScripts Whether to add scripts.
   * @returns {this}
   */
  addAllCustomThemes(addStyles = true, addScripts = true) {
    for (let ext of detectDrupalExtensions([
      path.join(this.drupalRoot, 'themes/custom/**'),
      path.join(this.drupalRoot, 'sites/*/themes/custom/**'),
    ])) {
      this.addExtension(ext, addStyles, addScripts);
    }

    return this;
  }

  /**
   * Get options for a plugin.
   *
   * @param {string} key Options key.
   *   Usually, this is the name of a plugin. Example: uglify.
   * @param {any} fallback A fallback value.
   *   If the option is not set, this value is returned.
   *
   * @return {any} Options object.
   */
  getOptionsFor(key, fallback = null) {
    if (key in this.options) {
      return this.options[key];
    }

    return fallback;
  }

  /**
   * Set options for a plugin.
   *
   * @param {string} key Options key.
   *   Usually, this is the name of a plugin. Example: uglify.
   * @param {{}} opts Options object.
   *
   * @return {this}
   */
  setOptionsFor(key, opts) {
    this.options[key] = opts;
    return this;
  }

  applyDefaults() {
    return this
      .addStyleIgnores([
        '**/node_modules/**',
        '**/vendor/**',
        '**/*.min.css',
      ])
      .addScriptIgnores([
        '**/node_modules/**',
        '**/vendor/**',
        '**/*.min.js',
      ])
      .setOptionsFor('globals', [
        '$',
        'Drupal',
        'drupalSettings',
        'jQuery',
        'once',
      ])
      .setOptionsFor('uglify', {
        mangle: {
          reserved: this.options['globals']
        },
        output: {
          comments: 'some'
        }
      });
  }

  /**
   * Build a configuration object from the builder's current state.
   *
   * @returns {Config} Configuration.
   */
  build() {
    return new Config({
      projectRoot: this.projectRoot,
      drupalRoot: this.drupalRoot,
      styleSources: this.styleSources,
      styleDestinations: this.styleDestinations,
      styleIgnores: this.styleIgnores,
      scriptSources: this.scriptSources,
      scriptDestinations: this.scriptDestinations,
      scriptIgnores: this.scriptIgnores,
      options: this.options,
    });
  }

}
