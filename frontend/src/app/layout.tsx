import React from 'react';
import './globals.css';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';

export const metadata = {
  title: 'VedaAI - AI-Powered Teacher Assessment & Question Paper Generator',
  description: 'Empower teachers with VedaAI, an executive school assessment suite. Instantly generate CBSE-aligned question papers, custom worksheets, numerical keys, and automated CBSE-standard PDFs from source texts in seconds.',
  keywords: 'AI question generator, CBSE paper creator, school assessment toolkit, VedaAI, automatic worksheet maker, exam setter tool, educational AI',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'VedaAI - AI-Powered Teacher Assessment Suite',
    description: 'Instantly generate CBSE-aligned exam question papers, sections, and automated PDF keys utilizing state-of-the-art Gemini LLM architectures.',
    siteName: 'VedaAI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VedaAI - AI-Powered Teacher Assessment Suite',
    description: 'Empower educators with automatic CBSE question paper generation and structural academic analytics dashboards.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-surface text-brand-primary font-sans overflow-x-hidden h-screen m-0 p-0">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
