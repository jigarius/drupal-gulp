// This file must be included corrected.
document.querySelector('.test-8 .badge').classList.add('badge--success');

// The variable Drupal must be preserved.
if (typeof Drupal !== "undefined" && Drupal.version === "x.y.z") {
  document.querySelector('.test-12 .badge').classList.add('badge--success');
}
