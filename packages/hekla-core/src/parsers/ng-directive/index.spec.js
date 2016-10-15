'use strict';

const path = require('path');
const AngularDirectiveParser = require('./index');

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

describe('AngularDirectiveParser', () => {
  let examples = {};

  before(() => {
    examples = {
      basic: makeModule('basic.js'),
      injected: makeModule('injected.js'),
      noScope: makeModule('no-scope.js'),
      minimal: makeModule('minimal.js'),
      twoDirectives: makeModule('two-directives.js'),
      splitDefinitionInjected: makeModule('split-definition-injected.js'),
      inline: makeModule('inline.js'),
      inlineConcat: makeModule('inline-concat.js'),
      inlineArrayJoin: makeModule('inline-array-join.js'),
      inlineVariable: makeModule('inline-variable.js'),
      templateUrl: makeModule('template-url.js'),
      templateUrlFn: makeModule('template-url-function.js'),
      webpackLoaderTemplate: makeModule('webpack-loader-template.js')
    };
  });

  describe('extractComponents', () => {

    it('should extract a basic directive', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.basic)
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

    it('should extract a directive with Angular DI syntax', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.injected)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('myPetShop');
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with no scope set', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.noScope)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.properties).to.deep.equal({
            angularModule: 'app',
            scope: null
          });
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with only a link function', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.minimal)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('myMouseHover');
          expect(component.properties).to.deep.equal({
            angularModule: 'app',
            scope: null
          });
          done();
        })
        .catch(err => done(err));
    });

    it('should extract two directives from a single file', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.twoDirectives)
        .then(results => {
          if (results.errors.length > 0) {
            console.error('Error while extracting components:');
            console.error(results.errors[0].stack);
          }
          expect(results.components).have.length(2);
          expect(results.errors).to.have.length(0);
          return results.components;
        })
        .then(components => {
          const firstComponent = components[0];
          expect(firstComponent.name).to.equal('myPetMenu');
          expect(firstComponent.properties).to.deep.equal({
            angularModule: 'app',
            scope: [
              'pets'
            ]
          });
          expect(firstComponent.dependencies).to.deep.equal([
            'my-pet-menu-item'
          ]);
          const secondComponent = components[1];
          expect(secondComponent.name).to.equal('myPetMenuItem');
          expect(secondComponent.properties).to.deep.equal({
            angularModule: 'app',
            scope: [
              'name'
            ]
          });
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with required template file', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.basic)
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
      parser.extractComponents(examples.inline)
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
      parser.extractComponents(examples.inlineConcat)
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
      parser.extractComponents(examples.inlineArrayJoin)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.dependencies).to.deep.equal([
            'my-pet-title'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with an inline template from a variable', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.inlineVariable)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.dependencies).to.deep.equal([
            'my-pet-title'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with a templateUrl', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.templateUrl)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.dependencies).to.deep.equal([
            'my-pet-title'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with a required template including a webpack loader prefix', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.webpackLoaderTemplate)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('myPetShop');
          expect(component.dependencies).to.deep.equal([
            'my-pet-title'
          ]);
          done();
        })
        .catch(err => done(err));
    });

    it('should extract a directive with a definition function saved in a variable', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.splitDefinitionInjected)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.name).to.equal('myPetShop');
          done();
        })
        .catch(err => done(err));
    });

    it('should gracefully fail with an evaluated templateUrl', (done) => {
      const parser = new AngularDirectiveParser();
      parser.extractComponents(examples.templateUrlFn)
        .then(getComponentFromResults)
        .then(component => {
          expect(component.dependencies).to.deep.equal([]);
          done();
        })
        .catch(err => done(err));
    });

  });

});
