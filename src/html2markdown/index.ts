
/* IMPORT */

import turndown = require ( '../../src/html2markdown/_turndown.js' ); //UGLY
import {Options} from 'turndown';
import TurndownService = require ( 'turndown' );

/* HTML 2 MARKDOWN */

//TODO: Maybe publish as a standalone package
//TODO: Decouple providers-specific logic

function html2markdown ( html: string, options?: Options ): string {

  html = html.replace ( /<!DOCTYPE(.*?)>/g, '' ) // Remove HTML doctype
             .replace ( /<\?xml(.*?)>/g, '' ) // Remove XML thing //TODO: What's it actually called?
             .replace ( /<head>([^]*?)<\/head>/gi, '' ) // Removing HTML head
             .replace ( /<div>(\s*)<\/div>/g, '' ) // Remove empty divs
             .replace ( /(<div>(\s*)<br ?\/>(\s*)<\/div>){2,}/g, '<div><br /></div>' ); // Remove extra line breaks

  html = html.replace ( /<en-todo checked="true"(.*?)\/?>/g, '<input type="checkbox" checked />' ) // Replace enex checked checkbox
             .replace ( /<en-todo checked="false"(.*?)\/?>/g, '<input type="checkbox" />' ) // Replace enex unchecked checkbox
             .replace ( /<li>\s*<input(.*?)type="checkbox"([^>]*?)checked(.*?)>/g, '<li> [x] ' ) // Replace checked checkbox
             .replace ( /<li>\s*<input(.*?)type="checkbox"(.*?)>/g, '<li> [ ] ' ) // Replace unchecked checkbox
             .replace ( /<input(.*?)type="checkbox"([^>]*?)checked(.*?)>/g, '- [x] ' ) // Replace checked checkbox
             .replace ( /<input(.*?)type="checkbox"(.*?)>/g, '- [ ] ' ) // Replace unchecked checkbox
             .replace ( /<\/?en-(\w+)(.*?)>/g, '' ); // Remove enex tags

  const service: TurndownService = new turndown ( options );

  service.addRule ( 'strikethrough', {
    filter: ['del', 's'],
    replacement: str => {
      return `~~${str}~~`;
    }
  });

  service.addRule ( 'alignment', {
    filter: node => node.nodeName !== 'TABLE' && ( node.getAttribute ( 'style' ) || '' ).includes ( 'text-align:' ),
    replacement: ( str, ele: HTMLElement ) => {
      str = str.trim ();
      if ( !str.length ) return '';
      const style = ele.getAttribute ( 'style' );
      if ( !style ) return '';
      const alignment = style.match ( /text-align:\s*(\S+);/ );
      if ( !alignment ) return `${str}\n\n`;
      return `<p align="${alignment[1]}">${str}</p>\n\n`;
    }
  });

  service.addRule ( 'code-enex', {
    filter: node => node.nodeName === 'DIV' && ( node.getAttribute ( 'style' ) || '' ).includes ( '-en-codeblock' ),
    replacement: str => {
      str = str.replace ( /^[\r\n]+/, '' ).replace ( /[\r\n]+$/, '' );
      if ( !str.length ) return '';
      str = str.replace ( /<(?:.|\n)*?>/gm, '' );
      str = str.includes ( '\n' ) ? `\n\n\`\`\`\n${str}\n\`\`\`\n` : `\`${str}\``;
      return str;
    }
  });

  service.addRule ( 'mixed', {
    filter: ['font', 'span'],
    replacement: ( str, ele: HTMLElement ) => {
      if ( !str.trim () ) return '';
      /* STYLE */
      const style = ele.getAttribute ( 'style' );
      let newStyle = '';
      if ( style ) {
        /* FORMATTING */
        if ( style.match ( /text-decoration: underline/ ) ) { // Underline
          str = `<u>${str}</u>`;
        }
        if ( style.match ( /text-decoration: line-through/ ) ) { // Strikethrough
          str = `~~${str}~~`;
        }
        if ( style.match ( /font-style: italic/ ) ) { // Italic
          str = `_${str}_`;
        }
        if ( style.match ( /font-weight: bold/ ) ) { // Bold
          str = `**${str}**`;
        }
        /* HEADING */
        if ( str.match ( /^[^#]|>#/ ) ) { // Doesn't contain an heading
          const match = style.match ( /font-size: (\d+)px/i );
          if ( match ) {
            const px = Number ( match[1] );
            if ( px >= 48 ) { // H1
              str = `# ${str}`;
            } else if ( px >= 36 ) { // H2
              str = `## ${str}`;
            } else if ( px >= 24 ) { // H3
              str = `### ${str}`;
            } else if ( px >= 14 ) { // Normal
            } else if ( px >= 12 ) { // Small
              str = `<small>${str}</small>`;
            } else { // Very Small
              str = `<small><small>${str}</small></small>`;
            }
          }
        }
        /* BACKGROUND COLOR */
        const backgroundColor = style.match ( /background-color: ([^;]+);/ );
        if ( backgroundColor && backgroundColor[1] !== 'rgb(255, 255, 255)' && backgroundColor[1] !== '#ffffff' ) {
          newStyle += backgroundColor[0];
        }
      }
      /* COLOR */
      const colorAttr = ele.getAttribute ( 'color' ); // Color
      if ( colorAttr && colorAttr !== '#010101' ) {
        newStyle += `color: ${colorAttr};`
      }
      if ( style ) {
        const colorStyle = style.match ( /[^-]color: ([^;]+);/ );
        if ( colorStyle && colorStyle[1] !== '#010101' ) {
          newStyle += `color: ${colorStyle[1]};`;
        }
      }
      /* NEW STYLE */
      if ( newStyle ) {
        str = `<span style="${newStyle}">${str}</span>`;
      }
      return str;
    }
  });

  service.keep ([ 'kbd', 'mark', 'small', 'u' ]);

  html = service.turndown ( html );

  return html.replace ( /\\((-|\*|\+) )/g, '$1' ) // Unescape unordered lists
             .replace ( /\\\[([^\]]*?)\\\] /g, '[$1] ' ) // Unescape square brackets
             .replace ( /\\\_/g, '_' ) // Unescape underscores
             .replace ( /^(-|\*|\+)\s+/gm, '$1 ' ) // Remove extra whitespace from unordered lists
             .replace ( /^((?:-|\*|\+) .*)\n\n(?=(?:-|\*|\+) )/gm, '$1\n' ) // Remove extra whitespace between unordered lists items
             .replace ( /^(\d+\.)\s+/gm, '$1 ' ) // Remove extra whitespace from ordered lists
             .replace ( /(\s*\n\s*){3,}/g, '\n\n' ) // Remove extra new lines
             .replace ( /\n\n<br \/>\n\n(-|\*|\+) /g, '\n\n$1 ' ) // Remove line breaks before lists
             .replace ( /[^\S\r\n]+$/gm, '' ) // Remmoving trailing whitespaces for each line
             .trim (); // Removing tailing/trailing whitespaces

}

/* EXPORT */

export default html2markdown;
