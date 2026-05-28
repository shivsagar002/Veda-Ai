'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import LoadingScreen from '../../components/LoadingScreen';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAssignmentStore, IAssignment } from '../../store/useAssignmentStore';
import confetti from 'canvas-confetti';
import { 
  Download, 
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getDifficultyBadge = (difficulty: string) => {
  if (!difficulty) return null;
  const diff = difficulty.toLowerCase().trim();
  let bg = 'bg-[#17cb9e12]';
  let text = 'text-[#17cb9e]';
  let border = 'border-[#17cb9e33]';
  let label = 'Easy';

  if (diff === 'medium' || diff === 'moderate') {
    bg = 'bg-[#ff9e1012]';
    text = 'text-[#ff9e10]';
    border = 'border-[#ff9e1033]';
    label = 'Moderate';
  } else if (diff === 'hard' || diff === 'challenging') {
    bg = 'bg-[#c5353512]';
    text = 'text-[#c53535]';
    border = 'border-[#c5353533]';
    label = 'Hard';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${bg} ${text} ${border} select-none`}>
      {label}
    </span>
  );
};

export default function AssignmentClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;

  const {
    currentAssignment,
    setCurrentAssignment,
    pdfCompiling,
    setPDFCompiling,
    pdfUrl,
    setPDFUrl,
    startGeneration,
    resetProgress,
  } = useAssignmentStore();

  const [showAnswerKey, setShowAnswerKey] = useState(true);

  useWebSocket(id);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/assignments/${id}`);
        if (response.ok) {
          const data: IAssignment = await response.json();
          setCurrentAssignment(data);
          if (data.pdfUrl) setPDFUrl(data.pdfUrl);
        }
      } catch (error) {
        console.error('Failed to fetch assignment:', error);
      }
    };

    if (id && (!currentAssignment || currentAssignment._id !== id)) {
      fetchAssignment();
    }
  }, [id, currentAssignment, setCurrentAssignment, setPDFUrl]);

  useEffect(() => {
    if (currentAssignment && currentAssignment.status === 'COMPLETED') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [currentAssignment]);

  // Effect: open the compiled PDF in a new tab only (no current-tab navigation)
  useEffect(() => {
    if (pdfUrl) {
      const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${BACKEND_URL}${pdfUrl}`;
      
      // Open PDF in a new tab — the browser's native PDF viewer handles downloading
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
      
      // Reset PDF store state to prevent re-triggering
      setPDFUrl(null);
      setPDFCompiling(false);
    }
  }, [pdfUrl, setPDFUrl, setPDFCompiling]);

  const handleDownloadPDF = async () => {
    try {
      setPDFCompiling(true);
      const response = await fetch(`${BACKEND_URL}/api/assignments/${id}/pdf`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate PDF compilation.');
      }

      const data = await response.json();
      if (data.pdfUrl) {
        setPDFUrl(data.pdfUrl);
      }
    } catch (err: any) {
      console.error('PDF download trigger failed:', err);
      alert('Failed to compile PDF paper. Please try again.');
      setPDFCompiling(false);
    }
  };

  const handleRegenerate = async () => {
    if (!currentAssignment) return;
    if (!confirm('Regenerate this assignment? All current questions will be replaced.')) return;

    try {
      startGeneration();
      const response = await fetch(`${BACKEND_URL}/api/assignments/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server rejected regeneration request.');
      }
    } catch (err: any) {
      console.error('Regeneration trigger failed:', err);
      alert(err.message || 'Failed to regenerate paper.');
      resetProgress();
    }
  };

  // Error view if generation failed
  if (currentAssignment && currentAssignment.status === 'FAILED') {
    return (
      <div className="flex w-full h-screen animate-fade">
        <Sidebar />
        <div className="main-content flex flex-col flex-1 h-full overflow-y-auto bg-brand-surface font-sans">
          <TopBar breadcrumb="Assignment Error" hideMobileHeader />
          <div className="flex flex-1 justify-center items-center p-8">
            <div className="bg-[#232323] rounded-[24px] p-10 max-w-[500px] border border-red-500/20 text-center shadow-[0_24px_72px_rgba(0,0,0,0.4)] flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex justify-center items-center text-red-500">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white mb-2">Generation Failed</h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {currentAssignment.error || "An unexpected error occurred during assignment paper generation."}
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  className="flex-1 bg-white hover:bg-gray-100 border-none rounded-full py-3 px-6 font-sans text-xs font-bold text-[#181818] cursor-pointer transition-all duration-200"
                  onClick={() => router.push('/')}
                >
                  Dashboard
                </button>
                <button
                  className="flex-1 bg-transparent hover:bg-white/10 border border-white/20 rounded-full py-3 px-6 font-sans text-xs font-bold text-white cursor-pointer transition-all duration-200"
                  onClick={handleRegenerate}
                >
                  Retry Generation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Actively loading or generating state views
  if (!currentAssignment || !currentAssignment.generatedPaper) {
    const isGeneratingState = currentAssignment && (currentAssignment.status === 'GENERATING' || currentAssignment.status === 'PENDING');
    
    if (isGeneratingState) {
      return (
        <div className="flex w-full h-screen animate-fade">
          <Sidebar />
          <div className="main-content flex flex-col flex-1 h-full overflow-y-auto bg-brand-surface">
            <TopBar breadcrumb="Assignment Generation" hideMobileHeader />
            <div className="flex-1 flex justify-center items-center relative">
              <LoadingScreen />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-center items-center w-screen h-screen bg-brand-surface font-sans">
        <Loader2 size={32} color="#ff5623" className="animate-spin" />
        <span className="mt-3 font-semibold text-white/70">Loading Assignment Data...</span>
      </div>
    );
  }

  const paper = currentAssignment.generatedPaper;

  return (
    <div className="flex w-full h-full animate-fade">
      <Sidebar />
      <LoadingScreen />

      <div className="main-content flex flex-col flex-1 h-full overflow-y-auto ">
        <TopBar breadcrumb="Assignment" hideMobileHeader />

        <div className="p-8 mx-4 my-6 pb-[120px] max-md:px-5 max-md:pt-10 max-md:pb-[104px] flex-1 relative md:bg-[#181818CC] rounded-xl">
          <div className="w-full  mx-auto flex flex-col gap-6 shrink-0">
            {/* ── DARK HERO SECTION CARD ── */}
            <div className="bg-[#232323] rounded-[24px] p-8 px-12 max-md:p-6 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
              <div className="font-display text-[15px] max-md:text-sm font-medium text-white leading-normal tracking-[-0.02em]">
                Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
              </div>
              <div className="flex items-center gap-3">
                {/* Desktop: Rounded Pill Button */}
                <button
                  className="hidden sm:flex bg-white hover:bg-gray-50 border-none rounded-full py-2.5 px-6 font-sans text-[13px] font-bold text-[#181818] cursor-pointer items-center gap-2 transition-all duration-200 hover:scale-[0.98] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                  onClick={handleDownloadPDF}
                  disabled={pdfCompiling}
                >
                  {pdfCompiling ? (
                    <><Loader2 size={15} className="animate-spin text-[#181818] mr-1.5" />Compiling...</>
                  ) : (
                    <><Download size={15} className="text-[#181818] mr-1.5" />Download as PDF</>
                  )}
                </button>

                {/* Desktop: Outlined Pill Regenerate Button */}
                <button
                  className="hidden sm:flex bg-transparent hover:bg-white/10 border border-white/20 rounded-full py-2.5 px-6 font-sans text-[13px] font-bold text-white cursor-pointer items-center gap-2 transition-all duration-200 hover:scale-[0.98] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleRegenerate}
                  disabled={pdfCompiling}
                >
                  <RefreshCw size={15} className="text-white mr-1.5" />
                  Regenerate
                </button>

                {/* Mobile: Circle Icon Button (Mockup Spec) */}
                <button
                  className="flex sm:hidden w-12 h-12 rounded-full bg-white hover:bg-gray-50 border-none justify-center items-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform duration-200 active:scale-95 disabled:opacity-60"
                  onClick={handleDownloadPDF}
                  disabled={pdfCompiling}
                  title="Download as PDF"
                >
                  {pdfCompiling ? (
                    <Loader2 size={18} className="animate-spin text-[#181818]" />
                  ) : (
                    <Download size={18} className="text-[#181818]" />
                  )}
                </button>

                {/* Mobile: Circle Outlined Regenerate Button */}
                <button
                  className="flex sm:hidden w-12 h-12 rounded-full bg-transparent hover:bg-white/5 border border-white/20 justify-center items-center cursor-pointer transition-transform duration-200 active:scale-95 disabled:opacity-60"
                  onClick={handleRegenerate}
                  disabled={pdfCompiling}
                  title="Regenerate Paper"
                >
                  <RefreshCw size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* ── WHITE ASSESSMENT SHEET ── */}
            <div className="bg-white rounded-[32px] p-12 max-md:p-6 shadow-[0_4px_32px_rgba(0,0,0,0.05)] border border-black/[0.04] flex flex-col font-sans text-[#181818]">
              {/* Header metadata */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-black/[0.08] mb-8 gap-1 shrink-0">
                <h1 className="font-display text-[22px] font-black uppercase tracking-tight m-0">{currentAssignment.generatedPaper.schoolHeader?.board || "DELHI PUBLIC SCHOOL"}</h1>
                <span className="font-display text-sm font-extrabold text-[#5e5e5e] tracking-tight">{currentAssignment.generatedPaper.schoolHeader?.name || "BOKARO STEEL CITY"}</span>
                <div className="flex justify-between w-full mt-6 text-xs font-bold text-gray-500 max-md:flex-col max-md:gap-2">
                  <span className="text-left max-md:text-center font-sans">SUBJECT: {paper.subject?.toUpperCase() || "SCIENCE"}</span>
                  <span className="text-center font-sans">CLASS: {currentAssignment.className ? currentAssignment.className.toUpperCase() : "CLASS 10"}</span>
                  <span className="text-right max-md:text-center font-sans">TOTAL MARKS: {paper.totalMarks || 20}</span>
                </div>
              </div>

              {/* General instructions */}
              {paper.instructions && paper.instructions.length > 0 && (
                <div className="flex flex-col gap-2 mb-8 bg-gray-50 rounded-2xl p-5 border border-black/[0.03]">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-gray-400">General Instructions:</span>
                  <ul className="m-0 pl-4 flex flex-col gap-1.5">
                    {paper.instructions.map((inst, idx) => (
                      <li key={idx} className="text-[13px] font-semibold text-gray-600 leading-normal font-sans">{inst}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sections list */}
              <div className="flex flex-col gap-8">
                {paper.sections.map((section) => (
                  <div key={section.id} className="flex flex-col gap-4">
                    <div className="border-b border-black/[0.06] pb-2 flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-2">
                      <span className="font-display text-base font-black text-[#181818] uppercase tracking-tight leading-none">{section.title}</span>
                      {section.instruction && (
                        <span className="text-xs font-semibold text-brand-secondary/60 leading-none font-sans italic">{section.instruction}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-4 pl-2">
                      {section.questions.map((question, qIdx) => (
                        <div key={qIdx} className="flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex gap-2.5 text-[14px] font-semibold leading-relaxed text-[#181818] font-sans">
                              <span className="font-bold min-w-5">Q{qIdx + 1}.</span>
                              <div className="flex flex-col gap-2">
                                <span>{question.text}</span>
                                {question.options && question.options.length > 0 && (
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2 mt-2">
                                    {question.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-center text-[13px] font-medium text-gray-600 bg-gray-50 border border-black/[0.03] rounded-lg py-2 px-3 hover:bg-gray-100/50">
                                        <span className="font-bold text-[#ff5623] mr-2 font-sans">{String.fromCharCode(97 + oIdx)}.</span>
                                        <span className="font-sans">{opt}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {getDifficultyBadge(question.difficulty)}
                              <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 whitespace-nowrap font-sans">[{question.marks}m]</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ANSWER KEY CONTAINER ── */}
            <div className="bg-white rounded-[32px] p-8 max-md:p-6 shadow-[0_4px_32px_rgba(0,0,0,0.05)] border border-black/[0.04] flex flex-col">
              <div className="flex justify-between items-center pb-4 border-b border-black/[0.08] mb-6">
                <div>
                  <h3 className="font-display text-lg font-black text-[#181818] uppercase tracking-tight">Answer Key</h3>
                  <p className="text-xs text-brand-secondary/60 font-medium font-sans mt-0.5">Section-wise evaluation references for this paper.</p>
                </div>
                <button
                  className="bg-brand-surface border border-black/[0.06] hover:bg-gray-50 text-[13px] font-bold text-[#181818] rounded-full py-2 px-5 cursor-pointer select-none transition-all font-sans"
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                >
                  {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
                </button>
              </div>

              {showAnswerKey && (
                <div className="flex flex-col gap-6 font-sans">
                  {paper.sections.map((section) => (
                    <div key={section.id} className="flex flex-col gap-3">
                      <div className="font-display text-[13px] font-bold text-gray-500 uppercase tracking-wider">{section.title}</div>
                      <div className="flex flex-col gap-2 pl-4">
                        {section.questions.map((q, index) => (
                          q.correctAnswer ? (
                            <div key={index} className="flex gap-2.5 text-[13px] text-[#181818] leading-relaxed">
                              <span className="font-bold min-w-5">Q{index + 1}.</span>
                              <span>{q.correctAnswer}</span>
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
