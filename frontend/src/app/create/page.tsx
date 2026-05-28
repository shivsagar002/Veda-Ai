'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import LoadingScreen from '../../components/LoadingScreen';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAssignmentStore, IQuestionTypeConfig } from '../../store/useAssignmentStore';
import {
  UploadCloud,
  CalendarCheck,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Trash2,
  X,
  Mic,
  ChevronDown,
  BookOpen,
  GraduationCap,
  FileText,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Hindi', 'History', 'Geography', 'Civics', 'Economics',
  'Computer Science', 'Environmental Science', 'Physical Education',
];

const CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12',
];

export default function CreateAssignment() {
  const router = useRouter();

  const {
    dueDate,
    additionalInstructions,
    sourceText,
    isGenerating,
    currentAssignment,
    error,
    setDueDate,
    setAdditionalInstructions,
    setSourceText,
    startGeneration,
    resetProgress,
    setCurrentAssignment,
  } = useAssignmentStore();

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [fileSelected, setFileSelected] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeConfigs, setActiveConfigs] = useState<IQuestionTypeConfig[]>([
    { type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { type: 'Short Questions', count: 3, marks: 2 },
    { type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { type: 'Numerical Problems', count: 5, marks: 5 },
  ]);

  useWebSocket(activeJobId);

  React.useEffect(() => {
    if (error) {
      alert(`Assessment Generation Failed:\n\n${error}\n\nPlease check your GEMINI_API_KEY, API quota, or network connection.`);
      resetProgress();
      setActiveJobId(null);
    }
  }, [error, resetProgress]);

  React.useEffect(() => {
    if (currentAssignment && currentAssignment.status === 'COMPLETED' && activeJobId === currentAssignment._id) {
      router.push(`/assignment/${currentAssignment._id}`);
      resetProgress();
      setActiveJobId(null);
    }
  }, [currentAssignment, activeJobId, router, resetProgress]);

  const totalQuestions = activeConfigs.reduce((acc, q) => acc + q.count, 0);
  const totalMarks = activeConfigs.reduce((acc, q) => acc + (q.count * q.marks), 0);

  // Convert file to base64 so it can be sent to backend for AI processing
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // result is "data:mimetype;base64,XXXXX" — strip the prefix
      const base64 = result.split(',')[1];
      setFileBase64(base64);
      setFileMimeType(file.type);
      setFileSelected(file.name);
      setSourceText(`[File attached: ${file.name}]`);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFileSelected(null);
    setFileBase64(null);
    setFileMimeType(null);
    setSourceText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateLocalConfig = (type: string, key: 'count' | 'marks', action: 'inc' | 'dec') => {
    setActiveConfigs(prev => prev.map(q => {
      if (q.type !== type) return q;
      let val = q[key];
      if (action === 'inc') val += 1;
      else if (action === 'dec') val = Math.max(0, val - 1);
      return { ...q, [key]: val };
    }));
  };

  const removeConfigRow = (type: string) => {
    setActiveConfigs(prev => prev.filter(q => q.type !== type));
  };

  const addConfigRow = () => {
    const availableTypes = [
      'Multiple Choice Questions', 'Short Questions', 'Diagram/Graph-Based Questions',
      'Numerical Problems', 'Long Questions', 'Fill in the Blanks', 'Match the Following', 'True or False'
    ];
    const unusedType = availableTypes.find(t => !activeConfigs.some(c => c.type === t)) || `Custom Section ${activeConfigs.length + 1}`;
    setActiveConfigs(prev => [...prev, { type: unusedType, count: 1, marks: 1 }]);
  };

  const changeRowType = (oldType: string, newType: string) => {
    setActiveConfigs(prev => prev.map(q => q.type !== oldType ? q : { ...q, type: newType }));
  };

  const handleGenerate = async () => {
    if (!subject) { alert('Please select a Subject.'); return; }
    if (!className) { alert('Please select a Class.'); return; }
    if (!dueDate) { alert('Please specify a valid Due Date.'); return; }
    if (totalQuestions <= 0) { alert('Please configure at least one question.'); return; }

    try {
      startGeneration();

      // Build the instructions string enriched with subject & class
      const fullInstructions = `Subject: ${subject}. Class: ${className}.${additionalInstructions ? ' ' + additionalInstructions : ''}`;

      const payload: any = {
        dueDate,
        subject,
        className,
        additionalInstructions: fullInstructions,
        sourceText: sourceText || '',
        questionTypes: activeConfigs.filter(q => q.count > 0),
      };

      // Attach file as base64 if uploaded — backend will pass it to Gemini vision
      if (fileBase64 && fileMimeType) {
        payload.fileBase64 = fileBase64;
        payload.fileMimeType = fileMimeType;
        payload.fileName = fileSelected;
      }

      const response = await fetch(`${BACKEND_URL}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server rejected creation request.');
      }

      const assignmentObj = await response.json();
      setActiveJobId(assignmentObj._id);
      setCurrentAssignment(assignmentObj);
    } catch (err: any) {
      console.error('Failed triggering assessment generation:', err);
      alert(err.message || 'Failed connecting to database. Please check backend status.');
      resetProgress();
    }
  };

  const selectOptions = [
    'Multiple Choice Questions', 'Short Questions', 'Diagram/Graph-Based Questions',
    'Numerical Problems', 'Long Questions', 'Fill in the Blanks', 'Match the Following', 'True or False'
  ];

  // Reusable styled select wrapper
  const SelectField = ({
    id, value, onChange, options, placeholder, icon: Icon,
  }: {
    id: string; value: string; onChange: (v: string) => void;
    options: string[]; placeholder: string; icon: React.ElementType;
  }) => (
    <div className="relative flex items-center">
      <Icon size={16} color="rgba(48,48,48,0.45)" className="absolute left-4 pointer-events-none z-10" />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-3 pl-10 pr-10 rounded-full border border-black/[0.08] bg-[#f6f6f6] text-[#303030] text-sm font-medium cursor-pointer appearance-none outline-none shadow-none font-display tracking-[-0.04em] focus:border-[#ff5623] focus:ring-1 focus:ring-[#ff5623]"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={14} color="#303030" className="absolute right-4 pointer-events-none" />
    </div>
  );

  return (
    <div className="flex w-full h-full animate-fade">
      <Sidebar />
      <LoadingScreen />

      <div className="main-content flex flex-col flex-1 h-full overflow-y-auto">
        {/* ═══════ DESKTOP: TopBar ═══════ */}
        <TopBar breadcrumb="Create Assignment" />

        {/* ═══════ Scrollable Content ═══════ */}
        <div className="p-12 pb-[120px] max-md:p-4 max-md:pb-[104px] flex-1 flex flex-col bg-gradient-to-b from-[#eeeeee] to-[#dadada] relative">
          <div className="mb-7 hidden md:block">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5623] relative shadow-[0_0_8px_rgba(255,86,35,0.6)] shrink-0">
                  <div className="beacon-outer-ripple"></div>
                </div>
                <div>
                  <h1 className="font-display text-[28px] font-extrabold text-[#181818] tracking-[-0.5px]">Create Assignment</h1>
                  <p className="text-[13px] text-[#5e5e5e]/70 mt-0.5">Set up a new assignment for your students.</p>
                </div>
              </div>
            </div>
          <div className="w-full max-w-[760px] mx-auto flex flex-col">
            {/* PAGE HEADER */}
            


            {/* Progress steps - visible on both mobile and desktop */}
            <div className="flex gap-2 w-full mb-6">
              <div className="h-1 flex-1 rounded-sm bg-[#374151]"></div>
              <div className="h-1 flex-1 rounded-sm bg-[#e5e7eb]"></div>
            </div>

            {/* ═══════ WHITE CARD: Assignment Details ═══════ */}
            <div className="bg-white/50 border border-black/[0.04] rounded-[32px] p-8 max-md:p-4 flex flex-col gap-6">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-display text-xl font-bold text-[#303030] tracking-[-0.04em] leading-[140%]">Assignment Details</h3>
                <p className="text-sm font-normal text-brand-secondary tracking-[-0.04em] leading-[140%]">Basic information about your assignment</p>
              </div>

              {/* ── SUBJECT & CLASS ROW ── */}
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div className="flex flex-col gap-2">
                  <label htmlFor="subject-select" className="font-display text-base font-bold text-[#303030] tracking-[-0.04em] block">Subject</label>
                  <SelectField
                    id="subject-select"
                    value={subject}
                    onChange={setSubject}
                    options={SUBJECTS}
                    placeholder="Select subject…"
                    icon={BookOpen}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="class-select" className="font-display text-base font-bold text-[#303030] tracking-[-0.04em] block">Class</label>
                  <SelectField
                    id="class-select"
                    value={className}
                    onChange={setClassName}
                    options={CLASSES}
                    placeholder="Select class…"
                    icon={GraduationCap}
                  />
                </div>
              </div>

              {/* ── DUE DATE (single, no duplicate) ── */}
              <div className="flex flex-col gap-2">
                <label htmlFor="due-date" className="font-display text-base font-bold text-[#303030] tracking-[-0.04em] block">Due Date</label>
                <div className="relative flex items-center">
                  <input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full py-3 pr-12 pl-5 rounded-full border border-black/[0.08] bg-[#f6f6f6] text-[#303030] text-sm font-medium cursor-pointer outline-none appearance-none shadow-none font-display tracking-[-0.04em] focus:border-[#ff5623] focus:ring-1 focus:ring-[#ff5623] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:top-0 
                   [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer 
                   [&::-webkit-calendar-picker-indicator]:opacity-0"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <CalendarCheck size={18} color="#303030" className="absolute right-5 pointer-events-none" />
                </div>
              </div>

              {/* ── FILE UPLOAD AREA ── */}
              <div className="flex flex-col gap-2">
                <label className="font-display text-base font-bold text-[#303030] tracking-[-0.04em] block">Upload Reference Material <span className="text-sm font-normal text-brand-secondary">(optional — used by AI)</span></label>
                <div
                  className={`border-[1.75px] border-dashed border-black/20 rounded-[24px] bg-[#f6f6f6] flex flex-col justify-center items-center p-6 px-8 max-md:px-4 gap-4 cursor-pointer transition-all duration-200 ${isDragging ? 'bg-[#ff5623]/5 border-[#ff5623]' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !fileSelected && fileInputRef.current?.click()}
                >
                  <div className="w-9 h-9 rounded-full bg-black/5 flex justify-center items-center">
                    {fileSelected ? <FileText size={20} color="rgba(255,86,35,0.7)" /> : <UploadCloud size={20} color="rgba(48,48,48,0.5)" />}
                  </div>

                  {fileSelected ? (
                    <div className="text-center">
                      <p className="font-bold text-[#303030] text-sm mb-1">File Attached</p>
                      <p className="text-brand-secondary text-xs break-all max-w-[280px]">{fileSelected}</p>
                      <button
                        className="flex items-center mx-auto mt-2.5 bg-[#c53535]/10 border-none py-1 px-2.5 rounded-md text-[#c53535] text-[11px] font-bold cursor-pointer hover:bg-[#c53535]/20 transition-colors"
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      >
                        <Trash2 size={12} className="mr-1" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <p className="font-display text-base font-medium text-[#303030] text-center tracking-[-0.04em] leading-[140%] mb-1">Choose a file or drag & drop it here</p>
                      <p className="text-xs text-black/40 text-center">Images (JPEG, PNG) or PDF — up to 10 MB</p>
                      <label className="bg-[#f6f6f6] border-[1.5px] border-black/[0.08] py-2 px-5 rounded-full text-[13px] font-semibold text-[#303030] cursor-pointer inline-block text-center hover:bg-black/5 transition-colors mt-2.5">
                        Browse Files
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* ── QUESTION TYPE TABLE ── */}
              <div className="flex flex-col gap-3">
                <label className="font-display text-base font-bold text-[#303030] tracking-[-0.04em] block">Question Types</label>

                {/* Desktop config rows */}
                <div className="hidden md:flex flex-col gap-2">
                  {/* Header row — column labels only, no repeated "Question Type" label */}
                  <div className="flex justify-end items-center mb-1 pr-9">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#374151] w-[110px] text-center block">No. of Questions</span>
                      <span className="text-xs font-bold text-[#374151] w-20 text-center block">Marks</span>
                    </div>
                  </div>

                  {activeConfigs.map((q) => (
                    <div key={q.type} className="flex items-center gap-2 py-1">
                      <div className="relative flex items-center flex-1 min-w-0">
                        <select value={q.type} onChange={(e) => changeRowType(q.type, e.target.value)} className="w-full py-2.5 pr-9 pl-4 rounded-full border border-black/[0.08] bg-[#f6f6f6] text-[#303030] text-sm font-medium cursor-pointer appearance-none outline-none shadow-none font-display tracking-[-0.04em] focus:border-[#ff5623] focus:ring-1 focus:ring-[#ff5623]">
                          {selectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown size={14} color="#303030" className="absolute right-3.5 pointer-events-none" />
                      </div>

                      <button className="bg-transparent border-none cursor-pointer p-1.5 flex items-center justify-center rounded-full shrink-0 hover:bg-black/5 transition-colors" onClick={() => removeConfigRow(q.type)}>
                        <X size={14} color="rgba(48,48,48,0.4)" />
                      </button>

                      <div className="flex items-center gap-3 ml-auto">
                        <div className="flex items-center bg-[#f6f6f6] rounded-full p-1.5 px-2 border border-black/[0.04] w-[110px] justify-between shrink-0">
                          <button className="w-6 h-6 rounded-full bg-transparent border-none flex justify-center items-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => updateLocalConfig(q.type, 'count', 'dec')}><Minus size={11} color="rgba(48,48,48,0.35)" /></button>
                          <span className="font-display text-sm font-bold text-[#303030] min-w-[20px] text-center">{q.count}</span>
                          <button className="w-6 h-6 rounded-full bg-transparent border-none flex justify-center items-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => updateLocalConfig(q.type, 'count', 'inc')}><Plus size={11} color="#303030" /></button>
                        </div>
                        <div className="flex items-center bg-[#f6f6f6] rounded-full p-1.5 px-2 border border-black/[0.04] w-20 justify-between shrink-0">
                          <button className="w-6 h-6 rounded-full bg-transparent border-none flex justify-center items-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => updateLocalConfig(q.type, 'marks', 'dec')}><Minus size={11} color="rgba(48,48,48,0.35)" /></button>
                          <span className="font-display text-sm font-bold text-[#303030] min-w-[20px] text-center">{q.marks}</span>
                          <button className="w-6 h-6 rounded-full bg-transparent border-none flex justify-center items-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => updateLocalConfig(q.type, 'marks', 'inc')}><Plus size={11} color="#303030" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile config cards */}
                <div className="flex md:hidden flex-col gap-3">
                  {activeConfigs.map((q) => (
                    <div key={q.type} className="bg-[#f6f6f6] rounded-[20px] p-4 flex flex-col gap-3 border border-black/[0.04]">
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center flex-1">
                          <select value={q.type} onChange={(e) => changeRowType(q.type, e.target.value)} className="w-full py-2.5 pr-9 pl-4 rounded-full border border-black/[0.08] bg-white text-[#303030] text-sm font-medium cursor-pointer appearance-none outline-none shadow-none font-display tracking-[-0.04em] focus:border-[#ff5623] focus:ring-1 focus:ring-[#ff5623]">
                            {selectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <ChevronDown size={14} color="#303030" className="absolute right-3.5 pointer-events-none" />
                        </div>
                        <button className="bg-transparent border-none cursor-pointer p-1.5 flex items-center justify-center rounded-full shrink-0 hover:bg-black/5 transition-colors" onClick={() => removeConfigRow(q.type)}>
                          <X size={14} color="rgba(48,48,48,0.4)" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-2.5 flex-1">
                          <span className="font-display text-xs font-semibold text-brand-secondary h-8 flex items-center">No. of Questions</span>
                          <span className="font-display text-xs font-semibold text-brand-secondary h-8 flex items-center">Marks</span>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center bg-white rounded-full p-1.5 px-2 border border-black/[0.04] w-[120px] justify-between shrink-0">
                            <button className="w-6 h-6 rounded-full bg-transparent border-none flex justify-center items-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => updateLocalConfig(q.type, 'count', 'dec')}><Minus size={11} color="rgba(48,48,48,0.35)" /></button>
                            <span className="font-display text-sm font-bold text-[#303030] min-w-[20px] text-center">{q.count}</span>
                            <button className="w-6 h-6 rounded-full bg-transparent border-none flex justify-center items-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => updateLocalConfig(q.type, 'count', 'inc')}><Plus size={11} color="#303030" /></button>
                          </div>
                          <div className="flex items-center bg-white rounded-full p-1.5 px-2 border border-black/[0.04] w-[120px] justify-between shrink-0">
                            <button className="w-6 h-6 rounded-full bg-transparent border-none flex justify-center items-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => updateLocalConfig(q.type, 'marks', 'dec')}><Minus size={11} color="rgba(48,48,48,0.35)" /></button>
                            <span className="font-display text-sm font-bold text-[#303030] min-w-[20px] text-center">{q.marks}</span>
                            <button className="w-6 h-6 rounded-full bg-transparent border-none flex justify-center items-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => updateLocalConfig(q.type, 'marks', 'inc')}><Plus size={11} color="#303030" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add row */}
                <button className="flex items-center gap-2 bg-transparent border-none cursor-pointer py-1.5 text-[#303030] font-display text-sm font-bold tracking-[-0.04em] self-start hover:opacity-80 transition-opacity" onClick={addConfigRow}>
                  <div className="w-6 h-6 rounded-full bg-[#303030] flex justify-center items-center shrink-0"><Plus size={13} color="#ffffff" /></div>
                  <span>Add Question Type</span>
                </button>

                {/* Totals */}
                <div className="flex justify-end max-md:flex-col max-md:items-end max-md:gap-1 gap-6 mt-2 pt-4 border-t border-dashed border-black/[0.08]">
                  <span className="font-display text-sm font-medium text-brand-secondary tracking-[-0.04em]">Total Questions : <strong className="text-[#303030] font-bold">{totalQuestions}</strong></span>
                  <span className="font-display text-sm font-medium text-brand-secondary tracking-[-0.04em]">Total Marks : <strong className="font-bold text-[#ff5623]">{totalMarks}</strong></span>
                </div>
              </div>

              {/* ── ADDITIONAL INFO ── */}
              <div className="flex flex-col gap-2">
                <label className="font-display text-base font-bold text-[#303030] tracking-[-0.04em] block">
                  Additional Instructions <span className="text-sm font-normal text-brand-secondary">(used by AI to customize output)</span>
                </label>
                <div className="relative w-full">
                  <textarea
                    placeholder="e.g. Focus on Ohm's Law. Exam duration 3 hours. Include diagram-based numericals..."
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    className="w-full h-[110px] rounded-2xl p-4 pr-12 border-[1.75px] border-dashed border-black/[0.15] bg-[#f6f6f6] text-sm text-[#303030] resize-none leading-normal outline-none shadow-none font-display tracking-[-0.04em] focus:border-[#ff5623] focus:ring-1 focus:ring-[#ff5623]"
                  />
                  <button className="absolute right-3.5 bottom-3.5 bg-white border-none cursor-pointer p-2 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-gray-50 active:scale-95 transition-all" title="Dictate instructions">
                    <Mic size={15} color="rgba(48,48,48,0.7)" />
                  </button>
                </div>
              </div>
            </div>

            {/* ═══════ ACTION BAR ═══════ */}
            <div className="flex justify-center items-center gap-3 mt-4 py-3 max-md:mt-2 max-md:mb-20">
              <Link href="/" className="no-underline">
                <button className="bg-white border-none rounded-[48px] py-3 px-6 font-display text-base font-medium text-[#303030] cursor-pointer flex items-center gap-1 tracking-[-0.04em] leading-[140%] shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                  <ArrowLeft size={16} className="mr-1" />
                  Previous
                </button>
              </Link>
              <button className="bg-brand-primary border-[1.5px] border-white/15 rounded-[48px] py-3 px-6 font-display text-base font-medium text-white cursor-pointer flex items-center gap-1 tracking-[-0.04em] leading-[140%] shadow-[0px_32px_48px_0px_rgba(0,0,0,0.2),0px_16px_48px_0px_rgba(0,0,0,0.12)] hover:bg-[#202020] active:scale-95 transition-all" onClick={handleGenerate}>
                Generate
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
