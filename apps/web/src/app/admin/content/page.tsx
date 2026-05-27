'use client';

import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Link2, ListPlus, RefreshCcw, Save, Video } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { AdminNav } from '@/components/AdminNav';

type MediaAsset = {
  _id: string;
  title?: string;
  url: string;
  width?: number;
  height?: number;
  folder?: string;
};

type LandingCard = {
  _id: string;
  sectionKey: string;
  cardType: string;
  adminName: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  mediaId?: MediaAsset;
  targetSlot?: string;
  recommendedWidth?: number;
  recommendedHeight?: number;
  sortOrder?: number;
  active?: boolean;
};

const sectionOptions = [
  ['showcase_videos', 'Top video carousel'],
  ['course_videos', 'Course video carousel'],
  ['image_cards', 'Image card carousel'],
  ['prompt_categories', 'Prompt category cards'],
  ['testimonials', 'Testimonials']
];

const cardTypeOptions = [
  ['video', 'YouTube video card'],
  ['image', 'Image card'],
  ['course', 'Course card'],
  ['testimonial', 'Testimonial card']
];

const defaultForm = {
  sectionKey: 'showcase_videos',
  cardType: 'video',
  adminName: '',
  title: '',
  description: '',
  videoUrl: '',
  imageUrl: '',
  imageTitle: '',
  targetSlot: 'Home landing carousel',
  recommendedWidth: '1080',
  recommendedHeight: '1920',
  sortOrder: '0',
  active: true
};

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

export default function AdminContentPage() {
  const [cards, setCards] = useState<LandingCard[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const isVideo = form.cardType === 'video' || form.cardType === 'course';

  const groupedCards = useMemo(() => {
    return sectionOptions.map(([key, label]) => ({
      key,
      label,
      cards: cards.filter((card) => card.sectionKey === key)
    }));
  }, [cards]);

  async function load() {
    const [cardsResponse, mediaResponse] = await Promise.all([
      fetch(`${API_URL}/api/cms/cards`, { credentials: 'include' }),
      fetch(`${API_URL}/api/cms/media`, { credentials: 'include' })
    ]);
    if (cardsResponse.ok) setCards(await cardsResponse.json());
    if (mediaResponse.ok) setMedia(await mediaResponse.json());
  }

  useEffect(() => {
    load().catch(() => setMessage('Could not load content. Please login again.'));
  }, []);

  async function createCard() {
    setMessage('Saving...');
    let mediaId = '';

    if (!isVideo && form.imageUrl.trim()) {
      const mediaResponse = await fetch(`${API_URL}/api/cms/media/link`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: form.sectionKey,
          url: form.imageUrl,
          title: form.imageTitle || form.title || form.adminName,
          alt: form.title,
          width: Number(form.recommendedWidth) || undefined,
          height: Number(form.recommendedHeight) || undefined
        })
      });
      if (mediaResponse.ok) {
        const asset = await mediaResponse.json();
        mediaId = asset._id;
      }
    }

    const response = await fetch(`${API_URL}/api/cms/cards`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionKey: form.sectionKey,
        cardType: form.cardType,
        adminName: form.adminName || form.title,
        title: form.title,
        description: form.description,
        videoUrl: isVideo ? toEmbedUrl(form.videoUrl) : '',
        mediaId,
        targetSlot: form.targetSlot,
        recommendedWidth: Number(form.recommendedWidth) || undefined,
        recommendedHeight: Number(form.recommendedHeight) || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active
      })
    });

    if (!response.ok) {
      setMessage('Save failed. Check fields and login session.');
      return;
    }
    setMessage('Card saved successfully.');
    setForm({ ...defaultForm, sectionKey: form.sectionKey, cardType: form.cardType });
    await load();
  }

  async function toggleCard(card: LandingCard) {
    await fetch(`${API_URL}/api/cms/cards/${card._id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !card.active })
    });
    await load();
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan">WordPress style content manager</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Add image and YouTube cards</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Beginner friendly listing panel: card ka naam, section, image URL ya YouTube link add karo, size mention karo, aur publish karo.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <div className="mb-5 flex items-center gap-3">
              <ListPlus className="text-neon" />
              <h2 className="text-2xl font-black">Add New Card</h2>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-white/70">Where should this card appear?</span>
                <select value={form.sectionKey} onChange={(e) => setForm({ ...form, sectionKey: e.target.value })} className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none">
                  {sectionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-white/70">Card type</span>
                <select value={form.cardType} onChange={(e) => setForm({ ...form, cardType: e.target.value, recommendedWidth: e.target.value === 'image' ? '1200' : '1080', recommendedHeight: e.target.value === 'image' ? '1500' : '1920' })} className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none">
                  {cardTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-white/70">Admin card name</span>
                <input value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} placeholder="Example: Hero reel card 1" className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-white/70">Public title</span>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Example: Cinematic Product Reel" className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-white/70">Description / tag</span>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Example: Gemini video prompt" className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none" />
              </label>

              {isVideo ? (
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-white/70"><Video size={16} /> YouTube video link</span>
                  <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none" />
                </label>
              ) : (
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-white/70"><ImagePlus size={16} /> Image URL</span>
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none" />
                </label>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-white/70">Width</span>
                  <input value={form.recommendedWidth} onChange={(e) => setForm({ ...form, recommendedWidth: e.target.value })} className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-white/70">Height</span>
                  <input value={form.recommendedHeight} onChange={(e) => setForm({ ...form, recommendedHeight: e.target.value })} className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none" />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-white/70">Sort order</span>
                <input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 outline-none" />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <span className="font-bold">Publish this card</span>
              </label>

              <button onClick={createCard} className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-5 py-4 font-black text-ink shadow-glow">
                <Save size={18} /> Save Card
              </button>
              {message ? <p className="text-sm font-bold text-cyan">{message}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Current Listings</h2>
                <p className="mt-1 text-sm text-white/55">{cards.length} cards, {media.length} media links</p>
              </div>
              <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold">
                <RefreshCcw size={16} /> Refresh
              </button>
            </div>

            <div className="grid gap-5">
              {groupedCards.map((group) => (
                <div key={group.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-black text-cyan">{group.label}</h3>
                  <div className="mt-3 grid gap-3">
                    {group.cards.length ? group.cards.map((card) => (
                      <article key={card._id} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-cyan/12 px-3 py-1 text-xs font-black text-cyan">{card.cardType}</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${card.active ? 'bg-neon text-ink' : 'bg-white/10 text-white/50'}`}>{card.active ? 'Published' : 'Hidden'}</span>
                          </div>
                          <p className="mt-3 font-black">{card.title || card.adminName}</p>
                          <p className="mt-1 text-sm text-white/55">{card.description || card.targetSlot}</p>
                          <p className="mt-2 flex items-center gap-2 break-all text-xs text-white/40">
                            <Link2 size={14} /> {card.videoUrl || card.mediaId?.url || 'No media link'}
                          </p>
                        </div>
                        <button onClick={() => toggleCard(card)} className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold hover:border-cyan hover:text-cyan">
                          {card.active ? 'Hide' : 'Publish'}
                        </button>
                      </article>
                    )) : <p className="text-sm text-white/42">No cards yet.</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
