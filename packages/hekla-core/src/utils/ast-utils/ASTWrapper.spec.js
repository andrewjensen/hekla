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

  describe('visit', () => {

    it('should call the visitor when it finds a matching node', async () => {
      const js = `console.log('hello world')`;
      const ast = await parseAST(js);
      const wrapper = new ASTWrapper(ast);
      const identifiers = [];
      wrapper.visit({
        Identifier(node) {
          identifiers.push(node.name);
        }
      });
      expect(identifiers).to.deep.equal(['console', 'log'])
    });

    it('should work for FunctionDeclaration nodes', async () => {
      const js = `
        function add(x, y) {
          return x + y;
        }
      `;
      const ast = await parseAST(js);
      const wrapper = new ASTWrapper(ast);
      let functionNode = null;
      wrapper.visit({
        FunctionDeclaration(node) {
          functionNode = node;
        }
      });
      expect(functionNode).to.not.be.undefined;
      expect(functionNode.id.type).to.equal('Identifier');
      expect(functionNode.id.name).to.equal('add');
    });

    it('should work for multiple visitors at the same time', async () => {
      const js = `
        function add(x, y) {
          return x + y;
        }

        function sub(x, y) {
          return x - y;
        }
      `;
      const ast = await parseAST(js);
      const wrapper = new ASTWrapper(ast);
      let functions = 0;
      const identifiers = [];
      wrapper.visit({
        FunctionDeclaration(node) {
          functions++;
        },
        Identifier(node) {
          identifiers.push(node.name);
        }
      });
      expect(functions).to.equal(2);
      expect(identifiers).to.deep.equal([
        'add',
        'x',
        'y',
        'x',
        'y',
        'sub',
        'x',
        'y',
        'x',
        'y',
      ]);
    });

  });

});
