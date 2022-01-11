
/* IMPORT */

import {NoteMetadata} from '../types';
import Utils from '../utils';
import {AbstractProvider, AbstractNote} from './abstract';

/* TYPES */

type NoteRaw = Buffer;
type AttachmentRaw = undefined;

/* MARKDOWN */

class MarkdownProvider extends AbstractProvider<NoteRaw, AttachmentRaw> {

  name = 'Markdown';
  extensions = ['.md', '.mkd', '.mkdn', '.mdwn', '.mdown', '.markdown', '.markdn', '.mdtxt', '.mdtext', '.rmd', '.txt'];

}

class MarkdownNote extends AbstractNote<NoteRaw, AttachmentRaw> {

  getMetadata ( note: NoteRaw ): Partial<NoteMetadata> {

    return {
      title: Utils.format.markdown.inferTitle ( note.toString () )
    };

  }

}

/* EXPORT */

export {MarkdownProvider, MarkdownNote};
export default new MarkdownProvider ( MarkdownNote );
