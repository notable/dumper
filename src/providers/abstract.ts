
/* IMPORT */

import decode from 'html-entities-decode';
import sanitize from 'sanitize-basename';
import {Promisable} from 'type-fest';
import {Attachment, AttachmentMetadata, Note, NoteMetadata, Dump, Class, Content, Source, SourceDetails} from '../types';
import Config from '../config';
import Utils from '../utils';

/* ABSTRACT */

abstract class AbstractProvider<NoteRaw, AttachmentRaw> {

  abstract name: string;
  abstract extensions: string[];

  note: AbstractNote<NoteRaw, AttachmentRaw>;
  attachment: AbstractAttachment<NoteRaw, AttachmentRaw>;

  constructor ( Note: Class<AbstractNote<NoteRaw, AttachmentRaw>> = AbstractNote, Attachment: Class<AbstractAttachment<NoteRaw, AttachmentRaw>> = AbstractAttachment ) {

    this.note = new Note ();
    this.attachment = new Attachment ();

    this.note.provider = this.attachment.provider = this;

  }

  isSupported ( source: Source ): boolean {

    return Utils.lang.isString ( source ) && !!this.extensions.find ( ext => source.endsWith ( ext ) );

  }

  async getDetails ( source: Source ): Promise<SourceDetails> {

    if ( !Utils.lang.isString ( source ) ) return {};

    return {
      stats: await Utils.file.stats ( source ),
      filePath: source
    };

  }

  getContent ( source: Source ): Promisable<Content> {

    if ( Utils.lang.isBuffer ( source ) ) return source;

    return Utils.file.read ( source );

  }

  getNotesRaw ( content: Content ): Promisable<NoteRaw[]> {

    return [content] as unknown as [NoteRaw]; //TSC

  }

  async dump ( source: Source, dump: Dump ): Promise<void> {

    const details = await this.getDetails ( source ),
          content = await this.getContent ( source ),
          notesRaw = await this.getNotesRaw ( content );

    for ( let noteRaw of notesRaw ) {

      const note = await this.note.get ( noteRaw, details );

      await dump ( note );

    }

  }

}

class AbstractNote<NoteRaw, AttachmentRaw> {

  provider: AbstractProvider<NoteRaw, AttachmentRaw>;

  async get ( note: NoteRaw, details: SourceDetails ): Promise<Note> {

    const metadata = await this.sanitizeMetadata ( await this.getMetadata ( note, details ), details ),
          content = await this.formatContent ( await this.getContent ( note, metadata ), metadata );

    return { metadata, content };

  }

  getMetadata ( note: NoteRaw, details: SourceDetails ): Promisable<Partial<NoteMetadata>> {

    throw new Error ( 'Missing implementation: Note#getMetadata' );

  }

  sanitizeMetadata ( metadata: Partial<NoteMetadata>, details: SourceDetails ): NoteMetadata {

    const created = metadata.created && Utils.lang.isDateValid ( metadata.created ) ? metadata.created : ( details.stats ? details.stats.birthtime : new Date () ),
          modified = metadata.modified && Utils.lang.isDateValid ( metadata.modified ) ? metadata.modified : ( details.stats ? details.stats.mtime : created ),
          titleFallback = details.filePath ? sanitize ( Utils.path.name ( details.filePath ) ) || Config.note.defaultTitle : Config.note.defaultTitle;

    return {
      title: metadata.title ? sanitize ( decode ( String ( metadata.title ) ).trim () ) || titleFallback : titleFallback,
      tags: metadata.tags ? metadata.tags.map ( tag => String ( tag ).trim () ).filter ( tag => tag ) : [],
      attachments: metadata.attachments ? metadata.attachments.map ( attachment => {
        attachment.metadata.created = Utils.lang.isDateValid ( attachment.metadata.created ) ? attachment.metadata.created : created;
        attachment.metadata.modified = Utils.lang.isDateValid ( attachment.metadata.modified ) ? attachment.metadata.modified : modified;
        return attachment;
      }) : [],
      deleted: Utils.lang.isBoolean ( metadata.deleted ) ? metadata.deleted : false,
      favorited: Utils.lang.isBoolean ( metadata.favorited ) ? metadata.favorited : false,
      pinned: Utils.lang.isBoolean ( metadata.pinned ) ? metadata.pinned : false,
      created,
      modified,
      sourceUrl: Utils.lang.isString ( metadata.sourceUrl ) ? metadata.sourceUrl : undefined
    };

  }

  getContent ( note: NoteRaw, metadata: NoteMetadata ): Promisable<Content> {

    return note as unknown as Content; //TSC

  }

  formatContent ( content: Content, metadata: NoteMetadata ): Promisable<Content> {

    return Buffer.from ( content.toString ().trim () );

  }

}

class AbstractAttachment<NoteRaw, AttachmentRaw> {

  provider: AbstractProvider<NoteRaw, AttachmentRaw>;

  async get ( attachment: AttachmentRaw ): Promise<Attachment[]> {

    const metadatas = Utils.lang.castArray ( await this.getMetadata ( attachment ) ).map ( metadata => this.sanitizeMetadata ( metadata ) ),
          contents = await Promise.all ( metadatas.map ( metadata => this.getContent ( attachment, metadata ) ) ),
          attachments = metadatas.map ( ( metadata, i ) => ({ metadata, content: contents[i] }) );

    return attachments;

  }

  getMetadata ( attachment: AttachmentRaw ): Promisable<Partial<AttachmentMetadata> | Partial<AttachmentMetadata>[]> {

    throw new Error ( 'Missing implementation: Attachment#getMetadata' );

  }

  sanitizeMetadata ( metadata: Partial<AttachmentMetadata> ): AttachmentMetadata {

    return {
      name: metadata.name ? sanitize ( metadata.name.trim () ) || Config.attachment.defaultName : Config.attachment.defaultName,
      created: metadata.created && Utils.lang.isDateValid ( metadata.created ) ? metadata.created : new Date ( 'invalid' ), //UGLY: we are using this invalid date as kind of like a global variable
      modified: metadata.modified && Utils.lang.isDateValid ( metadata.modified ) ? metadata.modified : new Date ( 'invalid' ), //UGLY: we are using this invalid date as kind of like a global variable
      mime: metadata.mime
    };

  }

  getContent ( attachment: AttachmentRaw, metadata: AttachmentMetadata ): Promisable<Content> {

    throw new Error ( 'Missing implementation: Attachment#getContent' );

  }

}

/* EXPORT */

export {AbstractProvider, AbstractNote, AbstractAttachment};
