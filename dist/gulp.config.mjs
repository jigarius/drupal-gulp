/**
 * Gulp Configuration.
 *
 * This config file is for use during the development of drupal-gulp.
 */

import { ConfigBuilder } from 'drupal-gulp';
import { fileURLToPath } from 'url';
import path from 'path';

const cwd = path.dirname(fileURLToPath(import.meta.url));
const builder = new ConfigBuilder(cwd);

builder.applyDefaults();

// Modify configuration through the builder as required.
// builder
//   .addAllCustomModules()
//   .addAllCustomThemes();

export default builder.build();
