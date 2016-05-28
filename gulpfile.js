var _ = require('./gulp-config.json');
var $ =  require('gulp-load-plugins')();
var gulp = require('gulp');
var debug = require('gulp-debug');
var wiredep = require('wiredep').stream;
var stylish =  require('jshint-stylish');
var runSequence = require('run-sequence').use(gulp);
var browserSync =  require('browser-sync').create();


var addExcludes = function(path){
    return _.exclude.concat(path);
};

/*
 *  Creando el servidor para desarrollo
 */
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: _.serve.base_dir,
            open: "local",
            browser: ["google chrome", "firefox"],
            notify: true,
            timestamps: true,
            host: _.serve.host
        }
    });
});

/*
 *  Creando el servidor para produccion
 */
gulp.task('serve:start', function() {
    browserSync.init({
        server: {
            baseDir: _.serve.prod_dir,
            open: "local",
            browser: ["google chrome", "firefox"],
            notify: true,
            timestamps: true,
            host: _.serve.host
        }
    });
});

/*
 * Procesar Archivos jade
 */
gulp.task('jade', function () {
    return gulp.src(_.serve.base_dir + "/**/*jade")
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest(_.serve.base_dir));
})


/*
 * Procesar Archivos sass
 */

gulp.task('sass', function() {
    return gulp.src(addExcludes(_.dir.stylesheet + '**/*.sass'))
        .pipe($.sass.sync(
            {outputStyle: ':expanded'})
            .on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers:['> 5%','iOS 7','ie 6-8','last 2 versions']}))
        .pipe(gulp.dest(_.dir.stylesheet));
});

/*
* Inyectar contenido js y css al index
**/
gulp.task('inject:angular', function() {
    return gulp.src('index.html', {cwd: _.serve.base_dir})
        .pipe($.inject(
                gulp.src(addExcludes(_.dir.angular + "**/*.js"))
                    .pipe($.angularFilesort()), {
                    name: 'angular',
                    relative:true
                    //ignorePath: './app'
                }))
        .pipe(gulp.dest(_.serve.base_dir));
});

gulp.task('inject:scripts', function() {
    return gulp.src('index.html', {cwd: _.serve.base_dir})
        .pipe($.inject(
            gulp.src(addExcludes(_.dir.script + "**/*.js")),
            {relative:true}
        ))
        .pipe(gulp.dest(_.serve.base_dir));
});

gulp.task('inject:css', function() {
    return gulp.src('index.html', {cwd: _.serve.base_dir})
        .pipe($.inject(
            gulp.src(addExcludes(_.dir.stylesheet + "**/*.css")),
            {relative:true}
        ))
        .pipe(gulp.dest(_.serve.base_dir));
});

gulp.task('inject:bower', function () {
    gulp.src('index.html', {cwd: "./app"})
        .pipe(wiredep())
        .pipe(gulp.dest(_.serve.base_dir));
});

/*
* genera modulo para el manejo de templates
**/
var templateCache = require('gulp-angular-templatecache');
gulp.task('templates', function() {
    gulp.src(_.dir.view + '**/*.html')
        .pipe(templateCache({
            root: 'views/',
            module: 'app.templates',
            standalone: true
        }))
        .pipe(gulp.dest(_.dir.angular + "modules"));
});

/*
 * Automatizando recarga del navegador
 */
gulp.task('watch', function() {
    gulp.watch(['./app/**/*.jade'], ['jade', browserSync.reload]);
    gulp.watch(['./app/stylesheets/**/*.sass'], ["sass","inject:css", browserSync.reload]);
    gulp.watch(['./app/**/*.js'], ['jshint','inject:angular','inject:scripts',browserSync.reload]);
    gulp.watch(['./bower.json'], ['wiredep',browserSync.reload]);
});


/*
* Busca errores en el JS y nos los muestra en el terminal
*/

gulp.task('jshint', function() {
    return gulp.src([_.dir.script+ "**/*.js", _.dir.angular+"**/.*js"])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('jshint-stylish'))

});

/*
* tareas de despiegue app
**/
gulp.task('compress', function() {
    gulp.src('index.html', {cwd: _.serve.base_dir})
        .pipe($.useref())
        .pipe($.if('*.js', $.uglify({mangle: false })))
        .pipe($.if('*.css', $.minifyCss()))
        .pipe(gulp.dest(_.serve.prod_dir));
});


gulp.task('copy:views', function() {
    gulp.src(_.serve.base_dir + '/views/**/*.html')
        .pipe(gulp.dest(_.serve.prod_dir + "/views"))
});

/*
 * Elimina el CSS que no es utilizado para reducir el peso del archivo
 */
gulp.task('uncss', function() {
    gulp.src(_.serve.prod_dir + '/public/**/*.min.css')
        .pipe($.uncss({
            html: 'index.html'
        }))
        .pipe(gulp.dest(_.serve.prod_dir +"/public"));
});

/*
 * Compilar archivos para desarrollo
 **/
gulp.task('build',function(){
    runSequence('jade', 'sass','inject:angular','inject:scripts','inject:css','inject:bower');
});

/*
* compilar app en para producción
* */
 gulp.task('compile', function() {
     runSequence( 'compress','copy:views','uncss','jshint','serve:start');
 });

/*
*Correr aplicacion
 */
gulp.task("start",function(){
    runSequence("build","compile")
})

/*
* compilar app entorno local
*/
gulp.task('default', function(){
    runSequence('build');
    setTimeout(function(){
        runSequence('jshint', 'serve','watch');
    },1000);
});


