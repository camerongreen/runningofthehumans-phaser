const {
  dest, series, src, watch,
} = require('gulp');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const del = require('del');
const eslint = require('gulp-eslint');
const terser = require('gulp-terser');

const outputDir = 'dist';

function clean() {
  return del([outputDir]);
}

function javascript() {
  return src([
    'src/*.es6.js',
    'gulpfile.babel.js',
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function liveReload(done) {
  browserSync.init({
    server: {
      baseDir: './',
    },
    port: 3000,
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

function transpile() {
  return src('src/*.es6.js')
    .pipe(babel())
    .pipe(concat(`../${outputDir}/game.js`))
    .pipe(terser())
    .pipe(dest(outputDir))
    .pipe(browserSync.stream());
}

function watchFiles() {
  watch('dist/game.js', browserSyncReload);
}

exports.lint = series(javascript);
exports.clean = series(clean);
exports.build = series(exports.clean, exports.lint, transpile);
exports.watch = series(javascript, transpile, liveReload, watchFiles);
exports.default = exports.watch;
