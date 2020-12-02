import gulp     from 'gulp';
import watch    from 'gulp-watch';
import foreach  from 'gulp-foreach';
import concat   from 'gulp-concat';
import babel    from 'gulp-babel';
import sass     from 'gulp-sass';
import prefix   from 'gulp-autoprefixer';
import cssmin   from 'gulp-clean-css';
import jsmin    from 'gulp-uglify';
import postcss  from 'gulp-postcss';
import fs       from 'fs';
import postscss from 'postcss-scss';
import reporter from 'postcss-reporter';
import scsslint from 'stylelint';
import del      from 'del';
import panini   from 'panini';
import sync     from 'browser-sync';

const clean = fn => {
    del('build/**/*').then(paths => { fn(); });
};

const html = fn => {
    return gulp.src('src/*.html')
        .pipe(panini({
            root: 'src/',
            layouts: 'src/layouts/',
            partials: 'src/include/',
            helpers: 'src/js/hbs-helpers/',
            data: 'src/json/'
        }))
        .pipe(gulp.dest('build/'))
        .on('end', fn);
};

const paniniRefresh = fn => {
    panini.refresh();
    fn();
};

const htmlPages = fn => {
    const arr = [];

    return gulp.src('src/*.html')
        .pipe(foreach((stream, file) => {
            const data = fs.readFileSync(file.path, 'utf-8', (err, data) => { });

            if (file.path.indexOf('_pages.html') === -1) {
                let title = '';

                if (data.split('---').length > 2) {
                    data.split('---').slice(1)[0].split('\n').forEach((str) => {
                        if (str.indexOf('title: ') === 0) {
                            title = str.replace('title: ', '').replace('\r', '');
                        }
                    });
                }

                if (file.path.indexOf('/') > -1) {
                    arr.push({
                        'file': file.path.slice(file.path.lastIndexOf('/') + 1),
                        'title': title
                    });
                } else {
                    arr.push({
                        'file': file.path.slice(file.path.lastIndexOf('\\') + 1),
                        'title': title
                    });
                }
            }

            return stream;
        }))
        .on('end', () => {
            fs.writeFileSync('src/json/_pages.json', JSON.stringify(arr, null, '  '));
            fn();
        });
};

const json = fn => {
    return gulp.src('src/json/**/*.*')
        .pipe(gulp.dest('build/json/'))
        .on('end', fn);
};

const css = fn => {
    return gulp.src('src/scss/*.scss')
        .pipe(sass({
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(prefix({
            browsers: ['last 4 versions', 'ie >= 10'],
            cascade: false,
            remove: true
        }))
        // .pipe(cssmin())
        .pipe(gulp.dest('build/css/'))
        .on('end', fn);
};

const cssBootstrap = fn => {
    return gulp.src('src/scss/bootstrap/*.scss')
        .pipe(sass({
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(prefix({
            browsers: ['last 4 versions', 'ie >= 10'],
            cascade: false,
            remove: true
        }))
        // .pipe(cssmin())
        .pipe(concat('bootstrap.css'))
        .pipe(gulp.dest('build/css/'))
        .on('end', fn);
};

const cssMediaQuery = fn => {
    return gulp.src('src/scss/media/*.scss')
        .pipe(sass({
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(prefix({
            browsers: ['last 4 versions', 'ie >= 10'],
            cascade: false,
            remove: true
        }))
        // .pipe(cssmin())
        .pipe(concat('media.css'))
        .pipe(gulp.dest('build/css/'))
        .on('end', fn);
};

const cssInclude = fn => {
    let first = '';
    let last = '';
    const arr = [];

    return gulp.src(['src/scss/main.scss', 'src/include/**/*.scss'])
        .pipe(foreach((stream, file) => {
            if (file.path.indexOf('main.scss') > 0) {
                const data = fs.readFileSync(file.path, 'utf-8', (err, data) => { });
                const temp_arr = data.split('//---');
                first = temp_arr[0];
                last = temp_arr[2];
            } else {
                arr.push('@import \'..' + file.path.split('src')[1].replace(/\\/g, '/').replace('.scss', '') + '\';\r\n');
            }

            return stream;
        }))
        .on('end', () => {
            fs.writeFileSync('src/scss/main.scss', first + '//---\r\n' + arr.join('') + '//---\r\n' + last);
            fn();
        });
};

const jslibs = fn => {
    return gulp.src('src/js/libs/**/*.js')
        // .pipe(concat('libs.js'))
        .pipe(gulp.dest('build/js/'))
        .on('end', fn);
};

const js = fn => {
    return gulp.src(['src/js/template/**/*.js', 'src/include/**/*.js'])
        .pipe(concat('main.js'))
        // .pipe(babel({ presets: ['es2015'] }))
        // .pipe(jsmin())
        .pipe(gulp.dest('build/js/'))
        .on('end', fn);
};

const assets = fn => {
    return gulp.src('src/assets/**/*.*')
        .pipe(gulp.dest('build/assets/'))
        .on('end', fn);
};

const reload = fn => {
    if (process.env.NODE_ENV == 'sync' || !process.env.NODE_ENV) {
        sync.reload();
    }

    fn();
};



gulp.task('test-scss', fn => {
    // https://maximgatilin.github.io/stylelint-config/
    var processors = [
        scsslint({
            "rules": {
                "indentation": "tab",
                "string-quotes": "single",
                "color-hex-case": "lower",
                "color-hex-length": "short",
                "color-named": "never",
                "color-no-hex": true,
                "selector-no-id": true,
                "selector-combinator-space-after": "always",
                "selector-attribute-operator-space-before": "never",
                "selector-attribute-operator-space-after": "never",
                "selector-attribute-brackets-space-inside": "never",
                "declaration-block-trailing-semicolon": "always",
                "declaration-colon-space-before": "never",
                "declaration-colon-space-after": "always",
                "number-leading-zero": "always",
                "font-weight-notation": "numeric",
                "font-family-name-quotes": "always-where-recommended",
                "rule-empty-line-before": "always-multi-line",
                "selector-pseudo-element-colon-notation": "double",
                "selector-pseudo-class-parentheses-space-inside": "never",
                "media-feature-range-operator-space-before": "always",
                "media-feature-range-operator-space-after": "always",
                "media-feature-parentheses-space-inside": "never",
                "media-feature-colon-space-before": "never",
                "media-feature-colon-space-after": "always"
            }
        }),
        reporter({
            clearMessages: true,
            throwError: false
        })
    ];

    return gulp.src(['src/scss/**/*.@(*(s)css)', '!src/scss/main.scss'])
        .pipe(postcss(processors, { syntax: postscss }))
        .on('end', fn);
});

gulp.task('build', gulp.series(clean, cssMediaQuery, cssBootstrap, cssInclude, css, gulp.parallel(htmlPages, jslibs, js, assets), gulp.parallel(html, json)));

gulp.task('watch', fn => {
    gulp.watch(['src/*.html'], htmlPages);
    gulp.watch(['src/*.html', 'src/{layouts,include}/**/*.html', 'src/js/hbs-helpers/**/*.js', 'src/json/**/*.*', '!src/json/_pages.json'], gulp.series(paniniRefresh, html, reload));
    gulp.watch(['src/json/**/*.*', '!src/json/_pages.json'], gulp.series(json, reload));
    gulp.watch(['src/include/**/*.scss'], gulp.series(cssInclude, css, reload));
    gulp.watch(['src/scss/**/*.scss'], gulp.series(cssMediaQuery, cssBootstrap, css, reload));
    gulp.watch(['src/js/libs/**/*.js'], gulp.series(jslibs, reload));
    gulp.watch(['src/js/template/**/*.js', 'src/include/**/*.js'], gulp.series(js, reload));
    gulp.watch(['src/assets/**/*.*'], gulp.series(assets, reload));
    fn();
});

gulp.task('default', gulp.series('build', 'watch'));

gulp.task('default-sync', gulp.series('build', 'watch', () => {
    sync({
        server: {
            baseDir: 'build',
            index: '_pages.html'
        },
        tunnel: false,
        host: 'localhost',
        logPrefix: ''
    });
}));
