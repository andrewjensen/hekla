'use strict';

const path = require('path');
const AngularDirectiveParser = require('./index');

function makeModule(path) {
  return {
    path: path,
    contents: loadContents(path)
  };
}

describe('AngularDirectiveParser', () => {
  const basicPath = path.resolve(__dirname, './test-examples/basic.js');
  const inlinePath = path.resolve(__dirname, './test-examples/inline.js');

  let basicModule;
  let inlineTemplateModule;

  before(() => {
    basicModule = makeModule(basicPath);
    inlineTemplateModule = makeModule(inlinePath);
  });

  describe('extractComponents', () => {

    it('should extract a basic directive', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(basicModule)
        .then(results => {
          expect(results.components.length).to.equal(1);
          expect(results.errors.length).to.equal(0);
          return results.components[0];
        })
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
        .then(results => {
          expect(results.components.length).to.equal(1);
          expect(results.errors.length).to.equal(0);
          return results.components[0];
        })
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
      parser.extractComponents(inlineTemplateModule)
        .then(results => {
          expect(results.components.length).to.equal(1);
          expect(results.errors.length).to.equal(0);
          return results.components[0];
        })
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

    it('should extract a directive with a complex inline template');

    it('should extract a directive with a templateUrl');

  });

});
