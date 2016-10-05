'use strict';

const fs = require('fs');

global.expect = require('chai').expect;

global.loadContents = function(filename) {
  return fs.readFileSync(filename, 'utf-8');
}
