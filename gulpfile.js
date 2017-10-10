var gulp = require('gulp');

// all gulp tasks are located in the ./build/tasks directory
// gulp configuration is in files in ./build directory
// require('require-dir')('build/tasks');

// gulp.task('default', ['watch']);

var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var changed = require('gulp-changed');
var print = require('gulp-print');
var watch = require('gulp-watch');
let browserSync = require('browser-sync');
var modRewrite = require('connect-modrewrite');

let os = require('os');
let exec = require('gulp-exec');

const argv = require('yargs').argv;

const chromeNameByPlatform = {
  'linux': 'google-chrome',
  'darwin': 'google chrome',
  'win32': 'chrome'
};

const chrome = chromeNameByPlatform[os.platform()];

const watchMode = argv.watch || argv.w;

gulp.task('serve', ['minify'], () => {

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
  let glob = 'src/**/*.html';
  let f = () => gulp.src(glob)
                    .pipe(changed('dist'))
                    .pipe(print())
                    .pipe(htmlmin({collapseWhitespace: true}))
                    .pipe(gulp.dest('dist'));
  if (watchMode) {
    watch(glob, { ignoreInitial: false }, () => f())
  }
  return f();
});

gulp.task('minify-css', function() {
  let glob = 'src/**/*.css';
  let f = () => gulp.src(glob)
                .pipe(changed('dist'))
                .pipe(print())
                .pipe(cleanCSS())
                .pipe(gulp.dest('dist'));
  if (watchMode) {
    watch(glob, { ignoreInitial: false }, () => f())
  }
  return f();
});

gulp.task('minify', ['minify-html', 'minify-css']);

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

function src(glob) {
  return watchMode ? watch(glob, { ignoreInitial: false }) : gulp.src(glob);
}