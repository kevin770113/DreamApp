import React, { useState, useRef, useEffect } from 'react';
import { analyzeDream } from './services/geminiService';
import { DreamAnalysis } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import AnalysisCard from './components/AnalysisCard';
import HexagramVisualizer from './components/HexagramVisualizer';
import RadarChart from './components/RadarChart';
import ApiKeyModal from './components/ApiKeyModal';
import { 
  Sparkles, 
  ScrollText, 
  Moon, 
  Tent, 
  ArrowRight, 
  RotateCcw,
  BookOpen,
  Brain,
  UserSearch,
  ChevronLeft,
  ChevronRight,
  Quote,
  Info,
  ShieldCheck,
  LogOut,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  const [dreamInput, setDreamInput] = useState('');
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Model Selection State - Defaulting to Pro
  const [currentModelId] = useState<string>('gemini-3-pro-preview');

  // Carousel State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Expansion State
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  // Auth & Usage State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);

  const CARD_COUNT = 5;

  // Swipe logic refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0); // For velocity calculation

  useEffect(() => {
    // Load persisted state on mount
    const storedKey = localStorage.getItem('mystic_user_key');
    const storedCount = localStorage.getItem('mystic_usage_count');
    
    if (storedKey) setUserApiKey(storedKey);
    if (storedCount) setUsageCount(parseInt(storedCount, 10));
  }, []);

  const handleSaveKey = (key: string) => {
    localStorage.setItem('mystic_user_key', key);
    setUserApiKey(key);
    setShowApiKeyModal(false);
    // Auto-retry analysis with the new key
    handleAnalyze(key);
  };

  const handleClearKey = () => {
    if (window.confirm('確定要清除您的 API Key 並切換回系統體驗模式嗎？')) {
      localStorage.removeItem('mystic_user_key');
      setUserApiKey(null);
    }
  };

  const handleAnalyze = async (forceKey?: string) => {
    if (!dreamInput.trim()) return;

    // Check usage limits if no user key provided/available
    const activeKey = forceKey || userApiKey;
    
    // If no custom key and usage >= 10, stop and show modal
    if (!activeKey && usageCount >= 10) {
      setShowApiKeyModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setActiveCardIndex(0);
    setDragOffset(0);
    setIsCardExpanded(false);

    try {
      // Pass the current selected model ID to the service.
      const result = await analyzeDream(dreamInput, currentModelId, activeKey || undefined);
      setAnalysis(result);

      // Increment usage count only if using system key
      if (!activeKey) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('mystic_usage_count', newCount.toString());
      }
    } catch (err: any) {
      console.error("Analysis Error:", err);
      const errString = err.toString().toLowerCase();

      // Check for Quota Exceeded (Resource Exhausted)
      if (errString.includes('quota') || errString.includes('exhausted')) {
        setError("周公已下班，請改日再約");
      } 
      // Check for Rate Limiting (429) or Server Overload (503)
      else if (errString.includes('429') || errString.includes('503') || errString.includes('too many requests')) {
        setError("周公忙線中，請稍後再撥...");
      } 
      // General Error
      else {
        setError("無法解析夢境，請稍後再試。");
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setDreamInput('');
    setError(null);
    setActiveCardIndex(0);
    setDragOffset(0);
    setIsCardExpanded(false);
  };

  // Vibration helper
  const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const changeCard = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < CARD_COUNT) {
      if (isCardExpanded) {
        setIsCardExpanded(false);
        setTimeout(() => {
          setActiveCardIndex(newIndex);
          setDragOffset(0);
          vibrate();
        }, 500);
      } else {
        setActiveCardIndex(newIndex);
        setDragOffset(0);
        vibrate();
      }
    }
  };

  const nextCard = () => changeCard(activeCardIndex + 1);
  const prevCard = () => changeCard(activeCardIndex - 1);

  // Unified Start Handler
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    touchStartX.current = clientX;
    touchStartY.current = clientY;
    touchStartTime.current = Date.now();
    setDragOffset(0);
  };

  // Unified Move Handler
  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const diffX = clientX - touchStartX.current;
    const diffY = clientY - touchStartY.current;

    if (Math.abs(diffY) > Math.abs(diffX) * 1.5) {
      return; 
    }

    if (
      (activeCardIndex === 0 && diffX > 0) || 
      (activeCardIndex === CARD_COUNT - 1 && diffX < 0)
    ) {
      setDragOffset(diffX * 0.3);
    } else {
      setDragOffset(diffX);
    }
  };

  // Unified End Handler
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const touchEndTime = Date.now();
    const duration = touchEndTime - touchStartTime.current;
    const isFlick = duration < 300 && Math.abs(dragOffset) > 20;
    const isLongDrag = Math.abs(dragOffset) > 80;

    if (isFlick || isLongDrag) {
       const isNext = dragOffset < 0;
       const isPrev = dragOffset > 0;
       const canNext = activeCardIndex < CARD_COUNT - 1;
       const canPrev = activeCardIndex > 0;

       if ((isNext && canNext) || (isPrev && canPrev)) {
         if (isCardExpanded) {
            setIsCardExpanded(false);
            setTimeout(() => {
               if (isNext) setActiveCardIndex(prev => prev + 1);
               else setActiveCardIndex(prev => prev - 1);
               setDragOffset(0);
               vibrate();
            }, 500);
            return;
         } else {
            if (isNext) nextCard();
            else prevCard();
            return;
         }
       }
    }
    setDragOffset(0);
  };

  // Wrappers
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  const onTouchEnd = () => handleDragEnd();
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => { if(isDragging) handleDragEnd(); };

  const renderCards = () => {
    if (!analysis) return null;

    const cards = [
      { id: 'iching', component: ( <AnalysisCard title="易經卜卦" icon={<BookOpen className="w-6 h-6" />} colorClass="border-amber-700/50" bgClass="bg-gradient-to-br from-amber-950/80 to-stone-900/80" isExpanded={isCardExpanded} onToggle={() => setIsCardExpanded(!isCardExpanded)}> <div className="text-center mb-4"> <HexagramVisualizer code={analysis.iching.hexagramCode} /> <div className="flex items-center justify-center gap-2 mt-2"> <span className="text-2xl text-white/50">{analysis.iching.hexagramSymbol}</span> <span className="text-xl font-bold text-amber-400">{analysis.iching.hexagramName}</span> </div> </div> <div> <h4 className="font-bold text-amber-200/70 mb-1">卦象解讀：</h4> <p className="text-sm mb-3">{analysis.iching.interpretation}</p> <h4 className="font-bold text-amber-200/70 mb-1">君子建議：</h4> <p className="text-sm italic border-l-2 border-amber-600 pl-3">{analysis.iching.advice}</p> </div> </AnalysisCard> ) },
      { id: 'freud', component: ( <AnalysisCard title="佛洛伊德心理學" icon={<UserSearch className="w-6 h-6" />} colorClass="border-slate-600/50" bgClass="bg-gradient-to-br from-slate-900/90 to-gray-900/90" isExpanded={isCardExpanded} onToggle={() => setIsCardExpanded(!isCardExpanded)}> <div className="space-y-4"> <div> <h4 className="font-bold text-slate-400 mb-1 text-xs uppercase tracking-wider">Manifest Content (顯性)</h4> <p className="text-sm text-gray-300">{analysis.freud.manifestContent}</p> </div> <div className="bg-black/30 p-3 rounded-lg border border-slate-700/30"> <h4 className="font-bold text-slate-300 mb-1 text-xs uppercase tracking-wider">Latent Content (隱性/潛意識)</h4> <p className="text-sm text-slate-100">{analysis.freud.latentContent}</p> </div> <div> <h4 className="font-bold text-slate-400 mb-1">心理分析：</h4> <p className="text-sm">{analysis.freud.psychologicalMeaning}</p> </div> </div> </AnalysisCard> ) },
      { id: 'neuroscience', component: ( <AnalysisCard title="神經科學解析" icon={<Brain className="w-6 h-6" />} colorClass="border-teal-700/50" bgClass="bg-gradient-to-br from-teal-950/80 to-cyan-950/80" isExpanded={isCardExpanded} onToggle={() => setIsCardExpanded(!isCardExpanded)}> <div className="space-y-4"> <div> <h4 className="font-bold text-teal-300/70 mb-1">大腦活動區域：</h4> <p className="text-sm">{analysis.neuroscience.brainActivity}</p> </div> <div> <h4 className="font-bold text-teal-300/70 mb-1">記憶整合機制：</h4> <p className="text-sm">{analysis.neuroscience.memoryConsolidation}</p> </div> <div className="flex items-center gap-2 bg-teal-900/30 p-2 rounded border border-teal-800/30"> <Moon className="w-4 h-4 text-teal-300" /> <span className="text-xs text-teal-100">{analysis.neuroscience.sleepCycleAnalysis}</span> </div> </div> </AnalysisCard> ) },
      { id: 'almanac', component: ( <AnalysisCard title="農民曆 / 周公" icon={<ScrollText className="w-6 h-6" />} colorClass="border-rose-800/50" bgClass="bg-gradient-to-br from-rose-950/80 to-red-950/80" isExpanded={isCardExpanded} onToggle={() => setIsCardExpanded(!isCardExpanded)}> <div className="mb-4"> <h4 className="font-bold text-rose-300/70 mb-1">吉凶寓意：</h4> <p className="text-sm">{analysis.almanac.significance}</p> </div> <div className="grid grid-cols-2 gap-2 mb-4"> <div className="bg-green-950/40 p-2 rounded border border-green-800/30"> <span className="block text-xs text-green-400 font-bold mb-1">宜</span> <ul className="text-xs space-y-1"> {analysis.almanac.goodFor.map((item, i) => <li key={i}>• {item}</li>)} </ul> </div> <div className="bg-red-950/40 p-2 rounded border border-red-800/30"> <span className="block text-xs text-red-400 font-bold mb-1">忌</span> <ul className="text-xs space-y-1"> {analysis.almanac.badFor.map((item, i) => <li key={i}>• {item}</li>)} </ul> </div> </div> <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg justify-center"> <span className="text-sm text-rose-300">幸運數字：</span> <div className="flex gap-2"> {analysis.almanac.luckyNumbers.map(n => ( <span key={n} className="w-6 h-6 rounded-full bg-rose-700 text-white flex items-center justify-center text-xs font-bold shadow-sm"> {n} </span> ))} </div> </div> </AnalysisCard> ) },
      { id: 'gypsy', component: ( <AnalysisCard title="吉普賽占卜" icon={<Tent className="w-6 h-6" />} colorClass="border-violet-700/50" bgClass="bg-gradient-to-br from-violet-950/80 to-purple-950/80" isExpanded={isCardExpanded} onToggle={() => setIsCardExpanded(!isCardExpanded)}> <div className="mb-4"> <h4 className="font-bold text-violet-300/70 mb-1">關鍵象徵：</h4> <div className="flex flex-wrap gap-2"> {analysis.gypsy.symbolsDetected.map((sym, i) => ( <span key={i} className="px-2 py-1 bg-violet-900/40 text-violet-200 rounded text-xs border border-violet-700/50"> {sym} </span> ))} </div> </div> <div className="mb-4"> <h4 className="font-bold text-violet-300/70 mb-1">神秘寓意：</h4> <p className="text-sm">{analysis.gypsy.meaning}</p> </div> <div> <h4 className="font-bold text-violet-300/70 mb-1">未來指引：</h4> <p className="text-sm flex items-start gap-2"> <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0 text-violet-400" /> {analysis.gypsy.prediction} </p> </div> </AnalysisCard> ) }
    ];

    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-gold-400/30 to-transparent z-20 pointer-events-none transition-opacity duration-200 rounded-l-xl" style={{ opacity: (activeCardIndex === 0 && dragOffset > 0) ? Math.min(dragOffset / 100, 1) : 0 }} />
        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-gold-400/30 to-transparent z-20 pointer-events-none transition-opacity duration-200 rounded-r-xl" style={{ opacity: (activeCardIndex === CARD_COUNT - 1 && dragOffset < 0) ? Math.min(Math.abs(dragOffset) / 100, 1) : 0 }} />
        <div className="overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing select-none" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}>
          <div className={`flex ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`} style={{ transform: `translateX(calc(-${activeCardIndex * 100}% + ${dragOffset}px))` }}>
            {cards.map((card) => ( <div key={card.id} className="w-full flex-shrink-0 px-2">{card.component}</div> ))}
          </div>
        </div>
        <div className="flex justify-center mt-6 gap-2">
          {cards.map((_, idx) => ( <button key={idx} onClick={() => changeCard(idx)} className={`w-2 h-2 rounded-full transition-all duration-300 ${activeCardIndex === idx ? 'bg-gold-400 w-6' : 'bg-mystic-600'}`} aria-label={`Go to slide ${idx + 1}`} /> ))}
        </div>
        <button onClick={prevCard} className={`hidden md:block absolute top-1/2 -left-12 transform -translate-y-1/2 p-2 rounded-full bg-mystic-800 border border-mystic-600 text-mystic-300 hover:text-white hover:border-gold-500 transition-colors ${activeCardIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`} disabled={activeCardIndex === 0}><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={nextCard} className={`hidden md:block absolute top-1/2 -right-12 transform -translate-y-1/2 p-2 rounded-full bg-mystic-800 border border-mystic-600 text-mystic-300 hover:text-white hover:border-gold-500 transition-colors ${activeCardIndex === CARD_COUNT - 1 ? 'opacity-30 cursor-not-allowed' : ''}`} disabled={activeCardIndex === CARD_COUNT - 1}><ChevronRight className="w-6 h-6" /></button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystic-900 via-mystic-800 to-black text-white p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 pt-8">
          <div className="inline-block p-3 rounded-full bg-mystic-800/80 mb-4 shadow-[0_0_15px_rgba(118,82,214,0.5)]"><Moon className="w-10 h-10 text-gold-400" /></div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-mystic-100 via-white to-gold-400 mb-2">MysticDream</h1>
          <p className="text-mystic-400 text-lg mb-4">五維夢境深度解析</p>
          <div className="flex justify-center">
            {userApiKey ? (
              <div className="flex items-center gap-3 bg-green-900/30 border border-green-500/30 rounded-full px-4 py-1.5">
                <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  目前使用: 個人專屬金鑰
                </span>
                <div className="w-px h-3 bg-green-700/50"></div>
                <button onClick={handleClearKey} className="text-[10px] text-green-300/70 hover:text-white hover:underline flex items-center gap-1 transition-colors"><LogOut className="w-3 h-3" /> 清除</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-mystic-800/60 border border-mystic-600/50 rounded-full px-4 py-1.5">
                <span className="flex items-center gap-1.5 text-xs text-mystic-300">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  目前使用: 系統體驗額度 ({Math.min(usageCount, 10)}/10)
                </span>
              </div>
            )}
          </div>
        </header>

        {!analysis && !loading && (
          <div className="animate-fade-in-up bg-mystic-800/30 backdrop-blur-sm border border-mystic-700 rounded-2xl p-6 md:p-8 shadow-2xl">
            <label htmlFor="dream" className="block text-lg font-serif mb-4 text-mystic-100">請描述您的夢境...</label>
            <textarea id="dream" value={dreamInput} onChange={(e) => setDreamInput(e.target.value)} placeholder="我看見一隻發光的鹿在森林中奔跑，然後..." className="w-full h-40 bg-mystic-900/60 border border-mystic-600 rounded-xl p-4 text-white placeholder-mystic-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all resize-none text-lg" />
            <button onClick={() => handleAnalyze()} disabled={!dreamInput.trim()} className={`w-full mt-6 py-4 rounded-xl text-xl font-bold font-serif flex items-center justify-center gap-2 transition-all duration-300 ${dreamInput.trim() ? 'bg-gradient-to-r from-mystic-600 to-indigo-600 hover:from-mystic-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-mystic-500/30 transform hover:-translate-y-1' : 'bg-mystic-800 text-mystic-500 cursor-not-allowed'}`}><Sparkles className="w-6 h-6" />開始全方位解析</button>
          </div>
        )}

        {loading && <LoadingSpinner />}
        {error && ( <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-center mb-8">{error}<button onClick={() => setError(null)} className="ml-4 underline">重試</button></div> )}

        {analysis && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-mystic-900/50 border border-mystic-700/50 rounded-xl p-5 backdrop-blur-md shadow-inner relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Quote className="w-16 h-16 text-white" /></div>
               <h3 className="text-xs font-bold text-gold-500 mb-2 uppercase tracking-wider flex items-center gap-2"><Moon className="w-3 h-3" /> 您的夢境</h3>
               <p className="text-gray-200 text-lg leading-relaxed font-serif italic border-l-2 border-mystic-700 pl-4">"{dreamInput}"</p>
            </div>
            <div className="bg-gradient-to-r from-mystic-800 to-indigo-900/50 rounded-2xl p-6 border border-gold-500/30 text-center shadow-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>
              <h2 className="text-2xl font-serif text-gold-400 mb-3 flex items-center justify-center gap-2"><Sparkles className="w-5 h-5" /> 綜合結論</h2>
              <p className="text-lg leading-relaxed text-mystic-100">{analysis.summary}</p>
            </div>
            <div className="flex flex-col items-center justify-center relative">
              <h3 className="text-mystic-300 font-serif text-sm mb-2 opacity-80 uppercase tracking-widest">五維運勢雷達</h3>
              <RadarChart data={analysis.scores} />
              <div className="mt-4 flex flex-col md:flex-row gap-4 text-xs text-mystic-300 bg-mystic-900/40 p-3 rounded-lg border border-mystic-700/30">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gold-500 mt-0.5" />
                  <div>
                    <span className="text-gold-400 font-bold block mb-1">分數說明 (1-5)</span>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <div><span className="text-mystic-400">宗教/占卜:</span> <span className="ml-1 text-white">凶 <span className="text-mystic-500">➜</span> 吉</span></div>
                      <div><span className="text-mystic-400">科學/心理:</span> <span className="ml-1 text-white">負面 <span className="text-mystic-500">➜</span> 正向</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-mystic-400 font-serif opacity-75 pt-4">點擊卡片展開詳細內容，滑動查看不同分析</div>
            {renderCards()}
            <div className="text-center pt-8 pb-12"><button onClick={reset} className="px-8 py-3 bg-transparent border border-mystic-600 text-mystic-300 hover:text-white hover:border-gold-500 rounded-full transition-all duration-300 flex items-center gap-2 mx-auto"><RotateCcw className="w-4 h-4" />解析另一個夢境</button></div>
          </div>
        )}

        <ApiKeyModal isOpen={showApiKeyModal} onSave={handleSaveKey} onClose={() => setShowApiKeyModal(false)} />
        
      </div>
    </div>
  );
};

export default App;