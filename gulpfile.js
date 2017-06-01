var gulp = require('gulp');

// all gulp tasks are located in the ./build/tasks directory
// gulp configuration is in files in ./build directory
// require('require-dir')('build/tasks');

// gulp.task('default', ['watch']);

var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var changed = require('gulp-changed');
var print = require('gulp-print');
let browserSync = require('browser-sync');
var modRewrite = require('connect-modrewrite');

let os = require('os');
let exec = require('gulp-exec');

const chromeNameByPlatform = {
  'linux': 'google-chrome',
  'darwin': 'google chrome',
  'win32': 'chrome'
};

const chrome = chromeNameByPlatform[os.platform()];



gulp.task('serve', ['watch'], () => {

  browserSync({
    browser: [chrome],
    server: {
      baseDir: './',
      middleware: [
          modRewrite(['!\\..+$ /index.html [L]'])
      ]
    }
  });
  gulp.watch('dist/**/*.js', ['reload']);
  gulp.watch('dist/**/*.html', ['reload']);
});

gulp.task('reload', function () {
  browserSync.reload();
});

gulp.task('update', ['typings-install', 'git-submodule-update']);


gulp.task('minify-html', function() {
  return gulp.src('src/**/*.html')
    // .pipe(changed('dist'))
    .pipe(print())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', function() {
  return gulp.src('src/**/*.css')
    // .pipe(changed('dist'))
    .pipe(print())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist'));
});

gulp.task('minify', ['minify-html', 'minify-css']);

gulp.task('watch', function() {
  gulp.watch('src/**/*.html', ['minify-html']);
  gulp.watch('src/**/*.css', ['minify-css']);
});

gulp.task('typings-install', (cb) => {
  exec('typings install', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('git-submodule-update', (cb) => {
  exec('git submodule update', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});