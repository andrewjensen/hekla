'use strict';

const path = require('path');
const DefaultParser = require('./index');

function makeModule(filename) {
  const modulePath = path.resolve(__dirname, './test-examples/', filename);
  return {
    path: modulePath,
    contents: loadContents(modulePath)
  };
}

function getComponentFromResults(results) {
  if (results.errors.length > 0) {
    console.error('Error while extracting components:');
    console.error(results.errors[0].stack);
  }
  expect(results.components).have.length(1);
  expect(results.errors).to.have.length(0);
  return results.components[0];
}

describe('DefaultParser', () => {
  let examples = {};

  before(() => {
    examples = {
      commonjs: makeModule('commonjs.js'),
      es6: makeModule('es6.js')
    };
  });

  describe('extractComponents', () => {

    it('should extract a component with CommonJS syntax', (done) => {
      const parser = new DefaultParser();
      parser.extractComponents(examples.commonjs)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('commonjs');
          expect(component.type).to.equal('default');
          expect(component.dependencies).to.deep.equal([
            'thingOne',
            'thingTwo'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a component with ES6 syntax', (done) => {
      const parser = new DefaultParser();
      parser.extractComponents(examples.es6)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('es6');
          expect(component.type).to.equal('default');
          expect(component.dependencies).to.deep.equal([
            'superCool',
            'superFun'
          ]);
          done();
        })
        .catch(err => done(err));
    });

  });

});
