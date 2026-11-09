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
import { RED_FLAG_SYMPTOMS, NATIONAL_EMERGENCY_NUMBERS, NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
      >
        {/* Red Warning Header */}
        <div className="bg-red-600 px-6 py-5 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <AlertOctagon className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-800 text-red-100 font-bold text-[10px] uppercase tracking-wider mb-1">
                Immediate Hospital Care Protocol
              </span>
              <h2 id="emergency-modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Critical Red-Flag Symptoms
              </h2>
              <p className="text-red-100 text-xs sm:text-sm mt-0.5">
                Bypass all home remedies. Go directly to an emergency department.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-red-700/80 transition-colors"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Direct Hotline Strip */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5 text-red-900 font-bold text-sm">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>Emergency Hotlines in Nigeria</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a 
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-red-200 hover:border-red-400 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="text-xs text-stone-500 font-medium">National Emergency Toll-Free</div>
                  <div className="text-base font-extrabold text-red-600 group-hover:text-red-700">Call 112</div>
                </div>
                <Ambulance className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              </a>

              <a 
                href="tel:6232"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-red-200 hover:border-red-400 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="text-xs text-stone-500 font-medium">NCDC Toll-Free Health Line</div>
                  <div className="text-base font-extrabold text-stone-900 group-hover:text-emerald-700">Call 6232</div>
                </div>
                <ShieldAlert className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
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
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span>Recognize Red-Flag Warning Signs</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RED_FLAG_SYMPTOMS.map((symptom, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-red-50/50 hover:border-red-200 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      {symptom.title}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
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
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Emergency Facilities in {selectedState}</span>
            </h3>
            <div className="space-y-2">
              {stateData.facilities.slice(0, 3).map((fac, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-900">{fac.name}</span>
                    <div className="text-stone-500 text-[11px]">{fac.type} • {fac.city}</div>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${fac.name} ${fac.city} ${fac.state} Nigeria`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-semibold text-[11px] underline"
                  >
                    View Map
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3 text-xs">
          <span className="text-stone-500 italic">
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
