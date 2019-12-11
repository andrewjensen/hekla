import Module from './Module';

describe('Module', () => {

  describe('set', () => {

    it('should not allow `name` to be changed', () => {
      const module = new Module('/path/to/project/src/filename.js', '/path/to/project');
      expect(() => module.set('name', 'something new')).toThrow();
    });

    it('should not allow `shortName` to be changed', () => {
      const module = new Module('/path/to/project/src/filename.js', '/path/to/project');
      expect(() => module.set('shortName', 'something new')).toThrow();
    });

  });

  describe('serialize', () => {

    it('should include custom metadata', () => {
      const module = new Module('/path/to/project/src/filename.js', '/path/to/project');
      module.set('special', true);
      const serialized = module.serialize();
      expect(serialized.special).toEqual(true);
    });

    it('should put the name and shortName before everything else', () => {
      const module = new Module('/path/to/project/src/filename.js', '/path/to/project');
      module.set('special', true);
      const serialized = module.serialize();
      const json = JSON.stringify(serialized);
      expect(json).toEqual(`{"name":"./src/filename.js","shortName":"filename.js","special":true}`);
    });

  });

});
