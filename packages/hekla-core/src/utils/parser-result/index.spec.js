'use strict';

const ParserResult = require('./index');
const ParserError = ParserResult._ParserError;

describe('ParserResult', () => {

  let parsedComponentsA;
  let parsedComponentsB;
  let parserError;
  let parserErrorList;
  let moduleA;
  let moduleB;

  beforeEach(() => {
    parsedComponentsA = [
      { name: 'One' },
      { name: 'Two' },
      { name: 'Three' }
    ];
    parsedComponentsB = [
      { name: 'Four' },
      { name: 'Five' },
    ];
    parserError = new Error('Something bad happened');
    parserErrorList = [
      new Error('Something bad happened for sure'),
      new Error('Another bad thing happened')
    ];
    moduleA = {
      id: 1,
      path: '/path/to/module-a/index.js'
    };
    moduleB = {
      id: 2,
      path: '/path/to/module-b/index.js'
    };
  });

  describe('create', () => {

    it('should accept an array of components', () => {
      const result = ParserResult.create(parsedComponentsA);
      expect(result.components).to.have.length(3);
      expect(result.errors).to.have.length(0);
    });

    it('should accept an error and a module', () => {
      const result = ParserResult.create([], parserError, moduleA);
      expect(result.components).to.have.length(0);
      expect(result.errors).to.have.length(1);

      const wrappedError = result.errors[0];
      expect(wrappedError).to.be.instanceof(ParserError);
      expect(wrappedError.reason).to.equal(parserError);
      expect(wrappedError.message).to.equal(parserError.message);
      expect(wrappedError.stack).to.equal(parserError.stack);
      expect(wrappedError.modulePath).to.equal(moduleA.path);
    });

    it('should accept a list of errors and a module', () => {
      const result = ParserResult.create([], parserErrorList, moduleB);
      expect(result.components).to.have.length(0);
      expect(result.errors).to.have.length(2);

      const firstError = result.errors[0];
      expect(firstError).to.be.instanceof(ParserError);
      expect(firstError.reason).to.equal(parserErrorList[0]);
      expect(firstError.message).to.equal(parserErrorList[0].message);
      expect(firstError.stack).to.equal(parserErrorList[0].stack);
      expect(firstError.modulePath).to.equal(moduleB.path);

      const secondError = result.errors[1];
      expect(secondError).to.be.instanceof(ParserError);
      expect(secondError.reason).to.equal(parserErrorList[1]);
      expect(secondError.message).to.equal(parserErrorList[1].message);
      expect(secondError.stack).to.equal(parserErrorList[1].stack);
      expect(secondError.modulePath).to.equal(moduleB.path);
    });

    it('should throw an error if there are errors but no module', () => {
      expect(() => ParserResult.create([], parserErrorList)).to.throw(/Invalid arguments for ParserError constructor/);
    });

  });

  describe('mergeAll', () => {

    it('should combine two ParserResult objects into one', () => {
      const firstResult = ParserResult.create(parsedComponentsA);
      const secondResult = ParserResult.create([], parserErrorList, moduleA);
      const combinedResult = ParserResult.mergeAll([
        firstResult,
        secondResult
      ]);
      expect(combinedResult.components).to.have.length(3);
      expect(combinedResult.components).to.deep.equal([
        { name: 'One' },
        { name: 'Two' },
        { name: 'Three' }
      ]);
      expect(combinedResult.errors).to.have.length(2);
      expect(combinedResult.errors[0]).to.be.instanceof(ParserError);
      expect(combinedResult.errors[1]).to.be.instanceof(ParserError);
    });

  });

});
