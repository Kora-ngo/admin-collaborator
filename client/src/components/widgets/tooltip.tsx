import { useState } from "react";

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = "top" }) => {
    const [visible, setVisible] = useState(false);

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-t-4 border-x-4 border-x-transparent border-b-0",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-b-4 border-x-4 border-x-transparent border-t-0",
        left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-l-4 border-y-4 border-y-transparent border-r-0",
        right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-r-4 border-y-4 border-y-transparent border-l-0",
    };

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}

            {visible && (
                <div className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}>
                    <div className="bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                        {text}
                    </div>
                    <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;