const Module = require('./Module');

describe('Module', () => {

  describe('set', () => {

    it('should not allow `name` to be changed', () => {
      const module = new Module('./path/to/filename.js', '/absolute/path/to/filename.js');
      expect(() => module.set('name', 'something new')).to.throw();
    });

  });

  describe('serialize', () => {

    it('should include custom metadata', () => {
      const module = new Module('./path/to/filename.js', '/absolute/path/to/filename.js');
      module.set('special', true);
      const serialized = module.serialize();
      expect(serialized.special).to.equal(true);
    });

    it('should put the name before everything else', () => {
      const module = new Module('./path/to/filename.js', '/absolute/path/to/filename.js');
      module.set('special', true);
      const serialized = module.serialize();
      const json = JSON.stringify(serialized);
      expect(json).to.equal(`{"name":"./path/to/filename.js","special":true}`);
    });

  });

});
