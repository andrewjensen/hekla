# hekla-core

## Example Usage

```js
const Analyzer = require('hekla-core').Analyzer;
const config = require('./path/to/Heklafile.js');

const analyzer = new Analyzer(config);
analyzer.run();
```

## Loaders

### `FileLoader`

Loads modules according to a glob pattern.

## Parsers

### `AngularDirectiveParser`

Extracts Angular directives from modules.

### `AngularFactoryParser`

Extracts Angular factories from modules.
