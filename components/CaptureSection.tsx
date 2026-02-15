
import React, { useRef, useState } from 'react';
import { Camera, Upload, Settings2, CheckCircle2, FlaskConical } from 'lucide-react';

interface CaptureSectionProps {
  onAnalyze: (image?: string, manualData?: any) => void;
  isAnalyzing: boolean;
}

const CaptureSection: React.FC<CaptureSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'drone'>('image');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Drone data form state
  const [droneData, setDroneData] = useState({
    pH: 7.0,
    tds: 150,
    turbidity: 'Low',
    chlorine: 0.2
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'image' && preview) {
      onAnalyze(preview);
    } else if (activeTab === 'drone') {
      onAnalyze(undefined, droneData);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            activeTab === 'image' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Camera size={18} />
            Drone Photo
          </div>
        </button>
        <button
          onClick={() => setActiveTab('drone')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            activeTab === 'drone' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FlaskConical size={18} />
            Drone Data
          </div>
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'image' ? (
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group overflow-hidden relative"
            >
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <Upload className="text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" size={32} />
                  <p className="text-sm text-slate-500 font-medium">Click to upload drone capture photo</p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <p className="text-xs text-slate-500 italic">Tip: Ensure drone imagery is high resolution and captured directly above the target water source.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">pH Level</label>
              <input 
                type="number" step="0.1" value={droneData.pH} 
                onChange={e => setDroneData({...droneData, pH: parseFloat(e.target.value)})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TDS (ppm)</label>
              <input 
                type="number" value={droneData.tds} 
                onChange={e => setDroneData({...droneData, tds: parseInt(e.target.value)})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Turbidity</label>
              <select 
                value={droneData.turbidity} 
                onChange={e => setDroneData({...droneData, turbidity: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chlorine (mg/L)</label>
              <input 
                type="number" step="0.1" value={droneData.chlorine} 
                onChange={e => setDroneData({...droneData, chlorine: parseFloat(e.target.value)})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || (activeTab === 'image' && !preview)}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
            isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Analyzing Drone Data...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Run AI Diagnostics
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CaptureSection;
