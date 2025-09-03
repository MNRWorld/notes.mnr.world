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
      if (this.ctx) {
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        // Re-apply drawing styles
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = parseInt(
          (this.wrapper?.querySelector('input[type="range"]') as HTMLInputElement)
            ?.value || "2",
        );
        this.ctx.strokeStyle =
          (
            this.wrapper?.querySelector('input[type="color"]') as HTMLInputElement
          )?.value || "#000000";
      }
    };
    img.src = oldImageData;
  }

  createToolbar(): HTMLElement {
    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
      align-items: center;
      flex-wrap: wrap;
    `;

    // Brush size
    const brushSizeLabel = document.createElement("label");
    brushSizeLabel.textContent = "ব্রাশ আকার: ";
    brushSizeLabel.style.fontSize = "14px";

    const brushSize = document.createElement("input");
    brushSize.type = "range";
    brushSize.min = "1";
    brushSize.max = "20";
    brushSize.value = "2";
    brushSize.addEventListener("input", () => {
      if (this.ctx) {
        this.ctx.lineWidth = parseInt(brushSize.value);
      }
    });

    // Color picker
    const colorLabel = document.createElement("label");
    colorLabel.textContent = "রং: ";
    colorLabel.style.fontSize = "14px";

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = "#000000";
    colorPicker.addEventListener("input", () => {
      if (this.ctx) {
        this.ctx.strokeStyle = colorPicker.value;
      }
    });

    // Clear button
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "মুছুন";
    clearBtn.style.cssText = `
      padding: 6px 12px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    clearBtn.addEventListener("click", () => this.clearCanvas());

    // Undo button (simplified)
    const undoBtn = document.createElement("button");
    undoBtn.textContent = "আনডু";
    undoBtn.style.cssText = `
      padding: 6px 12px;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    undoBtn.addEventListener("click", () => this.undo());

    toolbar.appendChild(brushSizeLabel);
    toolbar.appendChild(brushSize);
    toolbar.appendChild(colorLabel);
    toolbar.appendChild(colorPicker);
    toolbar.appendChild(clearBtn);
    toolbar.appendChild(undoBtn);

    return toolbar;
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
    this.isDrawing = true;
    const rect = this.canvas!.getBoundingClientRect();
    this.lastX = (e.clientX - rect.left) * (this.canvas!.width / rect.width);
    this.lastY = (e.clientY - rect.top) * (this.canvas!.height / rect.height);
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
      this.canvas!.dispatchEvent(mouseEvent);
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
