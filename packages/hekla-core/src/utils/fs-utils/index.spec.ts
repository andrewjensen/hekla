import * as fsUtils from './index';

describe('fsUtils', () => {

  describe('getModuleName', () => {

    it('should remove the rootPath', () => {
      const filePath = '/path/to/project/src/main.js';
      const rootPath = '/path/to/project';
      expect(fsUtils.getModuleName(filePath, rootPath)).toEqual('./src/main.js');
    });

    it('should remove webpack loaders from the front', () => {
      const resourceRequest = 'module!/path/to/project/src/styles.css';
      const rootPath = '/path/to/project';
      expect(fsUtils.getModuleName(resourceRequest, rootPath)).toEqual('./src/styles.css');
    });
  });

  describe('getModuleShortName', () => {

    it('should shorten a normal module name', () => {
      const moduleName = './src/main.js';
      expect(fsUtils.getModuleShortName(moduleName)).toEqual('main.js');
    });

    it('should shorten a module name with extra file extensions', () => {
      const moduleName = './src/special.thing.js';
      expect(fsUtils.getModuleShortName(moduleName)).toEqual('special.thing.js');
    });

    it('should shorten a module named index.js', () => {
      const moduleName = './src/my-feature/index.js';
      expect(fsUtils.getModuleShortName(moduleName)).toEqual('my-feature/index.js');
    });

    it('should shorten a module named app.js', () => {
      const moduleName = './src/my-feature/app.js';
      expect(fsUtils.getModuleShortName(moduleName)).toEqual('my-feature/app.js');
    });

  });

});
