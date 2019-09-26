# hekla-plugin-csv-reporter

A Hekla plugin to report analysis through CSV files

## Usage

Install the package into your project:

```bash
npm install --save-dev hekla-plugin-csv-reporter
```

Then add it to your `hekla.config.js` file, with configuration:

```js
const CSVReporterPlugin = require('hekla-plugin-csv-reporter');

module.exports = {
  // ...
  plugins: [
    // ...
    new CSVReporterPlugin({
      destination: '/path/to/output.csv',
      headers: [
        'file',
        'myProperty',
        'myOtherProperty'
      ],
      moduleToRows: (module) => ([
        [
          module.name,
          module.myProperty,
          module.myOtherProperty
        ]
      ])
    })
  ]
};
```

## Usage with list properties

Suppose you track a list of items for each module, like this example:

```json
{
  "modules": [
    {
      "name": "./common/components/AppWrapper.js",
      "shortName": "AppWrapper.js",
      "nativeElements": [
        "div",
        "footer",
        "h1",
        "header",
        "main"
      ]
    }
    {
      "name": "./my-feature/components/ContactForm.js",
      "shortName": "ContactForm.js",
      "nativeElements": [
        "button",
        "div",
        "input",
        "span",
        "textarea"
      ]
    },
  ]
}
```

You could create a row for each item in the module, with a `hekla.config.js` configuration like this:

```js
const CSVReporterPlugin = require('hekla-plugin-csv-reporter');

module.exports = {
  // ...
  plugins: [
    // ...
    new CSVReporterPlugin({
      destination: '/path/to/output.csv',
      headers: [
        'file',
        'nativeElement'
      ],
      moduleToRows: (module) =>
        module.nativeElements
          .map(nativeElement => ([module.name, nativeElement]))
    })
  ]
};
```

This would create the following data in `output.csv`:

| file                                   | nativeElement |
| -------------------------------------- | ------------- |
| ./common/components/AppWrapper.js      | div           |
| ./common/components/AppWrapper.js      | footer        |
| ./common/components/AppWrapper.js      | h1            |
| ./common/components/AppWrapper.js      | header        |
| ./common/components/AppWrapper.js      | main          |
| ./my-feature/components/ContactForm.js | button        |
| ./my-feature/components/ContactForm.js | div           |
| ./my-feature/components/ContactForm.js | input         |
| ./my-feature/components/ContactForm.js | span          |
| ./my-feature/components/ContactForm.js | textarea      |
