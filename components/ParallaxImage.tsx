import React, { useEffect, useRef, useState } from 'react';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  speed?: number;
}

const ParallaxImage: React.FC<ParallaxImageProps> = ({ 
  src, 
  alt, 
  className = "",
  imageClassName = "",
  speed = 0.1
}) => {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Only calculate if the element is close to being visible or is visible
      if (rect.top < windowHeight && rect.bottom > 0) {
        const centerY = windowHeight / 2;
        const elementY = rect.top + rect.height / 2;
        // Calculate offset based on distance from center
        // A positive speed moves the image down as we scroll down (creating depth)
        setOffset((centerY - elementY) * speed);
      }
    };

    const onScroll = () => {
        rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll);
    handleScroll(); // Initial calculation

    return () => {
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div ref={containerRef} className={`overflow-hidden relative ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className={`absolute inset-0 w-full h-[120%] -top-[10%] object-cover ${imageClassName}`}
        style={{ 
            transform: `translateY(${offset}px)`,
            willChange: 'transform' 
        }}
      />
    </div>
  );
};

export default ParallaxImage;