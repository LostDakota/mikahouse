var gulp = require('gulp')
var sass = require('gulp-sass')
var inline = require('gulp-inline-source')
var htmlmin = require('gulp-htmlmin')

gulp.task('inlinesources', () => {
    var inlineOpts = {
        rootpath: __dirname + '/'
    }
    return gulp.src(__dirname + '/public/src/index.html')
        .pipe(inline(), inlineOpts)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(__dirname + '/public/'))
})

gulp.task('transpile', () => {
    var opts = {
        outputStyle: 'compressed'
    }
    return gulp.src(__dirname + '/public/styles/sass/screen.scss')
        .pipe(sass(opts))
        .pipe(gulp.dest(__dirname + '/public/styles/'))
})

gulp.task('watch', () => {
    gulp.watch(__dirname + '/public/src/index.html', ['inlinesources'])
    gulp.watch(__dirname + '/public/styles/sass/**/*.scss', ['transpile'])
})

gulp.task('build', ['transpile', 'inlinesources'])