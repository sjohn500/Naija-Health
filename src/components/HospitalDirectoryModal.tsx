import React from 'react';
import { X, Building2 } from 'lucide-react';
import { FacilityDirectory } from './FacilityDirectory';
import { SupportedLanguage } from '../types/triage';
import { useModalBehavior } from '../lib/useModalBehavior';

interface HospitalDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultState: string;
  defaultLga?: string;
  lang?: SupportedLanguage;
}

const MODAL_COPY: Record<SupportedLanguage, { title: string; subtitle: string; closeLabel: string }> = {
  pidgin: {
    title: 'Hospital Directory for Nigeria',
    subtitle: 'Public hospitals and health centres across all 36 states, FCT & 774 LGAs — call ahead before travelling.',
    closeLabel: 'Close directory',
  },
  english: {
    title: 'Nigeria Hospital Directory',
    subtitle: 'Public hospitals and health centres across all 36 states, FCT & 774 LGAs — call ahead before travelling.',
    closeLabel: 'Close directory',
  },
  hausa: {
    title: 'Jerin Asibitocin Najeriya',
    subtitle: 'Asibitocin gwamnati da cibiyoyin lafiya a dukkan jihohi 36 + FCT da kananan hukumomi 774 — a kira kafin tafiya.',
    closeLabel: 'Rufe jeri',
  },
  yoruba: {
    title: 'Àtòjọ Ilé-Ìwòsàn Nàìjíríà',
    subtitle: 'Àwọn ilé-ìwòsàn ìjọba ní ìpínlẹ̀ 36 + FCT àti gbogbo ìjọba ìbílẹ̀ 774 — pe kí o tó lọ.',
    closeLabel: 'Tì àtòjọ',
  },
  igbo: {
    title: 'Ndepụta Ụlọ Ọgwụ Naịjirịa',
    subtitle: 'Ụlọ ọgwụ gọọmentị n’ofe steeti 36 + FCT na LGA 774 niile — kpọọ tupu ị gaa.',
    closeLabel: 'Mechie ndepụta',
  },
};

export const HospitalDirectoryModal: React.FC<HospitalDirectoryModalProps> = ({
  isOpen,
  onClose,
  defaultState,
  defaultLga = '',
  lang = 'pidgin',
}) => {
  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const copy = MODAL_COPY[lang] || MODAL_COPY.english;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 760 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hospital-directory-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="ico" aria-hidden="true">
            <Building2 className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2 id="hospital-directory-title">{copy.title}</h2>
            <p className="sub">{copy.subtitle}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label={copy.closeLabel}>
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal-body">
          <FacilityDirectory defaultState={defaultState} defaultLga={defaultLga} lang={lang} />
        </div>
      </div>
    </div>
  );
};
