
/* IMPORT */

import {parse as xml2js} from 'fast-xml-parser';
import {AttachmentMetadata, NoteMetadata, Content} from '../types';
import Utils from '../utils';
import {AbstractProvider, AbstractNote, AbstractAttachment} from './abstract';

/* TYPES */

type XML = any;
type NoteRaw = XML;
type AttachmentRaw = XML;

/* ENEX */

class EnexProvider extends AbstractProvider<NoteRaw, AttachmentRaw> {

  name = 'Evernote';
  extensions = ['.enex'];

  getNotesRaw ( content: Content ): NoteRaw[] {

    return Utils.lang.castArray ( xml2js ( content.toString () )['en-export'].note );

  }

}

class EnexNote extends AbstractNote<NoteRaw, AttachmentRaw> {

  async getMetadata ( note: NoteRaw ): Promise<Partial<NoteMetadata>> {

    const resources = note.resource ? Utils.lang.castArray ( note.resource ).filter ( resource => !!resource && !!resource.data ) : [];

    return {
      title: note.title || Utils.format.html.inferTitle ( note.content || '' ),
      tags: note.tag && Utils.lang.castArray ( note.tag ),
      attachments: await Promise.all ( resources.map ( resource => this.provider.attachment.get ( resource ) ) ),
      created: note.created && this.parseDate ( note.created ),
      modified: note.updated && this.parseDate ( note.updated )
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

    return Buffer.from ( note.content || '' );

  }

  formatContent ( content: Content, metadata: NoteMetadata ): Content {

    return Buffer.from ( Utils.format.html.convert ( content.toString (), metadata.title ) );

  }

}

class EnexAttachment extends AbstractAttachment<NoteRaw, AttachmentRaw> {

  getMetadata ( attachment: AttachmentRaw ): Partial<AttachmentMetadata> {

    return {
      name: attachment['resource-attributes'] && attachment['resource-attributes']['file-name']
    };

  }

  getContent ( attachment: AttachmentRaw ): Content {

    return Buffer.from ( attachment.data, 'base64' );

  }

}

/* EXPORT */

export {EnexProvider, EnexNote, EnexAttachment};
export default new EnexProvider ( EnexNote, EnexAttachment );
