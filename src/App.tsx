import { useCallback, useRef } from "react";
import Canvas from "./components/canvas"
import { CanvasDraw, MouseContext, MouseScroll, MouseWheel } from "./components/canvas/types";
import "./css/canvas.css";
import { Vec2 } from "./utility/Vec2";
import Toolbar from "./components/Toolbar";

class Circle {
  pos: Vec2;
  reg: {
    prevMousePos: Vec2,
    prevPos: Vec2
  };
  state: "RESIZE" | "NORMAL";
  static resizeHandleScreenSize: number = 5;
  radius: number;
  dragging: boolean;
  resizing: boolean;

  constructor(x: number = 0, y: number = 0) {
    this.pos = Vec2.new(x, y);
    this.state = "NORMAL";
    this.reg = { 
      prevMousePos: Vec2.new(0, 0), 
      prevPos: Vec2.new(x, y) 
    };
    this.radius = 25;
    this.dragging = false;
    this.resizing = false;
  }

  canDrag(mousePos: Vec2) {
    return mousePos.dist(this.pos) <= this.radius;
  }

  canResize(mousePos: Vec2) {
    const resizeHandlePos = this.pos.add(Vec2.new(this.radius, 0));
    const closeEnough = mousePos.dist(resizeHandlePos) <= Circle.resizeHandleScreenSize;
    const isModeResize = this.state === "RESIZE";
    return closeEnough && isModeResize
  }

  onMouseDown(mousePos: Vec2) {
    if (this.canResize(mousePos)) {
      this.resizing = true;
      return;
    }
    if (this.canDrag(mousePos)) {
      this.dragging = true;
      this.reg.prevMousePos = mousePos.copy();
      this.reg.prevPos = this.pos.copy();
    }
  }

  onMouseMove(mousePos: Vec2) {
    if (this.resizing) {
      const newRad = mousePos.sub(this.pos).mag();
      this.radius = newRad;
      return true;
    }
    if (this.dragging) {
      this.pos = mousePos.sub(this.reg.prevMousePos).add(this.reg.prevPos);
      return true;
    }
    return false;
  }
  
  onMouseUp() {
    this.dragging = false;
    this.resizing = false;
  }
}

class Grid {
  cellSize: number;
  columnCount: number;
  rowCount: number;
  constructor() {
    this.columnCount = 10;
    this.rowCount = 10;
    this.cellSize = 50;
  }
}

class RenderingEngine {
  circles: Circle[];
  grid: Grid;
  mouseDown: boolean;
  lastMousePos: Vec2;
  viewOffset: Vec2;
  lastViewOffset: Vec2;
  currentMousePos: Vec2;
  screenWidth: number;
  screenHeight: number;
  screenScale: number;

  constructor() {
    this.screenWidth = 0;
    this.screenHeight = 0;
    this.screenScale = 1;


    this.currentMousePos = Vec2.zero();
    this.lastMousePos = Vec2.zero();
    this.viewOffset = Vec2.zero();
    this.lastViewOffset = Vec2.zero();


    this.mouseDown = false;
    this.grid = new Grid();
    this.circles = [
      new Circle(500, 500),
      // new Circle(0, 0),
      new Circle(600, 600)
    ];
  }

  screenToCanvas(pos: Vec2) {
    return pos.sub(this.viewOffset).scale(1 / this.screenScale);
  }

  canvasToScreen(canvasPos: Vec2) {
    return canvasPos.scale(this.screenScale).add(this.viewOffset);
  }

  onMouseDown(ctx: MouseContext) {
    this.mouseDown = true;
    this.lastMousePos = ctx.pos.copy();
    this.lastViewOffset = this.viewOffset.copy();


    const mousePos = this.screenToCanvas(ctx.pos);
    this.circles.forEach(circle => {
      if (!(circle.canDrag(mousePos) || circle.canResize(mousePos))) return;
      circle.onMouseDown(mousePos);
    });
  }

  onMouseScroll(wheel: MouseWheel) {
    if (wheel.scroll === MouseScroll.SCROLL_DOWN && this.screenScale <= 0.8) return;
    if (wheel.scroll === MouseScroll.SCROLL_UP && this.screenScale >= 2) return;
    const oldMousePos = this.screenToCanvas(this.currentMousePos);
    if (wheel.scroll === MouseScroll.SCROLL_UP) {
      this.screenScale *= 1.1;
    } else {
      this.screenScale *= 0.9;
    }
    // adjust offset
    const mousePosChange = this.canvasToScreen(oldMousePos).sub(this.currentMousePos);
    this.viewOffset = this.viewOffset.sub(mousePosChange);
  }

  onMouseMove(ctx: MouseContext) {
    this.currentMousePos = ctx.pos.copy();
    const mousePos = this.screenToCanvas(ctx.pos);
    for (const circle of this.circles) {
      const moving = circle.onMouseMove(mousePos);
      if (moving) return;
    }

    if (this.mouseDown) {
      const mouseDiff = ctx.pos.sub(this.lastMousePos);
      this.viewOffset = this.lastViewOffset.add(mouseDiff);
    }
  }

  onMouseUp() {
    this.mouseDown = false;
    for (const circle of this.circles) {
      circle.onMouseUp();
    }
  }

  setNormalMode() {
    this.circles.forEach(c => c.state = "NORMAL");
  }

  setResizeMode() {
    this.circles.forEach(c => c.state = "RESIZE");
  }

  renderSimple(ctx: CanvasRenderingContext2D) {
    const renderCircle = (
      data: {
        x: number,
        y: number,
        r: number,
        fill?: string,
        shadow?: {
          color: string,
          blur: number
        },
        stroke?: {
          color: string,
          width: number,
        }
      }
    ) => {
      const shadow = data.shadow;
      const stroke = data.stroke;
      if (shadow) {
        ctx.shadowColor = shadow.color;
        ctx.shadowBlur = shadow.blur;
      }
      if (stroke) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      }
      ctx.fillStyle = data.fill ?? 'black';
      ctx.beginPath();
      ctx.arc(data.x, data.y, data.r, 0, 2 * Math.PI);
      ctx.fill();
      if (shadow) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
      if (stroke) {
        ctx.stroke();
      }
    }

    return {
      circle: renderCircle
    }
  }

  renderCircle(circle: Circle, ctx: CanvasRenderingContext2D) {
    const renderSimple = this.renderSimple(ctx);
    const screenCirclePos = this.canvasToScreen(circle.pos);
    const pX = screenCirclePos.x();
    const pY = screenCirclePos.y();
    const r = circle.radius * this.screenScale;
    renderSimple.circle({ x: pX, y: pY, r, fill: 'black' });
    if (circle.state === "RESIZE") {
      renderSimple.circle({ 
        x: pX + r, 
        y: pY, 
        r: Circle.resizeHandleScreenSize, 
        fill: "white", 
        shadow: {
          color: 'black', 
          blur: 5 
        },
        stroke: {
          color: "#0c8ce9",
          width: 1.5,
        }
      });
    }

  }

  renderGrid(grid: Grid, ctx: CanvasRenderingContext2D) {
    const screenStart = this.canvasToScreen(Vec2.zero());
    const screenSource = Vec2.zero();
    const screenDest = Vec2.new(ctx.canvas.width, ctx.canvas.height);

    const screenCellSize = grid.cellSize * this.screenScale;
    ctx.strokeStyle = "rgba(0, 0, 0, 1)"
    const initialX = Math.max(screenStart.x(), Math.floor((screenSource.x() - screenStart.x()) / screenCellSize) * screenCellSize + screenStart.x());
    const initialY = Math.max(screenStart.y(), Math.floor((screenSource.y() - screenStart.y()) / screenCellSize) * screenCellSize + screenStart.y());
    ctx.lineWidth = 0.5;
    let x = initialX;
    while (x <= screenDest.x()) {
      ctx.beginPath();
      ctx.moveTo(x, screenSource.y());
      ctx.lineTo(x, screenDest.y());
      ctx.stroke();
      x += screenCellSize;
    }
    x = initialX - screenCellSize;
    while (x >= 0) {
      ctx.beginPath();
      ctx.moveTo(x, screenSource.y());
      ctx.lineTo(x, screenDest.y());
      ctx.stroke();
      x -= screenCellSize;  
    }

    let y = initialY;
    while (y <= screenDest.y()) {
      ctx.beginPath();
      ctx.moveTo(screenSource.x(), y);
      ctx.lineTo(screenDest.x(), y);
      ctx.stroke();
      y += screenCellSize;
    }
    
    y = initialY - screenCellSize;
    while (y >= 0) {
      ctx.beginPath();
      ctx.moveTo(screenSource.x(), y);
      ctx.lineTo(screenDest.x(), y);
      ctx.stroke();
      y -= screenCellSize;
    }
  }


  render(ctx: CanvasRenderingContext2D) {
    this.screenHeight = ctx.canvas.height;
    this.screenWidth = ctx.canvas.width;

    if (this.mouseDown) {
      ctx.canvas.style.cursor = "grabbing";
    } else {
      ctx.canvas.style.cursor = "initial";
    }

    const canResize = this.circles.some(c => c.canResize(this.screenToCanvas(this.currentMousePos)));
    if (canResize) {
      ctx.canvas.style.cursor = "ew-resize"
    }


    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.renderGrid(this.grid, ctx)
    for (let i = this.circles.length - 1; i >= 0; i--) {
      this.renderCircle(this.circles[i], ctx);
    }
  }
}

const useRenderingEngine = () => {
  const renderingEngine = useRef(new RenderingEngine());

  const onMouseMove = useCallback((ctx: MouseContext) => {
    renderingEngine.current.onMouseMove(ctx);
  }, []);

  const onMouseDown = useCallback((ctx: MouseContext) => {
    renderingEngine.current.onMouseDown(ctx);
  }, []);

  const onMouseUp = useCallback(() => {
    renderingEngine.current.onMouseUp();
  }, []);

  const onMouseWheel = useCallback((wheel: MouseWheel) => {
    renderingEngine.current.onMouseScroll(wheel);
  }, []);

  const setResizeMode = useCallback(() => {
    renderingEngine.current.setResizeMode();
  }, []);

  const setNormalMode = useCallback(() => {
    renderingEngine.current.setNormalMode();
  }, []);
  
  const draw: CanvasDraw = useCallback((ctx) => {
    renderingEngine.current.render(ctx);
  }, []);

  return { draw, onMouseMove, onMouseUp, onMouseDown, onMouseWheel, setResizeMode, setNormalMode };
}

function App() {
  const { 
    draw, 
    onMouseMove, 
    onMouseDown, 
    onMouseUp, 
    onMouseWheel,
    setResizeMode,
    setNormalMode 
  } = useRenderingEngine();

  return (
    <>
      <Toolbar
        {...{ setNormalMode, setResizeMode }}
      />
      <Canvas
        draw={draw}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseWheel={onMouseWheel}
      />
    </>
  )
}

export default App
