import ProjectTreeAnnotations from './ProjectTreeAnnotations';
import { IAnalyzer, IHeklaPlugin } from '../../interfaces';
import Module from '../../Module';

interface Owner {
  path: string
  owner: string
}

export default class OwnershipPlugin implements IHeklaPlugin {
  annotations: ProjectTreeAnnotations

  constructor(owners: Owner[]) {
    if (!owners) {
      throw new TypeError();
    }
    this.annotations = new ProjectTreeAnnotations();
    for (let ownerRule of owners) {
      const { path, owner } = ownerRule;
      this.annotations.add(path, { owner });
    }
  }

  apply(analyzer: IAnalyzer) {
    analyzer.hooks.moduleRawSource.tap('OwnershipPlugin', this.moduleRawSource.bind(this));
  }

  moduleRawSource(module: Module, source: string) {
    const match = this.annotations.match(module.getName());
    if (match) {
      module.set('owner', match.owner);
    } else {
      module.set('owner', null);
    }
  }
}
