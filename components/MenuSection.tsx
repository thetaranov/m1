
import React from 'react';
import { Flame, Wind } from 'lucide-react';
import Reveal from './Reveal';
import ParticlesOverlay from './ParticlesOverlay';

interface FeaturesSectionProps {
  isActive?: boolean;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ isActive = false }) => {
  return (
    <section className="relative w-full h-full min-h-[100vh] bg-black text-white overflow-hidden flex items-center">
      
      {/* 1. Content Grid (Layer 10 - Base Content) */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-center py-8 md:py-0">
        
        {/* Mobile Title (Order 1) */}
        <div className="md:hidden w-full text-center mb-6 order-1 mt-12">
            <Reveal>
                <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg leading-tight">
                  Перегородка,<br />которая меняет всё
                </h2>
            </Reveal>
        </div>

        {/* Left Column: Image (Order 2 on Mobile) */}
        <div className="w-full md:w-1/2 flex items-center justify-center relative order-2 md:order-1 mb-6 md:mb-0 h-[35vh] md:h-full">
             {/* Backlight for separation */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none"></div>
             
             <img 
                src="https://www.dropbox.com/scl/fi/cvln6jbl93cpwwczx2rrr/m111-removebg-preview.png?rlkey=ks3iuvoqcs6jturw7w091jqox&st=1ubx27ab&raw=1" 
                alt="Grill Partition Mechanism" 
                className="w-full h-full md:h-[75vh] object-contain drop-shadow-2xl relative z-10"
                loading="lazy"
             />
        </div>

        {/* Right Column: Text (Order 3 on Mobile) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left pl-0 md:pl-16 order-3 md:order-2 pt-0 md:pt-24 md:scale-90 md:origin-left">
            <Reveal>
                {/* Desktop Title (Hidden on Mobile) */}
                <h2 className="hidden md:block text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-lg leading-tight">
                  Перегородка,<br />которая меняет всё
                </h2>
                
                <div className="text-gray-300 text-lg leading-relaxed max-w-lg mb-10 font-medium drop-shadow-md">
                  <p>
                    Больше не нужно раздувать угли и тушить вспышки огня водой. Загрузите дрова в режиме «Печь», следите за термометром и одним движением переключите перегородку в режим «Мангал».
                  </p>
                </div>
            </Reveal>

            {/* Hidden on mobile for cleaner look - STRICTLY HIDDEN */}
            <Reveal delay={200} className="hidden md:grid gap-4 w-full max-w-sm md:max-w-full">
                {/* Mode Cards */}
                <div className="group flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm text-left">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(234,88,12,0.3)] flex-shrink-0">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white mb-1">Режим печи</h3>
                        <p className="text-sm text-gray-400">Мощная тяга. От плова до кипятка.</p>
                    </div>
                </div>

                <div className="group flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm text-left">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)] flex-shrink-0">
                        <Wind size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white mb-1">Режим мангала</h3>
                        <p className="text-sm text-gray-400">Рассеянное тепло. Идеально для шампуров.</p>
                    </div>
                </div>
            </Reveal>
        </div>
      </div>

      {/* 2. Particles Video Overlay (Layer 50 - Top) */}
      <ParticlesOverlay active={isActive} />

    </section>
  );
};

export default FeaturesSection;
