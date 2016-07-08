# picas
Main website for [picas.us](http://picas.us)

### Usage

```
git clone https://github.com/greenglobal/picas.git
cd picas
git checkout dev
npm install
```

#### Go to dev mode

After installation:

```
npm start
```

If everything is ok, now you're already under dev mode. The website will be available at http://localhost:8181 (or another port you choose) and its resources are located within "./src" directory. Just modify them as you want.

Note that you can:

- use Handlebars syntax in HTML files
- use CSS4 in CSS files
- use ES6 in JavaScript files

These resources will be processed in background to give you live-result.

#### Releasing

Once you've done your job, just release the product:

```
npm run release
```

Wait a few seconds, the last build will be generated and saved under "./dist" directory. What you see there is a static website built from the resources within "./src", in which:


- HTML files have been compiled by Handlebars and minified
- CSS filles have been compiled by PostCSS, minified and combined
- JS filles have been transpiled by Babel, minified and combined
- All PNG, JPG and SVG images have been optimized


#### Template data

Please take a look at ./src/config.json, it's very important.

With this special file, you can add anything to define your website: meta data, articles, copyright... While compiling HTML resource, the content here will be parsed by Handlebars engine as template data.


#### Third party resources

Similar to [mdl-skeleton](https://github.com/ndaidong/mdl-skeleton), you can specify the third party resources (CSS & JavaScript) and several basic settings for builder by using package.json - at "builder" section.

Carefully when you change the value of sourceDir or distDir property. They are referred at many other places.

### Tech stacks

Don't miss these hot technologies:

- [ECMAScript 2015 (ES6)](http://es6-features.org/)
- [Babel](http://babeljs.io/)
- [PostCSS](http://postcss.org/)
- [Handlebars](http://handlebarsjs.com/)
- [Jake](http://jakejs.com/)

### License

The MIT License (MIT)
