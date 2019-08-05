
/* IMPORT */

import {Stats} from 'fs';
import {Class, Promisable} from 'type-fest';

/* TYPES */

type DOMParser = Class<{
  parseFromString ( str: string, mimeType: string ): Document
}>;

type Attachment = {
  metadata: AttachmentMetadata,
  content: Content
};

type AttachmentMetadata = {
  name: string,
  created: Date,
  modified: Date
};

type Note = {
  metadata: NoteMetadata,
  content: Content
};

type NoteMetadata = {
  title: string,
  tags: string[],
  attachments: Attachment[],
  deleted: boolean,
  favorited: boolean,
  pinned: boolean,
  created: Date,
  modified: Date
};

type Dump = ( note: Note ) => Promisable<void>;

type Source = string | Buffer;

type SourceDetails = {
  stats?: Stats,
  filePath?: string
};

type Content = Buffer;

type Options = {
  DOMParser?: DOMParser,
  source: Source | Source[],
  dump: Dump
};

/* EXPORT */

export {DOMParser, Attachment, AttachmentMetadata, Note, NoteMetadata, Dump, Source, SourceDetails, Class, Content, Stats, Options};
