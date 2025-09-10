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

interface ToolbarContainer extends HTMLElement {
  showToolbar?: () => void;
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
      border-radius: 12px;
      padding: 12px;
      background: linear-gradient(180deg,#ffffff 0%, #fbfdff 100%);
      box-shadow: 0 6px 18px rgba(15,23,42,0.04);
      border: 1px solid rgba(15,23,42,0.04);
    `;

    if (this.readOnly) {
      this.wrapper.innerHTML = this.renderDrawing();
      return this.wrapper;
    }

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = `
      border-radius: 10px;
      cursor: crosshair;
      background: white;
      width: 100%;
      height: auto;
      aspect-ratio: ${this.data.width} / ${this.data.height};
      border: 1px solid rgba(2,6,23,0.06);
      box-shadow: inset 0 -1px 0 rgba(2,6,23,0.02);
      min-height: 220px;
      display: block;
    `;

    this.ctx = this.canvas.getContext("2d") || undefined;
    if (this.ctx) {
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#000000";
    }

    // Create toolbar
    const toolbar = this.createToolbar() as ToolbarContainer;

    // Add event listeners
    this.setupEventListeners();

    // Add canvas click listener to show toolbar
    this.canvas.addEventListener("click", () => {
      if (toolbar.showToolbar) {
        toolbar.showToolbar();
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
        (this.wrapper?.querySelector('input[type="range"]') as HTMLInputElement)
          ?.value || "2",
      );
      this.ctx.strokeStyle =
        (this.wrapper?.querySelector('input[type="color"]') as HTMLInputElement)
          ?.value || "#000000";
    };
    img.src = oldImageData;
  }

  createToolbar(): HTMLElement {
    const toolbarContainer = document.createElement("div") as ToolbarContainer;
    toolbarContainer.style.cssText = `
      position: relative;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    `;

    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: rgba(255,255,255,0.8);
      border-radius: 999px;
      border: 1px solid rgba(2,6,23,0.04);
      align-items: center;
    `;

    // Hide button (cross) in top right corner
    const hideBtn = document.createElement("button");
    hideBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    hideBtn.title = "Hide Toolbar";
    hideBtn.style.cssText = `
      width: 36px;
      height: 36px;
      background: white;
      border: 1px solid rgba(2,6,23,0.04);
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #475569;
      transition: transform .12s ease, box-shadow .12s ease;
    `;

    hideBtn.addEventListener("mouseenter", () => {
      hideBtn.style.transform = "translateY(-2px)";
      hideBtn.style.boxShadow = "0 8px 20px rgba(2,6,23,0.06)";
    });

    hideBtn.addEventListener("mouseleave", () => {
      hideBtn.style.transform = "translateY(0)";
      hideBtn.style.boxShadow = "none";
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
    brushIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21c0-1.657 2.239-3 5-3s5 1.343 5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16.24 7.76 6.34 17.66" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.36 5.64a3 3 0 0 0 0-4.24 3 3 0 0 0-4.24 0L8 7.52v0L3 12.52v0l5 5 5-5 5.36-5.36z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    brushIcon.style.cssText = `display:flex;align-items:center;color:#0f172a;`;

    const brushSize = document.createElement("input");
    brushSize.type = "range";
    brushSize.min = "1";
    brushSize.max = "20";
    brushSize.value = "2";
    brushSize.style.cssText = `
      width: 110px;
      cursor: pointer;
      appearance: none;
      height: 6px;
      border-radius: 999px;
      background: linear-gradient(90deg,#eff6ff,#e9fdf8);
      outline: none;
      accent-color: #2563eb;
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
      color: #64748b;
      min-width: 28px;
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
    paletteIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22c4.97 0 9-4.03 9-9 0-1.98-.64-3.81-1.72-5.28C17.7 4.75 15.02 3 12 3 8.13 3 5 6.13 5 10c0 1.7.53 3.27 1.42 4.57C7.95 16.85 9.87 18 12 18c.83 0 1.5.67 1.5 1.5S12.83 21 12 21" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    paletteIcon.style.cssText = `display:flex;align-items:center;color:#0f172a;`;

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = "#000000";
    colorPicker.style.cssText = `
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      padding: 0;
      background: transparent;
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
    clearBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    clearBtn.title = "Clear Canvas";
    clearBtn.style.cssText = `
      width: 40px;
      height: 40px;
      background: white;
      border: 1px solid rgba(2,6,23,0.04);
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #0f172a;
      transition: transform .12s ease, box-shadow .12s ease;
    `;
    clearBtn.addEventListener("mouseenter", () => {
      clearBtn.style.transform = "translateY(-2px)";
      clearBtn.style.boxShadow = "0 10px 30px rgba(2,6,23,0.06)";
    });
    clearBtn.addEventListener("mouseleave", () => {
      clearBtn.style.transform = "translateY(0)";
      clearBtn.style.boxShadow = "none";
    });
    clearBtn.addEventListener("click", () => this.clearCanvas());

    // Undo button
    const undoBtn = document.createElement("button");
    undoBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 17H5v-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20 12a8 8 0 1 0-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    undoBtn.title = "Undo";
    undoBtn.style.cssText = `
      width: 40px;
      height: 40px;
      background: white;
      border: 1px solid rgba(2,6,23,0.04);
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #0f172a;
      transition: transform .12s ease, box-shadow .12s ease;
    `;
    undoBtn.addEventListener("mouseenter", () => {
      undoBtn.style.transform = "translateY(-2px)";
      undoBtn.style.boxShadow = "0 10px 30px rgba(2,6,23,0.06)";
    });
    undoBtn.addEventListener("mouseleave", () => {
      undoBtn.style.transform = "translateY(0)";
      undoBtn.style.boxShadow = "none";
    });
    undoBtn.addEventListener("click", () => this.undo());

    // Add all controls to toolbar
    toolbar.appendChild(brushSizeContainer);
    toolbar.appendChild(colorContainer);
    toolbar.appendChild(clearBtn);
    toolbar.appendChild(undoBtn);
    // place hide button at the end (but visually separated)
    const endControls = document.createElement("div");
    endControls.style.cssText = "display:flex;gap:8px;align-items:center;";
    endControls.appendChild(hideBtn);
    toolbarContainer.appendChild(toolbar);
    toolbarContainer.appendChild(endControls);

    // Add toolbar to container
    // Store reference for canvas click handler
    toolbarContainer.showToolbar = () => {
      if (!toolbarVisible) {
        toolbarVisible = true;
        toolbarContainer.style.display = "flex";
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
