import type { Metadata } from 'next';
import { TrackingBridge } from '@/components/TrackingBridge';
import './globals.css';

export const metadata: Metadata = {
  title: 'CineForge AI - 10 Hajar+ AI Prompt Bundle + AI Course',
  description: 'Google Gemini, Midjourney, Sora, DALL-E prompt bundle plus recorded AI course for creators.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'CineForge AI Prompt Vault',
    description: 'Ready-to-copy prompt vault for creators, agencies, freelancers and businesses.',
    type: 'website'
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TrackingBridge />
        {children}
      </body>
    </html>
  );
}
