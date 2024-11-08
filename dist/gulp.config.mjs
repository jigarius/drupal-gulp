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

// Add all custom themes.
builder.addAllCustomThemes();

// Add all custom modules.
builder.addAllCustomModules();

// Add a specific extension.
// builder.addExtensionByPath('web/modules/custom/foo');
// By default, both styles and scripts are processed for each extension,
// however, it is possible to specify whether only styles or scripts
// should be processed.
// builder.addExtensionByPath('web/modules/custom/foo', true, false);

// Combine multiple SVG files into SVG sprites.
// builder.addSvgSpriteSources(
//   ['web/themes/custom/theme1/dist/icons/*.svg'],
//   'web/themes/custom/theme1/dist/icons.svg',
// );

export default builder.build();
