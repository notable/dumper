
/* IMPORT */

import {NoteMetadata} from '../../types';
import Utils from '../../utils';
import {AbstractProvider, AbstractNote} from '../abstract';
import {AttachmentRaw, NoteRaw} from './types';

/* MAIN */

class MarkdownProvider extends AbstractProvider<NoteRaw, AttachmentRaw> {

  /* VARIABLES */

  name = 'Markdown';
  extensions = ['.md', '.mkd', '.mkdn', '.mdwn', '.mdown', '.markdown', '.markdn', '.mdtxt', '.mdtext', '.rmd', '.txt'];

}

class MarkdownNote extends AbstractNote<NoteRaw, AttachmentRaw> {

  getMetadata ( note: NoteRaw ): Partial<NoteMetadata> {

    return {
      title: Utils.format.markdown.inferTitle ( Utils.buffer.toUtf8 ( note ) )
    };

  }

}

/* EXPORT */

export {MarkdownProvider, MarkdownNote};
export default new MarkdownProvider ( MarkdownNote );
