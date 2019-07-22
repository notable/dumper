
/* IMPORT */

import {Source, Options} from './types';
import {Boostnote, Enex, HTML, Markdown} from './providers';
import Utils from './utils';

/* DUMPER */

const Dumper = {

  providers: [
    Boostnote,
    Enex,
    HTML,
    Markdown
  ],

  isSupported ( source: Source ): boolean {

    return !!Dumper.providers.find ( provider => provider.isSupported ( source ) );

  },

  async dump ( options: Options ): Promise<void> {

    const sources = Utils.lang.castArray ( options.source ),
          sourcesUnsupported = sources.filter ( source => !Dumper.isSupported ( source ) );

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
