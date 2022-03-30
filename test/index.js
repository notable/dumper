
/* IMPORT */

const argv = require ( 'minimist' )( process.argv.slice ( 2 ) );
const diff = require ( 'test-diff' );
const fs = require ( 'fs' );
const mkdirp = require ( 'mkdirp' );
const minidom = require ( 'minidom' );
const path = require ( 'path' );
const U8 = require ( 'uint8-encoding' );
const {default: Dumper} = require ( '../dist' );

/* VARIABLES */

const OUTPUT = path.join ( __dirname, 'output' );
const SOURCE = path.join ( __dirname, 'source' );
const CHECK = path.join ( __dirname, 'check' );

/* DOM PARSER */

class DOMParser {
  parseFromString ( str ) {
    return minidom ( str );
  }
}

/* MAKE */

function make ( source ) {
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
      mkdirp.sync ( path.join ( OUTPUT, source ) );
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
}

/* DIFF */

process.env.IS_TEST = true;

const GLOB_PROVIDER = argv.provider ? `${argv.provider}` : '*';
const GLOB_FILE = argv.file ? `${argv.file}` : '*';

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
