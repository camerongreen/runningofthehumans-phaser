const { dest, series, src } = require('gulp');
const babel = require('gulp-babel');
const del = require('del');
const eslint = require('gulp-eslint');

const outputDir = 'dist';

function bundle() {
}

function clean() {
  return del([outputDir]);
}

function javascript() {
  return src([
    'src/*.js',
    'gulpfile.babel.js',
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function liveReload() {
}

function transpile() {
  return src('src/*.js')
    .pipe(babel())
    .pipe(dest(outputDir));
}

exports.lint = series(javascript);
exports.clean = series(clean);
exports.transpile = series(transpile);
exports.build = series(exports.clean, exports.lint, transpile, bundle);
exports.watch = series(javascript, transpile, bundle, liveReload);
exports.default = exports.watch;
