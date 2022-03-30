
/* IMPORT */

import html2markdown from '@notable/html2markdown';
import decodeBase64 from 'decode-base64';
import * as fs from 'fs';
import mime2ext from 'mime2ext';
import * as path from 'path';
import U8 from 'uint8-encoding';
import {Stats} from './types';
import Config from './config';

/* MAIN */

const Utils = {

  /* API */

  buffer: {

    fromBase64: ( string: string ): Uint8Array => {

      string = string.replace ( /\r?\n|\r/g, '' ); // Sanitization for stupid inputs like Evernote's

      return decodeBase64 ( string );

    },

    fromUtf8: ( string: string ): Uint8Array => {

      return U8.encode ( string );

    },

    toUtf8: ( buffer: Uint8Array ): string => {

      return U8.decode ( buffer );

    }

  },

  lang: {

    isArray: ( value: unknown ): value is unknown[] => {

      return value instanceof Array;

    },

    isBoolean: ( value: unknown ): value is boolean => {

      return typeof value === 'boolean';

    },

    isString: ( value: unknown ): value is string => {

      return typeof value === 'string';

    },

    isBuffer: ( value: unknown ): value is Uint8Array => {

      return value instanceof Uint8Array;

    },

    isDateValid: ( value: unknown ): value is Date => {

      return value instanceof Date && !isNaN ( value.getTime () );

    },

    castArray: <T> ( value: T | T[] ): T[] => {

      return Utils.lang.isArray ( value ) ? value : [value];

    },

    flatten: <T> ( value: T[][] ): T[] => {

      return [].concat.apply ( [], value );

    },

    matchAll: ( str: string, re: RegExp ): RegExpMatchArray[] => {

      return Array.from ( str.matchAll ( re ) );

    }

  },

  mime: {

    inferExtension: ( type: string ): string => {

      const ext = mime2ext ( type );

      return ext ? `.${ext}` : '';

    },

    isImage: ( type: string ): boolean => {

      return type.includes ( 'image' );

    }

  },

  system: {

    getMaxHeapSize: (): number => {

      try {

        return performance['memory'].jsHeapSizeLimit;

      } catch {

        return 2197815296; // Hard-coded for better web compatibility, source: "require ( 'v8' ).getHeapStatistics ().heap_size_limit"

      }

    },

  },

  file: {

    checkSize: ( filePath: string ): Promise<void> => {

      return Utils.file.stats ( filePath ).then ( stats => {

        if ( stats.size < ( Utils.system.getMaxHeapSize () * .75 ) ) return;

        throw new Error ( 'File too large, try splitting it into smaller ones' );

      });

    },

    read: async ( filePath: string ): Promise<Uint8Array> => {

      await Utils.file.checkSize ( filePath );

      return new Promise ( ( resolve, reject ) => {

        fs.readFile ( filePath, ( err, data ) => {

          if ( err ) return reject ( err );

          return resolve ( data );

        });

      });

    },

    stats: ( filePath: string ): Promise<Stats> => {

      return new Promise ( ( resolve, reject ) => {

        fs.stat ( filePath, ( err, stats ) => {

          if ( err ) return reject ( err );

          return resolve ( stats );

        });

      });

    }

  },

  path: {

    name: ( filePath: string ): string => {

      return path.basename ( filePath, path.extname ( filePath ) );

    }

  },

  format: {

    txt: {

      inferTitle: ( content: string ): string | undefined => {

        const firstUnemptyLine = content.match ( /^.*?\S.*$/m );

        if ( firstUnemptyLine ) return firstUnemptyLine[0].trim ();

      }

    },

    markdown: {

      inferTitle: ( content: string ): string | undefined => {

        const headingMatch = content.match ( /^\s{0,3}#+\s(.*)(\s#+\s*$)?/m );

        if ( headingMatch ) return headingMatch[1].trim ();

      }

    },

    html: {

      inferTitle: ( content: string ): string | undefined => {

        const headingMatch = content.match ( /<h1(?:\s[^>]*)?>(.*?)<\/h1>/i );

        if ( headingMatch ) return headingMatch[1].trim ();

        const titleMatch = content.match ( /<title(?:\s[^>]*)?>(.*?)<\/title>/i );

        if ( titleMatch ) return titleMatch[1].trim ();

      },

      ensureTitle: ( content: string, title: string ): string => {

        const headingMatch = content.match ( /<h1(?:\s[^>]*)?>(.*?)<\/h1>/i );

        if ( headingMatch ) return content;

        const titleTag = `<h1>${title}</h1>`;
        const bodyIndex = content.indexOf ( '<body>' );

        if ( bodyIndex >= 0 ) {

          return `${content.substring ( 0, bodyIndex )}${titleTag}${content.substring ( bodyIndex )}`;

        } else {

          return `${titleTag}${content}`;

        }

      },

      convert: ( content: string, title?: string ): string => {

        title = title || Utils.format.html.inferTitle ( content );

        if ( title ) content = Utils.format.html.ensureTitle ( content, title );

        return html2markdown ( content, Config.html2markdown.options );

      }

    }

  }

};

/* EXPORT */

export default Utils;
