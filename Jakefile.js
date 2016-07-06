/**
 * Common scenario for building sites with Jake
 * @ndaidong at Twitter
 **/

/* global task */

var pkg = require('./package');
var builder = require('./workers/builder');
var createDir = builder.createDir;
var removeDir = builder.removeDir;
var copyDir = builder.copyDir;
var copyFile = builder.copyFile;
var iminify = builder.iminify;

var bella = require('bellajs');
var Handlebars = require('handlebars');

var fs = require('fs');
var fixPath = builder.fixPath;

var bConfig = pkg.builder;
var sourceDir = fixPath(bConfig.sourceDir);
var distDir = fixPath(bConfig.distDir);

var dir = () => {
  createDir([distDir]);
};

var reset = () => {
  removeDir([distDir, `${sourceDir}/js/vendor`, `${sourceDir}/css/vendor`]);
};

var getResources = () => {
  let download = builder.download;
  let jsFiles = bConfig.javascript || {};
  let cssFiles = bConfig.css || {};
  if (bella.isObject(jsFiles)) {
    let js3rdDir = fixPath(sourceDir + '/js/vendor');
    let rd = fixPath(js3rdDir);
    if (!fs.existsSync(rd)) {
      createDir(rd);
    }
    for (let alias in jsFiles) {
      if (bella.hasProperty(jsFiles, alias)) {
        let src = jsFiles[alias];
        let dest = rd + alias + '.js';
        if (!fs.existsSync(dest)) {
          download(src, dest);
        }
      }
    }
  }
  if (bella.isObject(cssFiles)) {
    let css3rdDir = fixPath(sourceDir + '/css/vendor');
    let rd = fixPath(css3rdDir);
    if (!fs.existsSync(rd)) {
      createDir(rd);
    }
    for (let alias in cssFiles) {
      if (bella.hasProperty(cssFiles, alias)) {
        let src = cssFiles[alias];
        let dest = rd + alias + '.css';
        if (!fs.existsSync(dest)) {
          download(src, dest);
        }
      }
    }
  }
};

var compileHTML = () => {
  copyDir(sourceDir, distDir);
  copyFile(`${sourceDir}/images/brand/favicon.ico`, `${distDir}/favicon.ico`);
  let buildOne = (file) => {
    let input = sourceDir + file;
    let output = distDir + file;
    builder.compileHTML(input, distDir).then((result) => {
      if (result.css) {
        let dcss = distDir + 'css';
        fs.writeFileSync(dcss + '/all.min.css', result.css, 'utf8');
      }
      if (result.js) {
        let djs = distDir + 'js';
        fs.writeFileSync(djs + '/all.min.js', result.js, 'utf8');
      }
      if (result.html) {
        let config = require(`./${sourceDir}/config`);
        let template = Handlebars.compile(result.html);
        let html = template(config);

        fs.unlinkSync(output);
        fs.writeFileSync(output, html, 'utf8');
      }
    });
  };

  let files = fs.readdirSync(sourceDir, 'utf8');
  if (files && files.length) {
    files.forEach((f) => {
      if (f.match(/^([a-zA-Z-0-9]+)\.(html?)$/)) {
        buildOne(f);
      }
    });
  }
};

var minifyImages = () => {
  iminify(distDir);
};

task('reset', reset);
task('dir', dir);
task('download', getResources);
task('start', ['dir', 'download']);
task('html', compileHTML);
task('image', minifyImages);
task('onrelease', () => {
  console.log(`Website has been released at ${distDir}`);
});
task('release', ['html', 'image', 'onrelease']);
