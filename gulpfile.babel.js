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
    'src/*.js',
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
  return src('src/*.js')
    .pipe(concat(`../${outputDir}/game.min.js`))
    .pipe(babel())
    .pipe(terser())
    .pipe(dest(outputDir))
    .pipe(browserSync.stream());
}

function watchFiles() {
  watch('src/*.js', transpile);
  watch('dist/main.js', browserSyncReload);
}

exports.lint = series(javascript);
exports.clean = series(clean);
exports.build = series(exports.clean, exports.lint, transpile);
exports.watch = series(exports.build, liveReload, watchFiles);
exports.default = exports.watch;
