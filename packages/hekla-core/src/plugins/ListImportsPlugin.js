const { getImportInfo } = require('../utils/ast-utils');

module.exports = class ListImportsPlugin {
  apply(analyzer) {
    analyzer.hooks.moduleJSFamilyAST.tap('ListImportsPlugin', this.moduleJSFamilyAST.bind(this));
  }

  moduleJSFamilyAST(module, ast) {
    const imports = getImportInfo(ast.unwrap());
    module.set('imports', imports);
  }
}
