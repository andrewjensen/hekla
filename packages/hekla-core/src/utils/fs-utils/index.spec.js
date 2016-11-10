'use strict';

const path = require('path');
const fsUtils = require('./index');

describe('fsUtils', () => {

  describe('getSmartModuleName', () => {

    it('should handle a normal module name', () => {
      const filePath = '/path/to/normalModule.js';
      expect(fsUtils.getSmartModuleName(filePath)).to.equal('normalModule');
    });

    it('should handle a module name with extra file extensions', () => {
      const filePath = '/path/to/normalModule.thing.js';
      expect(fsUtils.getSmartModuleName(filePath)).to.equal('normalModule');
    });

    it('should handle a module name with hyphens', () => {
      const filePath = '/path/to/normal-module.js';
      expect(fsUtils.getSmartModuleName(filePath)).to.equal('normalModule');
    });

    it('should handle a module named index.js', () => {
      const filePath = '/path/to/normalModule/index.js';
      expect(fsUtils.getSmartModuleName(filePath)).to.equal('normalModule');
    });

  });

});
