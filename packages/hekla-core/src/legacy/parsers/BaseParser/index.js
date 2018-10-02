'use strict';

module.exports = class BaseParser {
  constructor() {

  }

  extractComponents(module) {
    return Promise.reject(new Error('Abstract method extractComponents not implemented'));
  }
};
