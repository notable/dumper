
/* IMPORT */

import Utils from '../../utils';
import type {NoteMetadata, Content} from '../../types';
import {AbstractProvider, AbstractNote} from '../abstract';
import type {AttachmentRaw, NoteRaw} from './types';

/* MAIN */

class HTMLProvider extends AbstractProvider<NoteRaw, AttachmentRaw> {

  /* VARIABLES */

  name = 'HTML';
  extensions = ['.html', '.htm'];

}

class HTMLNote extends AbstractNote<NoteRaw, AttachmentRaw> {

  getMetadata ( note: NoteRaw ): Partial<NoteMetadata> {

    return {
      title: Utils.format.html.inferTitle ( Utils.buffer.toUtf8 ( note ) )
    };

  }

  formatContent ( content: Content, metadata: NoteMetadata ): Content {

    return Utils.buffer.fromUtf8 ( Utils.format.html.convert ( Utils.buffer.toUtf8 ( content ), metadata.title ) );

  }

}

/* EXPORT */

export {HTMLProvider, HTMLNote};
export default new HTMLProvider ( HTMLNote );
