'use client';
import React, { useState } from 'react';

interface ZoomableImageProps {
    src?: string;
    alt?: string;
    className?: string;
}

export default function ZoomableImage({ src, alt = '', className = '' }: ZoomableImageProps) {
    const [position, setPosition] = useState('50% 50%');
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();

        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setPosition(`${x}% ${y}%`);
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'zoom-in' }}
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-200 ease-out"
                style={{
                    transformOrigin: position,
                    transform: isHovered ? 'scale(2)' : 'scale(1)', // Adjust scale(2) to zoom more/less
                }}
            />
        </div>
    );
}