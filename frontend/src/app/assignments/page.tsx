'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import Link from 'next/link';
import { useAssignmentStore, IAssignment } from '../../store/useAssignmentStore';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Calendar, 
  Plus
} from 'lucide-react';
import Image from 'next/image';
import emptyIllustration from '../assets/Illustrations.svg';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AssignmentsPage() {
  const { assignmentsList, setAssignmentsList, setCurrentAssignment } = useAssignmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');

  const uniqueSubjects = Array.from(new Set(assignmentsList.map(a => a.generatedPaper?.subject || 'Physics').filter(Boolean)));
  const uniqueClasses = Array.from(new Set(assignmentsList.map(a => a.className || 'Class 10').filter(Boolean)));

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/assignments`);
        if (response.ok) {
          const list: IAssignment[] = await response.json();
          setAssignmentsList(list);
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      }
    };
    fetchAssignments();
  }, [setAssignmentsList]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/assignments/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAssignmentsList(assignmentsList.filter(item => item._id !== id));
        setActiveMenuId(null);
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  const filteredAssignments = assignmentsList
    .filter(item => {
      const title = item.generatedPaper?.title || `Assessment (Due: ${item.dueDate})`;
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.generatedPaper?.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = !selectedSubject || (item.generatedPaper?.subject || 'Physics') === selectedSubject;
      const matchesClass = !selectedClass || (item.className || 'Class 10') === selectedClass;
      
      return matchesSearch && matchesSubject && matchesClass;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'due') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      return 0;
    });

  return (
    <div className="flex w-full h-full animate-fade">
      <Sidebar />

      <div
        className="main-content flex flex-col flex-1 h-full overflow-y-auto"
        onClick={() => activeMenuId && setActiveMenuId(null)}
      >
        <TopBar breadcrumb="Assignments" />

        <div className="p-12 pb-[120px] max-md:p-4 max-md:pb-[104px] flex-1 relative">
          {assignmentsList.length > 0 && (
            <>
              {/* PAGE HEADER */}
              <div className="mb-7 hidden md:block">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#17cb9e] relative shadow-[0_0_8px_rgba(23,203,158,0.5)] shrink-0">
                    <div className="beacon-outer-ripple"></div>
                  </div>
                  <div>
                    <h1 className="font-display text-[28px] font-extrabold text-[#181818] tracking-[-0.5px]">Assignments</h1>
                    <p className="text-[13px] text-[#5e5e5e]/70 mt-0.5">Manage and create assignments for your classes.</p>
                  </div>
                </div>
              </div>

              {/* FILTER ROW */}
              <div className="flex items-center justify-between mb-7 bg-white rounded-2xl py-3 px-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                <button
                  className="flex items-center bg-transparent border-none cursor-pointer p-0 outline-none hover:opacity-80 transition-opacity"
                  onClick={() => setFilterActive(!filterActive)}
                >
                  <Filter size={18} color="rgba(24,24,24,0.4)" className="mr-2" />
                  <span className="text-sm font-semibold text-brand-primary/60">Filter By</span>
                </button>

                <div className="flex items-center bg-white border border-black/[0.08] rounded-full py-2 px-4 flex-1 max-w-[300px] max-md:max-w-[200px]">
                  <Search size={16} color="rgba(24,24,24,0.35)" className="mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Assignment"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none p-0 w-full bg-transparent text-sm font-medium text-brand-primary outline-none focus:ring-0 shadow-none"
                  />
                </div>
              </div>

              {/* COLLAPSIBLE FILTER DROPDOWN */}
              {filterActive && (
                <div className="bg-white border border-black/[0.06] rounded-2xl p-5 mb-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col gap-4 animate-fade">
                  {/* Subject Filters */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-brand-secondary/60 uppercase tracking-wider font-sans">Filter by Subject</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        className={`py-1.5 px-3.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${selectedSubject === null ? 'bg-[#ff5623] text-white border-transparent' : 'bg-brand-surface text-brand-primary border-black/[0.04] hover:bg-gray-150'}`}
                        onClick={() => setSelectedSubject(null)}
                      >
                        All Subjects
                      </button>
                      {uniqueSubjects.map(sub => (
                        <button 
                          key={sub}
                          className={`py-1.5 px-3.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${selectedSubject === sub ? 'bg-[#ff5623] text-white border-transparent' : 'bg-brand-surface text-brand-primary border-black/[0.04] hover:bg-gray-150'}`}
                          onClick={() => setSelectedSubject(sub)}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Class Filters */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-brand-secondary/60 uppercase tracking-wider font-sans">Filter by Class</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        className={`py-1.5 px-3.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${selectedClass === null ? 'bg-[#ff5623] text-white border-transparent' : 'bg-brand-surface text-brand-primary border-black/[0.04] hover:bg-gray-150'}`}
                        onClick={() => setSelectedClass(null)}
                      >
                        All Classes
                      </button>
                      {uniqueClasses.map(cls => (
                        <button 
                          key={cls}
                          className={`py-1.5 px-3.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${selectedClass === cls ? 'bg-[#ff5623] text-white border-transparent' : 'bg-brand-surface text-brand-primary border-black/[0.04] hover:bg-gray-150'}`}
                          onClick={() => setSelectedClass(cls)}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex flex-col gap-2 border-t border-black/[0.04] pt-3">
                    <span className="text-[11px] font-bold text-brand-secondary/60 uppercase tracking-wider font-sans">Sort By</span>
                    <div className="flex gap-2">
                      {[
                        { label: 'Newest First', value: 'newest' },
                        { label: 'Oldest First', value: 'oldest' },
                        { label: 'Due Date', value: 'due' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          className={`py-1.5 px-3.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${sortBy === opt.value ? 'bg-brand-primary text-white border-transparent' : 'bg-brand-surface text-brand-primary border-black/[0.04] hover:bg-gray-150'}`}
                          onClick={() => setSortBy(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ASSIGNMENTS GRID or EMPTY */}
          {assignmentsList.length === 0 ? (
            <div className="flex justify-center items-center min-h-[300px] max-md:py-8">
              <div className="flex flex-col items-center text-center">
                <Image src={emptyIllustration} alt="No assignments" width={260} height={260} className="mb-[-16px]" />
                <h3 className="font-display text-2xl font-extrabold text-brand-primary tracking-[-0.5px] mt-0 mb-3">No assignments yet</h3>
                <p className="text-sm text-[#5E5E5E] leading-relaxed max-w-[540px]">
                  Create your first assignment to start collecting and grading student<br />
                  submissions. You can set up rubrics, define marking criteria, and let AI<br />
                  assist with grading.
                </p>
                <Link href="/create" className="no-underline mt-6">
                  <button className="bg-brand-primary text-white border-none rounded-full py-3.5 px-8 text-sm font-semibold cursor-pointer flex items-center shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-200 hover:bg-brand-primary/90 hover:scale-[0.98] active:scale-95">
                    <Plus size={16} color="#ffffff" className="mr-2" />
                    Create Your First Assignment
                  </button>
                </Link>
              </div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="flex flex-col items-center text-center">
                <h3 className="font-display text-2xl font-extrabold text-brand-primary tracking-[-0.5px] mt-0 mb-3">No results found</h3>
                <p className="text-sm text-[#5E5E5E] leading-relaxed max-w-[540px]">No assignments match your search criteria.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
              {filteredAssignments.map((assignment) => {
                const paper = assignment.generatedPaper;
                const title = paper?.title || `Quiz on ${paper?.subject || 'Electricity'}`;
                const assignedDate = new Date(assignment.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
                const dueDate = assignment.dueDate;

                return (
                  <div
                    key={assignment._id}
                    className="bg-white rounded-2xl border border-black/[0.06] p-5 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-10 cursor-pointer transition-shadow duration-200 hover:shadow-md"
                    onClick={() => setActiveMenuId(null)}
                  >
                    {/* Card Top */}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-display text-base font-bold text-brand-primary tracking-[-0.3px] leading-[1.3] flex-1">{title}</h4>

                      {/* Three-dot menu */}
                      <div className="relative shrink-0">
                        <button
                          className="bg-transparent border-none cursor-pointer p-1 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === assignment._id ? null : assignment._id);
                          }}
                        >
                          <MoreVertical size={16} color="rgba(24,24,24,0.5)" />
                        </button>

                        {activeMenuId === assignment._id && (
                          <div className="absolute top-7 right-0 bg-white border border-black/[0.08] rounded-xl p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-[100] min-w-[150px]" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/assignment/${assignment._id}`} className="no-underline">
                              <div
                                className="flex items-center py-2 px-3 text-[13px] font-semibold text-brand-primary rounded-lg cursor-pointer transition-colors duration-150 hover:bg-gray-100"
                                onClick={() => { setCurrentAssignment(assignment); setActiveMenuId(null); }}
                              >
                                <Eye size={13} className="mr-2" />
                                View Assignment
                              </div>
                            </Link>
                            <div
                              className="flex items-center py-2 px-3 text-[13px] font-semibold text-[#c53535] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-red-50"
                              onClick={(e) => handleDelete(assignment._id, e)}
                            >
                              <Trash2 size={13} className="mr-2" />
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer with dates */}
                    <div className="flex justify-between items-center border-t border-black/[0.06] pt-3">
                      <span className="flex items-center text-xs text-brand-primary/60">
                        <Calendar size={12} className="mr-1 opacity-50" />
                        Assigned on : {assignedDate}
                      </span>
                      <span className="flex items-center text-xs text-brand-primary/60 font-bold">
                        Due : {dueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FLOATING BOTTOM CREATE BUTTON */}
        {assignmentsList.length > 0 && (
          <div className="max-md:hidden fixed bottom-0 right-0 left-[296px] h-[100px] flex items-center justify-center z-50 pb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-surface/98 via-brand-surface/98 to-transparent backdrop-blur-[2px] pointer-events-none"></div>
            <Link href="/create" className="no-underline">
              <button className="relative z-10 bg-brand-primary text-white border-none rounded-full py-3.5 px-8 text-sm font-bold cursor-pointer flex items-center shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-200 hover:bg-brand-primary/90 hover:scale-[0.98] active:scale-95">
                <Plus size={18} color="#ffffff" className="mr-2" />
                Create Assignment
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
