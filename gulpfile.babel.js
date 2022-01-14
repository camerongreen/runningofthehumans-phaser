/**
 * Gulpfile in version 4 format.
 */
const {
  dest, series, src, watch,
} = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const eslint = require('gulp-eslint');
const browserify = require('browserify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const paths = {
  source: 'src',
  output: 'dist',
  base: './',
};

/**
 * Clean all the output paths.
 *
 * @return {boolean}
 *   Success.
 */
function clean() {
  return del([paths.output]);
}

/**
 * Check for proper syntax.
 *
 * @return {boolean}
 *   Success.
 */
function lint() {
  return src([
    `${paths.source}`,
    'gulpfile.babel.js',
  ])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
}

/**
 * Do the live reload thing.
 *
 * @param {function} done
 *   Function to call once reload finished.
 */
function liveReload(done) {
  browserSync.init({
    server: {
      baseDir: paths.base,
    },
    port: 3000,
  });
  done();
}

/**
 * BrowserSync Reload
 *
 * @param {function} done
 *   Function to call once reload finished.
 */
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

/**
 * Compile everything.
 *
 * @return {function}
 *   Return everything.
 */
function compile() {
  return browserify({
    entries: [`${paths.source}/index.js`],
    debug: true,
    transform: [
      babelify.configure({
        presets: ['@babel/preset-env'],
      }),
    ],
  })
      .bundle()
      .pipe(source('game.min.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(dest(paths.output));
}

/**
 * Watch files while you code.
 */
function watchFiles() {
  watch(`${paths.source}/*.js`, compile);
  watch(`${paths.output}/*.js`, browserSyncReload);
}

exports.lint = series(lint);
exports.clean = series(clean);
exports.build = series(exports.clean, exports.lint, compile);
exports.watch = series(exports.build, liveReload, watchFiles);
exports.default = exports.watch;
