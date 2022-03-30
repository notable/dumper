
/* IMPORT */

import {Stats} from 'fs';

/* HELPERS */

type Constructor<T> = { new (): T };

type ConstructorWith<T, Arguments extends unknown[]> = { new ( ...args: Arguments ): T };

type Promisable<T> = Promise<T> | T;

/* MAIN */

type DOMParser = Constructor<{
  parseFromString ( str: string, mimeType: string ): Document
}>;

type Attachment = {
  metadata: AttachmentMetadata,
  content: Content
};

type AttachmentMetadata = {
  name: string,
  created: Date,
  modified: Date,
  mime?: string
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
  modified: Date,
  sourceUrl?: string
};

type Dump = ( note: Note ) => Promisable<void>;

type Source = string | Uint8Array;

type SourceDetails = {
  stats?: Stats,
  filePath?: string
};

type Content = Uint8Array;

type Options = {
  DOMParser?: DOMParser,
  source: Source | Source[],
  dump: Dump
};

/* EXPORT */

export {Constructor, ConstructorWith, Promisable};
export {DOMParser, Attachment, AttachmentMetadata, Note, NoteMetadata, Dump, Source, SourceDetails, Content, Stats, Options};
