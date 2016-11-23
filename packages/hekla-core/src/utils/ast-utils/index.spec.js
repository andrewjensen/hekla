'use strict';

const path = require('path');
const astUtils = require('./index');

function parse(filename) {
  const filePath = path.resolve(__dirname, './test-examples/', filename);
  const contents = loadContents(filePath);
  return astUtils.parseAST(contents, filePath);
}

describe('astUtils', () => {

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
