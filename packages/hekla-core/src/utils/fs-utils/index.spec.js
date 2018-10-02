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

  describe('getModuleShortName', () => {

    it('should shorten a normal module name', () => {
      const moduleName = './src/main.js';
      expect(fsUtils.getModuleShortName(moduleName)).to.equal('main.js');
    });

    it('should shorten a module name with extra file extensions', () => {
      const moduleName = './src/special.thing.js';
      expect(fsUtils.getModuleShortName(moduleName)).to.equal('special.thing.js');
    });

    it('should shorten a module named index.js', () => {
      const moduleName = './src/my-feature/index.js';
      expect(fsUtils.getModuleShortName(moduleName)).to.equal('my-feature/index.js');
    });

    it('should shorten a module named app.js', () => {
      const moduleName = './src/my-feature/app.js';
      expect(fsUtils.getModuleShortName(moduleName)).to.equal('my-feature/app.js');
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
