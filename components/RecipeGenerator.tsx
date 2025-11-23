
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChefHat, Flame } from 'lucide-react';
import { generateBBQRecipe } from '../services/geminiService';
import Reveal from './Reveal';

const FLOATING_IMAGES = [
  "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=400", // Steak
  "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=400", // Ribs
  "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80&w=400", // Wagyu
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400", // BBQ Plate
  "https://images.unsplash.com/photo-1527477396000-643d68ad82fa?auto=format&fit=crop&q=80&w=400", // Sausages
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400", // Ribs 2
  "https://images.unsplash.com/photo-1598103442097-8b74072e56ab?auto=format&fit=crop&q=80&w=400", // Grill fire
  "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=400", // Steak 2
  "https://images.unsplash.com/photo-1623689046286-01d812cc7ac7?auto=format&fit=crop&q=80&w=400", // Skewers
  "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&q=80&w=400", // Meat
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400", // Food generic
  "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&q=80&w=400", // Veggies
];

const FloatingImage: React.FC<{ src: string, style: React.CSSProperties }> = ({ src, style }) => {
    const [isVisible, setIsVisible] = useState(true);
    
    if (!isVisible) return null;

    return (
        <div 
            className="absolute w-24 h-24 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 opacity-60"
            style={style}
        >
            <img 
                src={src} 
                alt="Food" 
                className="w-full h-full object-cover" 
                onError={() => setIsVisible(false)}
            />
        </div>
    );
};

interface RecipeResult {
    text: string;
    image?: string;
}

const RecipeGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setRecipe(null);
    
    try {
      const result = await generateBBQRecipe(input);
      setRecipe(result);
    } catch (error) {
      setRecipe({ text: "Что-то пошло не так. Попробуйте еще раз, возможно угли отсырели!" });
    } finally {
      setLoading(false);
    }
  };

  // Chaotic Flying styles
  const getFloatStyle = (index: number) => {
    const randomDuration = 15 + Math.random() * 20; // 15-35s
    const randomDelay = Math.random() * 10;
    const randomX = Math.random() * 90;
    const randomY = Math.random() * 80;
    
    return {
      animation: `float-${index} ${randomDuration}s infinite ease-in-out ${randomDelay}s`,
      left: `${randomX}%`,
      top: `${randomY}%`,
    } as React.CSSProperties;
  };

  const isResultMode = !!recipe;

  return (
    <section id="ai-chef" className="relative w-full h-full min-h-screen bg-[#111] text-white overflow-hidden flex items-center justify-center">
        <style>{`
            ${FLOATING_IMAGES.map((_, i) => `
              @keyframes float-${i} {
                0% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(${Math.random()*100 - 50}px, ${Math.random()*100 - 50}px) rotate(${Math.random()*20 - 10}deg); }
                66% { transform: translate(${Math.random()*100 - 50}px, ${Math.random()*100 - 50}px) rotate(${Math.random()*20 - 10}deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }
            `).join('')}
        `}</style>

      {/* Background Flying Images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {FLOATING_IMAGES.map((src, idx) => (
           <FloatingImage key={idx} src={src} style={getFloatStyle(idx)} />
        ))}
      </div>

      {/* Main Content - Dynamically adjust padding based on state */}
      <div className={`relative z-10 max-w-4xl w-full px-6 flex flex-col h-[80vh] transition-all duration-500 ${isResultMode ? 'pt-24' : 'pt-32'}`}>
        
        {/* Header - Hidden when result is shown */}
        {!isResultMode && (
            <Reveal className="text-center mb-8">
               <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                 bbqp<sup className="text-2xl md:text-3xl text-orange-500 font-bold align-top top-[-1em] ml-1 drop-shadow-[0_0_10px_rgba(234,88,12,0.8)]">AI Chef</sup>
               </h2>
               <p className="text-gray-400 text-lg max-w-xl mx-auto">
                 Генерируйте уникальные рецепты стейков и гриля. <br/>
                 Ваш персональный су-шеф.
               </p>
            </Reveal>
        )}

        {/* Chat/Result Container - Dark Glass + Glare */}
        <Reveal delay={200} className={`flex-1 flex flex-col overflow-hidden ${isResultMode ? 'h-full' : ''}`}>
            <div className={`flex-1 bg-black/60 backdrop-blur-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative transition-all duration-500 ${isResultMode ? 'h-full' : ''}`}>
                
                {/* Output Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {!recipe && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-4">
                            <ChefHat size={48} className="opacity-20" />
                            <p className="text-sm">
                                Введите название блюда, например:<br/>
                                <span className="text-white font-bold">"Стейк Рибай Medium Rare"</span> или <span className="text-white font-bold">"Сочные немецкие колбаски"</span>
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                                <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={24} />
                            </div>
                            <p className="text-sm text-gray-400 animate-pulse">Шеф разогревает гриль...</p>
                        </div>
                    )}

                    {recipe && (
                        <div className="prose prose-invert max-w-none animate-fade-in">
                            {recipe.image && (
                                <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-white/10 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                    <img src={recipe.image} alt="Generated Dish" className="w-full h-64 md:h-80 object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                </div>
                            )}
                            <div className="whitespace-pre-wrap leading-relaxed text-gray-200 text-sm md:text-base">
                                {recipe.text}
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/40 border-t border-white/10 flex-shrink-0">
                    <div className="relative flex items-center gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            placeholder="Что будем готовить сегодня?"
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-white/10 transition-all placeholder:text-gray-500"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={loading}
                            className="absolute right-2 p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </Reveal>

      </div>
    </section>
  );
};

export default RecipeGenerator;
