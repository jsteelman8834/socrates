import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Socratic University - Learn History Through Discovery',
  description: 'An adaptive AI tutor that teaches 5th-grade American History through the Socratic method.',
  keywords: ['education', 'history', 'AI tutor', 'Socratic method', '5th grade'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-parchment-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
