
/* IMPORT */

import cson2json from 'cson2json';
import * as path from 'path';
import {AttachmentMetadata, NoteMetadata, Content, SourceDetails} from '../../types';
import Utils from '../../utils';
import {AbstractProvider, AbstractNote, AbstractAttachment} from '../abstract';
import {AttachmentRaw, NoteRaw} from './types';

/* MAIN */

class BoostnoteProvider extends AbstractProvider<NoteRaw, AttachmentRaw> {

  /* VARIABLES */

  name = 'Boostnote';
  extensions = ['.cson'];

  /* API */

  getNotesRaw ( content: Content ): NoteRaw[] {

    return [cson2json ( Utils.buffer.toUtf8 ( content ) )];

  }

}

class BoostnoteNote extends AbstractNote<NoteRaw, AttachmentRaw> {

  async getMetadata ( note: NoteRaw, details: SourceDetails ): Promise<Partial<NoteMetadata>> {

    const attachmentsPaths = this.getAttachmentsPaths ( note, details );

    return {
      title: note.title || Utils.format.markdown.inferTitle ( note.content || '' ),
      tags: note.tags,
      attachments: Utils.lang.flatten ( await Promise.all ( attachmentsPaths.map ( attachmentPath => this.provider.attachment.get ( attachmentPath ) ) ) ),
      deleted: note.isTrashed,
      favorited: note.isStarred,
      created: note.createdAt && new Date ( note.createdAt ),
      modified: note.updatedAt && new Date ( note.updatedAt )
    };

  }

  getAttachmentsPaths ( note: NoteRaw, details: SourceDetails ): string[] {

    if ( !details.filePath ) return [];

    const attachmentsLinks = note.content ? Utils.lang.matchAll ( note.content, /\]\(:storage\/([^)]+)\)/gi ) : [];
    const attachmentsCwd = process.env.IS_TEST ? path.resolve ( details.filePath, '..', 'attachments' ) : path.resolve ( details.filePath, '..', '..', 'attachments' );
    const attachmentsPaths = attachmentsLinks.map ( match => path.join ( attachmentsCwd, match[1] ) );

    return attachmentsPaths;

  }

  getContent ( note: NoteRaw ): Content {

    return Utils.buffer.fromUtf8 ( note.content || '' );

  }

  formatAttachmentsLinks ( content: string ): string {

    return content.replace ( /\]\(:storage\/[a-z0-9-]+\/([^)]+)\)/i, '](@attachment/$1)' );

  }

  formatContent ( content: Content, metadata: NoteMetadata ): Content {

    let str = Utils.buffer.toUtf8 ( content ).trim ();

    str = this.formatAttachmentsLinks ( str );

    return Utils.buffer.fromUtf8 ( str );

  }

}

class BoostnoteAttachment extends AbstractAttachment<NoteRaw, AttachmentRaw> {

  getMetadata ( attachment: AttachmentRaw ): Partial<AttachmentMetadata> {

    return {
      name: path.basename ( attachment )
    };

  }

  getContent ( attachment: AttachmentRaw ): Promise<Content> {

    return Utils.file.read ( attachment );

  }

}

/* EXPORT */

export {BoostnoteProvider, BoostnoteNote, BoostnoteAttachment};
export default new BoostnoteProvider ( BoostnoteNote, BoostnoteAttachment );
