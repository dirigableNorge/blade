"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var pug = require("gulp-pug");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var svgo = require("gulp-svgo");
var uglify = require("gulp-uglify");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var htmlmin = require("gulp-htmlmin");
var del = require("del");

gulp.task("pug", function () {
  return gulp.src("source/pug/*.pug")
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest("./build/"));
})

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("svgo", function (){
  return gulp.src('source/img/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('source/img/svgo'));
});

gulp.task("images", function() {
  return gulp
    .src("source/img/**/*{png,jpg,svg}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.svgo()
      ])
    )
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function() {
  return gulp
    .src("source/img/**/*.{png,jpg}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function() {
  return gulp
    .src("source/img/icon-*.svg")
    .pipe(
      svgstore({
        inlineSvg: true
      })
    )
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("jsmin", function() {
  return gulp
    .src("source/js/*.js")
    .pipe(
      uglify()
    )
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest("build/js"))
})

gulp.task("html", function() {
  return gulp
    .src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin())
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp
    .src(
      [
        "source/fonts/**/*.{woff,woff2}",
        "source/*.ico"
      ],
      {
        base: "source"
      }
    )
    .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.task("refresh", function(done) {
    server.reload();
    done();
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/pug/*.pug", gulp.series("pug", "refresh"));
  gulp.watch("source/js/*.js", gulp.series("jsmin", "refresh"));
});

gulp.task("build", gulp.series("clean", "images", "webp", "copy", "css", "sprite", "pug", "jsmin"));
gulp.task("start", gulp.series("build", "server"));


gulp.task("dev-build", gulp.series("css", "pug", "jsmin"));
gulp.task("dev-start", gulp.series("dev-build", "server"))
