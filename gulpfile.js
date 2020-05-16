const gulp = require('gulp'),
      sass = require('gulp-sass'),
      clean = require('gulp-clean'),
      babel = require('gulp-babel'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      imagemin = require('gulp-imagemin'),
      webserver = require('gulp-webserver'),
      minifyCSS = require('gulp-clean-css'),
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer');

const scssPath = './src/scss/*.scss';
const cssPath = './dist/assets/css';
const originJsPath = './src/js';
const buildJsPath = './dist/assets/js';
const originImgPath = './src/img/*';
const buildImgPath = './dist/assets/images';

gulp.task('clean-styles', () => gulp.src(`${cssPath}/*.css`, {read: false}).pipe(clean()));
gulp.task('clean-scripts', () => gulp.src(`${buildJsPath}/*.js`, {read: false}).pipe(clean()));
gulp.task('clean-images', () => gulp.src(`${buildImgPath}/*`, {read: false}).pipe(clean()));
gulp.task('clean', gulp.parallel(['clean-styles', 'clean-scripts', 'clean-images']));

gulp.task('build-styles', () => {
    return gulp.src('./src/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'nested',
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 20 versions'],
            flexbox: 'no-2009',
            grid: 'autoplace'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(cssPath))
});

gulp.task('minifyCSS', () => {
    return gulp.src(`${cssPath}/style.css`)
        .pipe(sourcemaps.init())
        .pipe(minifyCSS())
        .pipe(concat('style.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(cssPath))
});

gulp.task('convert-scripts', () =>
    gulp.src(`${originJsPath}/*.js`)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('script.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(buildJsPath))
);

gulp.task('minifyJS', () => {
    return gulp.src(`${buildJsPath}/script.js`)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('script.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(buildJsPath))
});

gulp.task('minifyIMG', () =>
    gulp.src(originImgPath)
        .pipe(imagemin())
        .pipe(gulp.dest(buildImgPath))
);

gulp.task('webserver', () => {
    gulp.src('dist')
        .pipe(webserver({
            open: true,
            livereload: true,
            directoryListing: false,
            fallback: 'index.html',
        }));
});

gulp.task('watch', () => {
    gulp.watch(scssPath, gulp.series(['build-styles']));
    gulp.watch(originJsPath, gulp.series(['convert-scripts']))
});

gulp.task('default', gulp.series(['clean', 'build-styles', 'minifyCSS', 'convert-scripts', 'minifyJS', 'minifyIMG']));

gulp.task('start-server', gulp.series(['build-styles', 'convert-scripts', gulp.parallel(['watch', 'webserver'])]));