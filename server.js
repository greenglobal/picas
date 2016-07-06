var fs = require('fs');
var minimist = require('minimist');

var express = require('express');
var app = express();
var Handlebars = require('handlebars');

var builder = require('./workers/builder');
var postProcess = builder.postProcess;
var transpile = builder.transpile;

var pkg = require('./package');
var bConfig = pkg.builder;
var sourceDir = bConfig.sourceDir;

app.use((req, res, next) => {
  let p = req.path;
  if (p === '/') {
    p = '/index.html';
  }
  if (p.match(/^\/([a-zA-Z-0-9]+)\.(html?)$/)) {
    let f = `./${sourceDir}${p}`;
    if (fs.existsSync(f)) {
      console.log(`Compiling with Handlebars: ${f}`);
      let s = fs.readFileSync(f, 'utf8');
      let template = Handlebars.compile(s);
      let c = fs.readFileSync(`./${sourceDir}/config.json`, 'utf8');
      let config = JSON.parse(c);
      let html = template(config);
      return res.status(200).send(html);
    }
  } else if (p.match(/\/([a-zA-Z-0-9]+)\.(css)$/)) {
    let f = `./${sourceDir}${p}`;
    if (fs.existsSync(f) && !p.includes('vendor/')) {
      console.log(`Processing with PostCSS: ${f}`);
      let s = fs.readFileSync(f, 'utf8');
      return postProcess(s).then((css) => {
        return res.status(200).type('text/css').send(css);
      });
    }
  } else if (p.match(/\/([a-zA-Z-0-9]+)\.(js|es6)$/)) {
    let f = `./${sourceDir}${p}`;
    if (fs.existsSync(f) && !p.includes('vendor/')) {
      console.log(`Transpiling with Babel: ${f}`);
      let s = fs.readFileSync(f, 'utf8');
      let r = transpile(s);
      let js = r.code || '';
      return res.status(200).type('text/javascript').send(js);
    }
  }
  return next();
});
app.use(express.static(sourceDir));
app.use((req, res) => {
  return res.status(404).send('File not found');
});

var argv = minimist(process.argv.slice(2));
app.listen(argv.port, () => {
  console.log(`Server started running at ${argv.port}`);
  console.log(`http://localhost:${argv.port}`);
});
