'use client';

import { useEffect } from 'react';
import { initMarketing, track } from '@/lib/tracking';

export function TrackingBridge() {
  useEffect(() => {
    initMarketing();
    track('page_view');
    if (window.location.pathname === '/') track('view_content', { productName: 'CineForge AI Prompt Bundle' });

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('a,button');
      if (button) track('button_click', { label: button.textContent?.trim().slice(0, 80) });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
