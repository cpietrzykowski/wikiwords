export default class Entry {
  title = ''; // for dictionary entries this is the word
  revisions = [];

  constructor(title) {
    this.title = title;
  }

  get word() {
    return this.title;
  }

  latestRevision() {
    return this.revisions.sort(function(a, b) {
      return new Date(b) - new Date(a);
    })[0];
  }

  // saves the main entry
  save(db) {
    const word = this.word;
    const revisions = this.revisions;

    db.prepare('INSERT OR IGNORE INTO word (word) VALUES (?)').run(word);
    for (let revision of revisions) {
      const results = db
        .prepare(
          'INSERT INTO revision (wordid, time, text, format) ' +
            'VALUES(' +
            '(SELECT id FROM word WHERE word = ?), ' +
            '?, ?, ?' +
            ')'
        )
        .run(
          word,
          revision.timestamp.toUTCString(),
          revision.text,
          revision.format
        );

      const revisionid = results.lastInsertROWID;
      for (let language of revision.languages) {
        // ensure language has been recorded
        db
          .prepare('INSERT OR IGNORE INTO language (language) VALUES (?)')
          .run(language.name);

        const results = db
          .prepare(
            'INSERT INTO revisions_languages ' +
              '(languageid, revisionid) ' +
              'VALUES(' +
              '(SELECT id FROM language WHERE language = ?), ' +
              '?' +
              ')'
          )
          .run(language.name, revisionid);

        const revlangid = results.lastInsertROWID;

        // commit language meta
        const stmt = db.prepare(
          'INSERT INTO revisions_languages_classes ' +
            '(revlangid, classid) ' +
            'VALUES(' +
            '?, ' +
            '(SELECT id FROM class WHERE class = ?)' +
            ')'
        );

        language.classes.forEach(function(c) {
          stmt.run(revlangid, c);
        });
      }
    }
  }
}
