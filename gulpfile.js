const gulp = require('gulp');
const { task } = require('gulp');

const clean = require('gulp-clean');
const uglify = require('gulp-uglify');
const cssmin = require('gulp-cssmin');
const minifyHtml = require('gulp-minify-html');

const cleanTask = () => {
	return gulp.src('dist/*', { read: false, allowEmpty: true }).pipe(clean());
};
task('cleanTask', cleanTask);

const css = () => gulp.src('./src/**.css').pipe(cssmin()).pipe(gulp.dest('./dist'));
const js = () =>
	gulp
		.src('./src/**.js')
		.pipe(uglify({ compress: true }))
		.pipe(gulp.dest('./dist'));
const html = () => gulp.src('./src/**.html').pipe(minifyHtml()).pipe(gulp.dest('./dist'));

const buildTask = gulp.parallel(css, js, html, () =>
	gulp.src('./src/*.json').pipe(gulp.dest('./dist'))
);
task('buildTask', buildTask);

exports.default = gulp.series(task('cleanTask'), task('buildTask'));
