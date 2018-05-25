'use strict';

const path = require('path');
const astUtils = require('./index');

function parse(filename) {
  const filePath = path.resolve(__dirname, './test-examples/', filename);
  const contents = loadContents(filePath);
  return astUtils.parseAST(contents, filePath);
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

  describe('looksLike', () => {
    const { looksLike } = astUtils;

    it('should work on partial AST node definitions', () => {
      expect(looksLike(AST_VARIABLE_ASSIGNMENT, {
        type: 'VariableDeclaration',
        kind: 'const'
      })).to.be.true;
      expect(looksLike(AST_VARIABLE_ASSIGNMENT.declarations[0], {
        type: 'VariableDeclarator',
        id: {},
        init: {}
      })).to.be.true;
      expect(looksLike(AST_VARIABLE_ASSIGNMENT.declarations[0].id, {
        type: 'Identifier',
        name: 'x'
      })).to.be.true;
      expect(looksLike(AST_VARIABLE_ASSIGNMENT.declarations[0].id, {
        name: 'truck'
      })).to.be.false;
    });
  });

  describe('getImportInfo', () => {

    it('should get CommonJS imports', (done) => {
      parse('imports.js')
        .then(ast => {
          expect(astUtils.getImportInfo(ast)).to.deep.equal([
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
