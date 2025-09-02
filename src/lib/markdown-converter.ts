/**
 * Markdown Export/Import Utility
 * Converts between Editor.js format and Markdown
 */

import { EditorOutputData, OutputBlockData } from './types';

export class MarkdownConverter {
  /**
   * Convert Editor.js content to Markdown
   */
  static toMarkdown(content: EditorOutputData): string {
    if (!content.blocks || content.blocks.length === 0) {
      return '';
    }

    const markdownLines: string[] = [];

    content.blocks.forEach((block) => {
      const markdown = this.blockToMarkdown(block);
      if (markdown) {
        markdownLines.push(markdown);
      }
    });

    return markdownLines.join('\n\n');
  }

  /**
   * Convert individual block to Markdown
   */
  private static blockToMarkdown(block: OutputBlockData): string {
    switch (block.type) {
      case 'paragraph':
        return block.data.text || '';

      case 'header':
        const level = block.data.level || 1;
        const headerPrefix = '#'.repeat(level);
        return `${headerPrefix} ${block.data.text || ''}`;

      case 'list':
        if (!block.data.items || !Array.isArray(block.data.items)) return '';
        const listType = block.data.style === 'ordered' ? 'ordered' : 'unordered';
        return block.data.items.map((item: string, index: number) => {
          const prefix = listType === 'ordered' ? `${index + 1}. ` : '- ';
          return `${prefix}${item}`;
        }).join('\n');

      case 'checklist':
        if (!block.data.items || !Array.isArray(block.data.items)) return '';
        return block.data.items.map((item: { text: string; checked: boolean }) => {
          const checkbox = item.checked ? '[x]' : '[ ]';
          return `- ${checkbox} ${item.text}`;
        }).join('\n');

      case 'quote':
        return `> ${block.data.text || ''}`;

      case 'code':
        const language = block.data.language || '';
        return `\`\`\`${language}\n${block.data.code || ''}\n\`\`\``;

      case 'table':
        if (!block.data.content || !Array.isArray(block.data.content)) return '';
        const rows = block.data.content;
        if (rows.length === 0) return '';

        const tableRows = rows.map((row: string[]) => {
          return `| ${row.join(' | ')} |`;
        });

        // Add header separator if there are rows
        if (tableRows.length > 0) {
          const headerSeparator = `| ${rows[0].map(() => '---').join(' | ')} |`;
          tableRows.splice(1, 0, headerSeparator);
        }

        return tableRows.join('\n');

      case 'embed':
        if (block.data.source) {
          return `[Embedded Content](${block.data.source})`;
        }
        return '';

      default:
        // For unknown block types, try to extract text
        if (block.data.text) {
          return block.data.text;
        }
        return '';
    }
  }

  /**
   * Convert Markdown to Editor.js format
   */
  static fromMarkdown(markdown: string): EditorOutputData {
    const lines = markdown.split('\n');
    const blocks: OutputBlockData[] = [];
    let currentBlock: string[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          // Start of code block
          inCodeBlock = true;
          codeLanguage = line.substring(3).trim();
          currentBlock = [];
        } else {
          // End of code block
          inCodeBlock = false;
          blocks.push({
            type: 'code',
            data: {
              code: currentBlock.join('\n'),
              language: codeLanguage
            }
          });
          currentBlock = [];
          codeLanguage = '';
        }
        continue;
      }

      if (inCodeBlock) {
        currentBlock.push(lines[i]); // Preserve original spacing in code
        continue;
      }

      // Handle headers
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.substring(level).trim();
        blocks.push({
          type: 'header',
          data: {
            text,
            level: Math.min(level, 4)
          }
        });
        continue;
      }

      // Handle quotes
      if (line.startsWith('>')) {
        const text = line.substring(1).trim();
        blocks.push({
          type: 'quote',
          data: { text }
        });
        continue;
      }

      // Handle unordered lists
      if (line.match(/^[\-\*\+]\s/)) {
        const text = line.substring(2).trim();
        
        // Check if it's a checklist item
        const checklistMatch = text.match(/^\[([x\s])\]\s(.+)$/);
        if (checklistMatch) {
          const checked = checklistMatch[1] === 'x';
          const itemText = checklistMatch[2];
          
          // Find or create checklist block
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock && lastBlock.type === 'checklist') {
            lastBlock.data.items.push({ text: itemText, checked });
          } else {
            blocks.push({
              type: 'checklist',
              data: {
                items: [{ text: itemText, checked }]
              }
            });
          }
        } else {
          // Regular list item
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock && lastBlock.type === 'list' && lastBlock.data.style === 'unordered') {
            lastBlock.data.items.push(text);
          } else {
            blocks.push({
              type: 'list',
              data: {
                style: 'unordered',
                items: [text]
              }
            });
          }
        }
        continue;
      }

      // Handle ordered lists
      if (line.match(/^\d+\.\s/)) {
        const text = line.replace(/^\d+\.\s/, '');
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock && lastBlock.type === 'list' && lastBlock.data.style === 'ordered') {
          lastBlock.data.items.push(text);
        } else {
          blocks.push({
            type: 'list',
            data: {
              style: 'ordered',
              items: [text]
            }
          });
        }
        continue;
      }

      // Handle regular paragraphs
      if (line.length > 0) {
        blocks.push({
          type: 'paragraph',
          data: { text: line }
        });
      }
    }

    return {
      version: '2.28.2',
      time: Date.now(),
      blocks
    };
  }

  /**
   * Export note as downloadable markdown file
   */
  static exportAsFile(title: string, content: EditorOutputData): void {
    const markdown = this.toMarkdown(content);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'নোট'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Import markdown from file
   */
  static async importFromFile(file: File): Promise<{ title: string; content: EditorOutputData }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const markdown = event.target?.result as string;
          const content = this.fromMarkdown(markdown);
          
          // Extract title from filename or first header
          let title = file.name.replace(/\.md$/, '');
          
          // Look for first header as title
          const firstHeader = content.blocks.find(block => block.type === 'header');
          if (firstHeader && firstHeader.data.text) {
            title = firstHeader.data.text;
          }
          
          resolve({ title, content });
        } catch (error) {
          reject(new Error('মার্কডাউন ফাইল পড়তে সমস্যা হয়েছে।'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ফাইল পড়তে ত্রুটি।'));
      };
      
      reader.readAsText(file, 'utf-8');
    });
  }
}
