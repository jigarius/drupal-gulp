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
builder.addAllCustomThemes();

// Add a specific extension.
// builder.addExtensionByPath('web/modules/custom/foo');

// Combine multiple SVG files into SVG sprites.
// builder.addSvgSpriteSources(
//   ['web/themes/custom/theme1/dist/icons/*.svg'],
//   'web/themes/custom/theme1/dist/icons.svg',
// );

export default builder.build();
