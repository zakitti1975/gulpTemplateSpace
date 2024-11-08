// Gulpfile.js
// サービスの特性に応じて、適宜以下をカスタマイズして利用してください。
// ただし、ソース中の以下のパスは、案件ごとに設定が必要なので必ず書き換えて利用してください。
//
//     // ★★★プロジェクト名★★★
//     projectName = 'mysampleproject',
//     // ★★★ブログ名（基本ディレクトリ名）★★★
//     directoryName = 'promo',

/*******************************************
 * import用
 *******************************************/
// common
var gulp             = require('gulp');
var plumber          = require('gulp-plumber');
var rename           = require('gulp-rename');
var concat           = require('gulp-concat');
var browserSync      = require('browser-sync');
var header           = require('gulp-header');
var replace          = require('gulp-replace');
var copyright        = require('gulp-insert');
var os               = require('os');

//css
var sass             = require('gulp-sass');
var autoprefixer     = require('gulp-autoprefixer');
var csslint          = require('gulp-csslint');
var yuicompressor    = require('gulp-yuicompressor');

//js
var jshint           = require('gulp-jshint');

//html
var htmlhint         = require('gulp-htmlhint');
var pug             = require('gulp-pug');

//image
var imagemin         = require('gulp-imagemin');
var spritesmith      = require('gulp.spritesmith');

//aossl
var check           = require('gulp-check');

/*******************************************
 * 設定パス
 *******************************************/

var root = './',

    // ★★★プロジェクト名★★★
    projectName = 'dummyProject',

    // ★★★ブログ名（基本ディレクトリ名）★★★
    directoryName = 'test',

    // 元になるデータ類
    src = root + 'src/',

    // 書き出す場所
    dest = root + 'dist/',

    // イメージセンター
    imagecenter = 'https://xxx.dummy.imagepass/' + directoryName + '/' + projectName + '/sp/',

    // ファイルパス
    filepath = {
    //docs: dest + 'docs/',

        html: dest + 'html/',
        //bluehtml: dest + 'blue_html/',
        css: dest + 'css/',
        js: dest + 'js/',
        image: dest + 'img/',

        src_pug: src + 'pug/',
        src_scss: src + 'scss/',
        src_js: src + 'js/',
        src_image: src + 'img/'

    };


/////////////////////////////////////////////////////////////
//
//  JS,CSSのコピーライトを自動で付与するための関数
// （ファイル名 ＋ copyright)
//
////////////////////////////////////////////////////////////

var addCopyrightString = function () {
    return function (contents, file) {
        var header = '',
            cssCharsetRegexp = /@charset\s+["'][A-Za-z0-9_-]*["']\s*\;\s*\n{0,1}/g,
            cssCharsetStr = contents.toString().match(cssCharsetRegexp),
            matchCharsetStr = (cssCharsetStr && cssCharsetStr.length > 0) ? cssCharsetStr[0] : null,
            // [ファイルパス] Windows では \\ 区切り, Mac では / 区切りとなるため
            filePathDelimiter = (os.type() === 'Windows_NT') ? '\\' : '/';

        if (matchCharsetStr) {
            contents = contents.toString().replace(matchCharsetStr, '');
            matchCharsetStr = matchCharsetStr.replace(/\r?\n/g, ""); // 余計な改行を削除
        }

        header = [
            (matchCharsetStr ? matchCharsetStr + '\n' : '') + '/*',
            file.path.split(filePathDelimiter).pop(),
            'Copyright (C) ' + (new Date()).getFullYear() +
            ' XXXXXX Corporation. All Rights Reserved.',
            '*/\n'
        ].join('\n');

        console.log(header);

        return header + contents;
    };
};

/////////////////////////////////////////////////////////////
//
//  MTファイル中にhttp://で始まるリソースがあれば怒る関数
//
////////////////////////////////////////////////////////////

var alertHttpResources = function (str) {

    var red     = '\u001b[31m';
    var reset   = '\u001b[0m';
    console.log('\n' +　red +
        '※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※\n' +
        '※\n' +
        '※【要修正】\n' +
        '※ '  + str + '内に、「http://」で始まるURLが含まれています。\n' +
        '※ 本番にリリースするときは必ず「https://」で始まるパスに書き換えてください。\n' +
        '※\n' +
        '※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※\n' + reset
    );
}

/*******************************************
 * HTML用のタスク
 *******************************************/

 gulp.task('html', function () {
    console.log('=============== HTML（プレビュー用）をビルドしています ===================')
    return gulp
        //.src(filepath.src_pug + 'index.pug')
        .src(filepath.src_pug + '*.pug')
        .pipe(plumber())
        .pipe(pug({pretty: '    '}))
        .pipe(htmlhint())
        .pipe(replace('index.css', projectName + '_sp.css'))
        .pipe(replace('index.js', projectName + '_sp.js'))
        .pipe(gulp.dest(filepath.html));
});

 /*******************************************
 * CMS Blue用ファイルの作成
 *******************************************/
// html
//gulp.task('bluehtml', function () {
//    console.log('=============== HTML（Blue用）をビルドしています ===================')
//    return gulp
//        .src(filepath.src_pug + 'index.pug')
//        .pipe(plumber())
//        .pipe(pug({pretty: '    ', locals: {'blue': true}}))
//        .pipe(htmlhint())
//        .pipe(replace('../img/', imagecenter  + 'img/'))
//        .pipe(replace('../css/', imagecenter  + 'css/'))
//        .pipe(replace('../js/', imagecenter  + 'js/'))
//        .pipe(replace('index.css', projectName + '_sp.min.css'))
//        .pipe(replace('index.js', projectName + '_sp.min.js'))
//        .pipe(check(/http:\/\//))
//        .on('error', function(){
//            alertHttpResources('CMS Blue用HTML');
//        })
//        .pipe(gulp.dest(filepath.bluehtml));
//});

/*******************************************
 * CSS用のタスク
 *******************************************/

gulp.task('css', function () {
    return gulp
        //.src(filepath.src_scss + 'index.scss')
        .src(filepath.src_scss + '*.scss')
        .pipe(plumber())
        .pipe(sass.sync({outputStyle: 'expanded'}))
        .pipe(autoprefixer('> 0%'))
        .pipe(csslint('./csslintrc.json'))
        .pipe(csslint.formatter())
        .pipe(rename(projectName +'_sp.css'))
        .pipe(copyright.transform(addCopyrightString()))
        .pipe(check(/http:\/\//))
        .on('error', function(){
            alertHttpResources('CSS');
        })
        .pipe(gulp.dest(filepath.css))
        .pipe(yuicompressor({
            type: 'css'
        }))
        .pipe(rename(function(path){path.extname = '.min.css';}))
        .pipe(copyright.transform(addCopyrightString()))
        .pipe(gulp.dest(filepath.css));
});

/*******************************************
 * JS用のタスク
 *******************************************/

gulp.task('js', function(){
    console.log('=============== JSをビルドしています ===================')
    return gulp
        .src([
            // 任意のファイルパス
            filepath.src_js + 'index.js'
        ])
        .pipe(plumber())
        .pipe(concat(projectName + '_sp.js'))
        .pipe(jshint('./jshintrc.json'))
        .pipe(jshint.reporter('default'))
        .pipe(copyright.transform(addCopyrightString()))
        .pipe(gulp.dest(filepath.js))
        .pipe(replace('console.log', '//console.log'))
        .pipe(check(/http:\/\//))
        .on('error', function(){
            alertHttpResources('JS');
        })
        .pipe(yuicompressor({
            type: 'js'
        }))
        .pipe(rename(function(path){path.extname = '.min.js';}))
        .pipe(copyright.transform(addCopyrightString()))
        .pipe(gulp.dest(filepath.js));
});

/*******************************************
 * 画像用のタスク
 *******************************************/

 gulp.task('image', function (done) {
        console.log('=============== スプライト画像/画像を圧縮しています ===================');
        console.log('\n' +
            '※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※\n' +
            '※\n' +
            '※【注意】\n' +
            '※ 画像のサイズ、数などを変更するたびに、\n' +
            '※ 作成されるスプライトの座標は大幅に変わります。\n' +
            '※ 本番環境へspriteする画像を同一画像パスで上書きすると、\n' +
            '※ イメージセンターのキャッシュが残ってしまうため、\n' +
            '※ リリース後に画像変更の必要がある場合は、\n' +
            '※ 出力画像ファイル名を変更するなどして対応してください。\n' +
            '※\n' +
            '※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※\n' +
        '\n');
         gulp
             .src([
                 filepath.src_image + '*.{gif,jpg,png,svg}',
                 '!' + filepath.src_image + 'sprite/*.{gif,jpg,png,svg}'
             ])
             .pipe(imagemin())
             .pipe(gulp.dest(filepath.image));

        var sprite_original = gulp
         .src(filepath.src_image + 'sprite/*.png')
         .pipe(spritesmith({
            algorithm: 'binary-tree',
            retinaSrcFilter: [filepath.src_image + 'sprite/*_2x.png'],
            imgName: 'spr_common_01.png',
            retinaImgName: 'spr_common_01_2x.png',
            imgPath: '../img/spr_common_01.png',
            retinaImgPath: '../img/spr_common_01_2x.png',
            cssName: '_sprite.scss',
            padding: 10,
            cssVarMap: function (sprite) {
                sprite.name = 'sprite_' + sprite.name;
            }
         }));
        sprite_original.img.pipe(gulp.dest(filepath.image)); //imgNameで指定したスプライト画像の保存先
        sprite_original.css.pipe(gulp.dest(filepath.src_scss)); //cssNameで指定したcssの保存先
        done();
 });

/*******************************************
 * ブラウザ同期のタスク
 *******************************************/
// browser-sync
gulp.task('bs-init', function (done) {
    browserSync({
        server: {
            baseDir: dest,//起動するディレクトリ
            directory: true,
            ghostMode: false
        }
    });
    done();
});
// bs-reload
gulp.task('bs-reload', function (done) {
    browserSync.reload();
    done();
});

/*******************************************
 * watch
 *******************************************/
gulp.task('watch', function (done) {
    gulp.watch(filepath.src_pug + '*.pug')
        .on('change', gulp.series('html', 'bs-reload'));
    gulp.watch(filepath.src_scss + '*.scss')
        .on('change', gulp.series('css', 'bs-reload'));
    gulp.watch(filepath.src_js + '*.js')
        .on('change', gulp.series('js', 'bs-reload'));
    gulp.watch(filepath.src_image + '*.{gif,jpg,png}')
        .on('change', gulp.series('image', 'css', 'bs-reload'));
    done();
});

/*******************************************
 * デフォルト
 *******************************************/

gulp.task('default',
    gulp.series(
        'bs-init',
        gulp.parallel(
            'html',
            //'bluehtml',
            'image',
            'css',
            'js'
        ), 
        'watch'
    ));