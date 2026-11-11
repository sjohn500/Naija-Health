export type UrgencyLevel = 'emergency' | 'urgent' | 'routine';

export type SupportedLanguage = 'pidgin' | 'english' | 'hausa' | 'yoruba' | 'igbo';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  localName: string;
  flag: string;
  listenPrompt: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'pidgin', name: 'Nigerian Pidgin', localName: 'Naija Pidgin', flag: '🇳🇬', listenPrompt: 'Gbo am (Listen)' },
  { code: 'english', name: 'English', localName: 'English (NG)', flag: '🇬🇧', listenPrompt: 'Listen aloud' },
  { code: 'hausa', name: 'Hausa', localName: 'Harshen Hausa', flag: '🇳🇬', listenPrompt: 'Saurara' },
  { code: 'yoruba', name: 'Yoruba', localName: 'Èdè Yorùbá', flag: '🇳🇬', listenPrompt: 'Gbọ́ àsọyé' },
  { code: 'igbo', name: 'Igbo', localName: 'Asụsụ Igbo', flag: '🇳🇬', listenPrompt: 'Ge nti' }
];

export interface TriageResult {
  language?: SupportedLanguage;
  urgencyLevel: UrgencyLevel;
  isRedFlag: boolean;
  emergencyWarning?: string;
  empathyNote?: string;
  // 3-part structured guidance
  wetinFitDeyHappen: string;
  wetinYouFitDoForHouse: string;
  nextStep: string;
  // Aliases for compatibility
  potentialCauses?: string;
  homeManagement?: string;
  actionPlan?: string;
  clarifyingQuestions?: string[];
  recommendedFacilities?: string[];
  detectedLocation?: string;
  detectedLga?: string;
  disclaimer: string;
  fullFormattedResponse?: string;
  rawText?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  triageData?: TriageResult;
  isEmergencyAlert?: boolean;
}

export interface NigerianFacility {
  name: string;
  type: 'Teaching Hospital' | 'Federal Medical Centre' | 'General Hospital' | 'Specialist Hospital';
  city: string;
  state: string;
  lga?: string;
  address?: string;
  emergencyPhone?: string;
  latitude?: number;
  longitude?: number;
}

export interface StateHealthInfo {
  name: string;
  capital: string;
  emergencyHotlines: string[];
  facilities: NigerianFacility[];
}
