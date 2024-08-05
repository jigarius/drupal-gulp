/**
 * Gulp Configuration.
 *
 * This config file is for use during the development of drupal-gulp.
 */

import { ConfigHelper } from 'drupal-gulp';
import { fileURLToPath } from 'url';
import path from 'path';

const cwd = path.dirname(fileURLToPath(import.meta.url));
const ch = new ConfigHelper(cwd);

let config = ch.getDefaults();

// Modify configuration, as required.
// config.styleSources.push('foo/**/*.scss')
// Alternatively, build your own Config object (not recommended).
// config = new Config();

export default config;
