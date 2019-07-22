
/* IMPORT */

const argv = require ( 'minimist' )( process.argv.slice ( 2 ) ),
      diff = require ( 'test-diff' )
      filenamify = require ( 'filenamify' ),
      fs = require ( 'fs' ),
      mkdirp = require ( 'mkdirp' ),
      path = require ( 'path' ),
      {default: Dumper} = require ( '../dist' );

/* VARIABLES */

const OUTPUT = path.join ( __dirname, 'output' ),
      SOURCE = path.join ( __dirname, 'source' ),
      CHECK = path.join ( __dirname, 'check' );

/* MAKE */

function make ( source ) {
  return Dumper.dump ({
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
      fs.writeFileSync ( path.join ( OUTPUT, source, `${note.metadata.title}.md` ), `${note.content.toString ()}\n` );
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

const GLOB_PROVIDER = argv.provider ? `${argv.provider}` : '*',
      GLOB_FILE = argv.file ? `${argv.file}` : '*';

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
