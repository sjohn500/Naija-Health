// Client-only module: never import this file from server.ts or shared backend files
import naijaCareWelcomeImg from '../assets/images/photo_naija_care_welcome_1794307091148.jpg';
import firstAidOrsImg from '../assets/images/photo_firstaid_ors_prep_1794307092405.jpg';
import firstAidFeverSpongingImg from '../assets/images/photo_firstaid_tepid_sponging_1794307093105.jpg';
import firstAidChokingRescueImg from '../assets/images/photo_firstaid_choking_rescue_1794307094250.jpg';
import naijaPregnancyCareImg from '../assets/images/photo_naija_pregnancy_care_1794307599688.jpg';
import naijaHospitalEmergencyImg from '../assets/images/photo_naija_hospital_emergency_1794307095773.jpg';

import { TriageResult } from '../types/triage';

export type VisualSceneKey = 'welcome' | 'ors' | 'sponging' | 'choking' | 'pregnancy' | 'hospital';

export interface VisualAssetMeta {
  key: VisualSceneKey;
  src: string;
  aspectClass: string;
  linkedGuideId?: 'ors' | 'tepid-sponging' | 'choking' | 'bleeding' | 'pregnancy';
}

export const VISUAL_ASSETS: Record<VisualSceneKey, VisualAssetMeta> = {
  welcome: {
    key: 'welcome',
    src: naijaCareWelcomeImg,
    aspectClass: 'aspect-video',
  },
  ors: {
    key: 'ors',
    src: firstAidOrsImg,
    aspectClass: 'aspect-[4/3]',
    linkedGuideId: 'ors',
  },
  sponging: {
    key: 'sponging',
    src: firstAidFeverSpongingImg,
    aspectClass: 'aspect-[4/3]',
    linkedGuideId: 'tepid-sponging',
  },
  choking: {
    key: 'choking',
    src: firstAidChokingRescueImg,
    aspectClass: 'aspect-[4/3]',
    linkedGuideId: 'choking',
  },
  pregnancy: {
    key: 'pregnancy',
    src: naijaPregnancyCareImg,
    aspectClass: 'aspect-[4/3]',
    linkedGuideId: 'pregnancy',
  },
  hospital: {
    key: 'hospital',
    src: naijaHospitalEmergencyImg,
    aspectClass: 'aspect-video',
    linkedGuideId: 'bleeding',
  },
};

export function getFirstAidVisual(guideId: string): VisualAssetMeta {
  switch (guideId) {
    case 'ors':
      return VISUAL_ASSETS.ors;
    case 'tepid-sponging':
      return VISUAL_ASSETS.sponging;
    case 'choking':
      return VISUAL_ASSETS.choking;
    case 'pregnancy':
      return VISUAL_ASSETS.pregnancy;
    case 'bleeding':
      return VISUAL_ASSETS.hospital;
    default:
      return VISUAL_ASSETS.welcome;
  }
}

export function resolveTriageVisual(triage: TriageResult): VisualAssetMeta {
  if (triage.isRedFlag) {
    return VISUAL_ASSETS.hospital;
  }

  const combined = `${triage.wetinFitDeyHappen || triage.potentialCauses || ''} ${
    triage.wetinYouFitDoForHouse || triage.homeManagement || ''
  } ${triage.nextStep || triage.actionPlan || ''}`.toLowerCase();

  // Prioritize pregnancy/antenatal care visual when pregnancy or maternity context is detected
  if (
    /\b(pregnan|antenatal|trimester|maternal|midwife|obstetric|fetal|baby kick|morning sickness|pre-eclampsia|eclampsia|expectant|get belle|carry belle|mai ciki|juna biyu|alaboyun|aláboyún|oyún|oyun|afọ ime|dị ime|nwaanyị dị ime)\b/.test(
      combined
    )
  ) {
    return VISUAL_ASSETS.pregnancy;
  }

  // Check Salt-Sugar / Purging / Dehydration terms across all 5 Nigerian languages
  if (
    /\b(ors|salt-sugar|salt and sugar|purging|diarrhea|watery stool|zawo|ruwan gishiri|sukari|ìgbẹ́ gbuuru|omi iyọ̀|afọ ọsịsa|mmiri nnu|shuga|cholera)\b/.test(
      combined
    )
  ) {
    return VISUAL_ASSETS.ors;
  }

  // Check Fever / Tepid Sponging / Hot Body / Malaria terms across all 5 languages
  if (
    /\b(tepid|spong|lukewarm|fever|hot body|malaria|zazzabi|ruwan dumi|ibà|ara gbígbóná|omi tútù|ahụ ọkụ|ịfụchasị)\b/.test(
      combined
    )
  ) {
    return VISUAL_ASSETS.sponging;
  }

  // Check Choking / Airway obstruction
  if (/\b(chok|airway|back blow|abdominal thrust|makale|ọ̀fun|akpịrị)\b/.test(combined)) {
    return VISUAL_ASSETS.choking;
  }

  // Urgent hospital review scenarios
  if (triage.urgencyLevel === 'urgent') {
    return VISUAL_ASSETS.hospital;
  }

  return VISUAL_ASSETS.welcome;
}
