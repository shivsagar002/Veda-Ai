'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Link from 'next/link';
import { useAssignmentStore, IAssignment } from '../store/useAssignmentStore';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Calendar, 
  FileText,
  Plus,
  BookOpen,
  HelpCircle,
  Award,
  TrendingUp
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { assignmentsList, setAssignmentsList, setCurrentAssignment } = useAssignmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Fetch all assignments on mount
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/assignments`);
        if (response.ok) {
          const list: IAssignment[] = await response.json();
          setAssignmentsList(list);
        }
      } catch (error) {
        console.error('Failed to fetch assignments from backend:', error);
      }
    };
    fetchAssignments();
  }, [setAssignmentsList]);

  // Handle Delete Assignment
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

  const filteredAssignments = assignmentsList.filter(item => {
    const title = item.generatedPaper?.title || `Assessment (Due: ${item.dueDate})`;
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.generatedPaper?.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate dynamic stats
  const totalAssignments = assignmentsList.length;
  const uniqueSubjects = Array.from(new Set(assignmentsList.map(a => a.generatedPaper?.subject || 'Physics').filter(Boolean)));
  const totalQuestionsCount = assignmentsList.reduce((acc, a) => acc + (a.totalQuestions || 0), 0);
  const averageMarks = assignmentsList.length ? Math.round(assignmentsList.reduce((acc, a) => acc + (a.totalMarks || 0), 0) / assignmentsList.length) : 0;

  // Calculate subject counts
  const subjectDistribution = assignmentsList.reduce((acc: { [key: string]: number }, cur) => {
    const sub = cur.generatedPaper?.subject || 'Physics';
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {});

  const subjectData = Object.entries(subjectDistribution).map(([name, count]) => ({
    name,
    count,
    percentage: totalAssignments ? Math.round((count / totalAssignments) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="flex w-full h-full animate-fade">
      <Sidebar />

      <div className="main-content flex flex-col flex-1 h-full overflow-y-auto">
        <TopBar breadcrumb="Dashboard" />

        <div className="p-12 pb-[120px] max-md:p-4 max-md:pb-[104px] bg-brand-surface flex-1 relative flex flex-col gap-8">
          
          {/* PAGE HEADER */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#17cb9e] relative shadow-[0_0_8px_rgba(23,203,158,0.5)] shrink-0">
                <div className="beacon-outer-ripple"></div>
              </div>
              <div>
                <h1 className="font-display text-[28px] font-extrabold text-[#181818] tracking-[-0.5px]">Academic Dashboard</h1>
                <p className="text-[13px] text-[#5e5e5e]/70 mt-0.5">Real-time statistics and assessment matrix overview.</p>
              </div>
            </div>
          </div>

          {/* DYNAMIC KPI CARDS GRID */}
          <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-6">
            {/* KPI 1 */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/5 flex justify-center items-center shrink-0">
                <FileText size={22} color="#ff5623" />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-secondary/60 block font-sans">Total Assessments</span>
                <span className="text-[28px] font-black text-[#181818] tracking-tight font-sans">{totalAssignments}</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/5 flex justify-center items-center shrink-0">
                <BookOpen size={22} color="#0d9488" />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-secondary/60 block font-sans">Subjects Covered</span>
                <span className="text-[28px] font-black text-[#181818] tracking-tight font-sans">{uniqueSubjects.length}</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex justify-center items-center shrink-0">
                <HelpCircle size={22} color="#2563eb" />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-secondary/60 block font-sans">Questions Formulated</span>
                <span className="text-[28px] font-black text-[#181818] tracking-tight font-sans">{totalQuestionsCount}</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/5 flex justify-center items-center shrink-0">
                <Award size={22} color="#7c3aed" />
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-secondary/60 block font-sans">Avg. Exam Marks</span>
                <span className="text-[28px] font-black text-[#181818] tracking-tight font-sans">{averageMarks} <span className="text-xs font-bold text-brand-secondary/50 font-sans">pts</span></span>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN ANALYTICS VIEW */}
          <div className="grid grid-cols-[1.6fr_1fr] max-lg:grid-cols-1 gap-8">
            
            {/* LEFT COLUMN: ASSESSMENT MATRIX TABLE */}
            <div className="bg-white rounded-[32px] border border-black/[0.04] p-8 max-md:p-5 shadow-sm flex flex-col gap-6">
              <div className="flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#181818]">Assessment Matrix</h3>
                  <p className="text-xs text-brand-secondary/70 mt-0.5">Syllabus-aligned papers currently stored in your repository.</p>
                </div>
                
                {/* Search Bar inside Panel */}
                <div className="flex items-center bg-brand-surface border border-black/[0.06] rounded-full py-1.5 px-4 w-[280px] max-md:w-full">
                  <Search size={16} color="rgba(48, 48, 48, 0.4)" className="mr-2 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search matrix..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none p-0 w-full bg-transparent text-xs font-medium outline-none focus:ring-0 shadow-none font-sans"
                  />
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.04]">
                      <th className="py-4 px-3 text-xs font-bold text-brand-secondary/60 uppercase tracking-wider font-sans">Assessment Paper</th>
                      <th className="py-4 px-3 text-xs font-bold text-brand-secondary/60 uppercase tracking-wider font-sans">Subject</th>
                      <th className="py-4 px-3 text-xs font-bold text-brand-secondary/60 uppercase tracking-wider font-sans">Target Class</th>
                      <th className="py-4 px-3 text-xs font-bold text-brand-secondary/60 uppercase tracking-wider font-sans text-center">Questions</th>
                      <th className="py-4 px-3 text-xs font-bold text-brand-secondary/60 uppercase tracking-wider font-sans text-center">Marks</th>
                      <th className="py-4 px-3 text-xs font-bold text-brand-secondary/60 uppercase tracking-wider font-sans">Due Date</th>
                      <th className="py-4 px-3 text-xs font-bold text-brand-secondary/60 uppercase tracking-wider font-sans text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm font-semibold text-brand-secondary/50 font-sans">
                          No assessment data found. Click "Create Assignment" to generate.
                        </td>
                      </tr>
                    ) : (
                      filteredAssignments.map((assignment) => {
                        const paper = assignment.generatedPaper;
                        const title = paper?.title || `Quiz on ${paper?.subject || 'Electricity'}`;
                        const formattedDate = assignment.dueDate;
                        const sub = paper?.subject || 'Physics';
                        const cls = assignment.className || 'Class 10';

                        return (
                          <tr key={assignment._id} className="border-b border-black/[0.03] hover:bg-black/[0.01] transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-accent/5 flex justify-center items-center shrink-0">
                                  <FileText size={16} color="#ff5623" />
                                </div>
                                <span className="text-sm font-bold text-[#181818] line-clamp-1 max-w-[200px] font-sans" title={title}>{title}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="inline-block text-[11px] font-bold bg-[#ff5623]/8 text-[#ff5623] px-2.5 py-0.5 rounded-full font-sans">
                                {sub}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="text-[13px] font-semibold text-[#181818] font-sans">{cls}</span>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="text-[13px] font-bold text-[#181818] font-sans">{assignment.totalQuestions}</span>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span className="text-[13px] font-bold text-brand-accent font-sans">{assignment.totalMarks}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="text-xs font-bold text-brand-secondary/80 font-sans">{formattedDate}</span>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Link href={`/assignment?id=${assignment._id}`}>
                                  <button 
                                    className="p-1.5 rounded-lg border-none bg-brand-accent/5 cursor-pointer hover:bg-brand-accent/10 transition-colors"
                                    onClick={() => setCurrentAssignment(assignment)}
                                    title="View"
                                  >
                                    <Eye size={14} color="#ff5623" />
                                  </button>
                                </Link>
                                <button 
                                  className="p-1.5 rounded-lg border-none bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition-colors"
                                  onClick={(e) => handleDelete(assignment._id, e)}
                                  title="Delete"
                                >
                                  <Trash2 size={14} color="#ef4444" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN: SUBJECT DISTRIBUTION CHART */}
            <div className="bg-white rounded-[32px] border border-black/[0.04] p-8 max-md:p-5 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="font-display text-xl font-bold text-[#181818]">Subject Analytics</h3>
                <p className="text-xs text-brand-secondary/70 mt-0.5">Assessments distribution cover across subjects.</p>
              </div>

              {/* BEAUTIFUL VISUAL CHARTS (Pure HTML/CSS Representation) */}
              <div className="flex flex-col gap-5 flex-1 justify-center">
                {subjectData.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <TrendingUp size={36} color="rgba(24, 24, 24, 0.2)" className="mb-3" />
                    <span className="text-xs font-semibold text-brand-secondary/50 font-sans">No subject analysis available.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4">
                      {subjectData.slice(0, 4).map((sub, idx) => (
                        <div key={sub.name} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[#181818] font-sans">{sub.name}</span>
                            <span className="font-semibold text-brand-secondary/60 font-sans">{sub.count} {sub.count === 1 ? 'Paper' : 'Papers'} ({sub.percentage}%)</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-brand-surface overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500`}
                              style={{ 
                                width: `${sub.percentage}%`,
                                backgroundColor: idx === 0 ? '#ff5623' : idx === 1 ? '#0d9488' : idx === 2 ? '#2563eb' : '#7c3aed'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Footer details */}
                    <div className="border-t border-dashed border-black/[0.08] pt-5 mt-auto flex items-center justify-between text-xs text-brand-secondary font-sans">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={14} color="#17cb9e" />
                        <span className="font-bold text-[#181818]">Topic Diversity Index</span>
                      </div>
                      <span className="font-bold bg-[#17cb9e]/8 text-[#17cb9e] px-2 py-0.5 rounded-md">
                        {subjectData.length > 2 ? 'High' : 'Medium'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* DYNAMIC MAIN ASSIGNMENTS PANEL */}
          <div className="bg-white rounded-[32px] border border-black/[0.04] p-8 max-md:p-5 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center max-md:flex-col max-md:items-stretch gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#181818]">Assignment Cards</h3>
                <p className="text-xs text-brand-secondary/70 mt-0.5">Access and review standard generated templates.</p>
              </div>
              <Link href="/create" className="no-underline">
                <button className="bg-brand-primary text-white border-none rounded-full py-2.5 px-6 text-xs font-bold cursor-pointer flex items-center shadow-[0_4px_12px_rgba(255,86,35,0.2)] transition-transform duration-200 hover:scale-[0.98] active:scale-95 font-sans">
                  <Plus size={15} color="#ffffff" className="mr-1.5" />
                  Generate New Paper
                </button>
              </Link>
            </div>

            {/* DYNAMIC ASSIGNMENT CARD GRID */}
            {filteredAssignments.length === 0 ? (
              <div className="flex justify-center items-center py-10">
                <span className="text-xs font-semibold text-brand-secondary/50 font-sans">No assignments created yet.</span>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] max-md:grid-cols-1 gap-8">
                {filteredAssignments.map((assignment) => {
                  const paper = assignment.generatedPaper;
                  const title = paper?.title || `Quiz on ${paper?.subject || 'Electricity'}`;
                  const formattedDate = assignment.dueDate;
                  const assignedDate = new Date(assignment.createdAt).toLocaleDateString('en-GB');

                  return (
                    <div key={assignment._id} className="bg-white rounded-[20px] border border-black/[0.06] p-6 shadow-sm flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center max-w-[85%]">
                          <FileText size={18} color="#ff5623" className="mr-2 shrink-0" />
                          <h4 className="font-display text-lg font-bold text-[#181818] tracking-[-0.3px] leading-[1.2]">{title}</h4>
                        </div>
                        
                        <div className="relative">
                          <button 
                            className="bg-transparent border-none cursor-pointer p-1 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === assignment._id ? null : assignment._id);
                            }}
                          >
                            <MoreVertical size={18} color="rgba(48, 48, 48, 0.6)" />
                          </button>

                          {activeMenuId === assignment._id && (
                            <div className="absolute top-7 right-0 bg-white border border-black/[0.08] rounded-xl p-1.5 shadow-md z-[99] w-[140px]">
                              <Link href={`/assignment?id=${assignment._id}`} className="no-underline">
                                <div className="flex items-center py-2 px-3 text-xs font-semibold text-[#181818] rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-100" onClick={() => setCurrentAssignment(assignment)}>
                                  <Eye size={14} className="mr-2" />
                                  View Paper
                                </div>
                              </Link>
                              <div 
                                className="flex items-center py-2 px-3 text-xs font-semibold text-[#c53535] rounded-lg cursor-pointer transition-colors duration-200 hover:bg-red-50"
                                onClick={(e) => handleDelete(assignment._id, e)}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mb-6 flex-1">
                        <div className="flex justify-between text-[13px]">
                          <span className="text-brand-secondary/70">Subject:</span>
                          <span className="text-[#181818] font-semibold">{paper?.subject || 'Physics'}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-brand-secondary/70">Total Questions:</span>
                          <span className="text-[#181818] font-semibold">{assignment.totalQuestions} Questions</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-brand-secondary/70">Total Marks:</span>
                          <span className="text-[#181818] font-semibold text-[#ff5623]">
                            {assignment.totalMarks} Marks
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-black/[0.08] pt-4 flex justify-between items-center">
                        <div className="flex items-center text-[11px] text-brand-secondary">
                          <Calendar size={13} color="rgba(48, 48, 48, 0.5)" className="mr-1" />
                          <span>Assigned: {assignedDate}</span>
                        </div>
                        <div className="flex items-center text-[11px] text-[#c53535]">
                          <Calendar size={13} color="#c53535" className="mr-1" />
                          <span className="font-bold">Due: {formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
