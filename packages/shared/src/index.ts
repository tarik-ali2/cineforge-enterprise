export const dataLayerEvents = [
  'page_view',
  'CTA_click',
  'button_click',
  'form_start',
  'form_submit',
  'add_to_cart',
  'initiate_checkout',
  'purchase',
  'thank_you_page',
  'whatsapp_click',
  'phone_click',
  'email_click',
  'scroll_depth',
  'video_play',
  'lead_generated',
  'section_view'
] as const;

export type DataLayerEvent = (typeof dataLayerEvents)[number];
