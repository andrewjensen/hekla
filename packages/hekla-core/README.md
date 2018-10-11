# hekla-core

Core logic for running static analysis with Hekla

[![Build Status](https://travis-ci.org/andrewjensen/hekla.svg?branch=master)](https://travis-ci.org/andrewjensen/hekla)

This package is required by the Hekla [Webpack plugin](https://www.npmjs.com/package/hekla-webpack-plugin) and [CLI tool](https://www.npmjs.com/package/hekla-cli). It includes built-in plugins, as well as other core logic that you can use in custom plugins. The Analyzer can also be imported and called directly from other code.

## Configuring `hekla.config.js`

TODO: add this section!

## Built-in plugins

See the `src/plugins` directory.

## Logic for other plugins

See the `src/utils/ast-utils` directory.

## Using hekla-core from other code

```js
const Analyzer = require('hekla-core').Analyzer;
const config = require('./path/to/hekla-config.js');

const analyzer = new Analyzer();
analyzer.applyConfig(config);

// ...
```

See the Analyzer unit tests for more example usage.
