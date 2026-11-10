import React from 'react';
import { 
  AlertOctagon, 
  X, 
  PhoneCall, 
  Building2, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  Ambulance 
} from 'lucide-react';
import { RED_FLAG_SYMPTOMS, NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { ResilientImage } from './ResilientImage';
import { VISUAL_ASSETS } from '../data/visualAssets';

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
  onSelectSymptomForTriage
}) => {
  if (!isOpen) return null;

  const stateData = NIGERIAN_STATES_DATA[selectedState] || NIGERIAN_STATES_DATA['Lagos'];

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card is-danger"
        style={{ maxWidth: 672 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
      >
        <div className="modal-head is-danger">
          <span className="ico" aria-hidden="true">
            <AlertOctagon className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2 id="emergency-modal-title">Critical red-flag symptoms</h2>
            <p className="sub">Bypass all home remedies. Go directly to an emergency department.</p>
          </div>
          <button onClick={onClose} className="modal-close" aria-label="Close emergency modal">
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Emergency Arrival Illustration with High-Contrast Gradient Scrim */}
          <div className="relative rounded-2xl overflow-hidden border border-[color:var(--line)] shadow-xs aspect-video max-h-48 w-full">
            <ResilientImage
              src={VISUAL_ASSETS.hospital.src}
              alt="Nigerian Emergency Hospital & Ambulance Arrival"
              variant="hospital"
              className="w-full h-full"
              imgClassName="w-full h-full object-cover object-[50%_60%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                {selectedState} State Emergency Dispatch
              </span>
              <p className="text-sm sm:text-base font-bold leading-snug">
                Head directly to your nearest Emergency Department — Dial 112 free on any network
              </p>
            </div>
          </div>

          {/* Direct Hotline Strip */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5 text-red-900 font-bold text-sm">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>Emergency Hotlines in Nigeria</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a 
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-xl bg-[color:var(--surface)] border border-red-200 hover:border-red-400 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="text-xs text-[color:var(--muted)] font-medium">National Emergency Toll-Free</div>
                  <div className="text-base font-extrabold text-red-600 group-hover:text-red-700">Call 112</div>
                </div>
                <Ambulance className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              </a>

              <a 
                href="tel:6232"
                className="flex items-center justify-between p-3 rounded-xl bg-[color:var(--surface)] border border-red-200 hover:border-red-400 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="text-xs text-[color:var(--muted)] font-medium">NCDC Toll-Free Health Line</div>
                  <div className="text-base font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">Call 6232</div>
                </div>
                <ShieldAlert className="w-5 h-5 text-[color:var(--brand)] group-hover:scale-110 transition-transform" />
              </a>
            </div>

            {stateData.emergencyHotlines.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200/60 text-xs text-red-900 flex flex-wrap items-center gap-2">
                <span className="font-semibold">{selectedState} Emergency Numbers:</span>
                {stateData.emergencyHotlines.map((num) => (
                  <a
                    key={num}
                    href={`tel:${num.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1 font-mono font-bold text-red-700 bg-red-100 hover:bg-red-200 px-2 py-0.5 rounded-md"
                  >
                    <PhoneCall className="w-2.5 h-2.5" />
                    {num}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Red Flag Symptoms Grid */}
          <div>
            <h3 className="text-sm font-bold text-[color:var(--ink)] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span>Recognize Red-Flag Warning Signs</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RED_FLAG_SYMPTOMS.map((symptom, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] hover:bg-red-50/50 hover:border-red-200 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[color:var(--ink)] mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      {symptom.title}
                    </h4>
                    <p className="text-xs text-[color:var(--ink-2)] leading-relaxed">
                      {symptom.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectSymptomForTriage(symptom.title);
                      onClose();
                    }}
                    className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 self-start group"
                  >
                    <span>Run immediate triage check</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Hospitals in Selected State */}
          <div className="bg-[color:var(--surface-2)] rounded-2xl p-4 border border-[color:var(--line)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--ink-2)] mb-2.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[color:var(--brand)]" />
              <span>Recommended Emergency Facilities in {selectedState}</span>
            </h3>
            <div className="space-y-2">
              {stateData.facilities.slice(0, 3).map((fac, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 bg-[color:var(--surface)] rounded-xl border border-[color:var(--line)] text-xs"
                >
                  <div>
                    <span className="font-bold text-[color:var(--ink)]">{fac.name}</span>
                    <div className="text-[color:var(--muted)] text-[11px]">{fac.type} • {fac.city}</div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${fac.name} ${fac.city} ${fac.state} Nigeria`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--brand)] hover:text-[color:var(--brand-ink)] font-semibold text-[11px] underline"
                  >
                    View Map
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[color:var(--surface-3)] border-t border-[color:var(--line)] flex items-center justify-between gap-3 text-xs">
          <span className="text-[color:var(--muted)] italic">
            Do not delay seeking emergency care for an AI response.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
