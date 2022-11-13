
/* IMPORT */

import {parse as xml2js} from 'fast-xml-parser';
import Utils from '../../utils';
import type {AttachmentMetadata, NoteMetadata, Content} from '../../types';
import {AbstractProvider, AbstractNote, AbstractAttachment} from '../abstract';
import type {AttachmentRaw, NoteRaw} from './types';

/* MAIN */

class EnexProvider extends AbstractProvider<NoteRaw, AttachmentRaw> {

  /* VARIABLES */

  name = 'Evernote';
  extensions = ['.enex'];

  /* API */

  getNotesRaw ( content: Content ): NoteRaw[] {

    return Utils.lang.castArray ( xml2js ( Utils.buffer.toUtf8 ( content ) )['en-export'].note );

  }

}

class EnexNote extends AbstractNote<NoteRaw, AttachmentRaw> {

  async getMetadata ( note: NoteRaw ): Promise<Partial<NoteMetadata>> {

    const resources = note.resource ? Utils.lang.castArray ( note.resource ).filter ( resource => !!resource && !!resource.data ) : [];

    return {
      title: note.title || Utils.format.html.inferTitle ( note.content || '' ),
      tags: note.tag && Utils.lang.castArray ( note.tag ),
      attachments: Utils.lang.flatten ( await Promise.all ( resources.map ( resource => this.provider.attachment.get ( resource ) ) ) ),
      created: note.created && this.parseDate ( note.created ),
      modified: note.updated && this.parseDate ( note.updated ),
      sourceUrl: note['note-attributes'] && note['note-attributes']['source-url']
    };

  }

  parseDate ( date: string ): Date { // From the YYYYMMDDTHHMMSSZ format

    const chars = date.split ( '' );

    chars.splice ( 13, 0, ':' );
    chars.splice ( 11, 0, ':' );
    chars.splice ( 6, 0, '-' );
    chars.splice ( 4, 0, '-' );

    return new Date ( chars.join ( '' ) );

  }

  getContent ( note: NoteRaw ): Content {

    return Utils.buffer.fromUtf8 ( note.content || '' );

  }

  formatSourceUrl ( content: string, sourceUrl: string ): string {

    return `${content.trim ()}\n\n---\n\n> Source: ${sourceUrl}`;

  }

  formatContent ( content: Content, metadata: NoteMetadata ): Content {

    let str = Utils.format.html.convert ( Utils.buffer.toUtf8 ( content ), metadata.title );

    if ( metadata.sourceUrl ) str = this.formatSourceUrl ( str, metadata.sourceUrl );

    return Utils.buffer.fromUtf8 ( str );

  }

}

class EnexAttachment extends AbstractAttachment<NoteRaw, AttachmentRaw> {

  getMetadata ( attachment: AttachmentRaw ): Partial<AttachmentMetadata>[] {

    const metadatas: Partial<AttachmentMetadata>[] = [];
    const mime = attachment.mime;
    const name = attachment['resource-attributes'] && attachment['resource-attributes']['file-name'];

    if ( name ) {

      metadatas.push ({ name, mime });

    }

    if ( attachment.recognition ) {

      const recognition = xml2js ( attachment.recognition, { ignoreAttributes: false } );

      if ( recognition.recoIndex && recognition.recoIndex['@_objID'] ) {

        const ext = Utils.mime.inferExtension ( attachment.mime );
        const name = `${recognition.recoIndex['@_objID']}${ext}`;

        metadatas.push ({ name, mime });

      }

    }

    return metadatas;

  }

  getContent ( attachment: AttachmentRaw ): Content {

    return Utils.buffer.fromBase64 ( attachment.data );

  }

}

/* EXPORT */

export {EnexProvider, EnexNote, EnexAttachment};
export default new EnexProvider ( EnexNote, EnexAttachment );
