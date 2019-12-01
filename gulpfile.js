// Load plugins
const babel = require('gulp-babel');
const browsersync = require('browser-sync').create();
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist/',
    },
    port: 3000,
  });
  done();
}

// Clean assets
function clean() {
  return del(['./dist/']);
}

// Optimize Images
function images() {
  return gulp
    .src('./assets/img/**/*')
    .pipe(newer('./dist/assets/img'))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true,
            },
          ],
        }),
      ]),
    )
    .pipe(gulp.dest('./dist/assets'));
}

// Lint scripts
function scriptsLint() {
  return gulp
    .src(['./src/**/*', './gulpfile.js'])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts
function scripts() {
  return (
    gulp
      .src(['./src/**/*'])
      .pipe(babel())
      .pipe(plumber())
      .pipe(gulp.dest('./dist/src/'))
      .pipe(browsersync.stream())
  );
}

// Watch files
function watchFiles() {
  gulp.watch('./src/**/*', gulp.series(scriptsLint, scripts));
  gulp.watch('./assets/img/**/*', images);
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(clean, gulp.parallel(images, js));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.js = js;
exports.lint = scriptsLint;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;
