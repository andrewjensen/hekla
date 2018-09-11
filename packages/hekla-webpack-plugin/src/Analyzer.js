const { SyncHook } = require('tapable');

module.exports = class Analyzer {
  constructor() {
    this.hooks = {
      moduleRawSource: new SyncHook(['module', 'source']),
      moduleJsFamilyAst: new SyncHook(['module', 'ast'])
    };
  }

  processModuleSource(module, source) {
    this.hooks.moduleRawSource.call(module, source);
  }
}
