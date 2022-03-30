# Dumper

Library for extracting attachments, notes and metadata out of formats used by popular note-taking apps.

## Features

- **Markdown**: all notes are converted to Markdown automatically, no matter what format each note uses.
- **Modular**: each supported format is implemented by a "provider", additional providers can be implemented easily, learn more about implementing one yourself [here](https://github.com/notable/dumper/blob/master/.github/CONTRIBUTING.md).
- **Lightweight**: extra care has been taken to ensure this library is lightweight, no external DOM implementation is loaded by default and the most lightweight dependencies are being used.

## Install

```sh
npm install --save @notable/dumper
```

## Providers

The following providers are currently implemented:

- **Enex**: it can import notes exported via [Evernote](https://evernote.com).
  - **Extensions**: `.enex`.
- **Boostnote**: it can import notes written using [Boostnote](https://boostnote.io).
  - **Extensions**: `.cson`.
- **HTML**: it can import HTML notes, most popular note-taking apps can export to HTML.
  - **Extensions**: `.html`, `.htm`.
- **Markdown**: it can import plain Markdown notes.
  - **Extensions**: `.md`, `.mkd`, `.mkdn`, `.mdwn`, `.mdown`, `.markdown`, `.markdn`, `.mdtxt`, `.mdtext`, `.txt`.

## Usage

The following interfaces are provided:

```ts
interface Dumper {
  isSupported ( source: string ): boolean,
  dump ( options: Options ): Promise<void>
}

interface Options {
  DOMParser?: DOMParser, // This option is only optional if you are in a browser-like environment, e.i. "window.DOMParser" exists
  source: string | string[],
  dump ( note: Note ): void | Promise<void>
}

interface Note {
  metadata: {
    title: string,
    tags: string[],
    attachments: {
      metadata: {
        name: string,
        created: Date,
        modified: Date
      },
      content: Uint8Array
    }[],
    deleted: boolean,
    favorited: boolean,
    pinned: boolean,
    created: Date,
    modified: Date
  },
  content: Uint8Array
}
```

You can use the library like so:

```ts
import * as path from 'path';
import Dumper from '@notable/dumper';

Dumper.dump ({
  source: path.join ( __dirname, 'source.html' ),
  dump ( note ) {
    // Do something with each given note object...
  }
});
```

## Contributing

There are multiple ways to contribute to this project, read about them [here](https://github.com/notable/dumper/blob/master/.github/CONTRIBUTING.md).

## Related

- **[Notable](https://github.com/notable/notable)**: The Markdown-based note-taking app that doesn't suck.

## License

MIT © Fabio Spampinato
