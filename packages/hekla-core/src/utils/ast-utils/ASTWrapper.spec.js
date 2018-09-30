const ASTWrapper = require('./ASTWrapper');
const { parseAST } = require('./index');

describe('ASTWrapper', () => {

  describe('unwrap', () => {

    it('should return the AST it wraps', async () => {
      const js = `console.log('hello world')`;
      const ast = await parseAST(js);
      const wrapper = new ASTWrapper(ast);
      expect(wrapper.unwrap()).to.equal(ast);
    });

  });

});
