import { Vec2 } from "../../utility/Vec2";

export type ScreenDim = { screenHeight: number, screenWidth: number };

export type CanvasDraw = (context: CanvasRenderingContext2D, screenDim: ScreenDim) => void;

export enum MouseButton {
    RIGHT = "RIGHT_MB",
    LEFT = "LEFT_MB"
}

export enum MouseScroll {
    SCROLL_UP = "SCROLL_UP",
    SCROLL_DOWN = "SCROLL_DOWN"
}

export type MouseContext = {
    pos: Vec2,
    button: MouseButton
}

export type MouseWheel = {
    scroll: MouseScroll,
}

export type CanvasProps = {
    onMouseDown?: (ctx: MouseContext) => void;
    onMouseMove?: (ctx: MouseContext) => void;
    onMouseUp?: (ctx: MouseContext) => void;
    onMouseWheel?: (ctx: MouseWheel) => void;
    draw?: CanvasDraw
}