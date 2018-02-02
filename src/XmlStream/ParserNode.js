export default class XmlNode {
  children = [];
  text = null;

  constructor(name, attributes = {}, parent = null) {
    this.name = name;
    this._attributes = attributes;
    this.parent = parent;
  }

  get isRoot() {
    return this._root;
  }

  attribute(name) {
    return this._attributes;
  }

  addChild(node) {
    this.children.push(node);
  }

  addText(text) {
    if (this.text) {
      this.text += text;
    } else {
      this.text = text;
    }
  }

  // TODO: setup proxy for attribute/element access
  // this function also acts as an aggregate for elements with the same name
  // returning a single node or an array of nodes
  // fallback to a regular property get
  get(name) {
    if (name in this._attributes) {
      return this._attributes[name];
    } else {
      const elements = this.children.filter((child) => child.name == name);
      if (elements.length > 0) {
        return elements.length == 1 ? elements[0] : elements;
      }
    }

    return this[name];
  }
}
