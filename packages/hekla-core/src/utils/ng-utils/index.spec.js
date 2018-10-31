const path = require('path');

const { parseAST, ASTWrapper, looksLike } = require('../ast-utils');
const ngUtils = require('./index');
const { AngularComponentWrapper } = require('./index');

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
      componentController: makeModule('component-controller.js')
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
      expect(componentDef.controllerNode).to.not.be.undefined;
      expect(componentDef.controllerNode).to.not.equal('PROPERTY_UNKNOWN');
      expect(looksLike(componentDef.controllerNode, {
        type: 'FunctionExpression',
        id: {
          type: 'Identifier',
          name: 'petShopController'
        }
      })).to.be.true;
    });
  });

});
