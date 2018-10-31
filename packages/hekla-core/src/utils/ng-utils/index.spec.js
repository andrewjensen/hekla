const path = require('path');

const {
  parseAST,
  ASTWrapper,
  looksLike
} = require('../ast-utils');
const ngUtils = require('./index');
const {
  AngularComponentWrapper,
  AngularControllerWrapper
} = require('./index');

function makeModule(filename) {
  const modulePath = path.resolve(__dirname, './test-examples/', filename);
  return {
    path: modulePath,
    contents: loadContents(modulePath)
  };
}

describe('ngUtils', () => {

  let EXAMPLES = {};

  before(() => {
    EXAMPLES = {
      componentController: makeModule('component-controller.js'),
      reference: makeModule('component-controller-reference.js')
    };
  });

  describe('getKebabCaseName', () => {
    it('should convert camel case to dashes', () => {
      expect(ngUtils.getKebabCaseName('myPetShop')).to.equal('my-pet-shop');
    });
  });

  describe('getComponents', () => {
    it('should find a component', async () => {
      const contents = EXAMPLES.componentController.contents;
      const ast = await parseAST(contents, '');
      const astWrapper = new ASTWrapper(ast);
      const componentDefs = ngUtils.getComponents(astWrapper);
      expect(componentDefs).to.have.lengthOf(1);

      const componentDef = componentDefs[0];
      expect(componentDef).to.be.instanceOf(AngularComponentWrapper);
      expect(componentDef.name).to.equal('myPetShop');
      expect(componentDef.bindings).to.deep.equal([
        { name: 'title', type: '<' },
        { name: 'dogs', type: '<' },
        { name: 'cats', type: '<' }
      ]);
    });

    it('should find the controller for a component', async () => {
      const contents = EXAMPLES.componentController.contents;
      const ast = await parseAST(contents, '');
      const astWrapper = new ASTWrapper(ast);
      const componentDefs = ngUtils.getComponents(astWrapper);
      expect(componentDefs).to.have.lengthOf(1);

      const componentDef = componentDefs[0];
      expect(componentDef.controller).to.not.be.undefined;
      expect(componentDef.controller).to.not.equal('PROPERTY_UNKNOWN');
      expect(componentDef.controller).to.be.instanceOf(AngularControllerWrapper);

      const controllerDef = componentDef.controller;
      expect(controllerDef.rootNode).to.not.be.undefined;
      expect(controllerDef.rootNode).to.not.equal('PROPERTY_UNKNOWN');
      expect(looksLike(controllerDef.rootNode, {
        type: 'FunctionExpression',
        id: {
          type: 'Identifier',
          name: 'petShopController'
        }
      })).to.be.true;
    });

    it('should find the controller based on an identifier', async () => {
      const contents = EXAMPLES.reference.contents;
      const ast = await parseAST(contents, '');
      const astWrapper = new ASTWrapper(ast);
      const componentDefs = ngUtils.getComponents(astWrapper);
      expect(componentDefs).to.have.lengthOf(1);

      const componentDef = componentDefs[0];
      const controllerDef = componentDef.controller;
      expect(controllerDef.rootNode).to.not.be.undefined;
      expect(controllerDef.rootNode).to.not.equal('PROPERTY_UNKNOWN');
      expect(looksLike(controllerDef.rootNode, {
        type: 'FunctionDeclaration',
        id: {
          type: 'Identifier',
          name: 'petShopController'
        }
      })).to.be.true;
    });
  });

});
