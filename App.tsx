
import React, { useState, useEffect } from 'react';
import { 
  Heart, Users, Calendar, ShieldCheck, BookOpen, Activity, ArrowRight, 
  ChevronDown, CheckCircle2, Lock, MessageSquare, Star, ChevronRight, 
  Share2, Download, ChevronUp, RefreshCcw, ArrowLeft, Loader2
} from 'lucide-react';
// Updated import to follow @google/genai guidelines
import { GoogleGenAI } from "@google/genai";

import { brandColors, cities, currentOptions, futureOptions, questions, powerCategories } from './constants';
import { AvatarIllustration, IntroIllustration, SceneIllustration, WarmVideoIllustration } from './components/Illustrations';
import { ConsultForm, MoodState, NebulaData } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('intro'); 
  const [scores, setScores] = useState<Record<number, number>>({});
  const [expandedPower, setExpandedPower] = useState<string | null>(null); 
  const [showConsult, setShowConsult] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [moodState, setMoodState] = useState<MoodState>({ 
    currentImg: null, currentTag: '', futureImg: null, futureTag: '' 
  });
  
  const [nebulaData, setNebulaData] = useState<NebulaData>({
    q1: 5, q8: '', q9: '', q15: '', q16: '', nickname: '', avatar: null
  });

  const [consultForm, setConsultForm] = useState<ConsultForm>({
    q2: [], q3: '', q4: '', q12: '', q13: '', q14: '', q17: '', q19: '', q20: ''  
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleGenerateReport = async () => {
    navigateTo('result');
    fetch('https://hook.us2.make.com/osvdwga9wtb365rj4i3v4wxp9lkjpmhy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nebulaData, scores, moodState, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  };

  const unlockAiStrategy = async () => {
    setIsAiLoading(true);
    try {
      // Initialize GoogleGenAI with the mandatory named parameter for apiKey
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `你是一位專業的長期照顧諮詢顧問。
      使用者暱稱：${nebulaData.nickname}，身份：${nebulaData.q15}。
      照顧對象患有：${nebulaData.q8}，目前在：${nebulaData.q9}。
      壓力指數：${nebulaData.q1}/10，目前心境：${moodState.currentTag}。
      請針對以上狀況，提供 3 條具體、溫暖且專業的「解鎖行動方案」。請限制在 200 字內，用繁體中文回覆。`;

      // Use ai.models.generateContent directly with model name and contents
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      // Extract text using the response.text property (not a method)
      setAiInsight(response.text || '');
    } catch (error) {
      console.error(error);
      setAiInsight('目前 AI 諮詢量較大，請稍後再試，或直接聯絡照顧管家。');
    } finally {
      setIsAiLoading(false);
    }
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleRestart = () => {
    setScores({});
    setAiInsight('');
    navigateTo('intro');
  };

  const isAssessmentComplete = Object.keys(scores).length === questions.length;
  const isMoodComplete = moodState.currentImg !== null && moodState.currentTag !== '' && moodState.futureImg !== null && moodState.futureTag !== '';
  const isFinalStepComplete = !!(nebulaData.q8 && nebulaData.nickname && nebulaData.avatar);

  const getCategoryScore = (catId: 'support' | 'info' | 'knowledge') => {
    return powerCategories[catId].ids.reduce((sum, id) => sum + (scores[id] || 0), 0);
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { label: '高風險', color: '#f87171', bg: '#fee2e2', shadow: 'rgba(248, 113, 113, 0.6)' }; 
    if (score <= 7) return { label: '中風險', color: '#f59e0b', bg: '#fef3c7', shadow: 'rgba(245, 158, 11, 0.6)' }; 
    return { label: '低風險', color: '#10b981', bg: '#d1fae5', shadow: 'rgba(16, 185, 129, 0.6)' }; 
  };

  const analysis = {
    support: { score: getCategoryScore('support'), risk: getRiskLevel(getCategoryScore('support')) },
    info: { score: getCategoryScore('info'), risk: getRiskLevel(getCategoryScore('info')) },
    knowledge: { score: getCategoryScore('knowledge'), risk: getRiskLevel(getCategoryScore('knowledge')) }
  };

  return (
    <div className="min-h-screen bg-[#fffafb] pb-16">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f4d0da] p-2 flex flex-col items-center shadow-sm">
         <img src="https://www.ilong-termcare.com/uploads/photos/shares/articles-content/%E6%98%9F%E9%9B%B2%E8%A8%88%E7%95%ABLOGO.png" alt="星雲計畫" className="h-8 mb-1" />
         <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${currentPage === 'intro' ? 10 : currentPage === 'result' ? 100 : 50}%` }}></div>
         </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-20">
        {currentPage === 'intro' && (
          <div className="text-center space-y-6 py-8">
            <IntroIllustration />
            <h1 className="text-3xl font-black text-pink-600">照護指南速成工具</h1>
            <p className="text-gray-500 font-bold">診斷隱形風險 • 照顧三力評析 • 專屬行動叮嚀</p>
            <button onClick={() => navigateTo('assessment')} className="w-full bg-pink-500 text-white py-5 rounded-full text-xl font-black shadow-xl flex items-center justify-center gap-2">
              開始診斷 <ArrowRight />
            </button>
          </div>
        )}

        {currentPage === 'assessment' && (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
                <div className="flex gap-3 mb-4">
                  <div className="p-2 bg-pink-50 rounded-full">{q.icon}</div>
                  <h3 className="font-bold text-lg leading-tight">{q.text}</h3>
                </div>
                <div className="flex justify-between px-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setScores({...scores, [q.id]: n})} className={`w-12 h-12 rounded-full border-2 font-black transition-all ${scores[q.id] === n ? 'bg-pink-500 border-pink-500 text-white shadow-lg' : 'border-slate-100 text-slate-400'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button disabled={!isAssessmentComplete} onClick={() => navigateTo('mood')} className="w-full bg-slate-800 text-white py-4 rounded-full font-bold disabled:opacity-30">下一頁</button>
          </div>
        )}

        {currentPage === 'mood' && (
          <div className="space-y-8 py-4">
             <section>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Heart className="text-pink-500" /> 察覺現況壓力</h2>
                <div className="grid grid-cols-5 gap-2 mb-4">
                   {[0,1,2,3,4].map(i => (
                     <button key={i} onClick={() => setMoodState({...moodState, currentImg: i})} className={`aspect-square rounded-xl border-4 overflow-hidden ${moodState.currentImg === i ? 'border-pink-500' : 'border-transparent'}`}>
                        <SceneIllustration type="current" index={i} active={moodState.currentImg === i} />
                     </button>
                   ))}
                </div>
                <div className="space-y-2">
                   {currentOptions.map(opt => (
                     <button key={opt.title} onClick={() => setMoodState({...moodState, currentTag: opt.title})} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${moodState.currentTag === opt.title ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 bg-white text-slate-500'}`}>
                        <div className="font-black">{opt.title}</div>
                        <div className="text-xs opacity-70">{opt.desc}</div>
                     </button>
                   ))}
                </div>
             </section>
             <button disabled={!isMoodComplete} onClick={() => navigateTo('nebula')} className="w-full bg-slate-800 text-white py-4 rounded-full font-bold disabled:opacity-30">最後一步</button>
          </div>
        )}

        {currentPage === 'nebula' && (
          <div className="space-y-6 py-4">
             <div className="bg-white p-6 rounded-3xl border-2 border-pink-100 shadow-sm space-y-6">
                <h2 className="text-xl font-black text-center text-pink-600 underline decoration-pink-200">建立照護檔案</h2>
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-black text-slate-400 mb-1">您的暱稱</label>
                      <input type="text" value={nebulaData.nickname} onChange={e => setNebulaData({...nebulaData, nickname: e.target.value})} className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold" placeholder="例如：祐馨" />
                   </div>
                   <div>
                      <label className="block text-sm font-black text-slate-400 mb-1">主要疾病狀況</label>
                      <select value={nebulaData.q8} onChange={e => setNebulaData({...nebulaData, q8: e.target.value})} className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold bg-white">
                         <option value="">請選擇</option>
                         {['失智症', '中風', '衰弱老邁', '癌症', '糖尿病'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                   <div className="pt-4 flex justify-around">
                      {['female', 'neutral', 'male'].map((t: any) => (
                        <button key={t} onClick={() => setNebulaData({...nebulaData, avatar: t})} className={`transition-transform ${nebulaData.avatar === t ? 'scale-125' : 'scale-100 opacity-50'}`}>
                           <AvatarIllustration type={t} selected={nebulaData.avatar === t} />
                        </button>
                      ))}
                   </div>
                </div>
             </div>
             <button disabled={!isFinalStepComplete} onClick={handleGenerateReport} className="w-full bg-pink-500 text-white py-5 rounded-full text-xl font-black shadow-xl">生成診斷報告</button>
          </div>
        )}

        {currentPage === 'result' && (
          <div className="space-y-8 py-4 animate-in fade-in">
             <div id="result-card" className="bg-white p-6 rounded-[40px] shadow-2xl border border-pink-50">
                <div className="text-center mb-8 border-b border-dashed border-pink-200 pb-6">
                   <AvatarIllustration type={nebulaData.avatar} selected={false} />
                   <h2 className="text-2xl font-black mt-2">{nebulaData.nickname} 的照顧檔案</h2>
                   <div className="mt-2 text-pink-500 font-bold px-4 py-1 bg-pink-50 inline-block rounded-full text-sm">壓力點：{moodState.currentTag}</div>
                </div>

                <div className="space-y-8">
                   {['support', 'info', 'knowledge'].map((key) => {
                     const cat = powerCategories[key];
                     const score = analysis[key as keyof typeof analysis];
                     return (
                       <div key={key} className="relative">
                          <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2 font-black text-lg">
                                {cat.icon} {cat.label}
                                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: score.risk.bg, color: score.risk.color }}>{score.risk.label}</span>
                             </div>
                             <span className="font-black text-slate-300">{score.score}/10</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${score.score * 10}%` }}></div>
                          </div>
                       </div>
                     );
                   })}
                </div>

                <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 relative">
                   {aiInsight ? (
                     <div className="animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 mb-3 text-pink-600 font-black">
                           <Star size={20} /> AI 專屬行動方案
                        </div>
                        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{aiInsight}</p>
                     </div>
                   ) : (
                     <div className="text-center py-4 space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                           <Lock className="mx-auto text-slate-300 mb-2" />
                           <p className="text-slate-400 text-sm font-bold">點擊下方按鈕，由 Gemini AI <br/>為您產出具體的行動策略</p>
                        </div>
                        <button 
                          onClick={unlockAiStrategy} 
                          disabled={isAiLoading}
                          className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                          {isAiLoading ? <Loader2 className="animate-spin" /> : <MessageSquare size={18} />}
                          即刻解鎖 AI 行動策略
                        </button>
                     </div>
                   )}
                </div>
                
                <WarmVideoIllustration />
             </div>

             <div className="flex gap-2 no-print">
                <button onClick={() => window.print()} className="flex-1 bg-white border-2 border-slate-100 py-4 rounded-full font-bold flex items-center justify-center gap-2"><Download size={18} /> 保存報告</button>
                <button onClick={() => setCurrentPage('intro')} className="flex-1 bg-white border-2 border-slate-100 py-4 rounded-full font-bold flex items-center justify-center gap-2"><RefreshCcw size={18} /> 重新檢測</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
