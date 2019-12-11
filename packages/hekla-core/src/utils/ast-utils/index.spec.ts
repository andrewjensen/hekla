import fs from 'fs';
import path from 'path';
import {
  getImportInfo,
  looksLike,
  parseAST,
  parseHTML
} from './index';

function loadContents(filename: string): string {
  return fs.readFileSync(filename, 'utf-8');
}

function parse(filename: string): Promise<any> {
  const filePath = path.resolve(__dirname, './test-examples/', filename);
  const contents = loadContents(filePath);
  return parseAST(contents, filePath);
}

// const x = 5;
const AST_VARIABLE_ASSIGNMENT = {
  type: 'VariableDeclaration',
  declarations: [
    {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: 'x'
      },
      init: {
        type: 'NumericLiteral',
        value: 5
      }
    }
  ],
  kind: 'const'
};

// function add(x, y) {
//   return x + y;
// }
const AST_FUNCTION_DECLARATION = {
  type: 'FunctionDeclaration',
  id: {
    type: 'Identifier',
    name: 'add'
  },
  generator: false,
  expression: false,
  async: false,
  params: [
    {
      type: 'Identifier',
      name: 'x'
    },
    {
      type: 'Identifier',
      name: 'y'
    }
  ],
  body: {
    type: 'BlockStatement',
    body: [
      {
        type: 'ReturnStatement',
        argument: {
          type: 'BinaryExpression',
          left: {
            type: 'Identifier',
            name: 'x'
          },
          operator: '+',
          right: {
            type: 'Identifier',
            name: 'y'
          }
        }
      }
    ],
    directives: []
  }
};

describe('astUtils', () => {

  describe('parseHTML', () => {

    it('should parse a simple HTML string', async () => {
      const html = `<div>Hello <b>world</b></div>`;
      const dom = await parseHTML(html);

      expect(dom).toHaveLength(1);

      const div = dom[0];
      expect(div.type).toEqual('tag');
      expect(div.name).toEqual('div');
      expect(div.children).toHaveLength(2);

      const [text, bold] = div.children;

      expect(text.type).toEqual('text');
      expect(text.data).toEqual('Hello ');

      expect(bold.type).toEqual('tag');
      expect(bold.name).toEqual('b');
      expect(bold.children).toHaveLength(1);

      const world = bold.children[0];
      expect(world.type).toEqual('text');
      expect(world.data).toEqual('world');
    });

    it('should parse HTML with attributes', async () => {
      const html = `<div class="special" data-special>Special</div>`;
      const dom = await parseHTML(html);

      expect(dom).toHaveLength(1);

      const div = dom[0];
      expect(div.type).toEqual('tag');
      expect(div.name).toEqual('div');
      expect(div.children).toHaveLength(1);

      const { attribs } = div;
      expect(attribs['class']).toEqual('special');
      expect(attribs['data-special']).toEqual('');

      const text = div.children[0];
      expect(text.type).toEqual('text');
      expect(text.data).toEqual('Special');
    });

  });

  describe('looksLike', () => {
    it('should work on partial AST node definitions', () => {
      expect(looksLike(AST_VARIABLE_ASSIGNMENT, {
        type: 'VariableDeclaration',
        kind: 'const'
      })).toBe(true);
      expect(looksLike(AST_VARIABLE_ASSIGNMENT.declarations[0], {
        type: 'VariableDeclarator',
        id: {},
        init: {}
      })).toBe(true);
      expect(looksLike(AST_VARIABLE_ASSIGNMENT.declarations[0].id, {
        type: 'Identifier',
        name: 'x'
      })).toBe(true);
      expect(looksLike(AST_VARIABLE_ASSIGNMENT.declarations[0].id, {
        name: 'truck'
      })).toBe(false);
    });
  });

  describe('getImportInfo', () => {

    it('should get CommonJS imports', (done) => {
      parse('imports.js')
        .then(ast => {
          expect(getImportInfo(ast)).toEqual([
            {
              type: 'ES6',
              value: 'somethingGreat'
            },
            {
              type: 'CommonJS',
              value: 'thingOne'
            },
            {
              type: 'CommonJS',
              value: 'thingTwo'
            }
          ]);
          done();
        })
        .catch(err => done(err));
    });

  });

});
