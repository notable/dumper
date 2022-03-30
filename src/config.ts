
/* IMPORT */

import {Options} from '@notable/html2markdown';

/* MAIN */

const Config = {
  note: {
    defaultTitle: 'Untitled'
  },
  attachment: {
    defaultName: 'Untitled'
  },
  html2markdown: {
    options: <Options> {
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '_',
      fence: '```',
      headingStyle: 'atx',
      hr: '---',
      linkStyle: 'inlined',
      strongDelimiter: '**'
    }
  }
};

/* EXPORT */

export default Config;
