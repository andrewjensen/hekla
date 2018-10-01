const { getImportInfo } = require('../utils/ast-utils');

module.exports = class ListImportsPlugin {
  apply(analyzer) {
    analyzer.hooks.moduleSyntaxTreeJS.tap('ListImportsPlugin', this.moduleSyntaxTreeJS.bind(this));
  }

  moduleSyntaxTreeJS(module, ast) {
    const imports = getImportInfo(ast.unwrap());
    module.set('imports', imports);
  }
}
