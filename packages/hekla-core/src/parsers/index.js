'use strict';

const BaseParser = require('./base-parser');

class AngularDirectiveParser extends BaseParser {
  constructor() {
    super();
    console.log('new AngularDirectiveParser');
  }
};

class BackboneViewParser extends BaseParser {
  constructor() {
    super();
    console.log('new BackboneViewParser');
  }
};

module.exports = {
  AngularDirectiveParser,
  BackboneViewParser
};
