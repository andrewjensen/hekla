'use strict';

const path = require('path');
const AngularFactoryParser = require('./index');

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

describe('AngularFactoryParser', () => {
  let examples = {};

  before(() => {
    examples = {
      basic: makeModule('basic.js')
    };
  });

  describe('extractComponents', () => {

    it('should extract a basic factory', (done) => {
      const parser = new AngularFactoryParser();
      parser.extractComponents(examples.basic)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('animalService');
          expect(component.type).to.equal('angular-factory');
          expect(component.properties).to.deep.equal({
            angularModule: 'app'
          });
          expect(component.dependencies).to.deep.equal([
            '$http',
            'anotherService'
          ]);
          done();
        })
        .catch(err => done(err));
    });

  });

});
