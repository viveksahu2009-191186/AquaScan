
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, TrendingUp, Droplets, ShieldCheck, Flame, Filter, Ban, Megaphone } from 'lucide-react';
import { AnalysisResult, RiskLevel } from '../types';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  history: AnalysisResult[];
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, history }) => {
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case RiskLevel.CAUTION: return 'text-amber-700 bg-amber-50 border-amber-200';
      case RiskLevel.UNSAFE: return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return <ShieldCheck className="text-emerald-500" size={32} />;
      case RiskLevel.CAUTION: return <AlertCircle className="text-amber-500" size={32} />;
      case RiskLevel.UNSAFE: return <AlertCircle className="text-rose-500" size={32} />;
    }
  };

  const getRecIcon = (rec: string) => {
    const r = rec.toLowerCase();
    if (r.includes('boil')) return <Flame size={16} />;
    if (r.includes('filter')) return <Filter size={16} />;
    if (r.includes('avoid') || r.includes('stop')) return <Ban size={16} />;
    if (r.includes('report') || r.includes('call')) return <Megaphone size={16} />;
    return <CheckCircle2 size={16} />;
  };

  const chartData = [...history].reverse().slice(-7).map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: h.score
  }));

  return (
    <div className="space-y-6">
      {/* Risk Hero Card */}
      <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.riskLevel)} transition-all duration-500 shadow-sm`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Water Safety Status</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl font-black">{result.riskLevel}</span>
              {getRiskIcon(result.riskLevel)}
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Purity Score</h3>
            <p className="text-4xl font-black">{result.score}%</p>
          </div>
        </div>
        
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-black/5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Simple Explanation:</p>
          <p className="text-lg font-medium leading-snug text-slate-900">{result.simpleExplanation}</p>
        </div>
      </div>

      {/* Health Alerts - Only shown if alerts exist */}
      {result.alerts && result.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500" />
            Critical Health Alerts
          </h3>
          {result.alerts.map((alert, idx) => (
            <div key={idx} className={`p-4 rounded-xl border-l-4 shadow-sm flex gap-4 items-start ${
              alert.severity === 'high' ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-amber-50 border-amber-500 text-amber-900'
            }`}>
              <AlertCircle className="shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-base">{alert.title}</p>
                <p className="text-sm opacity-80 leading-relaxed">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Droplets className="text-blue-500" size={20} />
            <h3 className="font-bold text-slate-800">Parameters</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'pH Level', val: result.parameters.pH },
              { label: 'TDS (ppm)', val: result.parameters.tds },
              { label: 'Chlorine', val: result.parameters.chlorine },
              { label: 'Turbidity', val: result.parameters.turbidity },
            ].map((p, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.label}</p>
                <p className="text-xl font-black text-slate-700">{p.val ?? '--'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-500" size={20} />
            <h3 className="font-bold text-slate-800">Recent Quality</h3>
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" size={20} />
          Recommended Actions
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                {getRecIcon(rec)}
              </span>
              <span className="font-medium">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
