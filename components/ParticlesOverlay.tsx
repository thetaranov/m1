import React, { useEffect, useRef } from 'react';

interface ParticlesOverlayProps {
  flipped?: boolean;
  className?: string;
  active?: boolean;
}

const ParticlesOverlay: React.FC<ParticlesOverlayProps> = ({ flipped = false, className = "", active = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={containerRef} className={`absolute inset-0 z-50 w-full h-full pointer-events-none mix-blend-screen ${className}`}>
         <video
            ref={videoRef}
            src="https://www.dropbox.com/scl/fi/3kizv2z4z1ycqp7mm23wv/3.mp4?rlkey=5lr3zic7h8r56nf55oq7pnxwp&st=nij5fstz&raw=1"
            loop
            muted
            playsInline
            className={`w-full h-full object-cover opacity-100 ${flipped ? 'scale-y-[-1]' : ''}`}
         />
      </div>
  );
}

export default ParticlesOverlay;