import { Parser } from 'node-expat';
import ParserNode from './ParserNode';

export default class XmlStream extends Parser {
  path = '';

  constructor(opts) {
    super(opts);
    this._initevents();
  }

  _initevents() {
    const stack = [''];
    let current = null;

    this.on('startElement', (name, attrs) => {
      stack.push(name);
      const context = stack.join('/');

      if (current) {
        const node = new ParserNode(name, attrs, current);
        current.addChild(node);
        current = node;
      } else {
        if (context == this.path) {
          current = new ParserNode(name, attrs, current);
        }
      }
    });

    this.on('endElement', (name) => {
      const context = stack.join('/');
      stack.pop();

      if (current) {
        if (context == this.path) {
          this.emit(name, current);
        }

        current = current.parent;
      }
    });

    this.on('text', (text) => {
      if (current) {
        current.addText(text);
      }
    });
  }
}
