import React from 'react';
import './globals.css';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';

export const metadata = {
  title: 'VedaAI',
  description: 'AI-Powered Teacher Assessment Suite',
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
