// Content library for the free WhatsApp invitation wording generator
// (/free/whatsapp-invitation-wording). Pure data + a compose helper so the
// page stays a thin client shell. Three languages × 4 tones × 8 occasions.

export type WordingLang = "en" | "hi" | "ur";
export type WordingTone = "classic" | "warm" | "short" | "modern";
export type WordingOccasion =
  | "wedding"
  | "nikah"
  | "haldi"
  | "mehndi"
  | "sangeet"
  | "reception"
  | "engagement"
  | "save-the-date";

export interface WordingDetails {
  bride?: string;
  groom?: string;
  date?: string;
  time?: string;
  venue?: string;
  rsvp?: string;
}

export const LANGS: { id: WordingLang; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "hi", label: "Hindi", native: "हिन्दी" },
  { id: "ur", label: "Urdu", native: "اردو" },
];

export const TONES: { id: WordingTone; label: string }[] = [
  { id: "classic", label: "Classic & formal" },
  { id: "warm", label: "Warm & heartfelt" },
  { id: "short", label: "Short & sweet" },
  { id: "modern", label: "Modern casual" },
];

export const OCCASIONS: { id: WordingOccasion; label: Record<WordingLang, string> }[] = [
  { id: "wedding", label: { en: "Wedding", hi: "विवाह", ur: "شادی" } },
  { id: "nikah", label: { en: "Nikah", hi: "निकाह", ur: "نکاح" } },
  { id: "haldi", label: { en: "Haldi", hi: "हल्दी", ur: "ھلدی" } },
  { id: "mehndi", label: { en: "Mehndi", hi: "मेहंदी", ur: "مہندی" } },
  { id: "sangeet", label: { en: "Sangeet", hi: "संगीत", ur: "سگیت" } },
  { id: "reception", label: { en: "Reception", hi: "प्रीतिभोज", ur: "ریسپشن" } },
  { id: "engagement", label: { en: "Engagement", hi: "सगाई", ur: "منگنی" } },
  { id: "save-the-date", label: { en: "Save the Date", hi: "सेव द डेट", ur: "تاریخ محفوظ" } },
];

const OPENERS: Record<WordingLang, Record<WordingTone, string>> = {
  en: {
    classic: "With the blessings of our families,",
    warm: "From our hearts to yours — this joy feels incomplete without you ❤️",
    short: "You're invited! 🎉",
    modern: "Big news, bigger celebration — you're on the guest list ✨",
  },
  hi: {
    classic: "अपने बड़ों के आशीर्वाद से,",
    warm: "दिल से — यह खुशी आपके बिना अधूरी है ❤️",
    short: "आप मधुर आमंत्रण में शामिल हैं! 🎉",
    modern: "खुशखबरी और धमाकेदार जश्न — आप लिस्ट में हैं ✨",
  },
  ur: {
    classic: "اپنے بزرگوں کی دعاؤں سے,",
    warm: "دل سے — یہ خوشی آپ کے بغیر ادھوری ہے ❤️",
    short: "آپ مدعو ہیں! 🎉",
    modern: "بڑی خوشی اور زبردست جشن — آپ مہمانوں کی فہرست میں ہیں ✨",
  },
};

const CLOSERS: Record<WordingLang, Record<WordingTone, string>> = {
  en: {
    classic: "Your presence will be our greatest blessing.",
    warm: "Come, bless the beginning of our forever — we'll save you a seat! 🤍",
    short: "See you there!",
    modern: "RSVP on WhatsApp — link below 👇",
  },
  hi: {
    classic: "आपकी उपस्थिति हमारे लिए सौभाग्य होगी।",
    warm: "आइए, हमारी नई शुरुआत का आशीर्वाद दें — आपके लिए जगह रखी है! 🤍",
    short: "मिलते हैं!",
    modern: "WhatsApp पर RSVP करें — लिंक नीचे है 👇",
  },
  ur: {
    classic: "آپ کی شرکت ہمارے لیے سعادت ہوگی۔",
    warm: "آئیں، ہماری نئی شروعات کی دعا دیں — آپ کے لیے جگہ محفوظ ہے! 🤍",
    short: "ملتے ہیں!",
    modern: "WhatsApp پر RSVP کریں — لنک نیچے ہے 👇",
  },
};

const BODIES: Record<WordingLang, Record<WordingOccasion, string>> = {
  en: {
    wedding:
      "Together with their families, {{bride}} & {{groom}} request the pleasure of your company as they tie the knot.",
    nikah:
      "{{bride}} & {{groom}} request the honour of your presence at their Nikah ceremony as they begin their journey together.",
    haldi:
      "Join us for a joyful Haldi ceremony as we bless {{bride}} & {{groom}} with turmeric, laughter and love.",
    mehndi:
      "{{bride}} & {{groom}} would love your company at their Mehndi evening — a night of henna, music and celebration.",
    sangeet:
      "Let's dance the night away! {{bride}} & {{groom}} invite you to their Sangeet celebration.",
    reception:
      "{{bride}} & {{groom}} warmly invite you to their Wedding Reception to celebrate their new beginning.",
    engagement:
      "{{bride}} & {{groom}} are getting engaged! Join us as they exchange rings and begin their forever.",
    "save-the-date":
      "Save the date! {{bride}} & {{groom}} are getting married, and your presence would make it unforgettable.",
  },
  hi: {
    wedding:
      "अपने परिवार के साथ, {{bride}} और {{groom}} आपको अपने विवाह समारोह में सादर आमंत्रित करते हैं।",
    nikah: "{{bride}} और {{groom}} अपने निकाह समारोह में आपकी उपस्थिति का सम्मान चाहते हैं।",
    haldi: "{{bride}} और {{groom}} की हल्दी सेरेमनी में शामिल हों — हल्दी, हंसी और आशीर्वाद के रंग में रंगने।",
    mehndi: "{{bride}} और {{groom}} की मेहंदी की शाम में शामिल हों — मेहंदी, संगीत और खुशियों के साथ।",
    sangeet: "नाचें और गाएं! {{bride}} और {{groom}} आपको अपनी संगीत संध्या में बुला रहे हैं।",
    reception: "{{bride}} और {{groom}} अपने प्रीतिभोज (रिसेप्शन) में आपका हार्दिक स्वागत करते हैं।",
    engagement: "{{bride}} और {{groom}} की सगाई! अंगूठियाँ बदलते देखने के लिए हमारे साथ जुड़ें।",
    "save-the-date":
      "तारीख याद रखें! {{bride}} और {{groom}} विवाह कर रहे हैं — आपकी उपस्थिति इसे यादगार बनाएगी।",
  },
  ur: {
    wedding:
      "اپنے خاندان کے ساتھ، {{bride}} اور {{groom}} آپ کو اپنی شادی میں شریک حیثیت سے مدعی کرتے ہیں۔",
    nikah: "{{bride}} اور {{groom}} اپنے نکاح میں آپ کی شرکت کا اعزاز چاہتے ہیں۔",
    haldi: "{{bride}} اور {{groom}} کی ھلدی تقریب میں شامل ہوں — ھلدی، ہنسی اور دعاؤں کے رنگ میں۔",
    mehndi: "{{bride}} اور {{groom}} کی مہندی کی شام میں شامل ہوں — مہندی، موسیقی اور خوشیوں کے ساتھ۔",
    sangeet: "ناچیں اور گائیں! {{bride}} اور {{groom}} آپ کو اپنی سگیت تقریب میں بلاتے ہیں۔",
    reception: "{{bride}} اور {{groom}} اپنی ریسپشن تقریب میں آپ کا گرمی سے خیر مقدم کرتے ہیں۔",
    engagement: "{{bride}} اور {{groom}} کی منگنی! انگوٹھیاں تبدیل ہوتے دیکھنے کے لیے ہمارے ساتھ جڑیں۔",
    "save-the-date":
      "تاریخ یاد رکھیں! {{bride}} اور {{groom}} شادی کر رہے ہیں — آپ کی شرکت اسے یادگار بنائے گی۔",
  },
};

const DETAIL_LINES: Record<WordingLang, { date: string; time: string; venue: string; rsvp: string }> = {
  en: { date: "Date: {{date}}", time: "Time: {{time}}", venue: "Venue: {{venue}}", rsvp: "RSVP: {{rsvp}}" },
  hi: { date: "तारीख: {{date}}", time: "समय: {{time}}", venue: "स्थान: {{venue}}", rsvp: "RSVP: {{rsvp}}" },
  ur: { date: "تاریخ: {{date}}", time: "وقت: {{time}}", venue: "مقام: {{venue}}", rsvp: "RSVP: {{rsvp}}" },
};

function fill(template: string, details: WordingDetails): string {
  const nameOf = (v?: string, fallback?: string) => (v && v.trim()) || fallback || "___";
  return template
    .replace(/\{\{bride\}\}/g, nameOf(details.bride, "Bride"))
    .replace(/\{\{groom\}\}/g, nameOf(details.groom, "Groom"))
    .replace(/\{\{date\}\}/g, details.date?.trim() || "___")
    .replace(/\{\{time\}\}/g, details.time?.trim() || "___")
    .replace(/\{\{venue\}\}/g, details.venue?.trim() || "___")
    .replace(/\{\{rsvp\}\}/g, details.rsvp?.trim() || "___");
}

/** Compose the final WhatsApp-ready wording from the picked options. */
export function composeWording(
  lang: WordingLang,
  tone: WordingTone,
  occasion: WordingOccasion,
  details: WordingDetails
): string {
  const lines: string[] = [
    OPENERS[lang][tone],
    "",
    fill(BODIES[lang][occasion], details),
    "",
  ];
  const d = DETAIL_LINES[lang];
  if (details.date?.trim()) lines.push(`📅 ${fill(d.date, details)}`);
  if (details.time?.trim()) lines.push(`🕖 ${fill(d.time, details)}`);
  if (details.venue?.trim()) lines.push(`📍 ${fill(d.venue, details)}`);
  if (details.rsvp?.trim()) lines.push(fill(d.rsvp, details));
  if (lines[lines.length - 1] !== "") lines.push("");
  lines.push(CLOSERS[lang][tone]);
  return lines.join("\n");
}

/** Word count — shown in the UI so messages stay WhatsApp-friendly. */
export function wordingWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
