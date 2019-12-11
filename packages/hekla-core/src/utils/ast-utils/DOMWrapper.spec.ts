import { DOMNode } from "./DOMWrapper";

import DOMWrapper from './DOMWrapper';
import { parseHTML } from './index';

describe('DOMWrapper', () => {

  describe('unwrap', () => {

    it('should return the DOM it wraps', async () => {
      const html = '<div>Hello <b>world</b></div>';
      const dom = await parseHTML(html);
      const wrapper = new DOMWrapper(dom);
      expect(wrapper.unwrap()).toEqual(dom);
    });

  });

  describe('visit', () => {

    it('should call the visitor on each tag', async () => {
      const html = '<div>Hello <b>world</b></div>';
      const dom = await parseHTML(html);
      const wrapper = new DOMWrapper(dom);
      const foundTags: string[] = [];
      wrapper.visit({
        tag: (node) => {
          foundTags.push(node.name);
        }
      });
      expect(foundTags).toEqual(['div', 'b']);
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
      expect(fullText).toEqual('Hello world');
    });

    it('should handle multiple visitors', async () => {
      const html = '<div>Hello <b>world</b></div>';
      const dom = await parseHTML(html);
      const wrapper = new DOMWrapper(dom);

      // Learn lots of things about the tree in a single pass
      let foundTags: string[] = [];
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
      expect(foundTags).toEqual(['div', 'b']);
      expect(tagCount).toEqual(2);
      expect(fullText).toEqual('Hello world');
    });

    it('should reject visitors for node types that do not exist', async () => {
      const html = '<div>Hello <b>world</b></div>';
      const dom = await parseHTML(html);
      const wrapper = new DOMWrapper(dom);
      expect(() => {
        wrapper.visit({
          truck: (node) => {}
        });
      }).toThrow('Invalid visitor type: truck');
    });

  });

});
