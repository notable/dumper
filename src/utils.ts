
/* IMPORT */

import * as fs from 'fs';
import * as path from 'path';
import {Stats} from './types';
import Config from './config';
import html2markdown from './html2markdown';

/* UTILS */

const Utils = {

  lang: {

    isArray ( x ): x is any[] {

      return x instanceof Array;

    },

    isBoolean ( x ): x is boolean {

      return typeof x === 'boolean';

    },

    isString ( x ): x is string {

      return typeof x === 'string';

    },

    isBuffer ( x ): x is Buffer {

      return x instanceof Buffer;

    },

    isDateValid ( x: Date ): boolean {

      return !isNaN ( x.getTime () );

    },

    castArray<T> ( x: T | T[] ): T[] {

      return Utils.lang.isArray ( x ) ? x : [x];

    }

  },

  file: {

    checkSize ( filePath: string ): Promise<void> {

      return Utils.file.stats ( filePath ).then ( stats => {

        if ( stats.size < 1000000000 && stats.size < ( require ( 'v8' ).getHeapStatistics ().heap_size_limit * .75 ) ) return;

        throw new Error ( 'File too large, try splitting it into smaller ones' );

      });

    },

    async read ( filePath: string ): Promise<Buffer> {

      await Utils.file.checkSize ( filePath );

      return new Promise ( ( resolve, reject ) => {

        fs.readFile ( filePath, ( err, data ) => {

          if ( err ) return reject ( err );

          resolve ( data );

        });

      });

    },

    stats ( filePath: string ): Promise<Stats> {

      return new Promise ( ( resolve, reject ) => {

        fs.stat ( filePath, ( err, stats ) => {

          if ( err ) return reject ( err );

          resolve ( stats );

        });

      });

    }

  },

  path: {

    name ( filePath: string ): string {

      return path.basename ( filePath, path.extname ( filePath ) );

    }

  },

  format: {

    txt: {

      inferTitle ( content: string ): string | undefined {

        const firstUnemptyLine = content.match ( /^.*?\S.*$/m );

        if ( firstUnemptyLine ) return firstUnemptyLine[0].trim ();

      }

    },

    markdown: {

      inferTitle ( content: string ): string | undefined {

        const headingMatch = content.match ( /^\s{0,3}#+\s(.*)(\s#+\s*$)?/m );

        if ( headingMatch ) return headingMatch[1].trim ();

      }

    },

    html: {

      inferTitle ( content: string ): string | undefined {

        const headingMatch = content.match ( /<h1(?:\s[^>]*)?>(.*?)<\/h1>/i );

        if ( headingMatch ) return headingMatch[1].trim ();

        const titleMatch = content.match ( /<title(?:\s[^>]*)?>(.*?)<\/title>/i );

        if ( titleMatch ) return titleMatch[1].trim ();

      },

      ensureTitle ( content: string, title: string ): string {

        const headingMatch = content.match ( /<h1(?:\s[^>]*)?>(.*?)<\/h1>/i );

        if ( headingMatch ) return content;

        const titleTag = `<h1>${title}</h1>`,
              bodyIndex = content.indexOf ( '<body>' );

        if ( bodyIndex >= 0 ) {

          return `${content.substring ( 0, bodyIndex )}${titleTag}${content.substring ( bodyIndex )}`;

        } else {

          return `${titleTag}${content}`;

        }

      },

      convert ( content: string, title?: string ): string {

        title = title || Utils.format.html.inferTitle ( content );

        if ( title ) content = Utils.format.html.ensureTitle ( content, title );

        return html2markdown ( content, Config.html2markdown.options );

      }

    }

  }

};

/* EXPORT */

export default Utils;
