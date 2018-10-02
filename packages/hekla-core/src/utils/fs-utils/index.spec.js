'use strict';

const path = require('path');
const fsUtils = require('./index');

describe('fsUtils', () => {

  describe('getModuleName', () => {

    it('should remove the rootPath', () => {
      const filePath = '/path/to/project/src/main.js';
      const rootPath = '/path/to/project';
      expect(fsUtils.getModuleName(filePath, rootPath)).to.equal('./src/main.js');
    });

    it('should remove webpack loaders from the front', () => {
      const resourceRequest = 'module!/path/to/project/src/styles.css';
      const rootPath = '/path/to/project';
      expect(fsUtils.getModuleName(resourceRequest, rootPath)).to.equal('./src/styles.css');
    });

    it('should throw if rootPath is not specified', () => {
      const filePath = '/path/to/project/src/main.js';
      expect(() => fsUtils.getModuleName(filePath)).to.throw('rootPath not specified');
    });

  });

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

    it('should handle a module named app.js', () => {
      const filePath = '/path/to/normalModule/app.js';
      expect(fsUtils.getSmartModuleName(filePath)).to.equal('normalModuleApp');
    });

  });

});
