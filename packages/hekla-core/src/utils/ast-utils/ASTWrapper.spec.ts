import ASTWrapper, { ASTNode } from './ASTWrapper';
import { parseAST } from './index';

describe('ASTWrapper', () => {

  describe('unwrap', () => {

    it('should return the AST it wraps', async () => {
      const js = `console.log('hello world')`;
      const ast = await parseAST(js);
      const wrapper = new ASTWrapper(ast);
      expect(wrapper.unwrap()).toEqual(ast);
    });

  });

  describe('visit', () => {

    it('should call the visitor when it finds a matching node', async () => {
      const js = `console.log('hello world')`;
      const ast = await parseAST(js);
      const wrapper = new ASTWrapper(ast);
      const identifiers: string[] = [];
      wrapper.visit({
        Identifier(node) {
          identifiers.push(node.name);
        }
      });
      expect(identifiers).toEqual(['console', 'log'])
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
      expect(functionNode).not.toBeUndefined()
      expect((functionNode as ASTNode).id.type).toEqual('Identifier');
      expect((functionNode as ASTNode).id.name).toEqual('add');
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
      const identifiers: string[] = [];
      wrapper.visit({
        FunctionDeclaration(node) {
          functions++;
        },
        Identifier(node) {
          identifiers.push(node.name);
        }
      });
      expect(functions).toEqual(2);
      expect(identifiers).toEqual([
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
