const Analyzer = require('./Analyzer');
const ASTWrapper = require('./utils/ast-utils/ASTWrapper');

class MockFS {
  /**
   * Example:
   *
   * ```
      const mockFS = new MockFS({
        '/path/to/project/hello.js': `console.log('hello world');`,
        '/path/to/project/fun.js': `console.log('this is fun');`
      });
   * ```
   *
   * @param {object} files
   */
  constructor(files) {
    this.files = files;
  }

  readFile(filename, callback) {
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
      expect(analyzer.hooks).to.have.property('moduleRawSource');
      expect(analyzer.hooks).to.have.property('moduleSyntaxTreeJS');
      expect(analyzer.hooks).to.have.property('moduleSyntaxTreeHTML');
      expect(analyzer.hooks).to.have.property('reporter');
    });

  });

  describe('applyConfig', () => {

    it('should set the rootPath', () => {
      const analyzer = new Analyzer();
      analyzer.applyConfig({
        rootPath: '/path/to/project'
      });
      expect(analyzer.rootPath).to.equal('/path/to/project');
    });

    it('should apply plugins', () => {
      let applied = false;
      let analyzerReference = null;
      const spyPlugin = {
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
      expect(applied).to.be.true;
      expect(analyzerReference).to.equal(analyzer);
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
      const spyPlugin = {
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
      expect(receivedModule).to.equal(module);
      expect(receivedSource).to.equal(source);
      expect(receivedAST).to.be.an.instanceof(ASTWrapper);
    });

  });

  describe('processReporters', () => {

    it('should call hooks for reporters', async () => {
      const fs = new MockFS({});

      let receivedAnalyzer = null;
      let receivedAnalysis = null;
      const spyPlugin = {
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

      expect(receivedAnalyzer).to.equal(analyzer);
      expect(receivedAnalysis).to.equal(analysis);
    });

  });

});
