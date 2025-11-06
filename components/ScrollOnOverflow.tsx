import React, { useState, useRef, useLayoutEffect } from 'react';

interface ScrollOnOverflowProps {
    children: React.ReactNode;
    className?: string;
}

const ScrollOnOverflow: React.FC<ScrollOnOverflowProps> = ({ children, className }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const checkOverflow = () => {
            const container = containerRef.current;
            const content = contentRef.current;
            if (container && content) {
                const hasOverflow = content.scrollWidth > container.clientWidth;
                if (isOverflowing !== hasOverflow) {
                    setIsOverflowing(hasOverflow);
                }
            }
        };
        
        // Check after layout is stable
        const rafId = requestAnimationFrame(checkOverflow);

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(checkOverflow);
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
        };
    }, [children, isOverflowing]);

    return (
        <div
            ref={containerRef}
            className={`${className} overflow-hidden whitespace-nowrap relative`}
        >
            {/* Hidden element for consistent measurement */}
            <span ref={contentRef} className="opacity-0 absolute top-0 left-0 -z-10 pointer-events-none whitespace-nowrap">
                {children}
            </span>

            {isOverflowing ? (
                <div className="animate-marquee-scroll flex whitespace-nowrap">
                    <span className="flex-shrink-0 pr-12">{children}</span>
                    <span className="flex-shrink-0 pr-12" aria-hidden="true">{children}</span>
                </div>
            ) : (
                <span className="truncate block">{children}</span>
            )}
        </div>
    );
};

export default ScrollOnOverflow;
