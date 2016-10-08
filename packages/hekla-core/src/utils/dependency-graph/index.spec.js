const DependencyGraph = require('./index');

describe('DependencyGraph', () => {

  describe('addNode', () => {

    it('should store nodes', () => {
      const graph = new DependencyGraph();
      graph.addNode(1, { name: 'One' });
      graph.addNode(2, { name: 'Two' });
      graph.addNode(3, { name: 'Three' });

      expect(graph.countNodes()).to.equal(3);
      expect(graph.hasNode(1)).to.be.true;
      expect(graph.hasNode(2)).to.be.true;
      expect(graph.hasNode(3)).to.be.true;

      expect(graph.getNode(1)).to.deep.equal({ name: 'One' });
      expect(graph.getNode(2)).to.deep.equal({ name: 'Two' });
      expect(graph.getNode(3)).to.deep.equal({ name: 'Three' });

      expect(graph.hasNode(4)).to.be.false;
      expect(graph.getNode(4)).to.be.undefined;
    });

    it('should not allow adding the same node twice');

  });

  describe('addLink', () => {

    it('should store links', () => {
      const graph = new DependencyGraph();
      graph.addNode(1, { name: 'One' });
      graph.addNode(2, { name: 'Two' });
      graph.addNode(3, { name: 'Three' });
      graph.addLink(1, 2);
      graph.addLink(1, 3);
      graph.addLink(2, 3);
      const serialized = graph.serialize();

      expect(graph.countNodes()).to.equal(3);
      expect(graph.countLinks()).to.equal(3);
      expect(serialized.links).to.have.length(3);
      expect(serialized.links).to.deep.include.members([
        { source: 1, target: 2 },
        { source: 1, target: 3 },
        { source: 2, target: 3 }
      ]);
    });

    it('should not allow adding the same link twice');

  });

  describe('createSubgraph', () => {

  });

  describe('calculateLevels', () => {

  });

});
