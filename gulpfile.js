var gulp = require('gulp');
var bs = require("browser-sync").create();
var stylus = require('gulp-stylus');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var jade = require('gulp-jade');
var notify = require('gulp-notify');
var svgSprite = require('gulp-svg-sprite');
var yaml = require('gulp-yaml');
var plumber = require('gulp-plumber');

var onError = function(err) {
      notify.onError({
                  title:    "Howly fuckin Shit!",
                  subtitle: "${error.plugin}: ${error.name} ",
                  message:  "<%= error.message %>",
                  sound:    "Hero"
              })(err);

      this.emit('end');
  };


gulp.task('js', function () {
    return gulp.src('app/build/js/**/*')
        .pipe(gulp.dest('wwwroot/build/js'))
        .pipe(bs.stream())
        .pipe(notify('js task finished'))
});
gulp.task('js-watch', ['js'], bs.reload);

gulp.task('yaml', function () {
    return gulp.src('app/build/data/*.yml')
        .pipe(yaml({ schema: 'DEFAULT_SAFE_SCHEMA' }))
        .pipe(gulp.dest('app/build/data/'))
        .pipe(notify('yaml converted to json'))
});
gulp.task('yaml-watch', ['yaml'], bs.reload);

var MY_LOCALS = { 
                // projects: require('./app/build/data/data.json')
                };

gulp.task('jade',['yaml'], function () {
    return gulp.src(['app/**/*.jade', '!app/build/includes/**/*.jade','!app/build/layouts/**/*.jade'])
        .pipe(plumber({errorHandler: onError}))
        .pipe(jade({
            pretty:true,
            basedir:'./app/',
            locals: MY_LOCALS
        }))
        .pipe(gulp.dest('wwwroot/'))
        .pipe(bs.stream())
        .pipe(notify('jade/html task finished'))
});
gulp.task('jade-watch', ['jade'], bs.reload);

gulp.task('styles', function () {
    var processors = [
        autoprefixer({browsers:['> 5%']})
    ];
    return gulp.src('app/build/styl/app.styl')
        .pipe(plumber({errorHandler: onError}))
        .pipe(stylus())
        .pipe(postcss(processors))
        .pipe(gulp.dest('wwwroot/build/css/'))
        .pipe(bs.stream())
        .pipe(notify('styles task finished, yey!'))
});
gulp.task('styles-watch', ['styles'], bs.reload);

gulp.task('assets', function () {
    return gulp.src(['app/assets/**/*', '!app/assets/{icons,icons/**}'])
        .pipe(gulp.dest('wwwroot/assets/'))
        .pipe(bs.stream())
});
gulp.task('assets-watch', ['assets'], bs.reload);

svgconfig = {
    mode : {
         symbol : true      // Activate the «symbol» mode
    }
};

gulp.task('svg', function () {
    return gulp.src('app/assets/icons/*.svg')
        .pipe(plumber({errorHandler: onError}))
        .pipe(svgSprite(svgconfig))
        .pipe(gulp.dest('app/assets/icons/'))
        .pipe(notify('created svg sprite'))
});
gulp.task('svg-watch', ['svg'], bs.reload);

gulp.task('default', ['jade', 'styles', 'js', 'assets', 'svg'], function () {
    bs.init({
        server: "./wwwroot",
        notify: false
    });
    gulp.watch("app/**/*.jade", ['jade-watch']);
    gulp.watch("app/build/styl/**/*.styl", ['styles-watch']);
    gulp.watch("app/build/js/*.js", ['js-watch']);
    gulp.watch("app/assets/**/*", ['assets-watch']);
    gulp.watch("app/assets/icons/*.svg", ['svg-watch']);
});