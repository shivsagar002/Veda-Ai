'use client';

import React from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import Link from 'next/link';
import { Sparkles, FileText, CalendarRange, PenTool, CheckSquare } from 'lucide-react';

export default function ToolkitPage() {
  const tools = [
    {
      name: 'AI Question Generator',
      desc: 'Create highly structured question papers from text drops or file uploads.',
      icon: FileText,
      active: true,
      path: '/create',
    },
    {
      name: 'Lesson Plan Architect',
      desc: 'Build comprehensive, syllabus-aligned daily, weekly, or monthly schedules.',
      icon: CalendarRange,
      active: false,
      path: '#',
    },
    {
      name: 'Rubric Constructor',
      desc: 'Formulate print-ready grading grids based on customized marking scales.',
      icon: CheckSquare,
      active: false,
      path: '#',
    },
    {
      name: 'Report Card Comments Writer',
      desc: 'Draft tailored, encouraging student performance reports in seconds.',
      icon: PenTool,
      active: false,
      path: '#',
    },
  ];

  return (
    <div className="flex w-full h-full animate-fade">
      <Sidebar />

      <div className="main-content flex flex-col flex-1 h-full overflow-y-auto">
        <TopBar breadcrumb="AI Toolkit" />

        <div className="p-12 pb-[120px] max-md:p-4 max-md:pb-[104px] bg-brand-surface flex-1 relative">
          <div className="mb-7 hidden md:block">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5623] relative shadow-[0_0_8px_rgba(255,86,35,0.6)] shrink-0">
                <div className="beacon-outer-ripple"></div>
              </div>
              <div>
                <h1 className="font-display text-[28px] font-extrabold text-[#181818] tracking-[-0.5px]">AI Teacher’s Toolkit</h1>
                <p className="text-[13px] text-[#5e5e5e]/70 mt-0.5">Supercharge your teaching with curriculum-grade artificial intelligence.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] max-md:grid-cols-1 gap-6">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              
              return (
                <div 
                  key={idx} 
                  className={`bg-white rounded-[24px] border border-black/[0.04] p-6 shadow-sm flex flex-col min-h-[260px] transition-all duration-200 ${
                    tool.active ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'opacity-85'
                  }`}
                >
                  <div className="flex justify-between items-center mb-5">
                    <div className={`w-11 h-11 rounded-[10px] flex justify-center items-center shrink-0 ${
                      tool.active ? 'bg-brand-accent/5' : 'bg-black/3'
                    }`}>
                      <Icon size={22} color={tool.active ? '#ff5623' : '#a9a9a9'} />
                    </div>
                    
                    {tool.active && (
                      <div className="flex items-center py-0.5 px-2 bg-brand-accent/8 text-brand-accent rounded-full text-[9px] font-bold tracking-wider">
                        <Sparkles size={11} className="mr-1" />
                        ACTIVE
                      </div>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#181818] mb-2">{tool.name}</h3>
                  <p className="text-[13px] text-brand-secondary leading-[1.4] mb-5">{tool.desc}</p>

                  {tool.active ? (
                    <Link href={tool.path} className="no-underline mt-auto">
                      <button className="w-full py-2.5 rounded-full border-none bg-gradient-to-br from-[#ff7950] to-[#ff5623] text-white font-sans text-[13px] font-bold cursor-pointer shadow-[0_4px_12px_rgba(255,86,35,0.2)] hover:opacity-95 active:scale-98 transition-all">
                        Launch Tool
                      </button>
                    </Link>
                  ) : (
                    <button className="w-full py-2.5 rounded-full border-none bg-[#2b2b2b] text-white/40 font-sans text-[13px] font-bold cursor-not-allowed shadow-none mt-auto" disabled>
                      Coming Soon
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
