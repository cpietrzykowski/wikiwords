export default class Revision {
  timestamp = '';
  languages = []; // array of objects: {language, classes}
  format = ''; // text format
  text = ''; // "text/x-wiki"

  constructor(timestamp, format, text) {
    this.timestamp = timestamp;
    this.format = format;
    this.text = text;
  }

  parse(classes = []) {
    if (this.format.match(/text\/x-wiki/) == null) return;

    const lines = this.text.split(/[\n\r]+/);
    let stack = [];
    let language = null;

    function addlangclass(c) {
      if (classes.includes(c)) {
        language && language.classes.add(c);
      }
    }

    for (let line of lines) {
      const languageHeader = /^==([^=]+)==$/;
      const headerMatches = line.match(languageHeader);
      if (headerMatches) {
        const name = headerMatches[1].toLowerCase().trim();
        language = this.languages.find((l) => l.name == name) || {
          'name': name,
          'classes': new Set(),
        };
        stack = [language.name];
        this.languages.push(language);
      } else {
        // test for secondary section
        const subheading = /^===([^=]+)===$/;
        const subheadingMatches = line.match(subheading);
        if (subheadingMatches) {
          while (stack.length > 2) {
            stack.pop();
          }

          const h2name = subheadingMatches[1].toLowerCase().trim();
          stack.push(h2name);
          addlangclass(h2name);
        } else {
          // test class in tertiary section
          const subheading = /^====([^=]+)====$/;
          const subheadingMatches = line.match(subheading);
          if (subheadingMatches) {
            while (stack.length > 3) {
              stack.pop();
            }

            const h3name = subheadingMatches[1].toLowerCase().trim();
            stack.push(h3name);
            addlangclass(h3name);
          }
        }
      }
    }
  }
}
