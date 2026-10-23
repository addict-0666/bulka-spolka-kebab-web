/**
 * Cennik i konfiguracja dań lokalu Bułka & Spółka Kraft Food (Kebab Tychy)
 * Zgodne ze zdjęciami menu.
 */

export const RESTAURANT_INFO = {
  name: "Bułka & Spółka",
  subname: "Kraft Food • Kebab Tychy",
  slogan: "100% KRAFTOWE MIĘSO W PŁATACH",
  address: "Tychy, Polska",
  status: "Otwarte",
  deliveryPrice: 8,
  freeDeliveryThreshold: 70,
  minOrder: 30,
};

export const MEAT_TYPES = [
  { id: 'kurczak', name: 'Kurczak', icon: '🐔', description: 'Soczysty kurczak kraftowy w płatach' },
  { id: 'wieprzowina', name: 'Wieprzowina', icon: '🐷', description: 'Pieczona aromatyczna wieprzowina' },
  { id: 'wolowina', name: 'Wołowina / Baranina', icon: '🐮', description: 'Szlachetna wołowina z nutą baraniny' },
  { id: 'mieszane', name: 'Mięso Mieszane (50/50)', icon: '🌓', description: 'Pół na pół (średnia cena obu mięs)' }
];

export const SAUCES = [
  { id: 'czosnkowy', name: 'Czosnkowy (autorski własnoręczny)', free: true },
  { id: 'jogurtowy', name: 'Jogurtowy (autorski z ziołami)', free: true },
  { id: 'ostry', name: 'Ostry (autorski pikantny)', free: true },
  { id: 'mieszany', name: 'Mieszany (autorski)', free: true },
  { id: 'ketchup', name: 'Ketchup (markowy Fanex)', free: true }
];

export const SPICES = [
  { id: 'chili', name: 'Płatki chili 🌶️', free: true },
  { id: 'cayenne', name: 'Pieprz Cayenne 🌶️🌶️', free: true },
  { id: 'bazylia', name: 'Bazylia', free: true },
  { id: 'oregano', name: 'Oregano', free: true },
  { id: 'pietruszka', name: 'Pietruszka', free: true },
  { id: 'papryka_slodka', name: 'Papryka słodka', free: true }
];

// Standardowe dodatki: mały +2 zł, średni/duży +4 zł, mega +8 zł
export const STANDARD_ADDONS = [
  { id: 'ser_zolty', name: 'Ser żółty', icon: '🧀' },
  { id: 'feta', name: 'Ser feta', icon: '🧈' },
  { id: 'cheddar', name: 'Ser cheddar', icon: '🧀' },
  { id: 'bekon', name: 'Chrupiący bekon', icon: '🥓' },
  { id: 'oliwki', name: 'Oliwki', icon: '🫒' },
  { id: 'jalapeno', name: 'Jalapeño 🌶️', icon: '🌶️' },
  { id: 'prazona_cebulka', name: 'Prażona cebulka', icon: '🧅' },
  { id: 'frytki_wewnatrz', name: 'Frytki w środku', icon: '🍟' },
  { id: 'pieczarki_cebulka', name: 'Pieczarki zasmażane z cebulką na maśle', icon: '🍄' }
];

// Premium dodatki: mały +3 zł, średni/duży +5 zł, mega +9 zł
export const PREMIUM_ADDONS = [
  { id: 'onion_rings', name: 'Onion rings (krążki cebulowe)', icon: '🧅' },
  { id: 'placki_ziemniaczane', name: 'Placki ziemniaczane', icon: '🥔' },
  { id: 'mozzarella_sticks', name: 'Mozzarella sticks', icon: '🧀' },
  { id: 'cheddar_bites', name: 'Cheddar bites', icon: '🧀' },
  { id: 'camembert_bites', name: 'Camembert bites', icon: '🧀' }
];

// Dodatkowe mięso
export const EXTRA_MEAT_OPTIONS = [
  { id: 'kurczak_50g', name: 'Dodatkowy Kurczak +50g', price: 7 },
  { id: 'kurczak_100g', name: 'Dodatkowy Kurczak +100g', price: 14 },
  { id: 'wieprzowina_50g', name: 'Dodatkowa Wieprzowina +50g', price: 8 },
  { id: 'wieprzowina_100g', name: 'Dodatkowa Wieprzowina +100g', price: 16 },
  { id: 'wolowina_50g', name: 'Dodatkowa Wołowina +50g', price: 9 },
  { id: 'wolowina_100g', name: 'Dodatkowa Wołowina +100g', price: 18 }
];

export const CATEGORIES = [
  { id: 'polecane', name: '🔥 Hity & Specjały', icon: '⭐' },
  { id: 'bula', name: '🥪 Kraft Buła', icon: '🍔' },
  { id: 'arabski', name: '🥙 Chlebek Arabski', icon: '🥙' },
  { id: 'lawasz', name: '🌯 Lawasz (Rollo)', icon: '🌯' },
  { id: 'kapsalon', name: '🍟 Kapsalon & Kubełki', icon: '🍟' },
  { id: 'samo_mieso', name: '🥩 Kebab Samo Mięso', icon: '🥩' },
  { id: 'wege', name: '🌱 Wege & Bez Mięsa', icon: '🥗' },
  { id: 'napoje', name: '🥤 Napoje & Soki', icon: '🥤' }
];

export const MENU_ITEMS = [
  // HITY & SPECJAŁY
  {
    id: 'specjal_szefowej',
    category: 'polecane',
    badge: 'Specjał Szefowej',
    name: 'Autorski Kebab z Pieczarkami',
    description: 'Mięso kraftowe w płatach, pieczarki zasmażane na maśle z cebulką, kapusta kiszona lub czerwona, marchewka, autorskie sosy.',
    image: 'assets/media_1792720066194_48c4e835.jpg',
    requiresMeat: true,
    sizes: [
      { id: 'standard', name: 'Porcja Standard', prices: { kurczak: 39, wieprzowina: 42, wolowina: 45 } }
    ],
    allowAddons: true,
    hasSaladChoice: true
  },
  {
    id: 'serowy_bekoniak',
    category: 'polecane',
    badge: 'Polecany',
    name: 'Serowy Bekoniak w Chlebku Arabskim',
    description: 'Mięso kraftowe, chrupiący boczek, rozpływający się ser żółty, gorące frytki w środku, świeże warzywa oraz autorski sos.',
    image: 'assets/media_1792720066194_48c4e835.jpg',
    requiresMeat: true,
    sizes: [
      { id: 'standard', name: 'Porcja Standard', prices: { kurczak: 42, wieprzowina: 45, wolowina: 48 } }
    ],
    allowAddons: true
  },

  // KRAFT BUŁA
  {
    id: 'kraft_bula',
    category: 'bula',
    badge: 'Lokalna Piekarnia',
    name: 'Kraft Buła',
    description: 'Podawana w chrupiącej bułce wypiekanej specjalnie dla nas przez lokalną piekarnię. 100% mięso kraftowe, świeże warzywa, sosy.',
    image: 'assets/media_1792720050398_2dc3c349.jpg',
    requiresMeat: true,
    sizes: [
      { id: 'duza', name: 'Duża', prices: { kurczak: 36, wieprzowina: 40, wolowina: 43 } },
      { id: 'mega', name: 'Mega', prices: { kurczak: 59, wieprzowina: 67, wolowina: 74 } }
    ],
    allowAddons: true
  },

  // CHLEBEK ARABSKI
  {
    id: 'chlebek_arabski',
    category: 'arabski',
    name: 'Kebab w Chlebku Arabskim',
    description: 'Puszyste pieczywo arabskie, kraftowe płaty mięsa, chrupiące warzywa i sos.',
    image: 'assets/media_1792720066194_48c4e835.jpg',
    requiresMeat: true,
    sizes: [
      { id: 'maly', name: 'Mały', prices: { kurczak: 26, wieprzowina: 28, wolowina: 30 } },
      { id: 'sredni', name: 'Średni', prices: { kurczak: 34, wieprzowina: 38, wolowina: 41 } },
      { id: 'mega', name: 'Mega', prices: { kurczak: 56, wieprzowina: 64, wolowina: 70 } }
    ],
    allowAddons: true
  },

  // LAWASZ
  {
    id: 'lawasz',
    category: 'lawasz',
    name: 'Kebab w Lawaszu (Rollo)',
    description: 'Cienkie ciasto lawasz przypiekane na złoto, wypełnione soczystym kraftowym mięsem i świeżymi warzywami.',
    image: 'assets/media_1792720066194_48c4e835.jpg',
    requiresMeat: true,
    sizes: [
      { id: 'maly', name: 'Mały', prices: { kurczak: 28, wieprzowina: 31, wolowina: 32 } },
      { id: 'sredni', name: 'Średni', prices: { kurczak: 35, wieprzowina: 39, wolowina: 42 } },
      { id: 'mega', name: 'Mega', prices: { kurczak: 58, wieprzowina: 66, wolowina: 73 } }
    ],
    allowAddons: true
  },

  // KAPSALON & BEZ CIASTA
  {
    id: 'kapsalon',
    category: 'kapsalon',
    badge: 'Top Serowy',
    name: 'Kapsalon Zapiekany z Cheddarem',
    description: 'Mięso kraftowe zapiekane w foremce: złociste frytki na spodzie, mięso, ciągnący ser cheddar i grillowane warzywa.',
    image: 'assets/media_1792720066194_48c4e835.jpg',
    requiresMeat: true,
    sizes: [
      { id: 'maly', name: 'Mały', prices: { kurczak: 26, wieprzowina: 28, wolowina: 31 } },
      { id: 'duzy', name: 'Duży', prices: { kurczak: 41, wieprzowina: 46, wolowina: 53 } }
    ],
    allowAddons: true
  },
  {
    id: 'kubelek',
    category: 'kapsalon',
    name: 'Kebab w Kubełku (Bez ciasta)',
    description: 'Mięso kraftowe w płatach, chrupiące frytki, bukiet świeżych warzyw oraz wybrane sosy.',
    image: 'assets/media_1792720050398_2dc3c349.jpg',
    requiresMeat: true,
    sizes: [
      { id: 'standard', name: 'Porcja Kubełek', prices: { kurczak: 34, wieprzowina: 37, wolowina: 39 } }
    ],
    allowAddons: true
  },
  {
    id: 'talerz',
    category: 'kapsalon',
    name: 'Kebab na Talerzu (Bez ciasta)',
    description: 'Duża porcja mięsa kraftowego serwowana na talerzu z frytkami, zestawem surówek i autorskimi sosami.',
    image: 'assets/media_1792720050398_2dc3c349.jpg',
    requiresMeat: true,
    sizes: [
      { id: 'standard', name: 'Porcja Talerz', prices: { kurczak: 35, wieprzowina: 41, wolowina: 44 } }
    ],
    allowAddons: true
  },

  // KEBAB SAMO MIĘSO
  {
    id: 'samo_mieso',
    category: 'samo_mieso',
    badge: '100% Płatów Mięsa',
    name: 'Kebab Samo Mięso (Bez warzyw)',
    description: 'Dla prawdziwych mięsożerców. Wybierz pieczywo (Chlebek arabski, Lawasz, Kraft Buła) lub bez pieczywa (Kubełek / Talerz).',
    image: 'assets/media_1792720050398_2dc3c349.jpg',
    requiresMeat: true,
    requiresBreadChoice: true,
    breadChoices: ['Chlebek Arabski', 'Lawasz', 'Kraft Buła'],
    sizes: [
      { id: 'maly', name: 'Mały (w pieczywie)', prices: { kurczak: 29, wieprzowina: 34, wolowina: 37 } },
      { id: 'sredni', name: 'Średni (w pieczywie)', prices: { kurczak: 38, wieprzowina: 43, wolowina: 48 } },
      { id: 'mega', name: 'Mega (w pieczywie)', prices: { kurczak: 64, wieprzowina: 74, wolowina: 83 } },
      { id: 'kubelek', name: 'Kubełek samo mięso', prices: { kurczak: 36, wieprzowina: 41, wolowina: 46 } },
      { id: 'talerz', name: 'Talerz samo mięso', prices: { kurczak: 39, wieprzowina: 46, wolowina: 52 } }
    ],
    allowAddons: true
  },

  // WEGE & PRZEKĄSKI
  {
    id: 'kebab_wege',
    category: 'wege',
    badge: 'Wegetariański',
    name: 'Kebab Wege z Falafelem',
    description: 'Chrupiący falafel zamiast mięsa, frytki, ser żółty, bukiet świeżych warzyw, sosy.',
    image: 'assets/media_1792720050398_2dc3c349.jpg',
    requiresMeat: false,
    requiresBreadChoice: true,
    breadChoices: ['Chlebek Arabski', 'Lawasz'],
    sizes: [
      { id: 'arabski_maly', name: 'Chlebek Arabski - Mały', fixedPrice: 23 },
      { id: 'arabski_duzy', name: 'Chlebek Arabski - Duży', fixedPrice: 34 },
      { id: 'arabski_mega', name: 'Chlebek Arabski - Mega', fixedPrice: 56 },
      { id: 'lawasz_maly', name: 'Lawasz - Mały', fixedPrice: 26 },
      { id: 'lawasz_duzy', name: 'Lawasz - Duży', fixedPrice: 36 },
      { id: 'lawasz_mega', name: 'Lawasz - Mega', fixedPrice: 58 }
    ],
    allowAddons: true
  },
  {
    id: 'bula_pieczarki',
    category: 'wege',
    badge: 'Wegetariański',
    name: 'Bułka z Pieczarkami',
    description: 'Kraftowa chrupiąca bułka, pieczarki zasmażane na maśle z cebulką, ciągnący ser żółty.',
    image: 'assets/media_1792720050398_2dc3c349.jpg',
    requiresMeat: false,
    sizes: [
      { id: 'standard', name: 'Porcja Bułka', fixedPrice: 34 }
    ],
    allowAddons: true
  },
  {
    id: 'frytki',
    category: 'wege',
    name: 'Chrupiące Frytki',
    description: 'Złociste, chrupiące frytki z solą i ulubioną posypką lub sosem.',
    image: 'assets/media_1792720050140_f0fd5afa.jpg',
    requiresMeat: false,
    sizes: [
      { id: 'male', name: 'Małe frytki', fixedPrice: 8 },
      { id: 'duze', name: 'Duże frytki', fixedPrice: 11 }
    ],
    allowAddons: false
  },

  // NAPOJE & SOKI
  {
    id: 'pepsi',
    category: 'napoje',
    name: 'Pepsi / Pepsi Max',
    description: 'Orzeźwiający napój gazowany w puszce lub butelce.',
    image: 'assets/media_1792720018022_a4bcb9f0.jpg',
    requiresMeat: false,
    sizes: [
      { id: 'puszka', name: 'Puszka 330ml (Pepsi)', fixedPrice: 6 },
      { id: 'puszka_max', name: 'Puszka 330ml (Pepsi Max)', fixedPrice: 6 },
      { id: 'butelka', name: 'Butelka 0.5L (Pepsi)', fixedPrice: 8 },
      { id: 'butelka_max', name: 'Butelka 0.5L (Pepsi Max)', fixedPrice: 8 }
    ]
  },
  {
    id: 'mirinda_7up',
    category: 'napoje',
    name: 'Mirinda / 7UP',
    description: 'Owocowe orzeźwienie pomarańczowe lub cytrynowe.',
    image: 'assets/media_1792720018022_a4bcb9f0.jpg',
    requiresMeat: false,
    sizes: [
      { id: 'mirinda_puszka', name: 'Mirinda 330ml puszka', fixedPrice: 6 },
      { id: 'mirinda_butelka', name: 'Mirinda 0.5L butelka', fixedPrice: 8 },
      { id: '7up_puszka', name: '7UP 330ml puszka', fixedPrice: 6 },
      { id: '7up_butelka', name: '7UP 0.5L butelka', fixedPrice: 8 }
    ]
  },
  {
    id: 'lipton',
    category: 'napoje',
    name: 'Lipton Ice Tea',
    description: 'Mrożona herbata – różne smaki: Peach (brzoskwinia), Lemon (cytryna), Green Tea.',
    image: 'assets/media_1792720018022_a4bcb9f0.jpg',
    requiresMeat: false,
    sizes: [
      { id: 'puszka_peach', name: 'Peach 330ml puszka', fixedPrice: 6 },
      { id: 'puszka_lemon', name: 'Lemon 330ml puszka', fixedPrice: 6 },
      { id: 'puszka_green', name: 'Green 330ml puszka', fixedPrice: 6 },
      { id: 'butelka_peach', name: 'Peach 0.5L butelka', fixedPrice: 8 },
      { id: 'butelka_lemon', name: 'Lemon 0.5L butelka', fixedPrice: 8 },
      { id: 'butelka_green', name: 'Green 0.5L butelka', fixedPrice: 8 }
    ]
  },
  {
    id: 'sok_toma',
    category: 'napoje',
    name: 'Sok Toma 330ml',
    description: 'Pyszny sok owocowy w butelce 330ml.',
    image: 'assets/media_1792720018022_a4bcb9f0.jpg',
    requiresMeat: false,
    sizes: [
      { id: 'jablko', name: 'Jabłko 330ml', fixedPrice: 6 },
      { id: 'pomarancz', name: 'Pomarańcz 330ml', fixedPrice: 6 }
    ]
  },
  {
    id: 'woda',
    category: 'napoje',
    name: 'Woda 0.5L',
    description: 'Krystaliczna woda w butelce 0.5L.',
    image: 'assets/media_1792720018022_a4bcb9f0.jpg',
    requiresMeat: false,
    sizes: [
      { id: 'gazowana', name: 'Gazowana 0.5L', fixedPrice: 5 },
      { id: 'niegazowana', name: 'Niegazowana 0.5L', fixedPrice: 5 }
    ]
  },
  {
    id: 'ayran',
    category: 'napoje',
    name: 'Tradycyjny Ayran 250ml',
    description: 'Turecki napój jogurtowy idealnie gaszący ostrość kebaba.',
    image: 'assets/media_1792720018022_a4bcb9f0.jpg',
    requiresMeat: false,
    sizes: [
      { id: 'standard', name: 'Kubeczek 250ml', fixedPrice: 5 }
    ]
  }
];
