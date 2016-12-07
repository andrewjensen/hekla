const DependencyGraph = require('./index');

describe('DependencyGraph', () => {

  function makeSimpleGraph() {
    const graph = new DependencyGraph();
    graph.addNode(1, { name: 'One' });
    graph.addNode(2, { name: 'Two' });
    graph.addNode(3, { name: 'Three' });
    graph.addLink(1, 2);
    graph.addLink(1, 3);
    graph.addLink(2, 3);
    return graph;
  }

  // NODES ---------------------------------------------------------------------

  describe('addNode', () => {

    it('should store nodes', () => {
      const graph = makeSimpleGraph();

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

  // LINKS ---------------------------------------------------------------------

  describe('addLink', () => {
    it('should store links', () => {
      const graph = makeSimpleGraph();
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
    it('should not allow adding the same link twice', () => {
      const graph = new DependencyGraph();
      graph.addNode(1, { name: 'One' });
      graph.addNode(2, { name: 'Two' });
      graph.addLink(1, 2);
      expect(graph.countLinks()).to.equal(1);
      expect(() => graph.addLink(1, 2)).to.throw();
    });
  });

  describe('getLink', () => {
    it('should return a link that was added', () => {
      const graph = new DependencyGraph();
      graph.addNode(1, { name: 'One' });
      graph.addNode(2, { name: 'Two' });
      graph.addLink(1, 2);
      expect(graph.getLink(1, 2)).to.deep.equal({
        source: 1,
        target: 2
      });
      expect(graph.getLink(1, 3)).to.be.null;
      expect(graph.getLink(3, 2)).to.be.null;
      expect(graph.getLink(4, 5)).to.be.null;
    });
  });

  describe('getLinksFrom', () => {
    it('should get the correct links from a node', () => {
      const graph = makeSimpleGraph();
      expect(graph.getLinksFrom(1)).to.deep.equal([
        { source: 1, target: 2 },
        { source: 1, target: 3 }
      ]);
    });
    it('should order by targetId ascending', () => {
      const graph = new DependencyGraph();
      graph.addNode(1, { name: 'One' });
      graph.addNode(2, { name: 'Two' });
      graph.addNode(3, { name: 'Three' });
      graph.addLink(1, 3); // adding out of order
      graph.addLink(1, 2);
      graph.addLink(2, 3);
      expect(graph.getLinksFrom(1)).to.deep.equal([
        { source: 1, target: 2 },
        { source: 1, target: 3 }
      ]);
    });
  });

  describe('getLinksTo', () => {
    it('should get the correct links to a node', () => {
      const graph = makeSimpleGraph();
      expect(graph.getLinksTo(3)).to.deep.equal([
        { source: 1, target: 3 },
        { source: 2, target: 3 }
      ]);
    });
    it('should order by sourceId ascending', () => {
      const graph = new DependencyGraph();
      graph.addNode(1, { name: 'One' });
      graph.addNode(2, { name: 'Two' });
      graph.addNode(3, { name: 'Three' });
      graph.addLink(1, 2);
      graph.addLink(2, 3); // adding out of order
      graph.addLink(1, 3);
      expect(graph.getLinksFrom(1)).to.deep.equal([
        { source: 1, target: 2 },
        { source: 1, target: 3 }
      ]);
    });
  });

  // OUTPUTS -------------------------------------------------------------------

  describe('createSubgraph', () => {

  });

  describe('calculateLevels', () => {

  });

});
