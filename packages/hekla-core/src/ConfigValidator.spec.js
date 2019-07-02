const ConfigValidator = require('./ConfigValidator');

class ValidPlugin {
  apply(analyzer) {}
}

class PluginWithoutApplyMethod {
  otherMethod() {}
}

describe('ConfigValidator', () => {

  describe('validate', () => {

    describe('rootPath', () => {

      it('should be required', () => {
        const validator = new ConfigValidator();
        validator.validate({});
        expect(validator.getErrors()).to.deep.equal(['rootPath is not configured']);
      });

    });

    describe('outputPath', () => {

      it('should allow strings', () => {
        const validator = new ConfigValidator();
        validator.validate({
          rootPath: '/path/to/project',
          outputPath: '/path/to/project/build',
        });
        expect(validator.isValid()).to.be.true;
      });

      it('should fail on invalid input', () => {
        const validator = new ConfigValidator();
        validator.validate({
          rootPath: '/path/to/project',
          outputPath: 123,
        });
        expect(validator.getErrors()).to.deep.equal(['Output path is not a string']);
      });

      it('should fail if the path includes a file name', () => {
        const validator = new ConfigValidator();
        validator.validate({
          rootPath: '/path/to/project',
          outputPath: '/path/to/project/build/analysis.json',
        });
        expect(validator.getErrors()).to.deep.equal(['Output path must be a directory']);
      });

    });

    describe('exclude', () => {

      it('should allow strings', () => {
        const validator = new ConfigValidator();
        validator.validate({
          rootPath: '/path/to/project',
          exclude: [
            'src/old/**',
            'src/ignore/**',
            'src/deprecated/**',
            'vendor/**',
            '**/*.png'
          ]
        });
        expect(validator.isValid()).to.be.true;
      });

      it('should fail on invalid input', () => {
        const validator = new ConfigValidator();
        validator.validate({
          rootPath: '/path/to/project',
          exclude: [
            'src/old/**',
            1234
          ]
        });
        expect(validator.getErrors()).to.deep.equal(['Exclude pattern is not a string']);
      });

      it('should fail on regular expressions', () => {
        const validator = new ConfigValidator();
        validator.validate({
          rootPath: '/path/to/project',
          exclude: [
            'src/old/**',
            /vendor/
          ]
        });
        expect(validator.getErrors()).to.deep.equal(['Exclude pattern is not a string']);
      });

    });

    describe('plugins', () => {

      it('should accept plugins', () => {
        const validator = new ConfigValidator();
        validator.validate({
          rootPath: '/path/to/project',
          plugins: [
            new ValidPlugin()
          ]
        });
        expect(validator.isValid()).to.be.true;
      });

      it('should reject plugins without an apply method', () => {
        const validator = new ConfigValidator();
        validator.validate({
          rootPath: '/path/to/project',
          plugins: [
            new PluginWithoutApplyMethod()
          ]
        });
        expect(validator.getErrors()).to.deep.equal(['Plugin does not have an `apply` method']);
      });

    });

  });
});
