
/* IMPORT */

import domino from 'domino';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import diff from 'test-diff';
import parseArgv from 'tiny-parse-argv';
import U8 from 'uint8-encoding';
import Dumper from '../dist/index.js';

/* VARIABLES */

const ARGV = parseArgv ( process.argv.slice ( 2 ) );
const OUTPUT = path.join ( process.cwd (), 'test', 'output' );
const SOURCE = path.join ( process.cwd (), 'test', 'source' );
const CHECK = path.join ( process.cwd (), 'test', 'check' );

/* DOM PARSER */

class DOMParser {
  parseFromString ( str ) {
    return domino.createWindow ( str ).document;
  }
}

/* MAKE */

const make = source => {
  return Dumper.dump ({
    DOMParser,
    source: path.join ( SOURCE, source ),
    dump ( note ) {
      function replaceDates ( obj ) { // They make the tests harder to pass unnecessarily
        if ( obj.created && !isNaN ( obj.created.getTime () ) ) obj.created = '[VALID_DATE]';
        if ( obj.modified && !isNaN ( obj.modified.getTime () ) ) obj.modified = '[VALID_DATE]';
      }
      function replaceAttachments ( obj ) { // No point in writing the buffer in the metadata
        if ( obj.attachments ) obj.attachments = obj.attachments.map ( attachment => attachment.metadata.name );
      }
      fs.mkdirSync ( path.join ( OUTPUT, source ), { recursive: true } );
      fs.writeFileSync ( path.join ( OUTPUT, source, `${note.metadata.title}.md` ), `${U8.decode ( note.content )}\n` );
      const noteMetadata = { ...note.metadata };
      replaceAttachments ( noteMetadata );
      replaceDates ( noteMetadata );
      fs.writeFileSync ( path.join ( OUTPUT, source, `${note.metadata.title}.md.json` ), `${JSON.stringify ( noteMetadata, undefined, 2 )}\n` );
      note.metadata.attachments.forEach ( attachment => {
        replaceDates ( attachment.metadata );
        fs.writeFileSync ( path.join ( OUTPUT, source, `${attachment.metadata.name}` ), attachment.content );
        fs.writeFileSync ( path.join ( OUTPUT, source, `${attachment.metadata.name}.json` ), `${JSON.stringify ( attachment.metadata, undefined, 2 )}\n` );
      });
    }
  })
};

/* DIFF */

process.env.IS_TEST = true;

const GLOB_PROVIDER = ARGV.provider ? `${ARGV.provider}` : '*';
const GLOB_FILE = ARGV.file ? `${ARGV.file}` : '*';

diff ({
  source: {
    cwd: SOURCE,
    glob: `${GLOB_PROVIDER}/*.*`
  },
  output: {
    cwd: OUTPUT,
    make
  },
  check: {
    cwd: CHECK,
    glob: `${GLOB_PROVIDER}/${GLOB_FILE}/*`
  }
});
