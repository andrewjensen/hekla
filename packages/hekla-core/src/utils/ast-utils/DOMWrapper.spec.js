const DOMWrapper = require('./DOMWrapper');
const { parseHTML } = require('./index');

describe('DOMWrapper', () => {

  describe('unwrap', () => {

    it('should return the DOM it wraps', async () => {
      const html = '<div>Hello <b>world</b></div>';
      const dom = await parseHTML(html);
      const wrapper = new DOMWrapper(dom);
      expect(wrapper.unwrap()).to.equal(dom);
    });

  });

  describe('visit', () => {

    it('should call the visitor on each tag', async () => {
      const html = '<div>Hello <b>world</b></div>';
      const dom = await parseHTML(html);
      const wrapper = new DOMWrapper(dom);
      const foundTags = [];
      wrapper.visit({
        tag: (node) => {
          foundTags.push(node.name);
        }
      });
      wrapper.walk();
      expect(foundTags).to.deep.equal(['div', 'b']);
    });

    it('should call the visitor on each text node', async () => {
      const html = '<div>Hello <b>world</b></div>';
      const dom = await parseHTML(html);
      const wrapper = new DOMWrapper(dom);
      let fullText = '';
      wrapper.visit({
        text: (node) => {
          fullText += node.data;
        }
      });
      wrapper.walk();
      expect(fullText).to.equal('Hello world');
    });

    it('should handle multiple visitors', async () => {
      const html = '<div>Hello <b>world</b></div>';
      const dom = await parseHTML(html);
      const wrapper = new DOMWrapper(dom);

      // Learn lots of things about the tree in a single pass
      let foundTags = [];
      let tagCount = 0;
      let fullText = '';
      wrapper.visit({
        tag: (node) => {
          foundTags.push(node.name);
        }
      });
      wrapper.visit({
        tag: (node) => {
          tagCount++;
        },
        text: (node) => {
          fullText += node.data;
        }
      });
      wrapper.walk();
      expect(foundTags).to.deep.equal(['div', 'b']);
      expect(tagCount).to.equal(2);
      expect(fullText).to.equal('Hello world');
    });

  });

});
