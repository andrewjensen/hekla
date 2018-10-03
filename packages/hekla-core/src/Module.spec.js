const Module = require('./Module');

describe('Module', () => {

  describe('set', () => {

    it('should not allow `name` to be changed', () => {
      const module = new Module('/path/to/project/src/filename.js', '/path/to/project');
      expect(() => module.set('name', 'something new')).to.throw();
    });

    it('should not allow `shortName` to be changed', () => {
      const module = new Module('/path/to/project/src/filename.js', '/path/to/project');
      expect(() => module.set('shortName', 'something new')).to.throw();
    });

  });

  describe('serialize', () => {

    it('should include custom metadata', () => {
      const module = new Module('/path/to/project/src/filename.js', '/path/to/project');
      module.set('special', true);
      const serialized = module.serialize();
      expect(serialized.special).to.equal(true);
    });

    it('should put the name and shortName before everything else', () => {
      const module = new Module('/path/to/project/src/filename.js', '/path/to/project');
      module.set('special', true);
      const serialized = module.serialize();
      const json = JSON.stringify(serialized);
      expect(json).to.equal(`{"name":"./src/filename.js","shortName":"filename.js","special":true}`);
    });

  });

});
