
import React from 'react';
import { AIModel, SessionConfig } from '../types';

interface SettingsSidebarProps {
  config: SessionConfig;
  setConfig: React.Dispatch<React.SetStateAction<SessionConfig>>;
  onDownloadHistory: () => void;
  isProcessing: boolean;
  onClear: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  config,
  setConfig,
  onDownloadHistory,
  isProcessing,
  onClear
}) => {
  return (
    <div className="w-full h-full bg-[#fdfdfd] flex flex-col p-5 overflow-hidden">
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="font-bold text-lg tracking-tight text-[#0d0d0d]">AI Analyst <span className="text-[#9ca3af] font-medium">Pro</span></h1>
        </div>

        <button
          onClick={onClear}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#0d0d0d] hover:bg-[#2a2a2a] rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Session
        </button>

        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
          <section>
            <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em] mb-3">Processor Engine</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f4f4f4] rounded-xl border border-[#eeeeee]">
              <button
                onClick={() => setConfig(prev => ({ ...prev, model: AIModel.CHATGPT }))}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                  config.model === AIModel.CHATGPT ? 'bg-white shadow-sm text-[#0d0d0d] border border-[#e5e5e5]' : 'text-[#676767] hover:text-[#0d0d0d]'
                }`}
              >
                ChatGPT
              </button>
              <button
                onClick={() => setConfig(prev => ({ ...prev, model: AIModel.GEMINI }))}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                  config.model === AIModel.GEMINI ? 'bg-white shadow-sm text-[#0d0d0d] border border-[#e5e5e5]' : 'text-[#676767] hover:text-[#0d0d0d]'
                }`}
              >
                Gemini
              </button>
            </div>
          </section>

          <section>
            <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em] mb-3">System Context</label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="w-full bg-white border border-[#e5e5e5] rounded-xl p-3 text-xs text-[#0d0d0d] focus:ring-2 focus:ring-[#0d0d0d]/5 focus:border-[#0d0d0d] outline-none min-h-[120px] resize-none leading-relaxed transition-all shadow-inner"
              placeholder="Define model behavior..."
            />
          </section>

          <section>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">Creative Bias</label>
              <span className="text-[10px] font-mono font-bold bg-[#f4f4f4] px-1.5 py-0.5 rounded text-[#0d0d0d]">{config.temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full h-1 bg-[#e5e5e5] rounded-lg appearance-none cursor-pointer accent-black"
            />
          </section>

          <section>
            <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em] mb-3">Response Ceiling (Tokens)</label>
            <div className="relative">
              <input
                type="number"
                value={config.maxOutputTokens}
                onChange={(e) => setConfig(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value) || 0 }))}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-2 text-xs font-semibold text-[#0d0d0d] focus:ring-2 focus:ring-[#0d0d0d]/5 focus:border-[#0d0d0d] outline-none shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9ca3af] font-bold">MAX</div>
            </div>
          </section>
        </div>
      </div>

      <div className="pt-6 border-t border-[#e5e5e5] mt-auto">
        <button
          onClick={onDownloadHistory}
          disabled={isProcessing}
          className="w-full py-2.5 px-3 text-[#676767] hover:text-[#0d0d0d] hover:bg-[#f4f4f4] text-xs font-semibold rounded-lg transition-all flex items-center gap-2.5 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Session History (CSV)
        </button>
      </div>
    </div>
  );
};
