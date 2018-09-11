module.exports = class LinesOfCodePlugin {
  apply(analyzer) {
    console.log('Applying LinesOfCodePlugin');

    analyzer.hooks.moduleRawSource.tap('LinesOfCodePlugin', this.moduleRawSource.bind(this));
  }

  moduleRawSource(module, source) {
    const lines = source.split('\n').length;
    module.set('lines', lines);
  }
}
