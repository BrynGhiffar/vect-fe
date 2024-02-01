import { MutableRefObject, useRef, useEffect, FC, MouseEvent, MouseEventHandler } from "react";
import { CanvasDraw, CanvasProps, MouseButton, MouseContext, MouseScroll } from "./types";
import { Vec2 } from "../../utility/Vec2";


function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    
    const { width, height } = canvas.getBoundingClientRect()
    if (canvas.width !== width || canvas.height !== height) {
      const { devicePixelRatio:ratio = 1 } = window
      canvas.width = width * ratio
      canvas.height = height * ratio
      ctx.scale(ratio, ratio);
      return { screenHeight: height, screenWidth: width };
       // here you can return some usefull information like delta width and delta height instead of just true
      // this information can be used in the next redraw...
    }

    return { screenHeight: height, screenWidth: width };
  }

const useCanvas = (draw: CanvasDraw) => {
    const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return () => {};
        const context = canvas.getContext("2d");
        if (!context) return () => {};
        let frameId: number | null = null;
        const render = () => {
            const screenDim = resizeCanvasToDisplaySize(canvas, context);
            draw(context, { ...screenDim });
            frameId = window.requestAnimationFrame(render);
        }
        render();
        return () => {
            if (!frameId) return;
            window.cancelAnimationFrame(frameId);
        }
    }, [draw]);
    return canvasRef;
};

const mapMouseButtonNumber = (mouseButtonNumber: number): MouseButton => {
    if (mouseButtonNumber === 0) return MouseButton.LEFT;
    return MouseButton.RIGHT;
}

const Canvas: FC<CanvasProps> = props => {
    const draw = props.draw ?? (() => {});
    const canvasRef = useCanvas(draw);
    const createMouseContext = (event: MouseEvent): MouseContext => {
        const button: MouseButton = mapMouseButtonNumber(event.button);
        // const { devicePixelRatio:ratio=1 } = window
        const ctx: MouseContext = {
            pos: Vec2.new(
                event.clientX,
                event.clientY
            ),
            button: button
        };
        return ctx;
    }
    const mouseDownHandler: MouseEventHandler = (event) => {
        const button: MouseButton = mapMouseButtonNumber(event.button);
        
        // cancel mouse right click presses.
        if (button === MouseButton.RIGHT) return;

        const ctx = createMouseContext(event);
        if (props.onMouseDown) {
            props.onMouseDown(ctx)
        }
    };

    const mouseUpHandler: MouseEventHandler = (event) => {
        const ctx = createMouseContext(event);
        if (props.onMouseUp) {
            props.onMouseUp(ctx);
        }
    }

    const mouseMoveHandler: MouseEventHandler = (event) => {
        const ctx = createMouseContext(event);
        if (props.onMouseMove) {
            props.onMouseMove(ctx);
        }
    }

    const mouseLeftHandler: MouseEventHandler = (event) => {
        const ctx = createMouseContext(event);
        if (props.onMouseUp) {
            props.onMouseUp(ctx);
        }
    };

    useEffect(() => {
        const onMouseWheel = props.onMouseWheel;
        const canvas = canvasRef.current;
        if (onMouseWheel && canvas) {
            const listener = (event: WheelEvent) => {
                if (event.deltaY < 0) {
                    onMouseWheel({ scroll: MouseScroll.SCROLL_UP });
                } else {
                    onMouseWheel({ scroll: MouseScroll.SCROLL_DOWN });
                }
            }
            canvas.addEventListener('wheel', listener);
            return () => {
                canvas.removeEventListener('wheel', listener);
            }
        }
    }, [props.onMouseWheel, canvasRef])

    return (
        <canvas
            onMouseLeave={mouseLeftHandler}
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onMouseMove={mouseMoveHandler}
            ref={canvasRef}
        />
    );
}

export default Canvas;