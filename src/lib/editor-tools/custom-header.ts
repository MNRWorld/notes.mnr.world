/**
 * Custom Header Tool with Professional Navigation
 * Automatically creates paragraph after header on Enter
 */

import Header from "@editorjs/header";

export class CustomHeader extends Header {
  private headerElement: HTMLElement | null = null;

  constructor({ data, config, api, readOnly }: any) {
    super({ data, config, api, readOnly });
  }

  render() {
    const headerElement = super.render();
    this.headerElement = headerElement;
    
    // Add comprehensive event blocking
    if (headerElement) {
      const textElement = headerElement.querySelector('.ce-header__text');
      if (textElement) {
        // Block all Enter-related events
        const blockEnter = (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        };

        textElement.addEventListener('keydown', blockEnter, true);
        textElement.addEventListener('keypress', blockEnter, true);
        textElement.addEventListener('keyup', blockEnter, true);
        
        // Block paste with newlines
        textElement.addEventListener('paste', (e: ClipboardEvent) => {
          e.preventDefault();
          const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
          const cleanPaste = paste.replace(/[\r\n\v\f]/g, ' ').trim();
          document.execCommand('insertText', false, cleanPaste);
          return false;
        });

        // Monitor content changes and remove any line breaks
        const observer = new MutationObserver(() => {
          const content = textElement.innerHTML;
          const cleanContent = content.replace(/<br\s*\/?>/gi, '').replace(/[\r\n\v\f]/g, ' ');
          if (content !== cleanContent) {
            textElement.innerHTML = cleanContent;
          }
        });

        observer.observe(textElement, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    }
    
    return headerElement;
  }

  onKeyDown(e: KeyboardEvent): boolean | void {
    if (e.key === "Enter" || e.keyCode === 13 || e.which === 13) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
    
    return super.onKeyDown ? super.onKeyDown(e) : true;
  }

  onPaste(e: ClipboardEvent): boolean | void {
    e.preventDefault();
    const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
    const cleanPaste = paste.replace(/[\r\n\v\f]/g, ' ').trim();
    document.execCommand('insertText', false, cleanPaste);
    return false;
  }

  static get toolbox() {
    return {
      title: "Heading",
      icon: Header.toolbox.icon,
    };
  }
}
