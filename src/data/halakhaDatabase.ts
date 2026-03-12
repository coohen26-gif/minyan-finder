// Base de données de Halakha pour mode hors-ligne
// Sources: Choulhan Aroukh, Mishna Berura, Kaf HaChaim

export interface HalakhaEntry {
  id: string;
  category: 'shabbat' | 'kashrut' | 'prayers' | 'family' | 'holidays' | 'daily';
  question: string;
  question_he: string;
  answer: string;
  answer_he: string;
  source: string;
  source_ref: string;
  ashkenazi_custom?: string;
  sephardi_custom?: string;
  level: 'chova' | 'reshut' | 'choumra' | 'minhag';
  keywords: string[];
}

export const halakhaDatabase: HalakhaEntry[] = [
  // CHABBAT
  {
    id: 'shabbat_1',
    category: 'shabbat',
    question: 'Peut-on allumer une lampe électrique le Chabbat?',
    question_he: 'האם מותר להדליק נורה חשמלית בשבת?',
    answer: 'Non, il est strictement interdit d\'allumer ou d\'éteindre toute lumière électrique le Chabbat. Cela constitue une des 39 Melachot interdites (Mav\'ir - allumer un feu).',
    answer_he: 'לא, אסור בהחלט להדליק או לכבות כל אור חשמלי בשבת. זה נחשב לאחת מל"ט מלאכות האסורות (מבעיר).',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 274:1, Mishna Berura sk 3',
    ashkenazi_custom: 'Stringent - interdit absolu',
    sephardi_custom: 'Même loi - interdit absolu',
    level: 'chova',
    keywords: ['electricite', 'lumiere', 'allumer', 'eteindre', 'ampoule'],
  },
  {
    id: 'shabbat_2',
    category: 'shabbat',
    question: 'Peut-on utiliser le téléphone le Chabbat?',
    question_he: 'האם מותר להשתמש בטלפון בשבת?',
    answer: 'Non, l\'utilisation du téléphone est interdite le Chabbat pour plusieurs raisons: allumer un écran (Mav\'ir), écrire (Kotev), et usage d\'instruments électriques.',
    answer_he: 'לא, השימוש בטלפון אסור בשבת מכמה סיבות: הדלקת מסך (מבעיר), כתיבה (כותב), ושימוש בכלים חשמליים.',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 307:5, Igrot Moshe OC 1:126',
    level: 'chova',
    keywords: ['telephone', 'portable', 'sms', 'appel', 'ecran'],
  },
  {
    id: 'shabbat_3',
    category: 'shabbat',
    question: 'Peut-on porter des objets dans la rue le Chabbat?',
    question_he: 'האם מותר לשאת חפצים ברחוב בשבת?',
    answer: 'Sans Erouv, il est interdit de transporter des objets dans la rue publique. Avec un Erouv valide, c\'est permis selon la majorité des opinions.',
    answer_he: 'בלי עירוב, אסור לשאת חפצים ברשות הרבים. עם עירוב תקף, מותר לפי רוב הדעות.',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 345-349, Mishna Berura 345:1',
    ashkenazi_custom: 'Dépend de la validité de l\'Erouv local',
    sephardi_custom: 'Même loi - suivre l\'avis du Rav local',
    level: 'chova',
    keywords: ['erouv', 'transporter', 'rue', 'porte', 'objet'],
  },
  {
    id: 'shabbat_4',
    category: 'shabbat',
    question: 'Peut-on cuisiner le Chabbat?',
    question_he: 'האם מותר לבשל בשבת?',
    answer: 'Il est interdit de cuisiner ou de faire de la chaleur le Chabbat. La nourriture doit être préparée avant le Chabbat et maintenue au chaud (sur plaque ou réchaud selon les règles).',
    answer_he: 'אסור לבשל או לחמם בשבת. האוכל צריך להיות מוכן לפני השבת ולהישמר חם (על פלטה או מיחם לפי הכללים).',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 253:1, Mishna Berura sk 21',
    ashkenazi_custom: 'Utilisation de la plaque (Blech)',
    sephardi_custom: 'Même principe - méthodes légèrement différentes',
    level: 'chova',
    keywords: ['cuisiner', 'chaleur', 'cuire', 'nourriture', 'plaque'],
  },
  {
    id: 'shabbat_5',
    category: 'shabbat',
    question: 'Combien de repas doit-on faire le Chabbat?',
    question_he: 'כמה סעודות צריך לעשות בשבת?',
    answer: 'On doit faire trois repas le Chabbat: vendredi soir (Chabbat soir), déjeuner du Chabbat, et Seouda Chelisheet (3ème repas) avant la fin du Chabbat.',
    answer_he: 'צריך לעשות שלוש סעודות בשבת: ערב שבת (ליל שבת), ארוחת צהריים של שבת, וסעודה שלישית לפני סוף השבת.',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 291:1, Mishna Berura sk 1',
    level: 'chova',
    keywords: ['repas', 'manger', 'seouda', 'challah', 'vin'],
  },

  // KASHROUT
  {
    id: 'kashrut_1',
    category: 'kashrut',
    question: 'Qu\'est-ce que la Casherout?',
    question_he: 'מהי כשרות?',
    answer: 'La Casherout est l\'ensemble des lois alimentaires juives définies dans la Torah et le Talmud. Elle inclut l\'interdiction de mélanger lait et viande, les animaux permis/interdits, et les règles d\'abattage (Shehita).',
    answer_he: 'כשרות היא אוסף החוקים הכשריים היהודיים המוגדרים בתורה ובתלמוד. זה כולל איסור ערבוב חלב ובשר, חיות מותרות/אסורות, וחוקי שחיטה.',
    source: 'Choulhan Aroukh Yoreh Deah',
    source_ref: 'YD 87-117',
    level: 'chova',
    keywords: ['casher', 'nourriture', 'manger', 'aliment', 'cacher'],
  },
  {
    id: 'kashrut_2',
    category: 'kashrut',
    question: 'Combien de temps attendre entre viande et lait?',
    question_he: 'כמה זמן צריך לחכות בין בשר לחלב?',
    answer: 'Après avoir mangé de la viande, on attend 6 heures avant de consommer des produits laitiers. Certains attendent 3 heures (coutume hollandaise) ou 1 heure (coutume allemande).',
    answer_he: 'אחרי אכילת בשר, מחכים 6 שעות לפני אכילת מוצרי חלב. יש המחכים 3 שעות (מנהג הולנדי) או שעה (מנהג גרמני).',
    source: 'Choulhan Aroukh Yoreh Deah',
    source_ref: 'YD 89:1, Rema et commentaires',
    ashkenazi_custom: '3 heures (Hollande) ou 6 heures (stringent)',
    sephardi_custom: '6 heures strict',
    level: 'chova',
    keywords: ['viande', 'lait', 'attendre', 'heure', 'basar', 'chalav'],
  },
  {
    id: 'kashrut_3',
    category: 'kashrut',
    question: 'Quels animaux sont casher?',
    question_he: 'אילו חיות הן כשרות?',
    answer: 'Les animaux casher doivent avoir des sabots fendus et ruminer (bœuf, mouton, chèvre). Les oiseaux casher sont ceux listés dans la Torah (poulet, dinde, canard, oie).',
    answer_he: 'חיות כשרות צריכות פרסה שסועה ומעלה גרה (בקר, כבשים, עזים). עופות כשרים הם אלה המפורטים בתורה (תרנגול, הודו, ברווז, אווז).',
    source: 'Choulhan Aroukh Yoreh Deah',
    source_ref: 'YD 1-28',
    level: 'chova',
    keywords: ['animal', 'viande', 'casher', 'interdit', 'permi'],
  },

  // PRIÈRES
  {
    id: 'prayers_1',
    category: 'prayers',
    question: 'Combien de prières par jour?',
    question_he: 'כמה תפילות ביום?',
    answer: 'On prie 3 fois par jour: Cha\'harit (matin), Min\'ha (après-midi), et Arvit (soir). Le Chabbat et les fêtes ajoutent Moussaf.',
    answer_he: 'מתפללים 3 פעמים ביום: שחרית (בוקר), מנחה (אחר הצהריים), וערבית (ערב). בשבת וחגים מוסיפים מוסף.',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 89:1, 233:1, 237:1',
    level: 'chova',
    keywords: ['priere', 'tefila', 'shacharit', 'mincha', 'maariv'],
  },
  {
    id: 'prayers_2',
    category: 'prayers',
    question: 'Quand faut-il mettre les Tefilin?',
    question_he: 'מתי צריך לשים תפילין?',
    answer: 'Les Tefilin se mettent pendant la prière de Cha\'harit (le matin), du lever du soleil jusqu\'à la fin de la 7ème heure (de préférence avant la 4ème heure).',
    answer_he: 'שמים תפילין בתפילת שחרית (בבוקר), מזריחת השמש עד סוף השעה השביעית (עדיף לפני השעה הרביעית).',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 30:1, Mishna Berura sk 1',
    ashkenazi_custom: 'Pendant Chol Hamoed: certains les mettent, d\'autres non',
    sephardi_custom: 'Chol Hamoed: ne pas mettre les Tefilin',
    level: 'chova',
    keywords: ['tefilin', 'phylactere', 'priere', 'matin', 'shel rosh'],
  },
  {
    id: 'prayers_3',
    category: 'prayers',
    question: 'Combien d\'hommes pour un Minyan?',
    question_he: 'כמה גברים צריכים למניין?',
    answer: 'Il faut 10 hommes juifs majeurs (âgés de 13 ans et plus) pour former un Minyan. Cela permet de dire la Kedoucha, le Kaddish, et de lire la Torah.',
    answer_he: 'צריך 10 גברים יהודים בוגרים (בני 13 ומעלה) כדי ליצור מניין. זה מאפשר לומר קדושה, קדיש, ולקרוא בתורה.',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 55:1, Mishna Berura sk 2',
    level: 'chova',
    keywords: ['minyan', 'priere', 'communaute', 'dix', 'homme'],
  },

  // FAMILLE
  {
    id: 'family_1',
    category: 'family',
    question: 'Qu\'est-ce que la Nidda?',
    question_he: 'מהי נידה?',
    answer: 'La Nidda est la période d\'impureté rituelle d\'une femme pendant et après ses menstruations. Elle implique des lois de Taharat Hamichpacha (pureté familiale) et d\'abstinence jusqu\'à la purification au Mikvé.',
    answer_he: 'נידה היא תקופת הטומאה הריטואלית של אישה במהלך ואחרי המחזור החודשי. זה כולל חוקי טהרת המשפחה ופרישה עד הטהרה במקווה.',
    source: 'Choulhan Aroukh Yoreh Deah',
    source_ref: 'YD 183-200',
    level: 'chova',
    keywords: ['nidda', 'famille', 'mikve', 'tahara', 'femme'],
  },
  {
    id: 'family_2',
    category: 'family',
    question: 'Qu\'est-ce que la Hoopa?',
    question_he: 'מהי חופה?',
    answer: 'La Hoopa est la cérémonie de mariage juive sous un dais (Hoopa). Elle inclut l\'échange des alliances, la lecture du Ketouba (contrat de mariage), et les 7 bénédictions (Sheva Brachot).',
    answer_he: 'חופה היא טקס החתונה היהודית תתת חופה. זה כולל החלפת טבעות, קריאת הכתובה, ושבע ברכות.',
    source: 'Choulhan Aroukh Even HaEzer',
    source_ref: 'EH 61-62',
    level: 'chova',
    keywords: ['mariage', 'hoopa', 'ketouba', 'alliance', 'couple'],
  },

  // FÊTES
  {
    id: 'holidays_1',
    category: 'holidays',
    question: 'Combien de jours de Pessa\'h?',
    question_he: 'כמה ימים של פסח?',
    answer: 'En Israël: 7 jours (1er et 7ème jours sont des Yom Tov). En Diaspora: 8 jours (1er, 2ème, 7ème et 8ème jours sont des Yom Tov).',
    answer_he: 'בישראל: 7 ימים (היום הראשון והשביעי הם יום טוב). בגולה: 8 ימים (הראשון, השני, השביעי והשמיני הם יום טוב).',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 429:1, Mishna Berura',
    ashkenazi_custom: '8 jours en Diaspora',
    sephardi_custom: '8 jours en Diaspora, 7 en Israël',
    level: 'chova',
    keywords: ['pessah', 'pessah', 'fete', 'jour', 'matza'],
  },
  {
    id: 'holidays_2',
    category: 'holidays',
    question: 'Que mange-t-on pendant Souccot?',
    question_he: 'מה אוכלים בסוכות?',
    answer: 'On mange dans la Soucca (hutte) pendant 7 jours. On prend les 4 espèces (Arba\'at Haminim): Etrog, Loulav, Hadass et Arava.',
    answer_he: 'אוכלים בסוכה במשך 7 ימים. לוקחים את ארבעת המינים: אתרוג, לולב, הדס וערבה.',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 625-651',
    level: 'chova',
    keywords: ['souccot', 'soucca', 'etrog', 'loulav', 'fete'],
  },

  // QUOTIDIEN
  {
    id: 'daily_1',
    category: 'daily',
    question: 'Comment faire les Benédictions (Bérachot)?',
    question_he: 'איך מברכים?',
    answer: 'On fait une bénédiction avant de manger (ex: Hamotzi pour le pain, Bore Minei Mezonot pour les gâteaux) et après (Birkat Hamazon).',
    answer_he: 'מברכים לפני האכילה (למשל המוציא לחם, בורא מיני מזונות לעוגות) ואחרי (ברכת המזון).',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 167, 202',
    level: 'chova',
    keywords: 'beracha', 'benediction', 'manger', 'hamotzi', 'birkat'],
  },
  {
    id: 'daily_2',
    category: 'daily',
    question: 'Comment mettre les Tzitzit?',
    question_he: 'איך שמים ציצית?',
    answer: 'Les Tzitzit se mettent sur un vêtement à 4 coins (Talit Katan). On dit la bénédiction "Léhitatef BéTzitzit" en les enfilant.',
    answer_he: 'שמים ציצית על בגד עם 4 כנפות (טלית קטן). מברכים "להתעטף בציצית" כשמכניסים אותם.',
    source: 'Choulhan Aroukh Orach Chaim',
    source_ref: 'OC 8:1-7',
    level: 'chova',
    keywords: ['tzitzit', 'talit', 'fringes', 'vetement', 'commandement'],
  },
];

// Fonction de recherche
export function searchHalakha(query: string, language: 'fr' | 'he' = 'fr'): HalakhaEntry[] {
  const searchTerms = query.toLowerCase().split(' ');
  
  return halakhaDatabase.filter(entry => {
    const searchField = language === 'he' ? entry.question_he : entry.question;
    const contentField = language === 'he' ? entry.answer_he : entry.answer;
    
    return searchTerms.some(term => 
      searchField.toLowerCase().includes(term) ||
      contentField.toLowerCase().includes(term) ||
      entry.keywords.some(k => k.toLowerCase().includes(term))
    );
  });
}

// Fonction pour obtenir par catégorie
export function getHalakhaByCategory(category: HalakhaEntry['category']): HalakhaEntry[] {
  return halakhaDatabase.filter(entry => entry.category === category);
}

// Fonction pour obtenir une entrée par ID
export function getHalakhaById(id: string): HalakhaEntry | undefined {
  return halakhaDatabase.find(entry => entry.id === id);
}

export default halakhaDatabase;
