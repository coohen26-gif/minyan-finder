// Configuration des publicités et partenariats
// Actuellement désactivé (mode non lucratif)

export interface AdConfig {
  enabled: boolean;
  type: 'travel' | 'grocery' | 'services' | 'events' | 'learning';
  title: string;
  title_he: string;
  description: string;
  description_he: string;
  imageUrl?: string;
  link: string;
  targetAudience: 'all' | 'ashkenazi' | 'sephardi' | 'specific_city';
  cities?: string[];
  startDate?: Date;
  endDate?: Date;
  priority: number; // 1-10
}

// Publicités exemples (non actives pour l'instant)
export const sampleAds: AdConfig[] = [
  {
    enabled: false,
    type: 'travel',
    title: 'Voyage en Israël - Pessah 2026',
    title_he: 'טיול לישראל - פסח 2026',
    description: 'Séjour tout compris à Jérusalem, hôtel casher, excursions guidées.',
    description_he: 'חופשה הכל כלול בירושלים, מלון כשר, סיורים מודרכים.',
    link: 'https://example.com/voyage-israel',
    targetAudience: 'all',
    priority: 8,
  },
  {
    enabled: false,
    type: 'grocery',
    title: 'Epicerie Casher Online',
    title_he: 'מכולת כשר אונליין',
    description: 'Livraison à domicile de produits casher. Large choix, prix compétitifs.',
    description_he: 'משלוח מוצרי כשר הביתה. מבחר גדול, מחירים תחרותיים.',
    link: 'https://example.com/epicerie',
    targetAudience: 'all',
    cities: ['Paris', 'Lyon', 'Marseille'],
    priority: 7,
  },
  {
    enabled: false,
    type: 'services',
    title: 'Mohel certifié - Région Parisienne',
    title_he: 'מוהל מוסמך - מחוז פריז',
    description: 'Services de Brit Mila professionnels et attentionnés.',
    description_he: 'שירותי ברית מילה מקצועיים ואכפתיים.',
    link: 'https://example.com/mohel',
    targetAudience: 'all',
    cities: ['Paris', 'Créteil', 'Sarcelles'],
    priority: 9,
  },
  {
    enabled: false,
    type: 'events',
    title: 'Gala de charité - Soirée de Pessah',
    title_he: 'ערב צדקה - ערב פסח',
    description: 'Soirée de collecte de fonds pour les orphelins. Dîner 5 étoiles casher.',
    description_he: 'ערב גיוס כספים ליתומים. ארוחת ערב כשרת 5 כוכבים.',
    link: 'https://example.com/gala',
    targetAudience: 'all',
    priority: 6,
  },
  {
    enabled: false,
    type: 'learning',
    title: 'Cours de Torah en ligne',
    title_he: 'שיעורי תורה אונליין',
    description: 'Apprenez la Halakha avec des Ravs reconnus. Cours en direct ou en replay.',
    description_he: 'למדו הלכה עם רבנים מוכרים. שיעורים בשידור חי או בהקלטה.',
    link: 'https://example.com/cours-torah',
    targetAudience: 'all',
    priority: 8,
  },
  {
    enabled: false,
    type: 'travel',
    title: 'OUmrah 2026/2027',
    title_he: 'עומרה 2026/2027',
    description: 'Voyage spirituel à la Mecque avec accompagnement religieux complet.',
    description_he: 'מסע רוחני למכה עם ליווי דתי מלא.',
    link: 'https://example.com/oumrah',
    targetAudience: 'sephardi',
    priority: 9,
  },
  {
    enabled: false,
    type: 'grocery',
    title: 'Boulangerie Casher - Livraison Chabbat',
    title_he: 'מאפייה כשרה - משלוח שבת',
    description: 'Hallot, pains et pâtisseries casher livrés avant Chabbat.',
    description_he: 'חלות, לחמים ומאפים כשרים מוגשים לפני שבת.',
    link: 'https://example.com/boulangerie',
    targetAudience: 'all',
    cities: ['Paris', 'Nice', 'Bordeaux'],
    priority: 7,
  },
  {
    enabled: false,
    type: 'services',
    title: 'Cours de Hébreu - Ulpan',
    title_he: 'שיעורי עברית - אולפן',
    description: 'Apprenez l\'hébreu avec des professeurs natifs. Débutant à avancé.',
    description_he: 'למדו עברית עם מורים ילידים. מתחילים עד מתקדמים.',
    link: 'https://example.com/ulpan',
    targetAudience: 'all',
    priority: 6,
  },
];

// Fonction pour obtenir les publicités actives
export function getActiveAds(userCity?: string, userCommunity?: 'ashkenazi' | 'sephardi'): AdConfig[] {
  return sampleAds.filter(ad => {
    if (!ad.enabled) return false;
    
    // Vérifier la date
    const now = new Date();
    if (ad.startDate && now < ad.startDate) return false;
    if (ad.endDate && now > ad.endDate) return false;
    
    // Vérifier la ville
    if (userCity && ad.cities && !ad.cities.includes(userCity)) return false;
    
    // Vérifier la communauté
    if (userCommunity && ad.targetAudience !== 'all' && ad.targetAudience !== userCommunity) return false;
    
    return true;
  }).sort((a, b) => b.priority - a.priority);
}

// Fonction pour activer les publicités (à appeler plus tard)
export function enableAds() {
  sampleAds.forEach(ad => ad.enabled = true);
  console.log('Publicités activées');
}

// Fonction pour désactiver les publicités
export function disableAds() {
  sampleAds.forEach(ad => ad.enabled = false);
  console.log('Publicités désactivées');
}

export default sampleAds;
