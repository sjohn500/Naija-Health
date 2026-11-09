export type UrgencyLevel = 'emergency' | 'urgent' | 'routine';

export interface TriageResult {
  urgencyLevel: UrgencyLevel;
  isRedFlag: boolean;
  emergencyWarning?: string;
  potentialCauses: string;
  homeManagement: string;
  actionPlan: string;
  clarifyingQuestions?: string[];
  recommendedFacilities?: string[];
  detectedLocation?: string;
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
  address?: string;
  emergencyPhone?: string;
}

export interface StateHealthInfo {
  name: string;
  capital: string;
  emergencyHotlines: string[];
  facilities: NigerianFacility[];
}
