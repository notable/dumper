
/* IMPORT */

import {Source, Options} from './types';
import Config from './config';
import {Boostnote, Enex, HTML, Markdown} from './providers';
import Utils from './utils';

/* MAIN */

const Dumper = {

  /* VARIABLES */

  providers: [
    Boostnote,
    Enex,
    HTML,
    Markdown
  ],

  /* API */

  isSupported: ( source: Source ): boolean => {

    return !!Dumper.providers.find ( provider => provider.isSupported ( source ) );

  },

  dump: async ( options: Options ): Promise<void> => {

    if ( options.DOMParser ) Config.html2markdown.options['parser'] = options.DOMParser;

    const sources = Utils.lang.castArray ( options.source );
    const sourcesUnsupported = sources.filter ( source => !Dumper.isSupported ( source ) );

    if ( sourcesUnsupported.length ) throw new Error ( `These sources are not supported: ${sourcesUnsupported.join ( ', ' )}` );

    for ( const source of sources ) {

      const provider = Dumper.providers.find ( provider => provider.isSupported ( source ) );

      if ( !provider ) throw new Error ( `This source is not supported: ${source}` );

      await provider.dump ( source, options.dump );

    }

  }

};

/* EXPORT */

export default Dumper;
