const walk = require('tree-walk');

module.exports = class ASTWrapper {
  constructor(ast) {
    this.ast = ast;
  }

  unwrap() {
    return this.ast;
  }
}
