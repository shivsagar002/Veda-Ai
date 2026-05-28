'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import TopBar from '../../../components/TopBar';
import LoadingScreen from '../../../components/LoadingScreen';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useAssignmentStore, IAssignment } from '../../../store/useAssignmentStore';
import confetti from 'canvas-confetti';
import { 
  Download, 
  Loader2,
  RefreshCw
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

export default function AssignmentOutput() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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

    if (!currentAssignment || currentAssignment._id !== id) {
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

  if (!currentAssignment || !currentAssignment.generatedPaper) {
    return (
      <div className="flex flex-col justify-center items-center w-screen h-screen bg-brand-surface font-sans">
        <Loader2 size={32} color="#ff5623" className="animate-spin" />
        <span className="mt-3 font-semibold">Loading Assignment Data...</span>
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
                  className="flex sm:hidden w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border-none flex justify-center items-center text-white cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleDownloadPDF}
                  disabled={pdfCompiling}
                  title="Download as PDF"
                >
                  {pdfCompiling ? (
                    <Loader2 size={18} className="animate-spin text-white" />
                  ) : (
                    <Download size={18} color="#ffffff" />
                  )}
                </button>

                {/* Mobile: Circle Icon Regenerate Button */}
                <button
                  className="flex sm:hidden w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border-none flex justify-center items-center text-white cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleRegenerate}
                  disabled={pdfCompiling}
                  title="Regenerate Question Paper"
                >
                  <RefreshCw size={18} color="#ffffff" />
                </button>
              </div>
            </div>

            {/* ── WHITE PAPER SECTION CARD ── */}
            <div className="bg-white rounded-[24px] max-md:rounded-[20px] p-12 max-md:p-6 flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
            
            <div className="text-center flex flex-col gap-2 mb-6">
              <div className="font-display text-2xl max-md:text-xl font-bold text-[#181818] tracking-[-0.04em]">{paper.subject ? `Delhi Public School, Sector-4, Bokaro` : 'DELHI PUBLIC SCHOOL'}</div>
              <div className="text-[15px] text-[#181818] font-semibold">Subject: {paper.subject}</div>
              <div className="text-[15px] text-[#181818] font-semibold">Class: {currentAssignment.className || 'unspecified class'}</div>
            </div>

            <div className="flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-2 mb-6">
              <span className="text-sm text-[#181818] font-semibold">Time Allowed: {paper.duration || '45 minutes'}</span>
              <span className="text-sm text-[#181818] font-semibold">Maximum Marks: {paper.totalMarks}</span>
            </div>

            {paper.instructions && paper.instructions.length > 0 && (
              <div className="text-sm text-[#181818] font-bold mb-6">
                All questions are compulsory unless stated otherwise.
              </div>
            )}

            <div className="flex flex-col gap-3 mb-8">
              <div className="text-sm text-[#181818] font-semibold">Name: ______________________</div>
              <div className="text-sm text-[#181818] font-semibold">Roll Number: _______________</div>
              <div className="text-sm text-[#181818] font-semibold">Class: {currentAssignment.className || '________'} Section: ________</div>
            </div>

            {/* Question Sections */}
            {paper.sections.map((section) => (
              <div key={section.id}>
                <div className="text-center font-display text-lg font-bold text-[#181818] my-8 mt-8 mb-4 tracking-[-0.04em]">{section.title}</div>
                {section.instruction && (
                  <div className="text-xs italic text-black/80 mb-6">{section.instruction}</div>
                )}

                <div>
                  {section.questions.map((q, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start gap-4 mb-4 text-sm text-[#181818] leading-relaxed w-full">
                        <div className="flex gap-2 items-start flex-1">
                          <span className="font-bold min-w-5">{index + 1}.</span>
                          <span>
                            {q.text}
                            <span className="font-bold text-[#181818] whitespace-nowrap ml-2">[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                          </span>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          {getDifficultyBadge(q.difficulty)}
                        </div>
                      </div>
                      
                      {q.type === 'MCQ' && q.options && (
                        <div className="flex flex-col gap-1.5 pl-6 text-[13px] mb-3">
                          {q.options.map((opt, oIndex) => {
                            const label = String.fromCharCode(97 + oIndex);
                            return (
                              <div key={oIndex} className="flex gap-1.5">
                                <span className="font-bold">({label})</span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="font-display text-sm font-bold text-[#181818] my-12 mt-12 mb-8 text-center">End of Question Paper</div>

            {/* Answer Key */}
            {showAnswerKey && (
              <div className="flex flex-col gap-6 mt-8 border-t border-gray-100 pt-8 print:hidden">
                <div className="font-display text-lg font-bold text-[#181818] tracking-[-0.04em]">Answer Key</div>
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
