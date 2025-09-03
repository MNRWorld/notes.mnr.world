/**
 * Custom Math Tool for Editor.js
 * Supports LaTeX mathematical expressions using KaTeX
 */

import katex from "katex";

interface MathToolData {
  latex: string;
}

interface MathToolConfig {
  [key: string]: any;
}

interface MathToolAPI {
  [key: string]: any;
}

export class MathTool {
  private api: MathToolAPI;
  private readOnly: boolean;
  private config: MathToolConfig;
  private data: MathToolData;
  private wrapper: HTMLElement | undefined;
  private settings: Array<{ name: string; icon: string; title: string }>;

  static get toolbox() {
    return {
      title: "Math",
      icon: '<svg width="17" height="15" viewBox="0 0 336 276"><path d="M288 0h-76v64h32v16h-32v64h76V80h-32V64h32V0zM160 80h-32V64h32V0H84v64h32v16H84v64h76V80z"/></svg>',
    };
  }

  constructor({
    data,
    config,
    api,
    readOnly,
  }: {
    data: Partial<MathToolData>;
    config?: MathToolConfig;
    api: MathToolAPI;
    readOnly: boolean;
  }) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config || {};

    this.data = {
      latex: data.latex || "",
    };

    this.wrapper = undefined;
    this.settings = [
      {
        name: "inline",
        icon: "I",
        title: "ইনলাইন",
      },
      {
        name: "block",
        icon: "B",
        title: "ব্লক",
      },
    ];
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("math-tool");

    if (this.readOnly) {
      this.wrapper.innerHTML = this.renderMath();
      return this.wrapper;
    }

    const input = document.createElement("textarea");
    input.placeholder = "LaTeX সূত্র লিখুন... (যেমন: E = mc^2)";
    input.value = this.data.latex;
    input.style.cssText = `
      width: 100%;
      min-height: 60px;
      padding: 10px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      resize: vertical;
    `;

    const preview = document.createElement("div");
    preview.style.cssText = `
      margin-top: 10px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 6px;
      min-height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    this.updatePreview(preview, input.value);

    input.addEventListener("input", () => {
      this.data.latex = input.value;
      this.updatePreview(preview, input.value);
    });

    this.wrapper.appendChild(input);
    this.wrapper.appendChild(preview);

    return this.wrapper;
  }

  updatePreview(preview: HTMLElement, latex: string): void {
    try {
      if (latex.trim()) {
        const rendered = katex.renderToString(latex, {
          displayMode: true,
          throwOnError: false,
          errorColor: "#ff0000",
        });
        preview.innerHTML = rendered;
      } else {
        preview.innerHTML =
          '<span style="color: #9ca3af;">গণিতের সূত্রের প্রিভিউ এখানে দেখানো হবে</span>';
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "অজানা ত্রুটি";
      preview.innerHTML = `<span style="color: #ef4444;">সূত্রে ত্রুটি: ${errorMessage}</span>`;
    }
  }

  renderMath(): string {
    if (!this.data.latex) {
      return '<div style="text-align: center; color: #9ca3af; padding: 20px;">কোন গণিতের সূত্র নেই</div>';
    }

    try {
      const rendered = katex.renderToString(this.data.latex, {
        displayMode: true,
        throwOnError: false,
      });

      return `
        <div style="text-align: center; padding: 20px;">
          ${rendered}
        </div>
      `;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "অজানা ত্রুটি";
      return `<div style="text-align: center; color: #ef4444; padding: 20px;">সূত্রে ত্রুটি: ${errorMessage}</div>`;
    }
  }

  save(): MathToolData {
    return {
      latex: this.data.latex,
    };
  }

  static get pasteConfig() {
    return {
      tags: ["SPAN"],
      patterns: {
        latex: /\$\$(.+?)\$\$/,
      },
    };
  }

  onPaste(event: any): void {
    const { data } = event.detail;

    if (data.latex) {
      this.data.latex = data.latex;
    }
  }

  renderSettings(): HTMLElement {
    const wrapper = document.createElement("div");

    this.settings.forEach((tune) => {
      const button = document.createElement("div");
      button.classList.add("cdx-settings-button");
      button.innerHTML = tune.icon;
      button.title = tune.title;

      wrapper.appendChild(button);
    });

    return wrapper;
  }
}

export default MathTool;
