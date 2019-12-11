import { getImportInfo, ASTWrapper } from '../utils/ast-utils';
import { IAnalyzer } from '../interfaces';
import Module from '../Module';

export default class ListImportsPlugin {
  apply(analyzer: IAnalyzer) {
    analyzer.hooks.moduleSyntaxTreeJS.tap('ListImportsPlugin', this.moduleSyntaxTreeJS.bind(this));
  }

  moduleSyntaxTreeJS(module: Module, ast: ASTWrapper) {
    const imports = getImportInfo(ast.unwrap());
    module.set('imports', imports);
  }
}
