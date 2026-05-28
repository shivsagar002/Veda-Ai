import React from 'react';

// Static fallback parameter to satisfy Next.js static HTML export build check
export async function generateStaticParams() {
  return [{ id: 'fallback' }];
}

export default function FallbackPage() {
  return null;
}
