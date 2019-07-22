
/* IMPORT */

import {NoteMetadata, Content} from '../types';
import Utils from '../utils';
import {AbstractProvider, AbstractNote} from './abstract';

/* TYPES */

type NoteRaw = Buffer;
type AttachmentRaw = undefined;

/* HTML */

class HTMLProvider extends AbstractProvider<NoteRaw, AttachmentRaw> {

  name = 'HTML';
  extensions = ['.html', '.htm'];

}

class HTMLNote extends AbstractNote<NoteRaw, AttachmentRaw> {

  getMetadata ( note: NoteRaw ): Partial<NoteMetadata> {

    return {
      title: Utils.format.html.inferTitle ( note.toString () )
    };

  }

  formatContent ( content: Content, metadata: NoteMetadata ): Content {

    return Buffer.from ( Utils.format.html.convert ( content.toString (), metadata.title ) );

  }

}

/* EXPORT */

export {HTMLProvider, HTMLNote};
export default new HTMLProvider ( HTMLNote );
