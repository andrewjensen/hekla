'use strict';

const path = require('path');
const AngularDirectiveParser = require('./index');

function makeModule(path) {
  return {
    path: path,
    contents: loadContents(path)
  };
}

function getComponentFromResults(results) {
  expect(results.components.length).to.equal(1);
  expect(results.errors.length).to.equal(0);
  return results.components[0];
}

describe('AngularDirectiveParser', () => {
  let basicModule;
  let inlineModule;
  let inlineConcatModule;
  let inlineArrayJoinModule;

  before(() => {
    basicModule = makeModule(path.resolve(__dirname, './test-examples/basic.js'));
    inlineModule = makeModule(path.resolve(__dirname, './test-examples/inline.js'));
    inlineConcatModule = makeModule(path.resolve(__dirname, './test-examples/inline-concat.js'));
    inlineArrayJoinModule = makeModule(path.resolve(__dirname, './test-examples/inline-array-join.js'));
  });

  describe('extractComponents', () => {

    it('should extract a basic directive', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(basicModule)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('myPetShop');
          expect(component.altNames).to.deep.equal(['my-pet-shop']);
          expect(component.type).to.equal('angular-directive');
          expect(component.properties).to.deep.equal({
            angularModule: 'app',
            scope: [
              'title',
              'dogs',
              'cats',
              'quoted'
            ]
          });
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with required template file', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(basicModule)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.dependencies).to.deep.equal([
            'my-pet-title'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with a simple inline template', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(inlineModule)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('myPetShop');
          expect(component.type).to.equal('angular-directive');
          expect(component.dependencies).to.deep.equal([
            'my-pet-title'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with a contatenated inline template', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(inlineConcatModule)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.dependencies).to.deep.equal([
            'my-pet-title'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with an inline template as a joined array', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(inlineArrayJoinModule)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.dependencies).to.deep.equal([
            'my-pet-title'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with a templateUrl');

  });

});
