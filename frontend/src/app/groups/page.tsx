'use client';

import React from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Plus, GraduationCap, ChevronRight } from 'lucide-react';

export default function GroupsPage() {
  const groups = [
    { name: 'Grade 10 - Physics (A)', students: 32, subject: 'Science', level: 'Secondary' },
    { name: 'Grade 10 - Physics (B)', students: 28, subject: 'Science', level: 'Secondary' },
    { name: 'Grade 12 - Advanced Electromagnetism', students: 24, subject: 'Physics', level: 'Higher Secondary' },
    { name: 'Grade 9 - Basic Mechanics', students: 30, subject: 'Science', level: 'Secondary' },
  ];

  return (
    <div className="flex w-full h-full animate-fade">
      <Sidebar />
      
      <div className="main-content flex flex-col flex-1 h-full overflow-y-auto">
        <TopBar breadcrumb="My Groups" />
        
        <div className="p-12 pb-[120px] max-md:p-4 max-md:pb-[104px] bg-brand-surface flex-1 relative">
          <div className="hidden md:flex justify-between items-center mb-7">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5623] relative shadow-[0_0_8px_rgba(255,86,35,0.6)] shrink-0">
              <div className="beacon-outer-ripple"></div>
            </div>
            <div>
              <h1 className="font-display text-[28px] font-extrabold text-[#181818] tracking-[-0.5px]">My Groups</h1>
              <p className="text-[13px] text-[#5e5e5e]/70 mt-0.5">Manage your classes and track student enrollment.</p>
            </div>
          </div>
          
          <button className="bg-gradient-to-br from-[#ff7950] to-[#ff5623] border-none rounded-full py-2.5 px-6 text-[13px] font-bold text-white cursor-pointer flex items-center shadow-[0_4px_12px_rgba(255,86,35,0.3)] hover:opacity-90 active:scale-95 transition-all">
            <Plus size={16} className="mr-1.5" />
            Create Group
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-md:grid-cols-1 gap-6">
          {groups.map((group, idx) => (
            <div key={idx} className="bg-white rounded-[20px] border border-black/[0.04] p-6 shadow-sm flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <div className="flex gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-brand-accent/5 flex justify-center items-center shrink-0">
                  <GraduationCap size={20} color="#ff5623" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-[#181818]">{group.name}</h4>
                  <span className="inline-block text-[11px] text-brand-accent font-semibold mt-0.5">{group.subject}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mb-5 flex-1">
                <div className="flex justify-between text-[13px]">
                  <span className="text-brand-secondary/70">Active Students</span>
                  <span className="font-semibold text-[#181818]">{group.students}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-brand-secondary/70">Grade Level</span>
                  <span className="font-semibold text-[#181818]">{group.level}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-black/[0.06] pt-4 flex justify-between items-center">
                <span className="text-xs font-bold text-brand-accent">Manage Roster</span>
                <ChevronRight size={14} color="#ff5623" />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
