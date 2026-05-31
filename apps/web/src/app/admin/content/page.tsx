'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  HelpCircle,
  ImagePlus,
  LayoutGrid,
  Link2,
  MonitorPlay,
  Palette,
  PlaySquare,
  PlusCircle,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  Video,
  X
} from 'lucide-react';
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

type SectionConfig = {
  key: string;
  label: string;
  simpleName: string;
  oldName: string;
  help: string;
  bestFor: string;
  type: 'image' | 'video' | 'course';
  width: string;
  height: string;
  icon: typeof LayoutGrid;
};

const sections: SectionConfig[] = [
  {
    key: 'market_cards',
    label: 'Popular 3-Column Cards',
    simpleName: 'Screenshot wali 3 cards',
    oldName: 'marketCards',
    help: 'Image/video, headline, border, badge aur niche text. Desktop par 3 cards ek row me dikhte hain.',
    bestFor: 'Wedding prompt, photoshoot prompt, invitation prompt jaise big cards.',
    type: 'image',
    width: '1080',
    height: '1350',
    icon: LayoutGrid
  },
  {
    key: 'showcase_videos',
    label: 'Top Reel Videos',
    simpleName: 'Upar wale reel videos',
    oldName: 'videoSlider',
    help: 'Landing page ke top section me reel format YouTube videos.',
    bestFor: 'Short demo reels aur product previews.',
    type: 'video',
    width: '1080',
    height: '1920',
    icon: PlaySquare
  },
  {
    key: 'course_videos',
    label: 'Course Video Slider',
    simpleName: 'Recorded course videos',
    oldName: 'courseSlider',
    help: 'Recorded AI classes ke reel video cards.',
    bestFor: 'ChatGPT Mastery, Prompt Engineering, SaaS ChatGPT jaise course previews.',
    type: 'course',
    width: '1080',
    height: '1920',
    icon: MonitorPlay
  },
  {
    key: 'image_cards',
    label: 'Image Slider',
    simpleName: 'Image slider cards',
    oldName: 'categorySlider',
    help: 'Prompt bundle/product visual image cards slider me.',
    bestFor: 'Bundle screenshots, product visuals, category images.',
    type: 'image',
    width: '1200',
    height: '1500',
    icon: ImagePlus
  },
  {
    key: 'prompt_categories',
    label: 'Prompt Category Cards',
    simpleName: 'Small category cards',
    oldName: 'promptSlider',
    help: 'Small category cards for prompt sets.',
    bestFor: 'Business, reels, ads, product shoot categories.',
    type: 'image',
    width: '1200',
    height: '900',
    icon: Sparkles
  }
];

const initial = {
  sectionKey: 'market_cards',
  cardType: 'image',
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
  recommendedHeight: '1350'
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

function sectionByKey(key: string) {
  return sections.find((section) => section.key === key) ?? sections[0];
}

export default function AdminContentPage() {
  const [cards, setCards] = useState<LandingCard[]>([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [openAdvanced, setOpenAdvanced] = useState(false);

  const currentSection = sectionByKey(form.sectionKey);
  const isVideo = form.cardType === 'video' || form.cardType === 'course';
  const sectionCards = cards.filter((card) => card.sectionKey === form.sectionKey);

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
    load().catch(() => setMessage('API connect nahi ho pa raha. Deployment/env check karo.'));
  }, []);

  function chooseSection(sectionKey: string) {
    const next = sectionByKey(sectionKey);
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
    setOpenAdvanced(false);
    setForm(initial);
  }

  function edit(card: LandingCard) {
    const section = sectionByKey(card.sectionKey);
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
      setMessage('Card name aur public headline dono required hain.');
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

    setMessage(editingId ? 'Card update ho gaya.' : 'New card website par add ho gaya.');
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
    <main className="min-h-screen bg-[#f4f7fb] text-[#101827] md:pl-[250px]">
      <AdminNav />
      <section className="px-4 py-5 sm:px-6">
        <header className="mb-5 rounded-[1.5rem] bg-gradient-to-br from-[#07111f] via-[#12233a] to-[#0c4a5a] p-5 text-white shadow-[0_24px_80px_rgba(8,18,40,0.18)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan">
                <Sparkles size={14} /> Beginner Friendly Editor
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">Landing Page Cards</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
                Yahan se aap website ke image cards, YouTube reel cards, course videos aur screenshot wali 3-column cards edit kar sakte ho.
              </p>
            </div>
            <a href="/" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ffe34d] px-5 py-3 font-black text-[#111827] shadow-[0_12px_30px_rgba(255,227,77,0.25)]">
              <Eye size={18} /> Website Dekho
            </a>
          </div>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          {[
            ['Total Cards', metrics.total],
            ['Video Cards', metrics.videos],
            ['Image Cards', metrics.images],
            ['Live Cards', metrics.live]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-3xl font-black text-[#0f766e]">{value}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[520px_1fr]">
          <form onSubmit={(event) => { event.preventDefault(); save(); }} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="inline-flex items-center gap-2 text-2xl font-black">
                  <PlusCircle className="text-[#0f766e]" /> {editingId ? 'Card Edit Karo' : 'New Card Add Karo'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Bas 3 steps follow karo. Technical fields optional hain.</p>
              </div>
              {editingId ? (
                <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  <X size={15} /> Cancel
                </button>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-[#99f6e4] bg-[#ecfeff] p-4">
              <p className="flex items-center gap-2 font-black text-[#0f3f46]">
                <HelpCircle size={18} /> Quick Guide
              </p>
              <div className="mt-3 grid gap-2 text-sm font-semibold text-[#155e75]">
                <p><strong>Screenshot wali cards:</strong> “Screenshot wali 3 cards” select karo.</p>
                <p><strong>YouTube reel:</strong> normal YouTube link paste karo, embed apne aap ban jayega.</p>
                <p><strong>Order:</strong> 1, 2, 3 se decide hota hai kaunsa card pehle dikhega.</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#0f766e]">
                <CheckCircle2 size={16} /> Step 1: Card kaha dikhana hai?
              </p>
              <div className="grid gap-3">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const selected = form.sectionKey === section.key;
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => chooseSection(section.key)}
                      className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-[#0f766e] bg-[#ecfdf5] shadow-[0_12px_28px_rgba(15,118,110,0.12)]' : 'border-slate-200 bg-white hover:border-[#0f766e]/40 hover:bg-slate-50'}`}
                    >
                      <span className="flex items-start gap-3">
                        <span className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? 'bg-[#0f766e] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon size={22} />
                        </span>
                        <span>
                          <span className="block text-lg font-black">{section.simpleName}</span>
                          <span className="mt-1 block text-sm leading-5 text-slate-500">{section.help}</span>
                          <span className="mt-2 block text-xs font-black uppercase tracking-[0.12em] text-[#ea580c]">{section.bestFor}</span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#0f766e]">
                <CheckCircle2 size={16} /> Step 2: Card ka text likho
              </p>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Admin Name</span>
                <span className="text-xs font-semibold text-slate-500">Ye sirf aapko admin me dikhega. Example: Wedding Card 1</span>
                <input value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} placeholder="Example: Wedding prompt card 1" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Public Headline</span>
                <span className="text-xs font-semibold text-slate-500">Ye website par card ke upar dikhega.</span>
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Example: Indian Wedding Invitation Prompt" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Niche ka text / description</span>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Example: Ready-to-copy prompt for premium wedding invitation videos." className="min-h-[96px] rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
              </label>
            </div>

            <div className="mt-6 grid gap-4">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#0f766e]">
                <CheckCircle2 size={16} /> Step 3: Image ya Video link add karo
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: 'image', label: 'Image Card', icon: ImagePlus },
                  { value: 'video', label: 'YouTube Reel', icon: Video },
                  { value: 'course', label: 'Course Video', icon: MonitorPlay }
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = form.cardType === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setForm({ ...form, cardType: item.value })}
                      className={`rounded-2xl border px-3 py-4 text-sm font-black ${selected ? 'border-[#0f766e] bg-[#0f766e] text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Icon className="mx-auto mb-2" size={22} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {isVideo ? (
                <label className="grid gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-slate-700"><Video size={16} /> YouTube Video Link</span>
                  <input value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
                </label>
              ) : (
                <label className="grid gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-slate-700"><ImagePlus size={16} /> Image URL</span>
                  <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://example.com/image.webp" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
                </label>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <button type="button" onClick={() => setOpenAdvanced(!openAdvanced)} className="flex w-full items-center justify-between text-left font-black text-slate-800">
                <span className="inline-flex items-center gap-2"><Palette size={18} /> Optional Design Settings</span>
                <span>{openAdvanced ? 'Hide' : 'Open'}</span>
              </button>

              {openAdvanced ? (
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-700">Badge Text</span>
                      <input value={form.badgeText} onChange={(event) => setForm({ ...form, badgeText: event.target.value })} placeholder="Most Popular" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-700">Border Color</span>
                      <span className="flex gap-2">
                        <input type="color" value={form.borderColor} onChange={(event) => setForm({ ...form, borderColor: event.target.value })} className="h-12 w-14 rounded-xl border border-slate-200 bg-white p-1" />
                        <input value={form.borderColor} onChange={(event) => setForm({ ...form, borderColor: event.target.value })} placeholder="#ff0000" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-700">Width</span>
                      <input value={form.recommendedWidth} onChange={(event) => setForm({ ...form, recommendedWidth: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-700">Height</span>
                      <input value={form.recommendedHeight} onChange={(event) => setForm({ ...form, recommendedHeight: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-slate-700">Order</span>
                      <input value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-[#0f766e]" />
                    </label>
                  </div>
                </div>
              ) : null}
            </div>

            <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} className="h-5 w-5 accent-[#0f766e]" />
              <span>
                <span className="block font-black">Website par show karo</span>
                <span className="text-xs font-semibold text-slate-500">Untick karoge to card hidden rahega.</span>
              </span>
            </label>

            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffe34d] to-[#ff8a2a] px-5 py-4 font-black text-[#111827] shadow-[0_16px_36px_rgba(255,138,42,0.22)]">
              <Save size={18} /> {editingId ? 'Update Card' : 'Save Card'}
            </button>
            {message ? <p className="mt-4 rounded-2xl border border-[#67e8f9] bg-[#ecfeff] p-3 text-sm font-bold text-[#155e75]">{message}</p> : null}
          </form>

          <section className="space-y-5">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Live Preview</h2>
                  <p className="text-sm font-semibold text-slate-500">Save se pehle card roughly aisa dikhega.</p>
                </div>
                <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-black text-[#0f766e]">{currentSection.simpleName}</span>
              </div>

              {form.sectionKey === 'market_cards' ? (
                <div className="rounded-2xl bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
                  <div className="mb-3 flex justify-end">
                    <span className="rounded-b-xl bg-gradient-to-r from-[#ff1f8a] to-[#7c3aed] px-4 py-1 text-sm font-black text-white shadow-lg">
                      {form.badgeText || 'Most Popular'}
                    </span>
                  </div>
                  <h3 className="mb-4 text-2xl font-black text-slate-900">{form.title || 'Indian Wedding Invitation Prompt'}</h3>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-[6px] bg-slate-100" style={{ borderColor: form.borderColor || '#ff0000' }}>
                    {form.imageUrl ? <img src={form.imageUrl} alt="" className="h-full w-full object-cover" /> : (
                      <div className="grid h-full place-items-center text-center text-slate-400">
                        <ImagePlus size={42} className="mx-auto mb-2" />
                        Image preview
                      </div>
                    )}
                    {isVideo ? <div className="absolute inset-0 grid place-items-center"><span className="grid h-20 w-20 place-items-center rounded-full bg-blue-600/85 text-white"><PlaySquare size={36} /></span></div> : null}
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">{form.description || 'Niche ka benefit text yahan dikhega.'}</p>
                </div>
              ) : (
                <div className="mx-auto max-w-[260px] rounded-[1.5rem] border border-slate-200 bg-[#08111f] p-3 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[1.15rem] bg-slate-900">
                    {!isVideo && form.imageUrl ? <img src={form.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-cyan/20 via-transparent to-[#ffe34d]/20">
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-[#ffe34d] text-[#111827]"><PlaySquare size={30} /></span>
                    </div>
                  </div>
                  <h3 className="mt-3 font-black">{form.title || 'Video / Image Card Title'}</h3>
                  <p className="mt-1 text-sm text-white/60">{form.description || 'Short description yahan dikhega.'}</p>
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Is Section ke Cards</h2>
                  <p className="text-sm font-semibold text-slate-500">{currentSection.simpleName}: {sectionCards.length} cards</p>
                </div>
                <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  <RefreshCcw size={16} /> Refresh
                </button>
              </div>

              <div className="grid gap-3">
                {sectionCards.length ? sectionCards.map((card) => (
                  <article key={card._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {card.mediaId?.url ? (
                        <img src={card.mediaId.url} alt="" className="h-24 w-24 rounded-xl border border-slate-200 object-cover" />
                      ) : (
                        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-[#0f766e]"><Video size={28} /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black">{card.title || card.adminName}</h3>
                          <span className={`rounded-full px-2 py-1 text-xs font-black ${card.active ? 'bg-[#dcfce7] text-[#166534]' : 'bg-slate-200 text-slate-500'}`}>
                            {card.active ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{card.description || 'No description'}</p>
                        <p className="mt-2 flex max-w-full items-center gap-1 break-all text-xs font-semibold text-slate-400">
                          <Link2 size={13} /> {card.videoUrl || card.mediaId?.url || 'No media link'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => edit(card)} className="inline-flex items-center gap-1 rounded-xl bg-[#0f766e] px-3 py-2 text-xs font-black text-white"><Edit3 size={14} /> Edit</button>
                        <button onClick={() => toggle(card)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">{card.active ? <EyeOff size={14} /> : <Eye size={14} />}{card.active ? 'Hide' : 'Show'}</button>
                        <button onClick={() => remove(card)} className="inline-flex items-center gap-1 rounded-xl bg-[#ef4444] px-3 py-2 text-xs font-black text-white"><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-lg font-black text-slate-700">Abhi is section me card nahi hai.</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">Left side form se pehla card add karo.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black">All Website Cards</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Har section me kitne cards hain, quick overview.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {sections.map((section) => {
                  const count = cards.filter((card) => card.sectionKey === section.key).length;
                  return (
                    <button key={section.key} onClick={() => chooseSection(section.key)} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-[#0f766e]/50">
                      <span>
                        <span className="block font-black">{section.simpleName}</span>
                        <span className="text-xs font-semibold text-slate-500">{section.label}</span>
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#0f766e]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
