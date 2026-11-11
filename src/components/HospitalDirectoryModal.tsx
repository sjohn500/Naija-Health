import React from 'react';
import { X, Building2 } from 'lucide-react';
import { FacilityDirectory } from './FacilityDirectory';
import { SupportedLanguage } from '../types/triage';

interface HospitalDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultState: string;
  lang?: SupportedLanguage;
}

export const HospitalDirectoryModal: React.FC<HospitalDirectoryModalProps> = ({
  isOpen,
  onClose,
  defaultState,
  lang = 'pidgin',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 780 }}
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
            <h2 id="hospital-directory-title">Nigeria hospital directory</h2>
            <p className="sub">State, LGA and facility level — call to confirm before you travel.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close directory">
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal-body">
          <FacilityDirectory defaultState={defaultState} lang={lang} />
        </div>
      </div>
    </div>
  );
};
