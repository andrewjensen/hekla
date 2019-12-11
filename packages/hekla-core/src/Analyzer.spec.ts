import Analyzer from './Analyzer';
import ASTWrapper from './utils/ast-utils/ASTWrapper';
import { IFilesystem, ReadFileCallback, IHeklaPlugin, IHeklaConfig } from './interfaces';

interface FilesystemMap {
  [filename: string]: string
}

class MockFS implements IFilesystem {
  files: FilesystemMap

  /**
   * Example:
   *
   * ```
      const mockFS = new MockFS({
        '/path/to/project/hello.js': `console.log('hello world');`,
        '/path/to/project/fun.js': `console.log('this is fun');`
      });
   * ```
   */
  constructor(files: FilesystemMap) {
    this.files = files;
  }

  readFile(filename: string, callback: ReadFileCallback) {
    if (this.files[filename]) {
      const buffer = Buffer.from(this.files[filename], 'utf8');
      callback(null, buffer);
    } else {
      callback(new Error('File does not exist'));
    }
  }
}

describe('Analyzer', () => {

  describe('hooks', () => {

    it('should be available', () => {
      const analyzer = new Analyzer();
      expect(analyzer.hooks).toHaveProperty('moduleRawSource');
      expect(analyzer.hooks).toHaveProperty('moduleSyntaxTreeJS');
      expect(analyzer.hooks).toHaveProperty('moduleSyntaxTreeHTML');
      expect(analyzer.hooks).toHaveProperty('reporter');
    });

  });

  describe('applyConfig', () => {

    it('should set the rootPath', () => {
      const analyzer = new Analyzer();
      analyzer.applyConfig({
        rootPath: '/path/to/project'
      });
      expect((analyzer.config as IHeklaConfig).rootPath).toEqual('/path/to/project');
    });

    it('should apply plugins', () => {
      let applied = false;
      let analyzerReference = null;
      const spyPlugin: IHeklaPlugin = {
        apply(analyzer) {
          analyzerReference = analyzer;
          applied = true;
        }
      };
      const analyzer = new Analyzer();
      analyzer.applyConfig({
        rootPath: '/path/to/project',
        plugins: [
          spyPlugin
        ]
      });
      expect(applied).toBe(true);
      expect(analyzerReference).toEqual(analyzer);
    });

  });

  describe('processModule', () => {

    it('should call hooks for a JS file', async () => {
      const source = `console.log('hello world');`;
      const fs = new MockFS({
        '/path/to/project/hello.js': source
      });

      let receivedModule = null;
      let receivedSource = '';
      let receivedAST = null;
      const spyPlugin: IHeklaPlugin = {
        apply(analyzer) {
          analyzer.hooks.moduleRawSource.tap('SpyPlugin', (module, source) => {
            receivedModule = module;
            receivedSource = source;
          });
          analyzer.hooks.moduleSyntaxTreeJS.tap('SpyPlugin', (module, ast) => {
            receivedAST = ast;
          });
        }
      };

      const analyzer = new Analyzer();
      analyzer.setInputFileSystem(fs);
      analyzer.applyConfig({
        rootPath: '/path/to/project',
        plugins: [
          spyPlugin
        ]
      });
      const module = analyzer.createModule('/path/to/project/hello.js');
      await analyzer.processModule(module);
      expect(receivedModule).toEqual(module);
      expect(receivedSource).toEqual(source);
      expect(receivedAST).toBeInstanceOf(ASTWrapper);
    });

  });

  describe('processReporters', () => {

    it('should call hooks for reporters', async () => {
      const fs = new MockFS({});

      let receivedAnalyzer = null;
      let receivedAnalysis = null;
      const spyPlugin: IHeklaPlugin = {
        apply(analyzer) {
          analyzer.hooks.reporter.tap('SpyPlugin', (analyzer, analysis) => {
            receivedAnalyzer = analyzer;
            receivedAnalysis = analysis;
          });
        }
      };

      const analyzer = new Analyzer();
      analyzer.setInputFileSystem(fs);
      analyzer.applyConfig({
        rootPath: '/path/to/project',
        plugins: [
          spyPlugin
        ]
      });

      const analysis = analyzer.getAnalysis();
      await analyzer.processReporters(analysis);

      expect(receivedAnalyzer).toEqual(analyzer);
      expect(receivedAnalysis).toEqual(analysis);
    });

  });

});
