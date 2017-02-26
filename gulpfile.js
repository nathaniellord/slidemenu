var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var beautify = require('gulp-beautify');
var sourcemaps = require('gulp-sourcemaps');
var lesshint = require('gulp-lesshint');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

gulp.task('copy:examples',function() {
    gulp.src(['dist/js/jquery.slidemenu.js'])
        .pipe(gulp.dest('examples/'));
    return gulp.src(['dist/css/slidemenu.css'])
        .pipe(gulp.dest('examples/'));
});

gulp.task('less',['validate:less'],function() {
    return gulp.src(['src/less/slidemenu.less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-css', ['less'], function() {
  return gulp.src('dist/css/slidemenu.css')
    .pipe(rename('slidemenu.min.css'))
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-js', ['beautify:js'],function() {
    return gulp.src('dist/js/jquery.slidemenu.js')
        .pipe(rename('jquery.slidemenu.min.js'))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('beautify:js',function() {
    return gulp.src('src/js/jquery.slidemenu.js')
        .pipe(beautify({indent_size: 2}))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('validate:js',function() {
    return gulp.src('src/js/jquery.slidemenu.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('validate:less', () => {
    return gulp.src('./src/less/*.less')
        .pipe(lesshint({}))
        .pipe(lesshint.reporter()) // Leave empty to use the default, "stylish" 
        .pipe(lesshint.failOnError()); // Use this to fail the task on lint errors 
});

gulp.task('beautify',['beautify:js']);
gulp.task('validate',['validate:js','validate:less']);
gulp.task('build:dist',['validate','minify-css','beautify','minify-js']);
gulp.task('build:examples',['build:dist','copy:examples']);
gulp.task('build',['build:dist','build:examples']);