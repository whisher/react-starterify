'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  argv = require('yargs').argv,
  autoprefixer = require('gulp-autoprefixer'),
  babelify = require('babelify'),
  browserify = require('browserify'),
  browserSync = require('browser-sync'),
  buffer = require('vinyl-buffer'),
  changed = require('gulp-changed'),
  csso = require('gulp-csso'),
  del = require('del'),
  eslint = require('gulp-eslint'),
  gulp = require('gulp'),
  gulpif = require('gulp-if'),
  notify = require('gulp-notify'),
  reload = browserSync.reload,
  runSequence = require('run-sequence'),
  sass = require('gulp-sass'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  watchify = require('watchify');

/**
 * Config.
 */ 
var release = !!argv.release; 
var paths = {
      jsx: './scripts/app.jsx',
      scss: 'styles/main.scss',
      bundle: 'app.js',
      dist: 'dist',
      distJs: 'dist/js',
      distCss: 'dist/css'
};

/**
 * Tasks.
 */   
gulp.task('clean', function(cb) {
  del([paths.dist], cb);
});

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: './'
    },
    browser: ['firefox']
  });
});

gulp.task('watchify', function() {
  var browserifyCustomOpts = {
    entries: [paths.jsx],
    transform: [babelify],
    debug: true
  };
  var browserifyOpts = _.assign({}, watchify.args, browserifyCustomOpts);
  var bundleStream = browserify(browserifyOpts);
    var rebundle = function () {
        var start = Date.now();
        return bundleStream.bundle()
          .on('error', notify.onError())
          .pipe(source(paths.bundle))
          .pipe(buffer())
          .pipe(gulpif(!release,sourcemaps.init({loadMaps: true}))) // loads map from browserify file
          .pipe(gulpif(release,uglify()))
          .pipe(gulpif(!release,sourcemaps.write('./')))// writes .map file
          .pipe(gulp.dest(paths.distJs))
          .pipe(notify(function () {
            console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
          }))
          .pipe(gulpif(!release,reload({stream: true})));
    }
    bundleStream = watchify(bundleStream);
    bundleStream.on('update', rebundle);
    return rebundle();
});

gulp.task('styles', function() {
  return gulp.src(paths.scss)
    .pipe(changed(paths.distCss))
    .pipe(sass({errLogToConsole: true}))
    .on('error', notify.onError())
    .pipe(autoprefixer('last 1 version'))
    .pipe(csso())
    .pipe(gulp.dest(paths.distCss))
    .pipe(reload({stream: true}));
});

gulp.task('lint', function() {
  return gulp.src('scripts/**/*.jsx')
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('watchTask', function() {
  gulp.watch(paths.scss, ['styles']);
  gulp.watch('scripts/**/*.jsx', ['lint']);
});

gulp.task('watch', ['clean'], function() {
  gulp.start(['browserSync', 'watchTask', 'watchify', 'styles', 'lint']);
});

gulp.task('build', ['clean'], function() {
  process.env.NODE_ENV = 'production';
  gulp.start(['browserify', 'styles']);
});

gulp.task('default', function() {
    runSequence(
               'clean',
                [ 'styles','lint'],
                ['watchify','watchTask'],
                ['serve']
    );
  }
);
