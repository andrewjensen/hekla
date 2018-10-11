# hekla-webpack-plugin

Webpack integration for running static analysis with Hekla

[![Build Status](https://travis-ci.org/andrewjensen/hekla.svg?branch=master)](https://travis-ci.org/andrewjensen/hekla)

## Quick setup

Step 1: add the dependencies to your `package.json` file:

```bash
npm install --save-dev hekla-core hekla-webpack-plugin
```

Step 2: create a `hekla.config.js` file in your project root that looks generally like this:

```js
const {
  LinesOfCodePlugin,
  // Import other built-in plugins here
} = require('hekla-core').plugins;

module.exports = {
  rootPath: __dirname,
  exclude: [
    /vendor/,
    /other-directory-to-skip/
  ],
  plugins: [
    new LinesOfCodePlugin()
    // Add your plugins here!
  ]
};

```

Step 3: Add the plugin to your webpack configuration:

```js
// ...

const HeklaWebpackPlugin = require('hekla-webpack-plugin');
const heklaConfig = require('./hekla.config.js');

module.exports = {
  // ...
  plugins: [
    // ...
    new HeklaWebpackPlugin(heklaConfig)
  ]
}
```

Now Hekla will produce analysis every time you build your project!

## Setup tips

Consider applying the `HeklaWebpackPlugin` conditionally, so the analysis only runs when you need it. You might want to run it only in production mode, or only when running along with CI.

Read more about configuring Hekla in the [hekla-core](https://www.npmjs.com/package/hekla-core) project.
