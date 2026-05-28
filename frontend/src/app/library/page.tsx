'use client';

import React from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { FileText, Search, Plus, HardDrive, Download } from 'lucide-react';

export default function LibraryPage() {
  const files = [
    { name: 'Ohm\'s Law Experiments.pdf', size: '2.4 MB', type: 'PDF' },
    { name: 'Syllabus Grid 2025.txt', size: '45 KB', type: 'Text' },
    { name: 'Final Exam Draft.pdf', size: '1.8 MB', type: 'PDF' },
    { name: 'Laboratory Safety Precautions.pdf', size: '890 KB', type: 'PDF' },
  ];

  return (
    <div className="flex w-full h-full animate-fade">
      <Sidebar />

      <div className="main-content flex flex-col flex-1 h-full overflow-y-auto">
        <TopBar breadcrumb="My Library" />

        <div className="p-12 pb-[120px] max-md:p-4 max-md:pb-[104px] bg-brand-surface flex-1 relative">
          <div className="hidden md:flex justify-between items-center mb-7">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5623] relative shadow-[0_0_8px_rgba(255,86,35,0.6)] shrink-0">
                <div className="beacon-outer-ripple"></div>
              </div>
              <div>
                <h1 className="font-display text-[28px] font-extrabold text-[#181818] tracking-[-0.5px]">My Library</h1>
                <p className="text-[13px] text-[#5e5e5e]/70 mt-0.5">Your centralized repository for lesson sheets and assessments.</p>
              </div>
            </div>

            <button className="bg-gradient-to-br from-[#ff7950] to-[#ff5623] border-none rounded-full py-2.5 px-6 text-[13px] font-bold text-white cursor-pointer flex items-center shadow-[0_4px_12px_rgba(255,86,35,0.3)] hover:opacity-90 active:scale-95 transition-all">
              <Plus size={16} className="mr-1.5" />
              Upload File
            </button>
          </div>

          {/* Search */}
          <div className="flex justify-between items-center mb-8 max-md:flex-col max-md:items-stretch max-md:gap-4">
            <div className="flex items-center bg-white border border-black/[0.08] rounded-full py-2 px-4 w-[320px] max-md:w-full shadow-sm">
              <Search size={18} color="rgba(48,48,48,0.4)" className="mr-2" />
              <input type="text" placeholder="Search files..." className="border-none p-0 w-full bg-transparent text-[13px] font-medium outline-none focus:ring-0 shadow-none" />
            </div>
            
            <div className="flex items-center bg-white py-2 px-4 rounded-full border border-black/[0.04] shadow-sm max-md:justify-center">
              <HardDrive size={15} color="#5e5e5e" className="mr-1.5" />
              <span className="text-xs font-semibold text-brand-secondary">Used: 4.8 MB of 100 MB</span>
            </div>
          </div>

          {/* Grid files */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] max-md:grid-cols-1 gap-6">
            {files.map((file, idx) => (
              <div key={idx} className="bg-white rounded-[20px] border border-black/[0.04] p-5 shadow-sm flex flex-col cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-9 h-9 rounded-lg bg-brand-accent/5 flex justify-center items-center shrink-0">
                    <FileText size={20} color="#ff5623" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#f6f6f6] flex justify-center items-center hover:bg-gray-200 transition-colors">
                    <Download size={14} color="#5e5e5e" />
                  </div>
                </div>

                <h4 className="font-sans text-sm font-semibold text-[#181818] mb-4 break-all">{file.name}</h4>
                
                <div className="flex justify-between items-center mt-auto text-[11px]">
                  <span className="text-brand-secondary/60">{file.size}</span>
                  <span className="bg-brand-accent text-white py-0.5 px-1.5 rounded text-[10px] font-bold">{file.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
