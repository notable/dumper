
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
      strongDelimiter: '**'
    } as TurndownOptions
  }
};

/* EXPORT */

export default Config;
