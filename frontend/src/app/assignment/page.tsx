'use client';

import React, { Suspense } from 'react';
import AssignmentClientPage from './AssignmentClientPage';
import { Loader2 } from 'lucide-react';

export default function AssignmentOutputPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center w-screen h-screen bg-brand-surface font-sans">
        <Loader2 size={32} color="#ff5623" className="animate-spin" />
        <span className="mt-3 font-semibold text-white/70">Loading Assignment...</span>
      </div>
    }>
      <AssignmentClientPage />
    </Suspense>
  );
}
