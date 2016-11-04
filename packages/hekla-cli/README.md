# hekla-cli

## Usage

### Step 1: Install dependencies

In your project directory, run:

```
npm install -g hekla-cli

npm install --save-dev hekla-core
```

### Step 2: Create a `Heklafile.js` config file

Configure your `Heklafile.js` based on the types of components your Javascript project contains. If your project is written in Angular 1.x, your config file might look something like this:

```js
const path = require('path');
const FileLoader = require('hekla-core/src/loaders').FileLoader;
const AngularDirectiveParser = require('hekla-core/src/parsers').AngularDirectiveParser;
const AngularFactoryParser = require('hekla-core/src/parsers').AngularFactoryParser;
const rootPath = path.resolve(__dirname);

module.exports = {
  title: 'VolcanoApp Web Client',
  root: rootPath,
  debug: false,

  // Load Javascript modules according to a glob pattern
  loader: new FileLoader({
    root: rootPath,
    glob: '**/*.js',
    ignore: [
      // Skip third-party code
      'node_modules/**',
      'bower_components/**',
      // Skip build artifacts
      '**/*.built.js',
      // Skip internal tests and tools
      'test/**',
      '**/*.spec.js',
      'webpack.config.js',
      'Gruntfile.js'
    ]
  }),

  // Extract Angular 1.x patterns from modules
  parsers: [
    new AngularDirectiveParser(),
    new AngularFactoryParser()
  ]
};
```

### Step 3: Run the analyzer

In your project directory, run:

```
hekla analyze

hekla view hekla.json
```
