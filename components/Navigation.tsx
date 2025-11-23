
import React, { useState, useEffect, useRef } from 'react';
import { NAV_LINKS } from '../constants';
import { Menu, X, MessageSquare } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  isIntroComplete?: boolean;
  onChatToggle?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, isIntroComplete = true, onChatToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const navRef = useRef<HTMLElement>(null);

  // Always Dark Theme / Hero Style
  const bgClass = 'bg-black/60 border-white/10';
  const blurClass = 'backdrop-blur-md';
  const logoColorClass = 'text-white';
  const inactiveColorClass = 'text-gray-300 hover:text-white';
  const mobileMenuBg = 'bg-black/80';
  const mobileMenuText = 'text-white';

  // Update the sliding indicator based on activeSection
  useEffect(() => {
    const activeIndex = NAV_LINKS.findIndex(link => link.href.substring(1) === activeSection);
    
    if (activeIndex !== -1 && itemsRef.current[activeIndex]) {
      const element = itemsRef.current[activeIndex];
      if (element) {
        setIndicatorStyle({
          left: element.offsetLeft,
          width: element.offsetWidth,
          opacity: 1
        });
      }
    } else {
        // Hide indicator if we are in Hero or non-menu section
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeSection]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-1000 py-4 shadow-sm ${bgClass} ${blurClass} ${isIntroComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <div className="max-w-[95rem] mx-auto px-6 lg:px-8 flex justify-between items-center min-h-[40px]">
        
        {/* DESKTOP LOGO */}
        <a 
          href="#" 
          onClick={(e) => handleScrollTo(e, "#hero")} 
          className={`hidden lg:block text-2xl md:text-3xl font-bold tracking-tighter z-10 relative hover:opacity-80 transition-opacity duration-1000 ${logoColorClass} ${isIntroComplete ? 'opacity-100 delay-300' : 'opacity-0'}`}
        >
          bbqp
        </a>

        {/* MOBILE LOGO (Left Aligned) */}
        <a 
            href="#" 
            onClick={(e) => handleScrollTo(e, "#hero")}
            className={`lg:hidden text-2xl font-bold tracking-tighter ${logoColorClass}`}
        >
            bbqp
        </a>

        {/* Desktop Menu - Liquid Drop Style */}
        <div className="hidden lg:flex items-center relative rounded-full p-1 border transition-colors duration-500 bg-white/5 border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          
          {/* The "Liquid Drop" Indicator */}
          <div 
            className="absolute h-[calc(100%-8px)] top-1 bg-orange-600 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.5)]"
            style={{ 
              left: indicatorStyle.left, 
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
              transitionProperty: 'left, width, opacity',
              transitionDuration: '350ms',
              transitionTimingFunction: 'cubic-bezier(0.2, 0, 0.2, 1.4)' 
            }}
          />

          {NAV_LINKS.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              ref={(el) => { itemsRef.current[index] = el; }}
              onClick={(e) => handleScrollTo(e, link.href)}
              className={`relative z-10 px-5 py-2 text-sm font-medium transition-all duration-500 ${
                activeSection === link.href.substring(1) 
                  ? 'text-white drop-shadow-md' 
                  : inactiveColorClass
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* CTA Button (Desktop Only) */}
        <div className="hidden lg:block">
           <a 
            href="https://t.me/thetaranov"
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10">Собрать свой</span>
          </a>
        </div>

        {/* Mobile Buttons (Support + Menu) */}
        <div className="lg:hidden absolute right-6 flex items-center gap-4">
           {/* Support Button (Mobile Only) */}
           <button
              className={`p-1 transition-colors ${logoColorClass} hover:text-orange-500`}
              onClick={onChatToggle}
              aria-label="Support"
           >
             <MessageSquare size={26} strokeWidth={2} />
           </button>

           {/* Menu Toggle */}
          <button
            className={`p-1 transition-colors ${logoColorClass}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full border-t p-6 flex flex-col gap-4 shadow-2xl animate-fade-in h-screen z-40 ${mobileMenuBg} bg-gradient-to-b from-white/5 to-transparent backdrop-blur-2xl border-white/10`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className={`text-2xl font-bold py-5 border-b last:border-0 flex items-center justify-between ${
                 activeSection === link.href.substring(1) 
                 ? 'text-orange-500' 
                 : `${mobileMenuText} border-gray-500/20`
              }`}
            >
              {link.name}
              {activeSection === link.href.substring(1) && <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_orange]"></div>}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
