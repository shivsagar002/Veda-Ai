'use client';

import React from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoadingScreen() {
  const { 
    isGenerating, 
    progressStep, 
    progressTotalSteps, 
    progressMessage 
  } = useAssignmentStore();

  if (!isGenerating) return null;

  const percent = Math.round((progressStep / progressTotalSteps) * 100);

  // List of mock detailed sub-logs for creative aesthetics
  const logs = [
    { step: 1, text: 'Resolving background worker connection threads...' },
    { step: 2, text: 'Analyzing context bounds & compiling prompt schemas...' },
    { step: 3, text: 'Streaming structured sections & balancing question difficulty tags...' },
    { step: 4, text: 'Writing final database nodes & preparing paper layout...' },
  ];

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#181818]/85 flex justify-center items-center z-[9999] glass">
      <div className="w-[480px] max-md:w-[calc(100%-32px)] p-10 rounded-[24px] bg-[#1e1e1e] border border-white/5 flex flex-col items-center shadow-[0_24px_72px_rgba(0,0,0,0.6)] animate-fade">
        
        {/* Glowing Spinner Center */}
        <div className="relative w-[100px] h-[100px] flex justify-center items-center mb-6">
          <div className="absolute w-20 h-20 bg-brand-accent/15 rounded-full blur-[16px] z-10 animate-pulse-glow"></div>
          <Loader2 
            size={56} 
            color="#ff5623" 
            className="animate-spin relative z-20"
            style={{ animationDuration: '1.2s' }}
          />
          <Sparkles 
            size={18} 
            color="#ff9e10" 
            className="absolute top-3 right-3 z-30 animate-[spin_4s_linear_infinite]" 
          />
        </div>

        {/* Header Titles */}
        <h2 className="font-display text-2xl font-bold text-white text-center mb-2">Creating Assessment Paper</h2>
        <p className="text-[13px] text-white/50 text-center leading-[1.4] mb-8">Our AI background workers are compiling a professional exam sheet.</p>

        {/* Circular Progress Gauge */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-[#ff7950] to-brand-accent rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]" 
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="text-xs font-semibold text-white/70">
            Step {progressStep} of {progressTotalSteps} ({percent}%)
          </div>
        </div>

        {/* Real-Time WebSocket Progress Message Logs */}
        <div className="w-full bg-black/25 rounded-2xl border border-white/5 p-4">
          <div className="flex items-center mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff9e10] mr-2 shadow-[0_0_8px_#ff9e10] animate-pulse-glow" style={{ animationDuration: '1.5s' }}></div>
            <span className="text-xs font-bold text-white/70">
              LIVE WORKER STREAM
            </span>
          </div>

          <div className="flex flex-col gap-2.5 mb-4">
            {logs.map((log) => {
              const isDone = progressStep > log.step;
              const isActive = progressStep === log.step;
              
              return (
                <div 
                  key={log.step} 
                  className="flex items-center transition-opacity duration-300"
                  style={{ opacity: isDone || isActive ? 1 : 0.35 }}
                >
                  {isDone ? (
                    <CheckCircle2 size={15} color="#17cb9e" className="mr-2 shrink-0" />
                  ) : isActive ? (
                    <Loader2 size={15} color="#ff9e10" className="animate-spin mr-2 shrink-0" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mr-3 ml-1 shrink-0"></div>
                  )}
                  <span className={`text-[13px] ${
                    isActive ? 'text-white font-semibold' : isDone ? 'text-white/60 font-normal' : 'text-white/40 font-normal'
                  }`}>
                    {log.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current Active Output Log */}
          <div className="bg-[#ff9e10]/10 border-[1.25px] border-dashed border-[#ff9e10]/25 p-2 px-3 rounded-lg text-xs text-white leading-normal">
            <span className="font-semibold text-[#ff9e10]">Status: </span>
            <span>{progressMessage}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
