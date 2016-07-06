/**
 * Common scenario for setting up and optimizing system
 * @ndaidong
 **/

var fs = require('fs');
var path = require('path');
var cprocess = require('child_process');
var exec = cprocess.execSync;

var Promise = require('promise-wtf');
var bella = require('bellajs');
var mkdirp = require('mkdirp').sync;
var cpdir = require('copy-dir').sync;
var readdir = require('recursive-readdir');

var cheerio = require('cheerio');

var postcss = require('postcss');
var postcssFilter = require('postcss-filter-plugins');
var cssnano = require('cssnano');
var cssnext = require('postcss-cssnext');
var postcssMixin = require('postcss-mixins');
var postcssNested = require('postcss-nested');

var parser = require('shift-parser');
var codegen = require('shift-codegen').default;
var babel = require('babel-core');

var SVGO = require('svgo');
var imagemin = require('imagemin');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');

var fixPath = (p) => {
  if (!p) {
    return '';
  }
  p = p.replace(/\/([\/]+)/, '/');
  if (p.endsWith('/')) {
    return p;
  }
  return p + '/';
};

var transpile = (code) => {
  return babel.transform(code, {
    presets: ['es2015'],
    plugins: [
      'transform-remove-strict-mode'
    ]
  });
};

var jsminify = (code) => {
  let ast = parser.parseScript(code);
  return codegen(ast);
};

var iminify = (dir) => {
  let svgo = new SVGO();
  let minsvg = (file) => {
    let s = fs.readFileSync(file, 'utf8');
    svgo.optimize(s, (result) => {
      fs.writeFile(file, result.data, (er) => {
        if (er) {
          console.log(er);
        } else {
          console.log(`Minified SVG ${file}`);
        }
      });
    });
  };

  let minimg = (file) => {
    imagemin([file], {
      plugins: [
        imageminMozjpeg({targa: false}),
        imageminPngquant({quality: '65-80'})
      ]
    }).then((ls) => {
      ls.forEach((item) => {
        if (item && item.data) {
          fs.writeFile(file, item.data, (er) => {
            if (er) {
              console.log(er);
            } else {
              console.log(`Minified image ${file}`);
            }
          });
        }
      });
    }).catch((e) => {
      console.log(e);
    });
  };

  let rdir = fixPath(dir + 'images');
  readdir(rdir, (err, files) => {
    if (err) {
      console.trace(err);
    }
    if (files && files.length) {
      files.forEach((f) => {
        let b = path.extname(f);
        if (b === '.svg') {
          minsvg(f);
        } else if (b === '.jpg' || b === '.jpeg' || b === '.png') {
          minimg(f);
        }
      });
    }
  });
};

const POSTCSS_PLUGINS = [
  postcssFilter({
    silent: true
  }),
  cssnext,
  cssnano,
  postcssMixin,
  postcssNested
];

var isAbsolute = (url) => {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
};

var removeNewLines = (s) => {
  s = s.replace(/(?:\r\n|\r|\n)+/gm, '');
  return s;
};

var download = (src, saveas) => {
  if (fs.existsSync(saveas)) {
    fs.unlink(saveas);
  }
  console.log('Downloading %s ...', src);
  exec('wget -O ' + saveas + ' ' + src);
  console.log('Downloaded %s', saveas);
};

var createDir = (ls) => {
  if (bella.isArray(ls)) {
    ls.forEach((d) => {
      d = path.normalize(d);
      if (!fs.existsSync(d)) {
        mkdirp(d);
        console.log('Created dir "%s"... ', d);
      }
    });
  } else {
    ls = path.normalize(ls);
    if (!fs.existsSync(ls)) {
      mkdirp(ls);
    }
  }
};

var removeDir = (ls) => {
  if (bella.isArray(ls)) {
    let k = 0;
    ls.forEach((d) => {
      d = path.normalize(d);
      exec('rm -rf ' + d);
      ++k;
      console.log('%s, removed dir "%s"... ', k, d);
    });
  } else {
    ls = path.normalize(ls);
    exec('rm -rf ' + ls);
  }
  console.log('Done.');
};

var createEmptyFile = (dest) => {
  let ext = path.extname(dest);
  let fname = path.basename(dest);
  let content = '';
  if (ext === '.js') {
    content = '/**' + fname + '*/';
  } else if (ext === '.css' || ext === '.less') {
    content = '/*' + fname + '*/';
  }
  fs.writeFileSync(dest, content, {
    encoding: 'utf8'
  });
};

var copyFile = (source, target) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
    var rd = fs.createReadStream(source);
    rd.on('error', reject);
    var wr = fs.createWriteStream(target);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  });
};

var copyDir = (from, to, clean = true) => {
  if (!fs.existsSync(from)) {
    return false;
  }
  if (fs.existsSync(to) && clean) {
    exec('rm -rf ' + to);
  }
  mkdirp(to);
  cpdir(from, to);
  return false;
};

var postProcess = (css) => {
  return new Promise((resolve, reject) => {
    return postcss(POSTCSS_PLUGINS)
      .process(css)
      .then((result) => {
        return resolve(result.css);
      }).catch((err) => {
        return reject(err);
      });
  });
};

var compileCSS = (files) => {

  return new Promise((resolve, reject) => {
    let s = '';
    let as = [];
    let vs = [];
    if (bella.isString(files)) {
      files = [files];
    }
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        let x = fs.readFileSync(file, 'utf8');
        as.push(x);
      }
    });

    s = as.join('\n');

    if (s.length > 0) {
      let ps = vs.join('\n');
      return postProcess(s).then((rs) => {
        return resolve(ps + rs);
      }).catch((err) => {
        return reject(err);
      });
    }
    return reject(new Error('No CSS data'));
  });
};

var compileJS = (files) => {

  return new Promise((resolve, reject) => {
    let s = '';
    let as = [];
    if (bella.isString(files)) {
      files = [files];
    }
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        let x = fs.readFileSync(file, 'utf8');
        if (!file.includes('vendor/')) {
          let r = transpile(x);
          x = r.code;
        }
        x = jsminify(x);
        if (!x.startsWith(';')) {
          x = ';' + x;
        }
        if (!x.endsWith(';')) {
          x += ';';
        }
        as.push(x);
      }
    });

    s = as.join('\n');

    if (s.length > 0) {
      return resolve(s);
    }
    return reject(new Error('No JavaScript data'));
  });
};

var compileHTML = (file, dir) => {

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) {
      return reject(new Error('File not found'));
    }

    let s = fs.readFileSync(file, 'utf8');
    let $ = cheerio.load(s, {
      normalizeWhitespace: true
    });
    let cssFiles = [];
    let jsFiles = [];

    let html = '';
    let style = '';
    let script = '';

    let revision = bella.createId(10);

    return Promise.series([
      (next) => {
        console.log('Parsing CSS files...');
        $('link[rel="stylesheet"]').each((i, elem) => {
          let ofile = $(elem).attr('href');
          if (!isAbsolute(ofile)) {
            cssFiles.push(dir + ofile);
            $(elem).remove();
          }
        });
        return next();
      },
      (next) => {
        console.log('Parsing JS files...');
        $('script[type="text/javascript"]').each((i, elem) => {
          let ofile = $(elem).attr('src');
          if (!isAbsolute(ofile)) {
            jsFiles.push(dir + ofile);
            $(elem).remove();
          }
        });
        return next();
      },
      (next) => {
        console.log('Compiling CSS...');
        return compileCSS(cssFiles).then((css) => {
          style = css;
          let styleTag = `<link rel="stylesheet" type="text/css" href="css/all.min.css?rev=${revision}" />`;
          $('head').append(styleTag);
          return css;
        }).finally(next);
      },
      (next) => {
        console.log('Compiling JS...');
        return compileJS(jsFiles).then((js) => {
          script = js;
          let scriptTag = `<script type="text/javascript" src="js/all.min.js?rev=${revision}"></script>`;
          $('body').append(scriptTag);
          return js;
        }).finally(next);
      },
      (next) => {
        console.log('Cleaning HTML...');
        html = $.html();
        html = removeNewLines(html);
        return next();
      }
    ]).then(() => {
      return resolve({
        html,
        css: style,
        js: script
      });
    }).catch((err) => {
      return reject(err);
    });
  });
};

module.exports = {
  fixPath,
  download,
  postProcess,
  transpile,
  compileHTML,
  iminify,
  readdir,
  createDir,
  removeDir,
  copyDir,
  copyFile,
  removeFile: (f) => {
    return exec('rm -rf ' + f);
  },
  createEmptyFile
};
