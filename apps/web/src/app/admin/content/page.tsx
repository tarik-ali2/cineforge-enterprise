'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, ImagePlus, Link2, PlusCircle, RefreshCcw, Save, Video } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { AdminNav } from '@/components/AdminNav';

type MediaAsset = { _id: string; url: string; alt?: string };
type LandingCard = {
  _id: string;
  sectionKey: string;
  cardType: string;
  adminName: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  mediaId?: MediaAsset;
  recommendedWidth?: number;
  recommendedHeight?: number;
  sortOrder?: number;
  active?: boolean;
};

const sections = [
  { key: 'showcase_videos', label: 'Top Video Slider', help: 'Landing page ke upar reel video cards', type: 'video', width: '1080', height: '1920' },
  { key: 'course_videos', label: 'Course Video Slider', help: 'Recorded classes ke video cards', type: 'course', width: '1080', height: '1920' },
  { key: 'image_cards', label: 'Image Card Slider', help: '8 image prompt cards / product visuals', type: 'image', width: '1200', height: '1500' },
  { key: 'prompt_categories', label: 'Prompt Categories', help: 'Small prompt category cards', type: 'image', width: '1200', height: '900' }
];

const initial = {
  sectionKey: 'showcase_videos',
  cardType: 'video',
  title: '',
  description: '',
  videoUrl: '',
  imageUrl: '',
  sortOrder: '0',
  active: true,
  recommendedWidth: '1080',
  recommendedHeight: '1920'
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
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState('');
  const currentSection = sections.find((section) => section.key === form.sectionKey) ?? sections[0];
  const isVideo = form.cardType === 'video' || form.cardType === 'course';

  const grouped = useMemo(() => sections.map((section) => ({
    ...section,
    cards: cards.filter((card) => card.sectionKey === section.key)
  })), [cards]);

  async function load() {
    const response = await fetch(`${API_URL}/api/cms/cards`, { credentials: 'include' });
    if (response.ok) setCards(await response.json());
  }

  useEffect(() => {
    load().catch(() => setMessage('Login session expired. Please login again.'));
  }, []);

  function chooseSection(section: typeof sections[number]) {
    setForm({
      ...form,
      sectionKey: section.key,
      cardType: section.type,
      recommendedWidth: section.width,
      recommendedHeight: section.height
    });
  }

  async function save() {
    setMessage('Saving card...');
    if (!form.title.trim()) {
      setMessage('Title required hai.');
      return;
    }
    if (isVideo && !form.videoUrl.trim()) {
      setMessage('YouTube link required hai.');
      return;
    }
    if (!isVideo && !form.imageUrl.trim()) {
      setMessage('Image URL required hai.');
      return;
    }

    let mediaId = '';
    if (!isVideo) {
      const mediaResponse = await fetch(`${API_URL}/api/cms/media/link`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: form.sectionKey,
          url: form.imageUrl,
          title: form.title,
          alt: form.title,
          width: Number(form.recommendedWidth),
          height: Number(form.recommendedHeight)
        })
      });
      if (mediaResponse.ok) mediaId = (await mediaResponse.json())._id;
    }

    const response = await fetch(`${API_URL}/api/cms/cards`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionKey: form.sectionKey,
        cardType: form.cardType,
        adminName: form.title,
        title: form.title,
        description: form.description,
        videoUrl: isVideo ? toEmbedUrl(form.videoUrl) : '',
        mediaId,
        targetSlot: currentSection.label,
        recommendedWidth: Number(form.recommendedWidth),
        recommendedHeight: Number(form.recommendedHeight),
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active
      })
    });

    if (!response.ok) {
      setMessage('Save failed. Login dobara karo ya fields check karo.');
      return;
    }

    setMessage('Saved. Card website slider me add ho gaya.');
    setForm({ ...initial, sectionKey: form.sectionKey, cardType: form.cardType, recommendedWidth: form.recommendedWidth, recommendedHeight: form.recommendedHeight });
    await load();
  }

  async function toggle(card: LandingCard) {
    await fetch(`${API_URL}/api/cms/cards/${card._id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !card.active })
    });
    await load();
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan">Content Manager</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Website cards add karo</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Simple flow: slider choose karo, title likho, YouTube link ya image URL paste karo, phir Save Card.
          </p>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[460px_1fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PlusCircle className="text-cyan" />
              <h2 className="text-xl font-black">Add New Card</h2>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-sm font-black text-slate-700">1. Slider choose karo</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => chooseSection(section)}
                    className={`rounded-xl border p-4 text-left transition ${form.sectionKey === section.key ? 'border-cyan bg-cyan/10 ring-2 ring-cyan/20' : 'border-slate-200 bg-slate-50 hover:border-cyan'}`}
                  >
                    <p className="font-black">{section.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{section.help}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">2. Card title</span>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Example: Cinematic Product Reel" className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Small description / tag</span>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Example: Gemini video prompt" className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan" />
              </label>

              {isVideo ? (
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-black text-slate-700"><Video size={16} /> 3. YouTube link paste karo</span>
                  <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan" />
                  <span className="text-xs text-slate-500">Normal YouTube watch link paste karna hai. System embed link bana dega.</span>
                </label>
              ) : (
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-black text-slate-700"><ImagePlus size={16} /> 3. Image URL paste karo</span>
                  <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan" />
                </label>
              )}

              <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <summary className="cursor-pointer font-black">Advanced options</summary>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <label className="grid gap-2">
                    <span className="text-xs font-black text-slate-600">Width</span>
                    <input value={form.recommendedWidth} onChange={(e) => setForm({ ...form, recommendedWidth: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-black text-slate-600">Height</span>
                    <input value={form.recommendedHeight} onChange={(e) => setForm({ ...form, recommendedHeight: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-black text-slate-600">Order</span>
                    <input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                </div>
                <label className="mt-4 flex items-center gap-3">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  <span className="font-bold">Publish immediately</span>
                </label>
              </details>

              <button onClick={save} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffe45c] px-5 py-4 font-black text-black shadow-sm hover:bg-[#fff078]">
                <Save size={18} /> Save Card
              </button>
              {message ? <p className="rounded-xl bg-cyan/10 p-3 text-sm font-bold text-cyan">{message}</p> : null}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Current Website Cards</h2>
                <p className="mt-1 text-sm text-slate-500">{cards.length} cards added</p>
              </div>
              <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold hover:border-cyan">
                <RefreshCcw size={16} /> Refresh
              </button>
            </div>

            <div className="grid gap-4">
              {grouped.map((group) => (
                <div key={group.key} className="rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <h3 className="font-black">{group.label}</h3>
                      <p className="text-xs text-slate-500">{group.cards.length} items</p>
                    </div>
                    <CheckCircle2 className="text-cyan" size={20} />
                  </div>
                  <div className="divide-y divide-slate-100">
                    {group.cards.length ? group.cards.map((card) => (
                      <article key={card._id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{card.cardType}</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${card.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{card.active ? 'Published' : 'Hidden'}</span>
                          </div>
                          <p className="mt-2 font-black">{card.title || card.adminName}</p>
                          <p className="mt-1 text-sm text-slate-500">{card.description || 'No description'}</p>
                          <p className="mt-2 flex items-center gap-2 break-all text-xs text-slate-400">
                            <Link2 size={14} /> {card.videoUrl || card.mediaId?.url || 'No media link'}
                          </p>
                        </div>
                        <button onClick={() => toggle(card)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold hover:border-cyan">
                          {card.active ? <EyeOff size={16} /> : <Eye size={16} />}
                          {card.active ? 'Hide' : 'Publish'}
                        </button>
                      </article>
                    )) : <p className="p-4 text-sm text-slate-400">No cards yet.</p>}
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
