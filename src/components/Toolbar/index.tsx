import { FC, ReactNode, useState } from "react";
import "@/css/toolbar.css";

const PointerSVG = () => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg">
        <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M3.3572 3.23397C3.66645 2.97447 4.1014 2.92638 4.45988 3.11204L20.7851 11.567C21.1426 11.7522 21.3542 12.1337 21.322 12.5351C21.2898 12.9364 21.02 13.2793 20.6375 13.405L13.7827 15.6586L10.373 22.0179C10.1828 22.3728 9.79826 22.5789 9.39743 22.541C8.9966 22.503 8.65762 22.2284 8.53735 21.8441L3.04564 4.29872C2.92505 3.91345 3.04794 3.49346 3.3572 3.23397ZM5.67123 5.99173L9.73507 18.9752L12.2091 14.361C12.3304 14.1347 12.5341 13.9637 12.7781 13.8835L17.7518 12.2484L5.67123 5.99173Z"
            fill="currentColor"
        />
    </svg>
);

const ResizeSVG = () => (
    <svg 
        viewBox="0 0 32 32" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg"
    >
        
        <g 
            fill="none" fillRule="evenodd">
            <g transform="translate(-256.000000, -879.000000)" fill="currentColor">
                <path d="M284,909 C282.896,909 282,908.104 282,907 C282,905.896 282.896,905 284,905 C285.104,905 286,905.896 286,907 C286,908.104 285.104,909 284,909 L284,909 Z M280.142,906 L263.858,906 C263.496,904.6 262.401,903.505 261,903.142 L261,886.858 C262.401,886.496 263.496,885.4 263.858,884 L280.142,884 C280.504,885.4 281.599,886.496 283,886.858 L283,903.142 C281.599,903.505 280.504,904.6 280.142,906 L280.142,906 Z M260,909 C258.896,909 258,908.104 258,907 C258,905.896 258.896,905 260,905 C261.104,905 262,905.896 262,907 C262,908.104 261.104,909 260,909 L260,909 Z M258,883 C258,881.896 258.896,881 260,881 C261.104,881 262,881.896 262,883 C262,884.104 261.104,885 260,885 C258.896,885 258,884.104 258,883 L258,883 Z M284,881 C285.104,881 286,881.896 286,883 C286,884.104 285.104,885 284,885 C282.896,885 282,884.104 282,883 C282,881.896 282.896,881 284,881 L284,881 Z M285,903.142 L285,886.858 C286.722,886.413 288,884.862 288,883 C288,880.791 286.209,879 284,879 C282.138,879 280.587,880.278 280.142,882 L263.858,882 C263.413,880.278 261.862,879 260,879 C257.791,879 256,880.791 256,883 C256,884.862 257.278,886.413 259,886.858 L259,903.142 C257.278,903.588 256,905.139 256,907 C256,909.209 257.791,911 260,911 C261.862,911 263.413,909.723 263.858,908 L280.142,908 C280.587,909.723 282.138,911 284,911 C286.209,911 288,909.209 288,907 C288,905.139 286.722,903.588 285,903.142 L285,903.142 Z"/>
            </g>
        </g>
    </svg>
);
    

type ToolbarButtonProps = {
    id: string,
    content: ReactNode,
    active?: boolean,
    onClick?: () => void
}

const ToolbarButton: FC<ToolbarButtonProps> = (props) => {
    return (
        <div 
            className={`toolbar-btn ${props.active && "active"} ${props.id}`}
            onClick={props.onClick}
        >
            {props.content}
        </div>
    )
}

type ToolbarProps = {
    setNormalMode?: () => void,
    setResizeMode?: () => void,
}

const Toolbar: FC<ToolbarProps> = (props) => {
    const [active, setActive] = useState("pointer");
    const doNothing = () => {};
    const setNormalMode = props.setNormalMode ?? doNothing;
    const setResizeMode = props.setResizeMode ?? doNothing;
    return (
        <div className="toolbar">
            <ToolbarButton
                id="pointer"
                content={<PointerSVG/>}
                onClick={() => {
                    setActive("pointer");
                    setNormalMode();
                }}
                active={active === "pointer"}
            />
            <ToolbarButton
                id="resize"
                content={<ResizeSVG/>}
                onClick={() => {
                    setActive("resize");
                    setResizeMode();
                }}
                active={active === "resize"}
            />
        </div>
    )
}

export default Toolbar;