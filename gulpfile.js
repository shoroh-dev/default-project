const gulp = require('gulp'),
  prefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  rigger = require('gulp-rigger'),
  cssmin = require('gulp-minify-css'),
  rimraf = require('rimraf'),
  browserSync = require("browser-sync"),
  reload = browserSync.reload;

const path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: './build/',
    js: './build/js/',
    css: './build/css/',
    img: './build/img/',
    fonts: './build/fonts/'
  },
  src: { //Пути откуда брать исходники
    html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
    style: 'src/styles/main.scss',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'src/*.html',
    js: 'src/js/**/*.js',
    styles: 'src/styles/**/*.scss',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  clean: './build'
};

const config = {
  server: {
    baseDir: "./build"
  },
  tunnel: false, // для тунелирования доступа в сеть
  host: 'localhost',
  port: 4550,
  logPrefix: "shoroh"
};

buildHtml = (done) => {
  gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений

  done();
};

buildJs = (done) => {
  gulp.src(path.src.js) //Найдем наш main файл
    .pipe(rigger()) //Прогоним через rigger
    .pipe(sourcemaps.init()) //Инициализируем sourcemap
    .pipe(uglify()) //Сожмем наш js
    .pipe(sourcemaps.write()) //Пропишем карты
    .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
    .pipe(reload({stream: true})); //И перезагрузим сервер

  done();
};

buildStyles = (done) => {
  gulp.src(path.src.style) //Выберем наш main.scss
    .pipe(sourcemaps.init()) //То же самое что и с js
    .pipe(sass({
      errorLogToConsole: true,
      outputStyle: 'compressed'
    }))
    .on('error', console.error.bind(console))
    .pipe(prefixer()) //Добавим вендорные префиксы
    .pipe(cssmin()) //Сожмем
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css)) //И в build
    .pipe(reload({stream: true}));

  done();
};

buildImage = (done) => {
  gulp.src(path.src.img) //Выберем наши картинки
    .pipe(gulp.dest(path.build.img)) //И бросим в build
    .pipe(reload({stream: true}));
  done();
};

buildFonts = (done) => {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));

  done();
};

watchFiles = () => {
  gulp.watch(path.watch.html, buildHtml);
  gulp.watch(path.watch.js, buildJs);
  gulp.watch(path.watch.styles, buildStyles);
  gulp.watch(path.watch.img, buildImage);
  gulp.watch(path.watch.fonts, buildFonts);
};

gulp.task('html:build', buildHtml);
gulp.task('js:build', buildJs);
gulp.task('style:build', buildStyles);
gulp.task('image:build', buildImage);
gulp.task('fonts:build', buildFonts);

gulp.task('build', gulp.parallel(
  buildHtml,
  buildJs,
  buildStyles,
  buildFonts,
  buildImage
));

gulp.task('watch', watchFiles);

gulp.task('server', function () {
  browserSync(config);
});

gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});

gulp.task('default', gulp.parallel('build', 'server', 'watch'));
