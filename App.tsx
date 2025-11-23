
import React, { useState, useEffect, useRef, Suspense, lazy, useMemo, useCallback } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturesSection from './components/MenuSection';
import ParallaxImage from './components/ParallaxImage';
import Reveal from './components/Reveal';
import ParticlesOverlay from './components/ParticlesOverlay';
import { DETAILS_ITEMS } from './constants';
import { Check, ArrowRight, Plus, Minus, Upload, ChevronLeft, ChevronRight, Loader2, Settings2, X, MoveRight, Play, Box, ShoppingCart, ScanLine } from 'lucide-react';

// Lazy Load Heavy Components to speed up initial render
const ChefBot = lazy(() => import('./components/ChefBot'));
const Grill3D = lazy(() => import('./components/Grill3D'));
const RecipeGenerator = lazy(() => import('./components/RecipeGenerator'));

// Optimization Constants
const SECTION_ORDER = ['hero', 'features', 'autodraft', 'details', 'personalize', 'military', 'models', 'ai-chef'];

// Configuration Data
type Option = { label: string; price: number; value: string };
type ConfigCategory = { id: string; name: string; options: Option[] };

const CONFIG_OPTIONS: ConfigCategory[] = [
  {
    id: 'material',
    name: 'Материал корпуса',
    options: [
      { label: 'Сталь 09Г2С (3мм)', price: 25000, value: 'steel' },
      { label: 'Нерж. сталь (3мм)', price: 45000, value: 'stainless' }
    ]
  },
  {
    id: 'style',
    name: 'Стиль и Отделка',
    options: [
      { label: 'Black Matt', price: 0, value: 'basic' },
      { label: 'Tactical (Военная)', price: 5000, value: 'military' },
      { label: 'Индив. гравировка', price: 3000, value: 'engraving' }
    ]
  },
  {
    id: 'thermometer',
    name: 'Контроль жара',
    options: [
      { label: 'Нет', price: 0, value: 'none' },
      { label: 'Термометр Pro', price: 1500, value: 'installed' }
    ]
  },
  {
    id: 'tray',
    name: 'Система очистки',
    options: [
      { label: 'Заслонка', price: 0, value: 'basic' },
      { label: 'Зольный ящик', price: 3500, value: 'drawer' }
    ]
  },
  {
    id: 'skewers',
    name: 'Аксессуары',
    options: [
      { label: 'Без шампуров', price: 0, value: 'none' },
      { label: 'Шампуры (6 шт)', price: 2000, value: '6pcs' },
      { label: 'Шампуры (10 шт)', price: 3000, value: '10pcs' }
    ]
  },
  {
    id: 'stone',
    name: 'Выпечка',
    options: [
      { label: 'Нет', price: 0, value: 'none' },
      { label: 'Камень для пиццы', price: 2500, value: 'yes' }
    ]
  },
  {
    id: 'grids',
    name: 'Гриль-решетки',
    options: [
      { label: 'Нет', price: 0, value: 'none' },
      { label: 'Нержавейка (2 шт)', price: 4000, value: 'yes' }
    ]
  }
];

const PHYSICS_FORMULAS = [
  "Q = c·m·Δt",
  "C + O₂ → CO₂ + Q",
  "F = m·a",
  "P + ρv²/2 = const",
  "PV = nRT",
  "Q = q·m",
  "v = √(2ΔP/ρ)",
  "ΔU = Q - W",
  "Q = L·m",
  "Q = r·m",
  "η = 1 - T₂/T₁", 
  "dQ = dU + pdV"
];

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Individual Formula Component to handle random text cycling
const FloatingFormula: React.FC<{ item: any, pool: string[] }> = ({ item, pool }) => {
  const [text, setText] = useState(item.formula);
  
  return (
     <div
        className="absolute font-scientific font-bold text-gray-800 select-none whitespace-nowrap pointer-events-none"
        style={{
          left: `${item.left}%`, 
          top: `${item.top}%`,
          fontSize: `${1.0 + (item.scale * 0.4)}rem`, 
          filter: `blur(${item.blur}px)`,
          opacity: item.opacity,
          '--scale': item.scale,
          '--max-opacity': item.opacity,
          animation: `comet-move ${item.duration}s linear infinite`,
          animationDelay: `${item.delay}s`,
        } as React.CSSProperties}
        onAnimationIteration={() => {
            // Pick a new random formula when animation loops
            setText(pool[Math.floor(Math.random() * pool.length)]);
        }}
     >
        {text}
     </div>
  );
};

// Optimized Image for Marquee
const MarqueeImage = React.memo(({ src, className }: { src: string, className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-black/40 border border-white/5 rounded-2xl ${className}`}>
        <img 
            src={src} 
            alt="" 
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${loaded ? 'opacity-80' : 'opacity-0'}`} 
        />
    </div>
  );
});

// Optimized 3D Marquee Row with robust logic
const OptimizedMarqueeRow = ({ reverse = false, items, speed = 1, itemClassName = "" }: { reverse?: boolean, items: typeof DETAILS_ITEMS, speed?: number, itemClassName?: string }) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const rowRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);
    const animationFrameRef = useRef<number>(0);

    const marqueeItems = useMemo(() => [...items, ...items, ...items, ...items], [items]); // Quadruple buffer for safety

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
             for (const entry of entries) {
                 setContainerWidth(entry.contentRect.width);
             }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const el = rowRef.current;
        if (!el) return;

        const animate = () => {
            const totalWidth = el.scrollWidth;
            const oneSetWidth = totalWidth / 4;
            
            if (oneSetWidth <= 0) {
                 animationFrameRef.current = requestAnimationFrame(animate);
                 return;
            }

            if (reverse) {
                positionRef.current += speed;
                if (positionRef.current >= 0) {
                    positionRef.current = -oneSetWidth * 2;
                }
            } else {
                positionRef.current -= speed;
                if (positionRef.current <= -oneSetWidth * 2) {
                    positionRef.current = -oneSetWidth;
                }
            }

            el.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (positionRef.current === 0) {
             positionRef.current = -100;
        }

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [reverse, speed]);

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden select-none pointer-events-none">
            <div 
                ref={rowRef}
                className="flex gap-4 md:gap-6 w-max will-change-transform"
                style={{ transform: 'translate3d(0,0,0)' }}
            >
                {marqueeItems.map((item, idx) => (
                    <MarqueeImage 
                        key={`${item.id}-${idx}`} 
                        src={item.image} 
                        className={`flex-shrink-0 ${itemClassName}`}
                    />
                ))}
            </div>
        </div>
    );
};

function App() {
  const TELEGRAM_LINK = "https://t.me/thetaranov";
  const MODEL_URL = "https://dl.dropboxusercontent.com/scl/fi/pl5sforuapge05lecajuz/m1.glb?rlkey=8b949kxbsen8w2t201bgoktjc&st=11zx3d9k";

  // Config State
  const [config, setConfig] = useState<Record<string, Option>>({
    material: CONFIG_OPTIONS[0].options[0],
    style: CONFIG_OPTIONS[1].options[0],
    thermometer: CONFIG_OPTIONS[2].options[0],
    tray: CONFIG_OPTIONS[3].options[0],
    skewers: CONFIG_OPTIONS[4].options[0],
    stone: CONFIG_OPTIONS[5].options[0],
    grids: CONFIG_OPTIONS[6].options[0],
  });

  const [engravingFile, setEngravingFile] = useState<File | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>('material');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 3D Load State
  const [is3DActive, setIs3DActive] = useState(false);

  // Intro Animation State
  const [introStep, setIntroStep] = useState(0); 
  
  // Refs for sections
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Marquee Data
  const row1Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);
  const row2Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);
  const row3Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);

  // Calculate non-overlapping formula positions
  const formulaData = useMemo(() => {
    const pos: {left: number, top: number, duration: number, delay: number, scale: number, blur: number, opacity: number, formula: string}[] = [];
    const usedRects: {l: number, t: number, w: number, h: number}[] = [];
    
    const shuffledFormulas = [...PHYSICS_FORMULAS].sort(() => 0.5 - Math.random());
    const count = 14; 

    const attemptsMax = 2000;
    
    for (let i = 0; i < count; i++) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < attemptsMax) {
            const l = Math.random() * 95; 
            const t = Math.random() * 95;
            const desktopTextZone = (l < 45 && t > 20 && t < 75);
            const imageOverlap = (l > 70 && t > 20 && t < 80);
            
            const inDangerZone = imageOverlap;
            const w = 22; 
            const h = 14; 
            
            const overlap = usedRects.some(r => {
                 return (l < r.l + r.w && l + w > r.l && t < r.t + r.h && t + h > r.t);
            });
            
            if (!overlap && !inDangerZone) {
                const scale = 0.5 + Math.random() * 1.0;
                let blur = 0; 
                if (scale > 1.2) {
                    blur = (scale - 1.2) * 1.5; 
                }
                if (desktopTextZone) {
                    blur += 1.5;
                }
                let opacity = 0.5;
                if (scale > 1.2) opacity = 0.35;
                if (desktopTextZone) opacity = 0.2;

                const duration = 6 + (Math.random() * 2);

                pos.push({
                    left: l,
                    top: t,
                    duration,
                    delay: -Math.random() * 10,
                    scale,
                    blur,
                    opacity,
                    formula: shuffledFormulas[i % shuffledFormulas.length]
                });
                usedRects.push({l, t, w, h});
                placed = true;
            }
            attempts++;
        }
    }
    return pos;
  }, []);

  // Check mobile size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intro Sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroStep(1), 1000);
    const timer2 = setTimeout(() => setIntroStep(2), 2500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const isIntroComplete = introStep >= 2;

  // Intersection Observer
  useEffect(() => {
    const observerOptions = {
      root: null, 
      rootMargin: '0px', 
      threshold: 0.5, 
    };
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id) setActiveSection(id);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    (Object.values(sectionRefs.current) as (Element | null)[]).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  const handleSelect = (categoryId: string, option: Option) => {
    setConfig(prev => ({ ...prev, [categoryId]: option }));
  };

  const toggleCategory = (id: string) => {
    setOpenCategory(openCategory === id ? null : id);
  };

  const calculateTotal = () => {
    return (Object.values(config) as Option[]).reduce((acc, item) => acc + item.price, 0);
  };

  const getOrderLink = () => {
    let text = `Здравствуйте! Хочу заказать bbqp в следующей конфигурации:%0A` +
      Object.entries(config).map(([key, val]) => {
          const option = val as Option;
          return `- ${CONFIG_OPTIONS.find(c => c.id === key)?.name}: ${option.label}`;
      }).join('%0A') +
      `%0A%0AПримерная стоимость: ${calculateTotal()} руб.`;
    
    if (config.style.value === 'engraving' && engravingFile) {
      text += `%0A%0AФайл для гравировки: ${engravingFile.name} (пришлю в чат)`;
    }

    return `${TELEGRAM_LINK}?text=${text}`;
  };

  const SectionLoader = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
    </div>
  );

  // --- OPTIMIZATION LOGIC ---
  // Calculates whether a section's HEAVY content should be rendered.
  // We keep the section container to maintain scroll height, but unmount content.
  const shouldRenderSection = (sectionId: string) => {
    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    const targetIndex = SECTION_ORDER.indexOf(sectionId);
    // Render active section and immediate neighbors to allow smooth scrolling.
    // Anything further away is completely unmounted.
    return Math.abs(currentIndex - targetIndex) <= 1;
  };

  // REDESIGNED CONFIGURATOR PANEL (DARK TECH MODE)
  const ConfiguratorPanel = () => (
    <div className="flex flex-col h-full bg-[#050505]/90 backdrop-blur-2xl text-white border-l border-white/10">
         {/* Header */}
         <div className="p-6 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Settings2 size={20} className="text-orange-500"/>
                    Конфигуратор
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-wider">System Config v1.0</p>
            </div>
            {!isMobile && (
                <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">Итого</div>
                    <div className="text-xl font-bold text-white">{calculateTotal().toLocaleString()} ₽</div>
                </div>
            )}
         </div>
         
         {/* Options List */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {CONFIG_OPTIONS.map((category) => (
               <div key={category.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/10 group">
                  <button 
                     onClick={() => toggleCategory(category.id)}
                     className={`w-full flex items-center justify-between p-4 text-left transition-colors`}
                  >
                     <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{category.name}</span>
                        {/* Selected value preview */}
                        <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_orange]"></span>
                             <span className="text-[11px] text-gray-500 truncate max-w-[180px]">
                                {config[category.id].label}
                             </span>
                        </div>
                     </div>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 transition-transform duration-300 ${openCategory === category.id ? 'bg-white/10 rotate-180' : 'bg-transparent'}`}>
                        <ChevronLeft size={16} className="-rotate-90 text-gray-400"/>
                     </div>
                  </button>
                  
                  {/* Expanded Content */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openCategory === category.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="p-4 pt-0">
                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/10">
                            {category.options.map((opt) => {
                                const isSelected = config[category.id].value === opt.value;
                                return (
                                   <button
                                      key={opt.value}
                                      onClick={() => handleSelect(category.id, opt)}
                                      className={`relative flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${
                                         isSelected 
                                            ? 'bg-orange-600/20 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.2)]' 
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                      }`}
                                   >
                                      <span className="z-10">{opt.label}</span>
                                      {opt.price > 0 && (
                                         <span className={`z-10 ${isSelected ? 'text-orange-200' : 'text-gray-500'}`}>
                                            +{opt.price.toLocaleString()} ₽
                                         </span>
                                      )}
                                   </button>
                                );
                            })}
                        </div>
                        
                        {/* Special case: File upload for Engraving */}
                        {category.id === 'style' && config[category.id].value === 'engraving' && (
                           <div className="mt-3 pt-3 border-t border-white/10 animate-fade-in">
                              <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider text-gray-400">Загрузите макет</label>
                              <div className="flex items-center gap-2">
                                  <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-gray-400 px-4 py-3 rounded-xl text-xs font-bold transition-all border-dashed">
                                      <Upload size={14} className="text-orange-500" />
                                      <span>{engravingFile ? 'Файл выбран' : 'Выберите файл'}</span>
                                      <input 
                                        type="file" 
                                        accept="image/*,.pdf,.ai,.eps"
                                        onChange={(e) => setEngravingFile(e.target.files ? e.target.files[0] : null)}
                                        className="hidden"
                                      />
                                  </label>
                              </div>
                              {engravingFile && (
                                  <div className="mt-2 text-[10px] text-green-400 flex items-center gap-1">
                                      <Check size={10} /> {engravingFile.name}
                                  </div>
                              )}
                              <p className="text-[10px] text-gray-500 mt-2">Поддерживаем: PNG, JPG, PDF, AI</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Footer Area */}
         <div className="p-6 border-t border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md flex-shrink-0">
            {/* Total Mobile View only (Desktop has it in header) */}
            <div className={`flex justify-between items-end mb-4 ${!isMobile ? 'lg:hidden' : ''}`}>
               <span className="text-sm text-gray-500 font-medium">Итого:</span>
               <span className="text-2xl font-bold tracking-tight text-white">{calculateTotal().toLocaleString()} ₽</span>
            </div>

            <a 
               href={getOrderLink()}
               target="_blank"
               rel="noopener noreferrer"
               className="group w-full bg-orange-600 text-white py-4 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(234,88,12,0.4)] active:scale-[0.98]"
            >
               <span>Оформить заказ</span>
               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
         </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden bg-black text-white selection:bg-orange-500 selection:text-white relative">
      
      {/* INTRO OVERLAY */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-colors duration-[1500ms] ease-in-out ${introStep >= 1 ? 'bg-transparent' : 'bg-black'} ${introStep >= 2 ? 'hidden' : ''}`}
      >
        <h1 
          className={`font-bold tracking-tighter text-white transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) absolute z-[101] whitespace-nowrap
            ${introStep >= 1
                ? 'top-[22px] left-[24px] lg:left-[32px] text-2xl md:text-3xl translate-x-0 translate-y-0 opacity-0' 
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-8xl' 
            }
            ${introStep >= 2 ? 'hidden' : 'block'}
          `}
        >
            bbqp
        </h1>
      </div>

      {/* Navigation */}
      <Navigation 
        activeSection={activeSection} 
        isIntroComplete={isIntroComplete} 
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
      />
      
      {/* Main Scroll Container */}
      <main className={`snap-container h-full w-full transition-opacity duration-1000 ${introStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 1. HERO */}
        <div id="hero" ref={setRef('hero')} className="snap-section min-h-[100svh] transition-opacity duration-[2500ms] ease-in-out">
            {shouldRenderSection('hero') && <Hero startAnimation={isIntroComplete} isActive={activeSection === 'hero'} />}
        </div>

        {/* 2. FEATURES */}
        <div id="features" ref={setRef('features')} className="snap-section min-h-[100svh] bg-black transition-opacity duration-[2500ms] ease-in-out">
             {shouldRenderSection('features') && <FeaturesSection isActive={activeSection === 'features'} />}
        </div>
        
        {/* 3. AUTODRAFT */}
        <section id="autodraft" ref={setRef('autodraft')} className="snap-section min-h-[100svh] bg-white text-black relative transition-all duration-[2500ms] ease-in-out overflow-hidden flex items-center justify-center">
           {shouldRenderSection('autodraft') && (
            <>
               <style>{`
                 @keyframes comet-move {
                    0% { 
                        opacity: 0; 
                        transform: translate(0, 0) scale(var(--scale)); 
                    }
                    10% { opacity: var(--max-opacity); }
                    90% { opacity: var(--max-opacity); }
                    100% { 
                        opacity: 0; 
                        transform: translate(120px, 120px) scale(var(--scale)); 
                    }
                 }
               `}</style>
               
               {/* Background Image - Desktop Only */}
               <div className="hidden md:flex absolute inset-0 w-full h-full z-0 justify-center items-center pt-0 md:pt-0">
                  <img 
                     src="https://www.dropbox.com/scl/fi/u2ocqfowe9f292wpzxq2d/3d-visualisation-m1.png?rlkey=9pcxocpda5f5upc4migvl3exk&st=gfj6htp8&raw=1" 
                     alt="Grill AutoDraft System" 
                     className="w-full h-full md:h-[75%] object-contain object-center md:object-[center_right] md:mr-12 opacity-100 translate-y-0 md:translate-y-8"
                  />
               </div>

               {/* Mobile Background Image (Behind Formulas) */}
               {/* Use mix-blend-multiply to handle non-pure white backgrounds in the image */}
               <div className="md:hidden absolute top-1/2 left-0 w-full h-[40vh] z-[1] flex items-center justify-center pointer-events-none -translate-y-1/2">
                   <img 
                       src="https://www.dropbox.com/scl/fi/u2ocqfowe9f292wpzxq2d/3d-visualisation-m1.png?rlkey=9pcxocpda5f5upc4migvl3exk&st=gfj6htp8&raw=1" 
                       alt="Grill AutoDraft System Mobile" 
                       className="h-full object-contain mix-blend-multiply"
                   />
               </div>

               {/* Floating Formulas */}
               <div 
                  className="absolute inset-0 z-[5] overflow-hidden pointer-events-none"
                  style={{ 
                     maskImage: isMobile ? 'none' : 'linear-gradient(to right, black 40%, transparent 70%)',
                     WebkitMaskImage: isMobile ? 'none' : 'linear-gradient(to right, black 40%, transparent 70%)'
                  }}
               >
                 {formulaData.map((item, i) => (
                     <FloatingFormula key={i} item={item} pool={PHYSICS_FORMULAS} />
                 ))}
               </div>

               {/* Content */}
               <div className="relative z-10 max-w-6xl mx-auto px-6 w-full h-full flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start pb-0 md:py-0 pt-0 md:pt-0">
                  <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left h-full pr-0 md:pr-12 pb-0 md:pb-0">
                     <Reveal>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-black relative z-20">
                           Просто закиньте угли, физика сделает все за вас
                        </h2>
                        
                        {/* Spacer to maintain layout while image is in background */}
                        <div className="md:hidden w-full h-[40vh] mb-6"></div>

                        <div className="text-gray-600 text-base md:text-xl leading-relaxed font-medium relative z-20">
                           <p>
                              Система автоподдува создаёт идеальную тягу. Угли разгораются быстрее. Никаких усилий — только результат.
                           </p>
                        </div>
                     </Reveal>
                  </div>
               </div>
            </>
           )}
        </section>

        {/* 4. DETAILS SECTION */}
        <section 
            id="details" 
            ref={setRef('details')} 
            className="snap-section min-h-[100svh] bg-[#050505] text-white transition-all duration-[2500ms] ease-in-out flex flex-col justify-center overflow-hidden relative group"
        >
          {shouldRenderSection('details') && (
            <>
              {/* A. ATMOSPHERE LAYER */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none"></div>
              <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
              <div className="absolute inset-0 z-[5] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)]"></div>

              {/* B. THE 3D WALL (Perspective Trapezoid) */}
              <div 
                 className="absolute inset-0 flex items-center justify-center z-[2] overflow-hidden" 
                 style={{ perspective: '500px' }}
              >
                 {/* The Tilted Plane Container */}
                 <div 
                    className="flex flex-col gap-6 md:gap-8 justify-center origin-center"
                    style={{ 
                        width: '220%',
                        height: '160%',
                        transform: 'rotateY(-25deg) rotateX(2deg) translateX(-10%) scale(1.6)', 
                        maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)'
                    }}
                 >
                     {/* Row 1 - Optimized JS Animation with Shuffled Items */}
                     <OptimizedMarqueeRow items={row1Items} speed={0.4} itemClassName="w-40 h-40 md:w-64 md:h-64 aspect-square" />
                     {/* Row 2 - Reverse */}
                     <OptimizedMarqueeRow items={row2Items} reverse={true} speed={0.5} itemClassName="w-40 h-40 md:w-64 md:h-64 aspect-square" />
                     {/* Row 3 - Normal */}
                     <OptimizedMarqueeRow items={row3Items} speed={0.6} itemClassName="w-40 h-40 md:w-64 md:h-64 aspect-square" />
                 </div>
              </div>

              {/* C. EDITORIAL CONTENT OVERLAY */}
              <div className="relative z-20 pointer-events-none w-full h-full flex flex-col items-center justify-center text-center p-8 md:p-12">
                 <Reveal>
                     <h2 
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white drop-shadow-2xl mb-8"
                        style={{ 
                            textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.9)' 
                        }}
                     >
                        Для тех, кто ценит детали
                     </h2>
                 </Reveal>

                 <div className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] max-w-[75%] md:max-w-[90%] mx-auto">
                     <p className="text-gray-200 text-sm md:text-base font-medium tracking-wide m-0 text-center">
                        Каждый элемент создан с одержимостью качеством
                     </p>
                 </div>
              </div>
            </>
          )}
        </section>

        {/* 5. PERSONALIZATION */}
        <section id="personalize" ref={setRef('personalize')} className="snap-section min-h-[100svh] bg-[#050505] text-white relative transition-all duration-[2500ms] ease-in-out overflow-hidden flex items-center">
           {shouldRenderSection('personalize') && (
            <>
               {/* Background Video */}
               <div className="absolute inset-0 z-0">
                    <video 
                        src="https://www.dropbox.com/scl/fi/enaxpj6kr16crgwfi77p1/2.mp4?rlkey=iiqrvd3v3owz15tmbnklu15ay&st=r5dy4saj&raw=1"
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover object-center translate-x-[-15%] scale-[1.35] md:translate-x-0 md:scale-100 opacity-70" 
                    />
                    {/* Dark gradient overlay for left-text readability - HIDDEN on Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent hidden md:block"></div>
               </div>

               {/* Content Container - Strictly Left Aligned */}
               <div className="container mx-auto px-6 relative z-20 w-full h-full flex flex-col justify-center items-center md:items-start text-center md:text-left">
                    <div className="max-w-xl pl-0 md:pl-12 border-l-0 md:border-l-2 border-orange-500/30 w-full">
                         <Reveal>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4 opacity-0 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
                                 <ScanLine size={16} className="text-orange-500 animate-pulse" />
                                 <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-orange-500/80">ПЕРСОНАЛИЗАЦИЯ</span>
                            </div>
                            
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[0.9] tracking-tighter">
                               ОСТАВЬТЕ<br/>
                               <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">СВОЙ СЛЕД</span>
                            </h2>

                            <p className="text-orange-500 text-xs md:text-sm leading-relaxed mb-8 font-mono text-center md:text-left w-full md:w-auto">
                               // ИНДИВИДУАЛЬНАЯ ГРАВИРОВКА<br/>
                               // ЛЮБОЙ СЛОЖНОСТИ<br/>
                               // ВАШЕ ИМЯ, ЛОГОТИП ИЛИ ПОСЛАНИЕ<br/>
                               // НА ВЕКА.
                            </p>

                            {/* Updated Button to match Support style (Glass/Blur) */}
                            <div className="flex justify-center md:justify-start">
                                <a 
                                   href={TELEGRAM_LINK}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="group inline-flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:bg-black/80 hover:scale-105"
                                >
                                   <span className="font-bold text-sm">Загрузить макет</span>
                                   <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                         </Reveal>
                    </div>
               </div>
            </>
           )}
        </section>

        {/* 6. MILITARY */}
        <section id="military" ref={setRef('military')} className="snap-section min-h-[100svh] bg-[#1c1c1c] text-white relative transition-all duration-[2500ms] ease-in-out pt-28 pb-32 md:pb-0">
           {shouldRenderSection('military') && (
            <>
               <div className="hidden md:block absolute inset-0 z-0 opacity-100">
                    <ParallaxImage 
                       src="https://www.dropbox.com/scl/fi/tf8gd5jlomq7kjsolns1p/Shift_the_composition_202511210136.jpeg?rlkey=dc3ughoy463qzpnecspj0w3ul&st=n7m57mer&raw=1" 
                       alt="Military Background" 
                       className="w-full h-full"
                       imageClassName="object-cover"
                       speed={0.1}
                    />
               </div>
               <div className="md:hidden absolute inset-0 z-0 opacity-100 overflow-hidden">
                    <img 
                       src="https://www.dropbox.com/scl/fi/2fn0d6v0xpucxhbyc8e35/Outpainting__expand_202511211122.jpeg?rlkey=ohj9t19m7ixw9941bm3fdkpi1&st=o1xmww6k&raw=1" 
                       alt="Military Background Mobile" 
                       className="w-full h-[110%] object-cover -translate-y-[10%]"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                    {/* Bottom Gradient for Military Mobile */}
                    <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
               </div>

               {/* Particles Overlay for Military Section (Flipped) */}
               <ParticlesOverlay flipped={true} active={activeSection === 'military'} />

               <div className="relative z-10 max-w-5xl mx-auto px-6 w-full h-full flex flex-col justify-center">
                  <Reveal className="max-w-xl bg-black/20 backdrop-blur-[2px] bg-gradient-to-br from-white/5 to-transparent p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl mt-auto md:mt-0">
                     <div className="inline-block px-3 py-1 border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm rounded-full mb-4 md:mb-6">
                        <span className="text-[10px] md:text-xs font-bold tracking-wider text-orange-400 uppercase">Эксклюзив</span>
                     </div>
                     <h2 className="mb-4 md:mb-6 tracking-tight text-3xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
                        Военная серия
                     </h2>
                     
                     <div className="space-y-4 text-gray-200 mb-6 md:mb-8 text-base md:text-lg leading-relaxed drop-shadow-md">
                        <p>
                            Тактический сувенир и дань уважения. Брутальный дизайн, спецпокрытие, армейская эстетика.
                        </p>
                     </div>

                     <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                        {[
                           { title: "Тактическое покрытие", desc: "Матовое, устойчивое к экстремальным условиям" },
                           { title: "Персональная гравировка", desc: "Позывной или звание — бесплатно" },
                        ].map((item, i) => (
                           <div key={i} className="flex items-start gap-4 p-3 md:p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                              <div className="mt-1 flex-shrink-0">
                                 <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-600/20">
                                    <Check className="w-3 h-3" />
                                 </div>
                              </div>
                              <div>
                                 <div className="font-bold text-sm md:text-base text-white">{item.title}</div>
                                 <p className="text-[10px] md:text-xs text-gray-300 mt-1">{item.desc}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="flex flex-row gap-3">
                        <a 
                           href={TELEGRAM_LINK}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="bg-orange-600 text-white h-12 md:h-14 px-8 rounded-2xl text-sm md:text-base font-bold hover:bg-orange-700 transition-colors flex items-center justify-center flex-1 shadow-[0_0_25px_rgba(234,88,12,0.3)] hover:scale-[1.02]"
                        >
                           Получить
                        </a>
                     </div>
                  </Reveal>
               </div>
            </>
           )}
        </section>

        {/* 7. MODELS & CONFIGURATOR */}
        <section id="models" ref={setRef('models')} className="snap-section min-h-[100svh] bg-[#050505] transition-all duration-[2500ms] ease-in-out relative pt-0 pb-0">
           {shouldRenderSection('models') && (
            <>
               {/* Background for this section */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

               <ParticlesOverlay active={activeSection === 'models'} className="!z-0 opacity-60" />

               <div className="relative z-10 max-w-[90rem] mx-auto px-0 md:px-6 w-full h-full flex flex-col justify-center">
                  
                  {/* Mobile Modal for Configurator */}
                  {mobileConfigOpen && (
                    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md lg:hidden flex items-end sm:items-center justify-center animate-fade-in">
                        <div className="bg-[#111] w-full sm:w-[90%] h-[85vh] sm:h-[80vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col relative animate-slide-up overflow-hidden border border-white/10">
                            <button 
                                onClick={() => setMobileConfigOpen(false)}
                                className="absolute top-4 right-4 z-20 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <ConfiguratorPanel />
                        </div>
                    </div>
                  )}

                  {/* Mobile Title Header */}
                  <div className="lg:hidden w-full pt-24 px-6 text-center flex-shrink-0 absolute top-0 left-0 w-full z-20 pointer-events-none">
                      <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Конфигуратор</h2>
                      <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto font-medium">Соберите свой идеальный bbqp</p>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-8 items-stretch h-full max-h-[100vh] lg:max-h-[85vh] pt-0 lg:pt-28 pb-0 lg:pb-12">
                     
                     {/* 3D Model Area */}
                     <Reveal className="lg:col-span-7 relative w-full h-[100vh] lg:h-full lg:rounded-[2.5rem] overflow-hidden bg-transparent lg:bg-white/5 lg:border lg:border-white/10 order-1 lg:order-1 flex flex-col justify-center group">
                        
                        {/* 3D Content Logic: Placeholder vs Active */}
                        <div className="w-full h-[45vh] lg:h-full relative flex items-center justify-center bg-transparent">
                             
                             {/* Placeholder Cover */}
                             <div 
                                className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505] transition-opacity duration-500 ${is3DActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                             >
                                <img 
                                    src="https://www.dropbox.com/scl/fi/u2ocqfowe9f292wpzxq2d/3d-visualisation-m1.png?rlkey=9pcxocpda5f5upc4migvl3exk&st=gfj6htp8&raw=1" 
                                    alt="3D Preview"
                                    className="hidden md:block absolute inset-0 w-full h-full object-contain p-12 opacity-60 scale-110"
                                />
                                <div className="hidden md:block absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                                
                                <button 
                                    onClick={() => setIs3DActive(true)}
                                    className="relative z-30 group flex flex-col items-center gap-4 transition-transform hover:scale-105"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:bg-orange-600 group-hover:border-orange-500 transition-colors">
                                        <Box size={32} strokeWidth={1.5} className="ml-1" />
                                    </div>
                                    <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg">
                                        <span className="text-sm font-bold text-white uppercase tracking-wider">Запустить 3D</span>
                                    </div>
                                </button>
                             </div>

                             {/* Actual 3D Component - Optimally unmounts when not active */}
                             {is3DActive && (
                                 <Suspense fallback={<SectionLoader />}>
                                    <Grill3D url={MODEL_URL} enableControls={!isMobile} isVisible={activeSection === 'models'} />
                                </Suspense>
                             )}
                        </div>

                        {!isMobile && is3DActive && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full text-xs font-bold text-gray-400 pointer-events-none select-none shadow-lg z-10 animate-fade-in flex items-center gap-2">
                                 <MoveRight size={14} /> Вращайте • Приближайте
                            </div>
                        )}
                        
                        {/* Mobile "Open Configurator" Button */}
                        <div className="lg:hidden absolute bottom-24 left-0 w-full z-30 flex justify-center pointer-events-auto">
                            <button 
                                onClick={() => setMobileConfigOpen(true)}
                                className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all hover:bg-orange-700 active:scale-95"
                            >
                                <Settings2 size={20} />
                                <span className="font-bold text-sm">Настроить конфигурацию</span>
                            </button>
                        </div>
                     </Reveal>

                     {/* Desktop Configurator Panel */}
                     <Reveal delay={200} className="hidden lg:flex lg:col-span-5 flex-col order-2 lg:order-2 rounded-[2.5rem] overflow-hidden h-full shadow-2xl border border-white/10">
                         <ConfiguratorPanel />
                     </Reveal>

                  </div>
               </div>
            </>
           )}
        </section>

        {/* 8. RECIPE GENERATOR */}
        <div id="ai-chef" ref={setRef('ai-chef')} className="snap-section min-h-[100svh] bg-[#050505] transition-all duration-[2500ms] ease-in-out pt-24 md:pt-0">
             {shouldRenderSection('ai-chef') && (
                 <Suspense fallback={<SectionLoader />}>
                     <RecipeGenerator />
                 </Suspense>
             )}
        </div>

        {/* 9. FOOTER */}
        <footer className="snap-section min-h-[100svh] bg-black text-white flex flex-col justify-center transition-opacity duration-[2500ms] ease-in-out pb-24 md:pb-0">
          <Reveal className="max-w-5xl mx-auto px-6 w-full">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-1">
                <div className="mb-4 text-2xl font-bold tracking-tighter">bbqp</div>
                <p className="text-xs text-gray-500 leading-relaxed">Инновации в искусстве приготовления.</p>
              </div>
              {[
                 { header: "Продукция", links: ["Модели", "Персонализация", "Аксессуары"] },
                 { header: "Поддержка", links: ["Доставка", "Гарантия", "Контакты"] },
                 { header: "О компании", links: ["История", "Производство"] },
              ].map((col) => (
                 <div key={col.header}>
                    <div className="font-bold mb-4 text-xs uppercase tracking-wider text-gray-400">{col.header}</div>
                    <ul className="space-y-2 text-xs text-gray-500">
                       {col.links.map(l => (
                          <li key={l}><a href="#" className="hover:text-orange-500 transition-colors">{l}</a></li>
                       ))}
                    </ul>
                 </div>
              ))}
            </div>
            <div className="border-t border-gray-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
              <p>© 2025 bbqp. Все права защищены.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white">Конфиденциальность</a>
                <a href="#" className="hover:text-white">Условия</a>
              </div>
            </div>
          </Reveal>
        </footer>

      </main>

      <Suspense fallback={null}>
        <ChefBot 
            visible={isIntroComplete} 
            externalIsOpen={isChatOpen}
            onToggle={setIsChatOpen}
        />
      </Suspense>
    </div>
  );
}

export default App;
