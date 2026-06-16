import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { connectDb } from '../db/mongoose.js';
import { CmsPage, LandingCard } from '../models/Cms.js';
import { CheckoutOffer } from '../models/Commerce.js';
import { TrackingScript } from '../models/Marketing.js';
import { Role } from '../models/Role.js';
import { Setting } from '../models/System.js';
import { User } from '../models/User.js';
import { ensureDefaultRoles } from '../services/auth.service.js';

async function seed() {
  await connectDb();
  await ensureDefaultRoles();

  const superAdmin = await Role.findOne({ key: 'super_admin' });
  if (!superAdmin) throw new Error('Super Admin role missing');

  await User.updateOne(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    {
      $setOnInsert: {
        name: 'CineForge Owner',
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 12),
        roles: [superAdmin._id],
        status: 'active'
      }
    },
    { upsert: true }
  );

  await CmsPage.updateOne(
    { slug: 'home' },
    {
      $setOnInsert: {
        title: 'CineForge AI Prompt Vault',
        slug: 'home',
        type: 'homepage',
        status: 'published',
        seo: {
          metaTitle: 'CineForge AI - 10 Hajar+ AI Prompt Bundle + AI Course',
          metaDescription: 'Ready-to-copy AI image and video prompts plus recorded AI course for creators, agencies, freelancers and business owners.',
          focusKeywords: ['Gemini prompts', 'AI video prompts', 'prompt bundle'],
          robots: 'index,follow',
          schemaType: 'Product'
        },
        sections: []
      }
    },
    { upsert: true }
  );

  const heroSettings: Array<[string, string]> = [
    ['hero_badge', 'Everything You Need to Start with AI'],
    ['hero_headline_line_1', '10K+ Prompts +'],
    ['hero_headline_line_2', 'AI Agent Course'],
    ['hero_headline_line_3', '+ Creation Bundle'],
    ['hero_highlight', 'No Experience Needed'],
    ['hero_description', 'Gemini, Midjourney, Sora, DALL-E, Leonardo aur almost har AI tool ke liye ready-to-copy prompt categories plus recorded AI course. Creators, agencies, freelancers aur business owners ke liye practical prompt system.'],
    ['hero_tools', 'Gemini, Midjourney, Sora, DALL-E, Leonardo, Google Flow, HeyGen, InVideo, Claude AI, GPT'],
    ['hero_image_url', '/cineforge-ai-bundle.png'],
    ['hero_image_alt', 'CineForge AI 10 hajar prompt bundle and AI agent course'],
    ['hero_price_text', 'Rs.199 Only'],
    ['hero_image_caption', '10 Hajar+ prompts, AI course and bonuses'],
    ['hero_primary_cta', 'Get Full Bundle'],
    ['hero_secondary_cta', 'View Prompt Sets']
  ];

  for (const [key, value] of heroSettings) {
    await Setting.updateOne(
      { key },
      { $setOnInsert: { group: 'hero', key, value } },
      { upsert: true }
    );
  }

  const cards: Array<[string, string, string, number]> = [
    ['hero_tools', 'Gemini', 'Prompt category for image and video generation', 1],
    ['hero_tools', 'Midjourney', 'Premium visual generation prompt system', 2],
    ['hero_tools', 'Sora', 'Short video and cinematic scene prompts', 3],
    ['course_slider', 'ChatGPT Mastery Course', '62 recorded videos', 1],
    ['course_slider', 'Prompt Engineering Course', '33 recorded videos', 2],
    ['course_slider', 'SaaS ChatGPT Course', '33 recorded videos', 3],
    ['course_slider', 'ChatGPT Power Course', '25 recorded videos', 4],
    ['testimonial', 'Rahul Sharma', 'The prompts helped my agency ship client creatives much faster.', 1],
    ['testimonial', 'Priya Mehta', 'I used it for reels, ad creatives and product mockups in one weekend.', 2],
    ['testimonial', 'Arjun Verma', 'A clean system for creators who want practical AI workflows.', 3],
    ['testimonial', 'Neha Kapoor', 'The recorded classes made prompt writing simple for my team.', 4]
  ];

  for (const [sectionKey, title, description, sortOrder] of cards) {
    await LandingCard.updateOne(
      { sectionKey, title },
      {
        $setOnInsert: {
          sectionKey,
          cardType: sectionKey === 'testimonial' ? 'testimonial' : sectionKey === 'course_slider' ? 'course' : 'tool_logo',
          adminName: `${sectionKey} - ${title}`,
          title,
          description,
          sortOrder,
          active: true
        }
      },
      { upsert: true }
    );
  }

  const offers: Array<[string, number, boolean]> = [
    ['10 Hajar+ AI Prompt Bundle + AI Course', 199, true],
    ['100,000 ChatGPT Prompts Bundle', 149, true],
    ['AI and Machine Learning Course', 147, true]
  ];

  for (const [name, price, selectedByDefault] of offers) {
    await CheckoutOffer.updateOne(
      { name },
      { $setOnInsert: { name, price, currency: 'INR', selectedByDefault, active: true } },
      { upsert: true }
    );
  }

  await TrackingScript.updateOne(
    { name: 'Default DataLayer' },
    {
      $setOnInsert: {
        name: 'Default DataLayer',
        provider: 'custom',
        placement: 'head',
        code: "window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'page_view' });",
        active: true
      }
    },
    { upsert: true }
  );

  console.log(`Seed complete. Admin login: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
