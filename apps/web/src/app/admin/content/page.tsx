'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Images,
  Link2,
  Loader2,
  RefreshCcw,
  Save,
  Upload,
  Video
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { AdminNav } from '@/components/AdminNav';

type MediaAsset = { _id: string; url: string; alt?: string };
type CardType = 'image' | 'video' | 'course';
type LandingCard = {
  _id: string;
  sectionKey: string;
  cardType: string;
  adminName: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  mediaId?: MediaAsset;
  badgeText?: string;
  borderColor?: string;
  recommendedWidth?: number;
  recommendedHeight?: number;
  sortOrder?: number;
  active?: boolean;
};

type Slot = {
  id: string;
  sectionKey: string;
  group: string;
  label: string;
  title: string;
  description: string;
  type: CardType;
  width: number;
  height: number;
  badgeText?: string;
  borderColor?: string;
  sortOrder: number;
};

type SlotDraft = {
  title: string;
  description: string;
  url: string;
  badgeText: string;
  borderColor: string;
};

const slots: Slot[] = [
  { id: 'cat1', sectionKey: 'market_cards', group: 'Popular 3-Column Cards', label: 'Category 1', title: 'Indian Wedding Invitation Prompt', description: 'Premium invitation prompt card.', type: 'image', width: 1080, height: 1080, badgeText: 'Most Popular', borderColor: '#ff0000', sortOrder: 1 },
  { id: 'cat2', sectionKey: 'market_cards', group: 'Popular 3-Column Cards', label: 'Category 2', title: 'Indian Wedding Photoshoot Prompt', description: 'Couple photoshoot and cinematic wedding prompt.', type: 'image', width: 1080, height: 1080, badgeText: 'Trending', borderColor: '#ff0000', sortOrder: 2 },
  { id: 'cat3', sectionKey: 'market_cards', group: 'Popular 3-Column Cards', label: 'Category 3', title: 'Commercial Brand Campaign Prompt', description: 'Product ad, brand campaign and creative visuals.', type: 'image', width: 1080, height: 1080, badgeText: 'Best Seller', borderColor: '#ff0000', sortOrder: 3 },
  { id: 'cat4', sectionKey: 'market_cards', group: 'Popular 3-Column Cards', label: 'Category 4', title: 'Birthday Celebration Prompt', description: 'Birthday poster and celebration video prompt.', type: 'image', width: 1080, height: 1080, badgeText: 'Popular', borderColor: '#ff1f7a', sortOrder: 4 },
  { id: 'cat5', sectionKey: 'market_cards', group: 'Popular 3-Column Cards', label: 'Category 5', title: 'Real Estate Promo Prompt', description: 'Property, interior and real estate ad prompts.', type: 'image', width: 1080, height: 1080, badgeText: 'Creator Pick', borderColor: '#2563eb', sortOrder: 5 },
  { id: 'cat6', sectionKey: 'market_cards', group: 'Popular 3-Column Cards', label: 'Category 6', title: 'Fashion Product Shoot Prompt', description: 'Fashion, model and premium product shoot prompts.', type: 'image', width: 1080, height: 1080, badgeText: 'Viral Pack', borderColor: '#8b5cf6', sortOrder: 6 },

  { id: 'topv1', sectionKey: 'showcase_videos', group: 'Top Reel Video Slider', label: 'Top Video 1', title: 'Cinematic Product Reel', description: 'Landing page ke upar wale reel card.', type: 'video', width: 1080, height: 1920, sortOrder: 1 },
  { id: 'topv2', sectionKey: 'showcase_videos', group: 'Top Reel Video Slider', label: 'Top Video 2', title: 'AI Prompt Demo Reel', description: 'Landing page ke upar wale reel card.', type: 'video', width: 1080, height: 1920, sortOrder: 2 },
  { id: 'topv3', sectionKey: 'showcase_videos', group: 'Top Reel Video Slider', label: 'Top Video 3', title: 'Creator Output Reel', description: 'Landing page ke upar wale reel card.', type: 'video', width: 1080, height: 1920, sortOrder: 3 },
  { id: 'topv4', sectionKey: 'showcase_videos', group: 'Top Reel Video Slider', label: 'Top Video 4', title: 'Business Ad Reel', description: 'Landing page ke upar wale reel card.', type: 'video', width: 1080, height: 1920, sortOrder: 4 },

  { id: 'course1', sectionKey: 'course_videos', group: 'Recorded Course Videos', label: 'Course Video 1', title: 'ChatGPT Mastery Course', description: '62 recorded videos', type: 'course', width: 1080, height: 1920, sortOrder: 1 },
  { id: 'course2', sectionKey: 'course_videos', group: 'Recorded Course Videos', label: 'Course Video 2', title: 'Prompt Engineering Course', description: '33 recorded videos', type: 'course', width: 1080, height: 1920, sortOrder: 2 },
  { id: 'course3', sectionKey: 'course_videos', group: 'Recorded Course Videos', label: 'Course Video 3', title: 'SaaS ChatGPT Course', description: '33 recorded videos', type: 'course', width: 1080, height: 1920, sortOrder: 3 },
  { id: 'course4', sectionKey: 'course_videos', group: 'Recorded Course Videos', label: 'Course Video 4', title: 'ChatGPT Power Course', description: '25 recorded videos', type: 'course', width: 1080, height: 1920, sortOrder: 4 },

  ...Array.from({ length: 8 }, (_, index) => ({
    id: `img${index + 1}`,
    sectionKey: 'image_cards',
    group: 'Image Card Slider',
    label: `Image Card ${index + 1}`,
    title: `Prompt Bundle Image ${index + 1}`,
    description: 'Image slider card.',
    type: 'image' as CardType,
    width: 1200,
    height: 1500,
    badgeText: '',
    borderColor: '#ff0000',
    sortOrder: index + 1
  }))
];

const groupOrder = ['Popular 3-Column Cards', 'Top Reel Video Slider', 'Recorded Course Videos', 'Image Card Slider'];

function toEmbedUrl(url: string) {
  const value = url.trim();
  if (!value) return '';
  try {
    const parsed = new URL(value);
    if (parsed.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').pop();
      return id ? `https://www.youtube.com/embed/${id}` : value;
    }
  } catch {
    return value;
  }
  return value;
}

function isVideoUrl(url: string) {
  return /youtube\.com|youtu\.be|wistia\.com|vimeo\.com|\.mp4/i.test(url);
}

async function imageFileToDataUrl(file: File, maxSize = 1400) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image compression failed');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.82);
}

export default function AdminContentPage() {
  const [cards, setCards] = useState<LandingCard[]>([]);
  const [drafts, setDrafts] = useState<Record<string, SlotDraft>>({});
  const [message, setMessage] = useState('');
  const [savingSlot, setSavingSlot] = useState('');
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const cardsBySlot = useMemo(() => {
    const map = new Map<string, LandingCard>();
    slots.forEach((slot) => {
      const card = cards.find((item) => item.sectionKey === slot.sectionKey && Number(item.sortOrder) === slot.sortOrder);
      if (card) map.set(slot.id, card);
    });
    return map;
  }, [cards]);

  const groupedSlots = useMemo(() => groupOrder.map((group) => ({
    group,
    items: slots.filter((slot) => slot.group === group)
  })), []);

  async function load() {
    const response = await fetch(`${API_URL}/api/cms/cards`, { credentials: 'include' });
    if (!response.ok) {
      setMessage('Session expired lag rahi hai. Please admin login dobara karo.');
      return;
    }

    const nextCards: LandingCard[] = await response.json();
    setCards(nextCards);
    const nextDrafts: Record<string, SlotDraft> = {};
    slots.forEach((slot) => {
      const card = nextCards.find((item) => item.sectionKey === slot.sectionKey && Number(item.sortOrder) === slot.sortOrder);
      nextDrafts[slot.id] = {
        title: card?.title || slot.title,
        description: card?.description || slot.description,
        url: card?.videoUrl || card?.mediaId?.url || '',
        badgeText: card?.badgeText || slot.badgeText || '',
        borderColor: card?.borderColor || slot.borderColor || '#ff0000'
      };
    });
    setDrafts(nextDrafts);
  }

  useEffect(() => {
    load().catch(() => setMessage('API connect nahi ho pa raha. Deployment/env check karo.'));
  }, []);

  function updateDraft(slotId: string, patch: Partial<SlotDraft>) {
    setDrafts((current) => ({
      ...current,
      [slotId]: { ...(current[slotId] || { title: '', description: '', url: '', badgeText: '', borderColor: '#ff0000' }), ...patch }
    }));
  }

  async function createMediaLink(slot: Slot, url: string, title: string) {
    const response = await fetch(`${API_URL}/api/cms/media/link`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folder: slot.sectionKey,
        url,
        title,
        alt: title,
        width: slot.width,
        height: slot.height
      })
    });
    if (!response.ok) throw new Error('Media URL save failed');
    return (await response.json()) as MediaAsset;
  }

  async function saveSlot(slot: Slot, uploadedMedia?: MediaAsset) {
    const draft = drafts[slot.id];
    const title = draft?.title?.trim() || slot.title;
    const description = draft?.description?.trim() || slot.description;
    const url = draft?.url?.trim() || uploadedMedia?.url || '';
    const card = cardsBySlot.get(slot.id);
    const shouldBeVideo = slot.type !== 'image' || isVideoUrl(url);
    const cardType: CardType = shouldBeVideo ? (slot.type === 'course' ? 'course' : 'video') : 'image';

    if (!url && !card?.mediaId?.url && !card?.videoUrl) {
      setMessage(`${slot.label}: ${slot.type === 'image' ? 'pehle image upload karo.' : 'pehle YouTube link paste karo.'}`);
      return;
    }

    setSavingSlot(slot.id);
    setMessage(`${slot.label} save ho raha hai...`);

    try {
      let mediaId = uploadedMedia?._id || '';
      if (!shouldBeVideo && url && url !== card?.mediaId?.url && !uploadedMedia) {
        mediaId = (await createMediaLink(slot, url, title))._id;
      }

      const payload = {
        sectionKey: slot.sectionKey,
        cardType,
        adminName: `${slot.label} - ${title}`,
        title,
        description,
        badgeText: draft?.badgeText || slot.badgeText || '',
        borderColor: draft?.borderColor || slot.borderColor || '#ff0000',
        videoUrl: shouldBeVideo ? toEmbedUrl(url || card?.videoUrl || '') : '',
        ...(mediaId ? { mediaId } : {}),
        targetSlot: slot.id,
        recommendedWidth: slot.width,
        recommendedHeight: slot.height,
        sortOrder: slot.sortOrder,
        active: true
      };

      const response = await fetch(`${API_URL}/api/cms/cards${card ? `/${card._id}` : ''}`, {
        method: card ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Card save failed');
      setMessage(`${slot.label} saved successfully.`);
      await load();
    } catch {
      setMessage(`${slot.label} save nahi hua. Login ya URL check karo.`);
    } finally {
      setSavingSlot('');
    }
  }

  async function uploadFile(slot: Slot, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const draft = drafts[slot.id];

    if (slot.type !== 'image') {
      setMessage(`${slot.label}: video card me upload nahi, sirf YouTube link paste karo.`);
      event.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage(`${slot.label}: sirf image upload karo.`);
      event.target.value = '';
      return;
    }

    setSavingSlot(slot.id);
    setMessage(`${slot.label} image upload ho rahi hai...`);

    try {
      const dataUrl = await imageFileToDataUrl(file);
      const media = await createMediaLink(slot, dataUrl, draft?.title || slot.title);
      updateDraft(slot.id, { url: media.url });
      await saveSlot(slot, media);
    } catch {
      setMessage('Image upload failed. Image chhoti karke dobara try karo.');
    } finally {
      setSavingSlot('');
      event.target.value = '';
    }
  }

  async function toggle(slot: Slot) {
    const card = cardsBySlot.get(slot.id);
    if (!card) return;
    await fetch(`${API_URL}/api/cms/cards/${card._id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !card.active })
    });
    await load();
  }

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-[#0f172a] md:pl-[250px]" style={{ colorScheme: 'light' }}>
      <AdminNav />
      <section className="px-4 py-5 sm:px-8">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black text-blue-700">
                <Images size={18} /> Media Manager
              </p>
              <h1 className="mt-2 text-3xl font-black">Landing Page Card Manager</h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                Image cards me image upload karo. Video cards me YouTube link paste karo, phir Save dabao.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-black text-slate-700 hover:bg-slate-50">
                <RefreshCcw size={17} /> Refresh
              </button>
              <a href="/" className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-3 font-black text-white">
                <ExternalLink size={17} /> Website Dekho
              </a>
            </div>
          </div>
        </header>

        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-slate-700">
          <p><CheckCircle2 className="mr-2 inline text-emerald-500" size={17} /><strong>Recommended:</strong> 1080x1080px square cards, reels ke liye 1080x1920px.</p>
          <p><CheckCircle2 className="mr-2 inline text-emerald-500" size={17} /><strong>Image cards:</strong> JPG, PNG ya WebP upload karo.</p>
          <p><CheckCircle2 className="mr-2 inline text-emerald-500" size={17} /><strong>Video cards:</strong> YouTube link paste karo aur Save YouTube dabao.</p>
        </div>

        {message ? (
          <div className="sticky top-3 z-20 mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="space-y-8">
          {groupedSlots.map(({ group, items }) => (
            <section key={group} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">{group}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {items.length} fixed slots. Image cards me upload, video cards me YouTube link.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                  {items[0]?.width}x{items[0]?.height}px
                </span>
              </div>

              <div className="divide-y divide-slate-200">
                {items.map((slot) => {
                  const card = cardsBySlot.get(slot.id);
                  const draft = drafts[slot.id] || {
                    title: slot.title,
                    description: slot.description,
                    url: card?.videoUrl || card?.mediaId?.url || '',
                    badgeText: slot.badgeText || '',
                    borderColor: slot.borderColor || '#ff0000'
                  };
                  const thumb = card?.mediaId?.url || (!isVideoUrl(draft.url) ? draft.url : '');
                  const isSaving = savingSlot === slot.id;

                  return (
                    <article key={slot.id} className="py-5">
                      <div className="grid gap-4 lg:grid-cols-[80px_1fr_110px] lg:items-start">
                        <div className="h-16 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {thumb ? (
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center text-slate-400">
                              {slot.type === 'image' ? <ImageIcon size={24} /> : <Video size={24} />}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black">
                              {slot.label} — “{draft.title || slot.title}” card
                            </h3>
                            {card ? (
                              <span className="text-sm font-black text-emerald-600">Saved</span>
                            ) : (
                              <span className="text-sm font-black text-amber-600">Empty</span>
                            )}
                            {card && !card.active ? <span className="text-sm font-black text-slate-400">Hidden</span> : null}
                          </div>
                          <p className="mt-1 text-sm font-semibold text-slate-400">
                            {slot.type === 'image' ? 'Image upload karo' : 'YouTube link paste karo'} - Recommended {slot.width}x{slot.height}px
                          </p>
                          {card ? <p className="mt-1 break-all text-xs font-semibold text-slate-500">{card.videoUrl || card.mediaId?.url}</p> : null}

                          <div className="mt-4 grid gap-3 xl:grid-cols-2">
                            <label className="grid gap-1">
                              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Headline</span>
                              <input value={draft.title} onChange={(event) => updateDraft(slot.id, { title: event.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500" />
                            </label>
                            <label className="grid gap-1">
                              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Niche ka text</span>
                              <input value={draft.description} onChange={(event) => updateDraft(slot.id, { description: event.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500" />
                            </label>
                          </div>

                          <div className={`mt-3 grid gap-3 ${slot.type === 'image' ? 'xl:grid-cols-[120px_120px]' : 'xl:grid-cols-[1fr_120px_120px]'}`}>
                            {slot.type !== 'image' ? (
                              <label className="relative">
                                <Link2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                  value={draft.url}
                                  onChange={(event) => updateDraft(slot.id, { url: event.target.value })}
                                  placeholder="YouTube video link paste karo"
                                  className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
                                />
                              </label>
                            ) : null}
                            <input
                              value={draft.badgeText}
                              onChange={(event) => updateDraft(slot.id, { badgeText: event.target.value })}
                              placeholder="Badge"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-3 font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
                            />
                            <input
                              type="color"
                              value={draft.borderColor || '#ff0000'}
                              onChange={(event) => updateDraft(slot.id, { borderColor: event.target.value })}
                              className="h-12 w-full rounded-lg border border-slate-200 bg-white p-1"
                              title="Border color"
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <input
                            ref={(node) => { fileInputs.current[slot.id] = node; }}
                            type="file"
                            accept={slot.type === 'image' ? 'image/*' : undefined}
                            className="hidden"
                            onChange={(event) => uploadFile(slot, event)}
                          />
                          {slot.type === 'image' ? (
                            <button
                              type="button"
                              onClick={() => fileInputs.current[slot.id]?.click()}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-4 py-3 font-black text-white"
                            >
                              <Upload size={16} /> Upload Image
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => saveSlot(slot)}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-black text-white disabled:opacity-60"
                          >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {slot.type === 'image' ? 'Save Text' : 'Save YouTube'}
                          </button>
                          {card ? (
                            <button
                              type="button"
                              onClick={() => toggle(slot)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-600"
                            >
                              {card.active ? 'Hide' : 'Show'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
