const { getImportInfo } = require('../utils/ast-utils');

module.exports = class ListImportsPlugin {
  apply(analyzer) {
    console.log('Applying ListImportsPlugin');

    analyzer.hooks.moduleJSFamilyAST.tap('ListImportsPlugin', this.moduleJSFamilyAST.bind(this));
  }

  moduleJSFamilyAST(module, ast) {
    const imports = getImportInfo(ast);
    module.set('imports', imports);
  }
}
