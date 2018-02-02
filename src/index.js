import fs from 'fs';
import Sqlite3Database from 'better-sqlite3';
import { performance } from 'perf_hooks';
import { formatelapsed } from './util';
import XmlStream from './XmlStream';
import Entry from './entry';
import Revision from './revision';

function initdb(file, sql) {
  return new Promise(function(resolve, reject) {
    let db = new Sqlite3Database(file).exec(sql);
    return resolve(db);
  });
}

function seeddb(db, classes) {
  return new Promise(function(resolve, reject) {
    const placeholders = classes.map(() => '(?)').join(', ');

    try {
      db
        .prepare(`INSERT INTO class (class) VALUES ${placeholders}`)
        .run(classes);
      return resolve(db.prepare('SELECT * FROM class').all());
    } catch (err) {
      return reject(err);
    }
  });
}

function parsewikixml(db, source, classes, pagesize = 250000) {
  let count = 0;
  const namespaces = [0]; // namespaces for wiki's dictionary entries
  const xmlstream = new XmlStream();
  xmlstream.path = '/mediawiki/page';

  let t0 = performance.now();

  db.exec('BEGIN TRANSACTION');

  xmlstream.on('error', function(e) {
    console.log(e);
  });

  xmlstream.on('page', function(page) {
    if (namespaces.includes(parseInt(page.get('ns').text))) {
      const entry = new Entry(page.get('title').text);
      let revisions = page.get('revision');
      if (!Array.isArray(revisions)) {
        revisions = [revisions];
      }

      entry.revisions = revisions.map(function(revision) {
        const rev = new Revision(
          new Date(revision.get('timestamp').text),
          revision.get('format').text,
          revision.get('text').text
        );
        rev.parse(classes);
        return rev;
      });

      entry.save(db);
      count++;
      // console.log(`'${entry.word}' saved`);
      if (count % pagesize == 0) {
        db.exec('END TRANSACTION');
        console.log(count, `${formatelapsed(performance.now() - t0)} elapsed`);
        t0 = performance.now();
        db.exec('BEGIN TRANSACTION');
      }
    }
  });

  return new Promise(function(resolve, reject) {
    const instream = fs.createReadStream(source);
    xmlstream.on('end', function() {
      db.exec('END TRANSACTION');
      db.close();
      return resolve(count);
    });
    instream.pipe(xmlstream);
  });
}

export function makewordsdb(classes, input, initsql, output, pagesize) {
  return initdb(output, initsql).then(function(db) {
    return seeddb(db, classes).then(function(classes) {
      return parsewikixml(db, input, classes.map((c) => c.class), pagesize);
    });
  });
}

// command line driver
if (require.main === module) {
  if (process.argv.length > 4) {
    const input = process.argv[3];
    const dbname = process.argv[4];
    const pagesize = process.argv[5];
    fs.readFile('seed/initial.sql', 'utf-8', function(err, data) {
      if (err) throw err;
      const classes = process.argv[2].split(',').map((c) => c.trim());
      const t0 = performance.now();
      makewordsdb(classes, input, data, dbname, pagesize)
        .then(function(count) {
          console.log(
            `${count} entries processed`,
            `${formatelapsed(performance.now() - t0)} elapsed`
          );
        })
        .catch(function(reason) {
          console.log(reason);
        });
    });
  }
}
