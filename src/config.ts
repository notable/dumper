
/* IMPORT */

import {Options as TurndownOptions} from 'turndown';

/* CONFIG */

const Config = {
  note: {
    defaultTitle: 'Untitled'
  },
  attachment: {
    defaultName: 'Untitled'
  },
  html2markdown: {
    options: {
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '_',
      fence: '```',
      headingStyle: 'atx',
      hr: '---',
      linkStyle: 'inlined',
      strongDelimiter: '**',
      parser: undefined // Defaults to window.DOMParser
    } as TurndownOptions
  }
};

/* EXPORT */

export default Config;
