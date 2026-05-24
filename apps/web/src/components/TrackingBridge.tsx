'use client';

import { useEffect } from 'react';
import { track } from '@/lib/api';

export function TrackingBridge() {
  useEffect(() => {
    const id = localStorage.getItem('cf_session') ?? crypto.randomUUID();
    localStorage.setItem('cf_session', id);
    track('page_view', { sessionId: id });

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
