import { IHeklaPlugin, IAnalyzer } from '../interfaces';
import Module from '../Module';

export default class LinesOfCodePlugin implements IHeklaPlugin {
  apply(analyzer: IAnalyzer) {
    analyzer.hooks.moduleRawSource.tap('LinesOfCodePlugin', this.moduleRawSource.bind(this));
  }

  moduleRawSource(module: Module, source: string) {
    const lines = source.split('\n').length;
    module.set('lines', lines);
  }
}
