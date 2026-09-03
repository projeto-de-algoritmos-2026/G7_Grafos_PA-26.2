'use client';
import React, { useEffect, useRef, useState } from 'react';

interface CarrosselProps {
    children: React.ReactNode;
}

export default function Carrossel({ children }: CarrosselProps) {
    const carrosselRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dragged, setDragged] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!carrosselRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - carrosselRef.current.offsetLeft);
        setScrollLeft(carrosselRef.current.scrollLeft);
        setDragged(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !carrosselRef.current) return;
        e.preventDefault();
        const x = e.pageX - carrosselRef.current.offsetLeft;
        const walk = x - startX;

        if (Math.abs(walk) > 5) setDragged(true);

        carrosselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleClickCapture = (e: React.MouseEvent) => {
        if (dragged) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    const handleDragStart = (e: React.DragEvent) => e.preventDefault();

    useEffect(() => {
        const handleMouseUpWindow = () => setIsDragging(false);
        window.addEventListener('mouseup', handleMouseUpWindow);
        return () => window.removeEventListener('mouseup', handleMouseUpWindow);
    }, []);

    return (
        <div
            ref={carrosselRef}
            className="flex overflow-x-auto gap-6 scrollbar-hide scroll-snap-x select-none"
            style={{
                scrollSnapType: 'x mandatory',
                cursor: 'default',
                userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClickCapture={handleClickCapture}
            onDragStart={handleDragStart}
        >
            {children}
        </div>
    );
}