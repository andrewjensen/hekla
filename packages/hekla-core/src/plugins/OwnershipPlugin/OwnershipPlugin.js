const ProjectTreeAnnotations = require('./ProjectTreeAnnotations');

module.exports = class OwnershipPlugin {
  constructor(owners) {
    if (!owners) {
      throw new TypeError();
    }
    this.annotations = new ProjectTreeAnnotations();
    for (let ownerRule of owners) {
      const { path, owner } = ownerRule;
      this.annotations.add(path, { owner });
    }
  }

  apply(analyzer) {
    analyzer.hooks.moduleRawSource.tap('OwnershipPlugin', this.moduleRawSource.bind(this));
  }

  moduleRawSource(module, source) {
    const match = this.annotations.match(module.getName());
    if (match) {
      module.set('owner', match.owner);
    } else {
      module.set('owner', null);
    }
  }
}
