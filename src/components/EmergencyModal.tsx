import React from 'react';
import {
  AlertOctagon,
  X,
  PhoneCall,
  Building2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Ambulance,
  ExternalLink,
} from 'lucide-react';
import { RED_FLAG_SYMPTOMS, NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { ResilientImage } from './ResilientImage';
import { VISUAL_ASSETS } from '../data/visualAssets';
import { useModalBehavior } from '../lib/useModalBehavior';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState: string;
  onSelectSymptomForTriage: (symptom: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  selectedState,
  onSelectSymptomForTriage,
}) => {
  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const stateData = NIGERIAN_STATES_DATA[selectedState] || NIGERIAN_STATES_DATA['Lagos'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card is-danger"
        style={{ maxWidth: 680 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head is-danger">
          <span className="ico" aria-hidden="true">
            <AlertOctagon className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2 id="emergency-modal-title">Critical red-flag symptoms</h2>
            <p className="sub">Bypass home remedies and go directly to an emergency ward.</p>
          </div>
          <button onClick={onClose} className="modal-close" aria-label="Close emergency modal">
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal-body">
          <div className="emg-hero">
            <ResilientImage
              src={VISUAL_ASSETS.hospital.src}
              alt="Nigerian emergency hospital arrival"
              variant="hospital"
              className="w-full h-full"
              imgClassName="w-full h-full object-cover object-[50%_55%]"
            />
            <div className="emg-hero-scrim">
              <small>{selectedState} State Emergency Dispatch</small>
              <b>Go straight to your nearest Emergency Department — Dial 112 free on any network</b>
            </div>
          </div>

          <div>
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                color: 'var(--danger)',
                marginBottom: 8,
              }}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Nigeria Emergency Hotlines
            </h3>

            <div className="hotline-grid" style={{ marginTop: 0 }}>
              <a href="tel:112" className="hotline-card is-danger">
                <div>
                  <small>National Emergency Toll-Free</small>
                  <b style={{ color: 'var(--danger)' }}>Call 112</b>
                </div>
                <Ambulance className="w-5 h-5" style={{ color: 'var(--danger)' }} />
              </a>

              <a href="tel:6232" className="hotline-card">
                <div>
                  <small>NCDC Toll-Free Health Line</small>
                  <b>Call 6232</b>
                </div>
                <ShieldAlert className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              </a>
            </div>

            {stateData.emergencyHotlines.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>
                  {selectedState} numbers:
                </span>
                {stateData.emergencyHotlines.map((num) => (
                  <a
                    key={num}
                    href={`tel:${num.replace(/\s+/g, '')}`}
                    className="btn btn-outline btn-sm tnum"
                    style={{ height: 32, fontSize: 12, color: 'var(--danger)' }}
                  >
                    <PhoneCall className="w-3 h-3" />
                    {num}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                color: 'var(--muted)',
                marginBottom: 10,
              }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
              Recognize Red-Flag Warning Signs
            </h3>
            <div className="redflag-grid">
              {RED_FLAG_SYMPTOMS.map((symptom, idx) => (
                <div key={idx} className="redflag-card">
                  <div>
                    <h4>{symptom.title}</h4>
                    <p>{symptom.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSymptomForTriage(symptom.title);
                      onClose();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 650,
                      color: 'var(--danger)',
                      alignSelf: 'flex-start',
                    }}
                  >
                    <span>Run triage check</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                color: 'var(--muted)',
                marginBottom: 10,
              }}
            >
              <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
              Emergency Hospitals in {selectedState}
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {stateData.facilities.slice(0, 3).map((fac, idx) => (
                <div key={idx} className="row-card" style={{ cursor: 'default' }}>
                  <div className="rc-body">
                    <b>{fac.name}</b>
                    <span>
                      {fac.lga ? `${fac.lga} LGA · ` : ''}
                      {fac.type} · {fac.city}
                    </span>
                  </div>
                  <a
                    href={
                      fac.latitude != null && fac.longitude != null
                        ? `https://maps.google.com/?q=${fac.latitude},${fac.longitude}`
                        : `https://maps.google.com/?q=${encodeURIComponent(`${fac.name} ${fac.city} ${fac.state} Nigeria`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Directions
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
