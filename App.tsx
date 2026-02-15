
import React, { useState, useEffect } from 'react';
import { Droplets, History, LayoutDashboard, Microscope, Shield, Menu, X, Languages, WifiOff, AlertCircle, Map as MapIcon, Globe } from 'lucide-react';
import CaptureSection from './components/CaptureSection';
import AnalysisDashboard from './components/AnalysisDashboard';
import HotspotMap from './components/HotspotMap';
import { analyzeWaterSample } from './services/geminiService';
import { AnalysisResult, Hotspot, Location } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'scan' | 'dashboard' | 'history' | 'map'>('scan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Spanish' | 'Hindi'>('English');

  // Mock regional hotspot data
  const [hotspots] = useState<Hotspot[]>([
    { id: '1', region: 'North District', avgScore: 42, riskCount: 15, dominantIssue: 'High Fluoride', lat: 25, lng: 30 },
    { id: '2', region: 'East Riverside', avgScore: 88, riskCount: 2, dominantIssue: 'Minor Silt', lat: 65, lng: 45 },
    { id: '3', region: 'Central Valley', avgScore: 31, riskCount: 24, dominantIssue: 'Nitrate Pollution', lat: 45, lng: 60 },
    { id: '4', region: 'West Highlands', avgScore: 92, riskCount: 0, dominantIssue: 'None', lat: 20, lng: 75 },
    { id: '5', region: 'South Plains', avgScore: 55, riskCount: 8, dominantIssue: 'Lead Suspicion', lat: 75, lng: 80 }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('aquascan_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aquascan_history', JSON.stringify(history));
  }, [history]);

  const getCurrentLocation = (): Promise<Location | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(undefined),
        { timeout: 5000 }
      );
    });
  };

  const handleAnalysis = async (image?: string, manualData?: any) => {
    setIsAnalyzing(true);
    try {
      const location = await getCurrentLocation();
      const result = await analyzeWaterSample(image, manualData, language);
      const enrichedResult = { ...result, location };
      
      setCurrentResult(enrichedResult);
      setHistory(prev => [enrichedResult, ...prev]);
      setActiveView('dashboard');
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("AI Analysis failed. Check internet connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const translations = {
    English: {
      title: "Water Diagnostics",
      subtitle: "Smart assessment for safe drinking water.",
      newScan: "New Analysis",
      dashboard: "Results",
      history: "Local Logs",
      map: "Geo Insights",
      offlineTip: "Works offline with saved logs"
    },
    Spanish: {
      title: "Diagnóstico de Agua",
      subtitle: "Evaluación inteligente para agua potable segura.",
      newScan: "Nuevo Análisis",
      dashboard: "Resultados",
      history: "Historial",
      map: "Perspectivas Geo",
      offlineTip: "Funciona sin conexión con registros"
    },
    Hindi: {
      title: "जल निदान",
      subtitle: "सुरक्षित पेयजल के लिए स्मार्ट मूल्यांकन।",
      newScan: "नया विश्लेषण",
      dashboard: "परिणाम",
      history: "इतिहास",
      map: "भौगोलिक जानकारी",
      offlineTip: "सहेजे गए लॉग के साथ ऑफ़लाइन काम करता है"
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 fixed h-full z-50">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Droplets className="text-white" size={24} />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">AquaScan AI</span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'scan', label: t.newScan, icon: <Microscope size={20} /> },
            { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard size={20} />, disabled: !currentResult },
            { id: 'history', label: t.history, icon: <History size={20} /> },
            { id: 'map', label: t.map, icon: <Globe size={20} /> }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
              } ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
            <Languages size={16} className="text-slate-500" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full"
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="Hindi">हिन्दी</option>
            </select>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <WifiOff className="text-emerald-600 shrink-0" size={16} />
            <p className="text-[10px] text-emerald-700 leading-tight font-bold uppercase">
              {t.offlineTip}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {activeView === 'scan' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <header className="space-y-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t.title}</h1>
                <p className="text-slate-500 text-lg font-medium">{t.subtitle}</p>
              </header>

              <CaptureSection onAnalyze={handleAnalysis} isAnalyzing={isAnalyzing} />

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Shield className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm italic">Geo-Mapping Active</h4>
                  <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    Samples are anonymously tagged with GPS data and drone data integration to help local authorities track infrastructure health.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'dashboard' && currentResult && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.dashboard}</h1>
                <button 
                  onClick={() => setActiveView('scan')}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800"
                >
                  {t.newScan}
                </button>
              </div>
              <AnalysisDashboard result={currentResult} history={history} />
            </div>
          )}

          {activeView === 'history' && (
            <div className="animate-in fade-in duration-500 pb-20">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.history}</h1>
                <span className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-600 rounded-full">
                  {history.length} Saved
                </span>
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-slate-100 border-dashed">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-500 font-bold">No saved logs yet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {history.map((h, i) => (
                    <div 
                      key={i} 
                      onClick={() => {setCurrentResult(h); setActiveView('dashboard')}}
                      className="group p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
                          h.riskLevel === 'SAFE' ? 'bg-emerald-50 text-emerald-600' : 
                          h.riskLevel === 'CAUTION' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {h.score}%
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{h.riskLevel}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(h.timestamp).toLocaleDateString()} • {h.location ? '📍 Localized' : '📡 Tagged'}</p>
                        </div>
                      </div>
                      <LayoutDashboard className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'map' && (
            <div className="animate-in fade-in duration-500 pb-20">
              <header className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t.map}</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Real-time aggregated regional water quality insights from drone data.</p>
              </header>
              <HotspotMap hotspots={hotspots} history={history} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 pb-6 z-[60]">
        {[
          { id: 'scan', label: 'Scan', icon: <Microscope size={20} /> },
          { id: 'dashboard', label: 'Result', icon: <LayoutDashboard size={20} />, disabled: !currentResult },
          { id: 'history', label: 'History', icon: <History size={20} /> },
          { id: 'map', label: 'Map', icon: <Globe size={20} /> }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveView(item.id as any)}
            disabled={item.disabled}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeView === item.id ? 'text-blue-600' : 'text-slate-400'
            } ${item.disabled ? 'opacity-20' : ''}`}
          >
            {item.icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
