const { SyncHook } = require('tapable');

module.exports = class Analyzer {
  constructor() {
    this.hooks = {
      moduleRawSource: new SyncHook(['module', 'source']),
      moduleJSFamilyAST: new SyncHook(['module', 'ast'])
    };
  }

  processModuleSource(module, source) {
    this.hooks.moduleRawSource.call(module, source);
  }

  processJSModuleAST(module, ast) {
    this.hooks.moduleJSFamilyAST.call(module, ast);
  }
}
