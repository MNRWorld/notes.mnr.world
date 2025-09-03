/**
 * Custom Drawing Tool for Editor.js
 * Canvas-based drawing tool for visual note-taking
 */

interface DrawingToolData {
  imageData: string;
  width: number;
  height: number;
}

interface DrawingToolConfig {
  [key: string]: any;
}

interface DrawingToolAPI {
  [key: string]: any;
}

export class DrawingTool {
  private api: DrawingToolAPI;
  private readOnly: boolean;
  private config: DrawingToolConfig;
  private data: DrawingToolData;
  private wrapper: HTMLElement | undefined;
  private canvas: HTMLCanvasElement | undefined;
  private ctx: CanvasRenderingContext2D | undefined;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  private resizeObserver: ResizeObserver | undefined;

  static get toolbox() {
    return {
      title: "Drawing",
      icon: '<svg width="17" height="15" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
    };
  }

  constructor({
    data,
    config,
    api,
    readOnly,
  }: {
    data: Partial<DrawingToolData>;
    config?: DrawingToolConfig;
    api: DrawingToolAPI;
    readOnly: boolean;
  }) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config || {};

    this.data = {
      imageData: data.imageData || "",
      width: data.width || 800,
      height: data.height || 400,
    };
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("drawing-tool");
    this.wrapper.style.cssText = `
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      background: #fff;
    `;

    if (this.readOnly) {
      this.wrapper.innerHTML = this.renderDrawing();
      return this.wrapper;
    }

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = `
      border: 1px solid #d1d5db;
      border-radius: 4px;
      cursor: crosshair;
      background: white;
      width: 100%;
      height: auto;
      aspect-ratio: ${this.data.width} / ${this.data.height};
    `;

    this.ctx = this.canvas.getContext("2d") || undefined;
    if (this.ctx) {
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#000000";
    }

    // Create toolbar
    const toolbar = this.createToolbar();

    // Add event listeners
    this.setupEventListeners();

    // Add canvas click listener to show toolbar
    this.canvas.addEventListener("click", () => {
      if ((toolbar as any).showToolbar) {
        (toolbar as any).showToolbar();
      }
    });

    this.wrapper.appendChild(toolbar);
    this.wrapper.appendChild(this.canvas);

    // Use ResizeObserver to handle canvas size changes
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvas);

    return this.wrapper;
  }

  private handleResize() {
    if (!this.canvas || !this.ctx) return;

    // Preserve the current drawing
    const oldImageData = this.canvas.toDataURL();

    // Update canvas internal resolution to match its display size
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Restore the drawing
    const img = new Image();
    img.onload = () => {
      if (!this.ctx || !this.canvas) return;
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      // Re-apply drawing styles
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.lineWidth = parseInt(
        (
          this.wrapper?.querySelector(
            'input[type="range"]',
          ) as HTMLInputElement
        )?.value || "2",
      );
      this.ctx.strokeStyle =
        (
          this.wrapper?.querySelector(
            'input[type="color"]',
          ) as HTMLInputElement
        )?.value || "#000000";
    };
    img.src = oldImageData;
  }

  createToolbar(): HTMLElement {
    const toolbarContainer = document.createElement("div");
    toolbarContainer.style.cssText = `
      position: relative;
      margin-bottom: 8px;
    `;

    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: linear-gradient(145deg, #ffffff, #f8fafc);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      flex-wrap: wrap;
      position: relative;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    `;

    // Hide button (cross) in top right corner
    const hideBtn = document.createElement("button");
    hideBtn.innerHTML = "×";
    hideBtn.title = "Hide Toolbar";
    hideBtn.style.cssText = `
      position: absolute;
      top: -10px;
      right: -10px;
      width: 24px;
      height: 24px;
      background: linear-gradient(145deg, #ef4444, #dc2626);
      color: white;
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
      transition: all 0.2s ease;
    `;

    hideBtn.addEventListener("mouseenter", () => {
      hideBtn.style.transform = "scale(1.1)";
      hideBtn.style.boxShadow = "0 6px 12px rgba(239, 68, 68, 0.4)";
    });

    hideBtn.addEventListener("mouseleave", () => {
      hideBtn.style.transform = "scale(1)";
      hideBtn.style.boxShadow = "0 4px 8px rgba(239, 68, 68, 0.3)";
    });

    let toolbarVisible = true;

    hideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toolbarVisible = false;
      toolbarContainer.style.display = "none";
    });

    // Brush size
    const brushSizeContainer = document.createElement("div");
    brushSizeContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const brushIcon = document.createElement("span");
    brushIcon.innerHTML = "🖌️";
    brushIcon.style.cssText = `
      font-size: 16px;
      display: flex;
      align-items: center;
    `;

    const brushSize = document.createElement("input");
    brushSize.type = "range";
    brushSize.min = "1";
    brushSize.max = "20";
    brushSize.value = "2";
    brushSize.style.cssText = `
      width: 80px;
      cursor: pointer;
    `;
    brushSize.addEventListener("input", () => {
      if (this.ctx) {
        this.ctx.lineWidth = parseInt(brushSize.value);
      }
    });

    const sizeDisplay = document.createElement("span");
    sizeDisplay.textContent = "2";
    sizeDisplay.style.cssText = `
      font-size: 12px;
      color: #6b7280;
      min-width: 20px;
      text-align: center;
    `;

    brushSize.addEventListener("input", () => {
      sizeDisplay.textContent = brushSize.value;
      if (this.ctx) {
        this.ctx.lineWidth = parseInt(brushSize.value);
      }
    });

    brushSizeContainer.appendChild(brushIcon);
    brushSizeContainer.appendChild(brushSize);
    brushSizeContainer.appendChild(sizeDisplay);

    // Color picker
    const colorContainer = document.createElement("div");
    colorContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
    `;

    const paletteIcon = document.createElement("span");
    paletteIcon.innerHTML = "🎨";
    paletteIcon.style.cssText = `
      font-size: 16px;
      display: flex;
      align-items: center;
    `;

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = "#000000";
    colorPicker.style.cssText = `
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background: none;
    `;
    colorPicker.addEventListener("input", () => {
      if (this.ctx) {
        this.ctx.strokeStyle = colorPicker.value;
      }
    });

    colorContainer.appendChild(paletteIcon);
    colorContainer.appendChild(colorPicker);

    // Clear button
    const clearBtn = document.createElement("button");
    clearBtn.innerHTML = "🗑️";
    clearBtn.title = "Clear Canvas";
    clearBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    `;
    clearBtn.addEventListener("mouseenter", () => {
      clearBtn.style.background = "#ef4444";
      clearBtn.style.borderColor = "#dc2626";
    });
    clearBtn.addEventListener("mouseleave", () => {
      clearBtn.style.background = "#f3f4f6";
      clearBtn.style.borderColor = "#d1d5db";
    });
    clearBtn.addEventListener("click", () => this.clearCanvas());

    // Undo button
    const undoBtn = document.createElement("button");
    undoBtn.innerHTML = "↶";
    undoBtn.title = "Undo";
    undoBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    `;
    undoBtn.addEventListener("mouseenter", () => {
      undoBtn.style.background = "#3b82f6";
      undoBtn.style.borderColor = "#2563eb";
      undoBtn.style.color = "white";
    });
    undoBtn.addEventListener("mouseleave", () => {
      undoBtn.style.background = "#f3f4f6";
      undoBtn.style.borderColor = "#d1d5db";
      undoBtn.style.color = "black";
    });
    undoBtn.addEventListener("click", () => this.undo());

    // Add all controls to toolbar
    toolbar.appendChild(brushSizeContainer);
    toolbar.appendChild(colorContainer);
    toolbar.appendChild(clearBtn);
    toolbar.appendChild(undoBtn);
    toolbar.appendChild(hideBtn);

    // Add toolbar to container
    toolbarContainer.appendChild(toolbar);

    // Store reference for canvas click handler
    (toolbarContainer as any).showToolbar = () => {
      if (!toolbarVisible) {
        toolbarVisible = true;
        toolbarContainer.style.display = "block";
      }
    };

    return toolbarContainer;
  }

  setupEventListeners(): void {
    if (!this.canvas || !this.ctx) return;

    // Mouse events
    this.canvas.addEventListener("mousedown", this.startDrawing.bind(this));
    this.canvas.addEventListener("mousemove", this.draw.bind(this));
    this.canvas.addEventListener("mouseup", this.stopDrawing.bind(this));
    this.canvas.addEventListener("mouseout", this.stopDrawing.bind(this));

    // Touch events for mobile
    this.canvas.addEventListener("touchstart", this.handleTouch.bind(this));
    this.canvas.addEventListener("touchmove", this.handleTouch.bind(this));
    this.canvas.addEventListener("touchend", this.stopDrawing.bind(this));
  }

  startDrawing(e: MouseEvent): void {
    if (!this.canvas) return;
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    this.lastY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
  }

  draw(e: MouseEvent): void {
    if (!this.isDrawing || !this.ctx || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const currentY =
      (e.clientY - rect.top) * (this.canvas.height / rect.height);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();

    this.lastX = currentX;
    this.lastY = currentY;

    // Save the drawing data
    this.saveDrawing();
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  handleTouch(e: TouchEvent): void {
    e.preventDefault();
    if (!this.canvas) return;
    const touch = e.touches[0];
    if (touch) {
      const mouseEvent = new MouseEvent(
        e.type === "touchstart"
          ? "mousedown"
          : e.type === "touchmove"
            ? "mousemove"
            : "mouseup",
        {
          clientX: touch.clientX,
          clientY: touch.clientY,
        },
      );
      this.canvas.dispatchEvent(mouseEvent);
    }
  }

  clearCanvas(): void {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveDrawing();
  }

  undo(): void {
    // Simplified undo - just clear for now
    // In a full implementation, you'd maintain a history stack
    this.clearCanvas();
  }

  saveDrawing(): void {
    if (!this.canvas) return;
    this.data.imageData = this.canvas.toDataURL("image/png");
    // Store canvas dimensions for consistent rendering
    this.data.width = this.canvas.width;
    this.data.height = this.canvas.height;
  }

  renderDrawing(): string {
    if (!this.data.imageData) {
      return '<div style="text-align: center; color: #9ca3af; padding: 40px;">কোন অঙ্কন নেই</div>';
    }

    return `
      <div style="text-align: center;">
        <img src="${this.data.imageData}" style="max-width: 100%; height: auto; border-radius: 4px;" alt="অঙ্কন" />
      </div>
    `;
  }

  save(): DrawingToolData {
    // Save final canvas state
    this.saveDrawing();
    return {
      imageData: this.data.imageData,
      width: this.data.width,
      height: this.data.height,
    };
  }

  destroy() {
    if (this.resizeObserver && this.canvas) {
      this.resizeObserver.unobserve(this.canvas);
    }
  }

  renderSettings(): HTMLElement {
    const wrapper = document.createElement("div");

    const sizeButton = document.createElement("div");
    sizeButton.classList.add("cdx-settings-button");
    sizeButton.innerHTML = "📏";
    sizeButton.title = "আকার পরিবর্তন";

    wrapper.appendChild(sizeButton);
    return wrapper;
  }
}

export default DrawingTool;
