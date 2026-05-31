'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit3, Eye, EyeOff, ImagePlus, Link2, PlusCircle, RefreshCcw, Save, Trash2, Video, X } from 'lucide-react';
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
  badgeText?: string;
  borderColor?: string;
  recommendedWidth?: number;
  recommendedHeight?: number;
  sortOrder?: number;
  active?: boolean;
};

const sections = [
  { key: 'showcase_videos', label: 'Top Video Carousel', oldName: 'videoSlider', help: 'Landing page par upar wale reel format YouTube videos.', type: 'video', width: '1080', height: '1920' },
  { key: 'course_videos', label: 'Course Video Carousel', oldName: 'courseSlider', help: 'Recorded AI classes ke reel video cards.', type: 'course', width: '1080', height: '1920' },
  { key: 'market_cards', label: 'Popular 3 Column Cards', oldName: 'marketCards', help: 'MarketSaleHub style cards: headline, image/video, red border aur niche text. Desktop par 3 cards ek row me aayenge.', type: 'image', width: '1080', height: '1350' },
  { key: 'image_cards', label: 'Image Card Carousel', oldName: 'categorySlider', help: 'Prompt bundle/product visual image cards.', type: 'image', width: '1200', height: '1500' },
  { key: 'prompt_categories', label: 'Prompt Category Cards', oldName: 'promptSlider', help: 'Small category cards for prompt sets.', type: 'image', width: '1200', height: '900' }
];

const initial = {
  sectionKey: 'showcase_videos',
  cardType: 'video',
  adminName: '',
  title: '',
  description: '',
  videoUrl: '',
  imageUrl: '',
  badgeText: 'Most Popular',
  borderColor: '#ff0000',
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
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const currentSection = sections.find((section) => section.key === form.sectionKey) ?? sections[0];
  const isVideo = form.cardType === 'video' || form.cardType === 'course';

  const metrics = useMemo(() => ({
    total: cards.length,
    videos: cards.filter((card) => card.cardType === 'video' || card.cardType === 'course').length,
    images: cards.filter((card) => card.cardType === 'image').length,
    live: cards.filter((card) => card.active).length
  }), [cards]);

  async function load() {
    const response = await fetch(`${API_URL}/api/cms/cards`, { credentials: 'include' });
    if (response.ok) {
      setCards(await response.json());
      return;
    }
    setMessage('Session expired lag rahi hai. Please admin login dobara karo.');
  }

  useEffect(() => {
    load().catch(() => setMessage('API connect nahi ho pa raha. Netlify function/env check karo.'));
  }, []);

  function chooseSection(sectionKey: string) {
    const next = sections.find((section) => section.key === sectionKey) ?? sections[0];
    setForm({
      ...form,
      sectionKey: next.key,
      cardType: next.type,
      recommendedWidth: next.width,
      recommendedHeight: next.height
    });
  }

  function resetForm() {
    setEditingId('');
    setForm(initial);
  }

  function edit(card: LandingCard) {
    const section = sections.find((item) => item.key === card.sectionKey) ?? sections[0];
    setEditingId(card._id);
    setForm({
      sectionKey: card.sectionKey,
      cardType: card.cardType,
      adminName: card.adminName || card.title || '',
      title: card.title || '',
      description: card.description || '',
      videoUrl: card.videoUrl || '',
      imageUrl: card.mediaId?.url || '',
      badgeText: card.badgeText || 'Most Popular',
      borderColor: card.borderColor || '#ff0000',
      sortOrder: String(card.sortOrder ?? 0),
      active: Boolean(card.active),
      recommendedWidth: String(card.recommendedWidth ?? section.width),
      recommendedHeight: String(card.recommendedHeight ?? section.height)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    setMessage('Saving...');
    const publicTitle = form.title.trim();
    const adminName = form.adminName.trim() || publicTitle;

    if (!adminName || !publicTitle) {
      setMessage('Admin name aur public title dono required hain.');
      return;
    }
    if (isVideo && !form.videoUrl.trim()) {
      setMessage('YouTube video link required hai.');
      return;
    }
    if (!isVideo && !form.imageUrl.trim()) {
      setMessage('Image URL required hai.');
      return;
    }

    let mediaId = '';
    if (!isVideo && (!editingId || form.imageUrl.startsWith('http'))) {
      const mediaResponse = await fetch(`${API_URL}/api/cms/media/link`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: form.sectionKey,
          url: form.imageUrl,
          title: publicTitle,
          alt: publicTitle,
          width: Number(form.recommendedWidth),
          height: Number(form.recommendedHeight)
        })
      });
      if (mediaResponse.ok) mediaId = (await mediaResponse.json())._id;
    }

    const payload = {
      sectionKey: form.sectionKey,
      cardType: form.cardType as 'image' | 'video' | 'course',
      adminName,
      title: publicTitle,
      description: form.description,
      videoUrl: isVideo ? toEmbedUrl(form.videoUrl) : '',
      badgeText: form.badgeText,
      borderColor: form.borderColor,
      ...(mediaId ? { mediaId } : {}),
      targetSlot: currentSection.oldName,
      recommendedWidth: Number(form.recommendedWidth),
      recommendedHeight: Number(form.recommendedHeight),
      sortOrder: Number(form.sortOrder) || 0,
      active: form.active
    };

    const response = await fetch(`${API_URL}/api/cms/cards${editingId ? `/${editingId}` : ''}`, {
      method: editingId ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setMessage('Save failed. Login dobara karo ya fields check karo.');
      return;
    }

    setMessage(editingId ? 'Card updated ho gaya.' : 'New card website slider me add ho gaya.');
    resetForm();
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

  async function remove(card: LandingCard) {
    if (!confirm(`Delete "${card.adminName || card.title}"?`)) return;
    await fetch(`${API_URL}/api/cms/cards/${card._id}`, { method: 'DELETE', credentials: 'include' });
    await load();
  }

  return (
    <main className="min-h-screen bg-[#070817] text-white md:pl-[250px]">
      <AdminNav />
      <section className="px-4 py-5 sm:px-6">
        <header className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#10152e] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">Cards & Media</h1>
            <p className="mt-1 text-sm text-white/58">YouTube video links, image cards, card names aur slider placement yahin manage honge.</p>
          </div>
          <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-5 py-3 font-black text-ink">
            <Eye size={18} /> View Website
          </a>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          {[
            ['Editable Cards', metrics.total],
            ['Video Cards', metrics.videos],
            ['Image Cards', metrics.images],
            ['Published', metrics.live]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-[#10152e] p-4">
              <p className="text-3xl font-black text-neon">{value}</p>
              <p className="mt-1 text-sm font-bold text-white/55">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[470px_1fr]">
          <form onSubmit={(event) => { event.preventDefault(); save(); }} className="rounded-2xl border border-white/10 bg-[#10152e] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 text-xl font-black">
                <PlusCircle className="text-cyan" /> {editingId ? 'Edit Card' : 'Create Card'}
              </h2>
              {editingId ? (
                <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-white/70 hover:text-white">
                  <X size={15} /> Cancel
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-black text-white/62">Section / Slider</span>
                <select value={form.sectionKey} onChange={(event) => chooseSection(event.target.value)} className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 font-bold outline-none focus:border-cyan">
                  {sections.map((section) => <option key={section.key} value={section.key}>{section.label}</option>)}
                </select>
                <span className="text-xs text-cyan/80">{currentSection.help}</span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-white/62">Card Type</span>
                <select value={form.cardType} onChange={(event) => setForm({ ...form, cardType: event.target.value })} className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 font-bold outline-none focus:border-cyan">
                  <option value="video">YouTube video card</option>
                  <option value="course">Recorded course video card</option>
                  <option value="image">Image card</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-white/62">Card Admin Name</span>
                <input value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} placeholder="Example: Course Reel 1" className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-white/62">Visible Headline</span>
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Example: ChatGPT Mastery Course" className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/62">Badge Text</span>
                  <input value={form.badgeText} onChange={(event) => setForm({ ...form, badgeText: event.target.value })} placeholder="Most Popular" className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/62">Border Color</span>
                  <input value={form.borderColor} onChange={(event) => setForm({ ...form, borderColor: event.target.value })} placeholder="#ff0000" className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-black text-white/62">Description / Tag</span>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Example: 62 recorded videos" className="min-h-[92px] rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
              </label>

              {isVideo ? (
                <label className="grid gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-white/62"><Video size={16} /> Video Link / YouTube Embed</span>
                  <input value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
                </label>
              ) : (
                <label className="grid gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-white/62"><ImagePlus size={16} /> Image URL</span>
                  <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://example.com/image.webp" className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
                </label>
              )}

              <div className="grid grid-cols-3 gap-3">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/62">Width</span>
                  <input value={form.recommendedWidth} onChange={(event) => setForm({ ...form, recommendedWidth: event.target.value })} className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/62">Height</span>
                  <input value={form.recommendedHeight} onChange={(event) => setForm({ ...form, recommendedHeight: event.target.value })} className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-black text-white/62">Order</span>
                  <input value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} className="rounded-xl border border-white/12 bg-[#0b1027] px-4 py-3 outline-none focus:border-cyan" />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-5 w-5 accent-[#ffd234]" />
                <span className="font-black">Active / website par show karo</span>
              </label>

              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffd234] to-[#ff7a22] px-5 py-4 font-black text-[#08020a]">
                <Save size={18} /> Save Card
              </button>
              {message ? <p className="rounded-xl border border-cyan/25 bg-cyan/10 p-3 text-sm font-bold text-cyan">{message}</p> : null}
            </div>
          </form>

          <section className="rounded-2xl border border-white/10 bg-[#10152e] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">All Cards</h2>
                <p className="mt-1 text-sm text-white/50">Old admin jaisa table: preview, name, section, type, size aur actions.</p>
              </div>
              <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-2 text-sm font-bold text-white/70 hover:border-cyan hover:text-cyan">
                <RefreshCcw size={16} /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[820px] border-collapse bg-[#0b1027] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-neon">
                    <th className="p-3">Preview</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Size / Slot</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {cards.length ? cards.map((card) => {
                    const section = sections.find((item) => item.key === card.sectionKey);
                    return (
                      <tr key={card._id} className="align-top">
                        <td className="p-3">
                          {card.mediaId?.url ? (
                            <img src={card.mediaId.url} alt="" className="h-20 w-20 rounded-lg border border-white/10 object-cover" />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10 text-cyan"><Video size={24} /></div>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="font-black">{card.adminName}</p>
                          <p className="mt-1 text-sm text-white/60">{card.title}</p>
                          <p className="mt-1 text-xs font-bold text-white/45">Badge: {card.badgeText || '-'} | Border: {card.borderColor || '-'}</p>
                          <p className="mt-2 flex max-w-[260px] items-center gap-1 break-all text-xs text-white/36"><Link2 size={13} /> {card.videoUrl || card.mediaId?.url || 'No media link'}</p>
                        </td>
                        <td className="p-3 text-sm font-bold text-white/78">{section?.label || card.sectionKey}</td>
                        <td className="p-3 text-sm font-bold text-white/78">{card.cardType}</td>
                        <td className="p-3 text-sm text-white/60">
                          <strong className="text-white">{card.recommendedWidth || '-'} x {card.recommendedHeight || '-'}</strong>
                          <br />{card.active ? <span className="text-[#54f074]">Published</span> : <span className="text-white/36">Hidden</span>}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => edit(card)} className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-3 py-2 text-xs font-black text-white hover:border-cyan hover:text-cyan"><Edit3 size={14} /> Edit</button>
                            <button onClick={() => toggle(card)} className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-3 py-2 text-xs font-black text-white hover:border-neon hover:text-neon">{card.active ? <EyeOff size={14} /> : <Eye size={14} />}{card.active ? 'Hide' : 'Show'}</button>
                            <button onClick={() => remove(card)} className="inline-flex items-center gap-1 rounded-lg bg-[#ff4b5f] px-3 py-2 text-xs font-black text-white"><Trash2 size={14} /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-white/45">No cards yet. Left side form se first card add karo.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
