
import React, { useEffect, useRef, useState } from 'react';

const PHRASES = [
  "Приготовьтесь",
  "Включите шеф-повара",
  "Зажигайте",
  "Наслаждайтесь процессом",
  "Переключайте режимы",
  "Творите",
  "Используйте возможности",
  "Персонализируйте",
  "Дарите эмоции",
  "Контролируйте температуру",
  "Собирайтесь вместе",
  "Согревайте",
  "Отдыхайте",
  "Перемещайте на колесах",
  "Заботьтесь",
  "Станьте героем пикника",
  "Веселитесь",
];

interface HeroProps {
    startAnimation?: boolean;
    isActive?: boolean;
}

const Hero: React.FC<HeroProps> = ({ startAnimation = true, isActive = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // If not active, we don't need to observe intersection, but if active we manage play/pause
    if (!isActive) return;

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
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!startAnimation) return;
    
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [startAnimation]);

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  const currentPhrase = PHRASES[currentPhraseIndex];

  return (
    <section id="hero" ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black text-white overflow-hidden">
      
      {/* 1. Placeholder / First Frame (Blurred) - Always visible for smooth transition */}
      <div 
        className={`absolute inset-0 z-0 bg-black transition-opacity duration-1000 ${videoLoaded && isActive ? 'opacity-0' : 'opacity-100'}`}
      >
        <img 
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1920"
            alt="Grill Background Placeholder"
            className="w-full h-full object-cover blur-xl scale-110 opacity-60"
        />
      </div>

      {/* 2. Video - Only rendered when active to save memory */}
      {isActive && (
        <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-full overflow-hidden flex items-center justify-center relative">
            <video 
                ref={videoRef}
                src="https://www.dropbox.com/scl/fi/oyn12cio5cnryq1oopiw7/123.mp4?rlkey=lr90iuwz75p4y0cv7lrkwity7&st=q74zn2pw&raw=1" 
                onLoadedData={handleVideoLoaded}
                loop 
                muted 
                playsInline 
                poster="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1920"
                className="w-full h-full object-cover scale-135 opacity-100"
            ></video>
            </div>
        </div>
      )}
      
      {/* Overlay darkening */}
      <div className="absolute inset-0 bg-black/30 z-[1]"></div>
      
      {/* Mobile Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-[2] md:hidden pointer-events-none"></div>

      {/* Text Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col justify-center h-full">
        <h1 
          key={currentPhraseIndex}
          className={`tracking-tight text-3xl md:text-5xl lg:text-7xl font-bold min-h-[160px] md:min-h-[200px] flex flex-col justify-center items-center leading-tight transition-opacity duration-1000 drop-shadow-2xl ${startAnimation ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}
          style={{ 
            textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.9)' 
          }}
        >
           {currentPhrase}
        </h1>
      </div>
    </section>
  );
};

export default Hero;
