
export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, this would be hashed
  name: string;
  role: 'master' | 'employee';
  currency: string;
  language: SupportedLanguage;
  country: string; // New field for Holidays
  hourlyRate: number;
  // New fields for subscription management
  nif?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  subscriptionDate?: string;
  isProvisionalPassword?: boolean;
  // Profile specific
  socialSecurity?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  irs?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  // Real Photo Upload (Base64 string)
  profilePicture?: string;
  // Avatar Configuration
  avatarConfig?: AvatarConfig;
}

export interface AvatarConfig {
  skinTone: string;
  profession: 'office' | 'construction' | 'crane' | 'electrician' | 'plumber' | 'carpenter';
  hairColor: string;
  accessory: 'none' | 'glasses' | 'sunglasses';
  mouth: 'smile' | 'neutral' | 'braces';
  gender: 'male' | 'female';
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  originalLanguage: SupportedLanguage;
}

export interface TimeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  lunchDuration: number; // in minutes
  isAbsent: boolean;
  notes?: string;
  workSite?: string; // New field: Local/Obra
  // Financial additions
  advance?: number; // Vale
  manualSocialSecurity?: number; // SS preenchido manualmente no dia
}

export type SupportedLanguage = 
  | 'pt'    // Português (Portugal)
  | 'pt-BR' // Português (Brasil)
  | 'en'    // Inglês
  | 'es'    // Espanhol
  | 'fr'    // Francês
  | 'it'    // Italiano
  | 'de'    // Alemão
  | 'nl'    // Holandês
  | 'ga'    // Irlandês
  | 'hi'    // Hindi (Índia)
  | 'ur'    // Urdu (Paquistão)
  | 'ar';   // Árabe (Marrocos/Geral)

export interface LanguageDictionary {
  [key: string]: {
    [key: string]: string;
  };
}

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português (PT)', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' }, // Irlanda
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }, // India
  { code: 'ur', name: 'اردو', flag: '🇵🇰' }, // Paquistão
  { code: 'ar', name: 'العربية', flag: '🇲🇦' }, // Marrocos (Árabe)
];

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' }, // Portugal, Italia, Holanda, Irlanda, Alemanha
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' }, // Brasil
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' }, // Suíça
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' }, // Índia
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' }, // Paquistão
  { code: 'MAD', symbol: 'dh', name: 'Moroccan Dirham' }, // Marrocos
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AOA', symbol: 'Kz', name: 'Kwanza' },
  { code: 'MZN', symbol: 'MT', name: 'Metical' },
];
