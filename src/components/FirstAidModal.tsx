import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Droplet, 
  Thermometer, 
  Heart, 
  Bandage, 
  Check, 
  Info, 
  ShieldCheck 
} from 'lucide-react';
import { FIRST_AID_GUIDES } from '../data/nigeriaHealthcareData';

interface FirstAidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstAidModal: React.FC<FirstAidModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeGuideId, setActiveGuideId] = useState<string>(FIRST_AID_GUIDES[0].id);

  if (!isOpen) return null;

  const currentGuide = FIRST_AID_GUIDES.find(g => g.id === activeGuideId) || FIRST_AID_GUIDES[0];

  const getGuideIcon = (id: string) => {
    switch (id) {
      case 'ors': return <Droplet className="w-4 h-4 text-cyan-600" />;
      case 'tepid-sponging': return <Thermometer className="w-4 h-4 text-amber-600" />;
      case 'choking': return <Heart className="w-4 h-4 text-red-600" />;
      case 'bleeding': return <Bandage className="w-4 h-4 text-rose-600" />;
      default: return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-aid-title"
      >
        {/* Header */}
        <div className="bg-[#05472A] px-6 py-5 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/15">
              <BookOpen className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-teal-800 text-teal-200 font-semibold text-[10px] uppercase tracking-wider mb-0.5">
                First-Aid & Safe Home Protocols
              </span>
              <h2 id="first-aid-title" className="text-xl sm:text-2xl font-bold tracking-tight">
                Practical First-Aid Guides
              </h2>
              <p className="text-teal-200/80 text-xs mt-0.5">
                Standard, evidence-based home care steps recommended across Nigerian communities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-teal-800 transition-colors"
            aria-label="Close guides"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-stone-100 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
          {FIRST_AID_GUIDES.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setActiveGuideId(guide.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
                activeGuideId === guide.id
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-300'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              {getGuideIcon(guide.id)}
              <span>{guide.title}</span>
            </button>
          ))}
        </div>

        {/* Active Guide Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950">
            <h3 className="font-extrabold text-base text-teal-900 mb-1">
              {currentGuide.title}
            </h3>
            <p className="text-xs text-teal-800 leading-relaxed">
              {currentGuide.summary}
            </p>
          </div>

          {/* Specific visual highlights for ORS */}
          {currentGuide.id === 'ors' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">1. Water</span>
                <span className="text-lg font-black text-blue-950">1 Litre</span>
                <span className="text-[11px] text-blue-800 block mt-0.5">Clean boiled & cooled water (or 2 pure-water sachets)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">2. Salt</span>
                <span className="text-lg font-black text-amber-950">1 Level Tsp</span>
                <span className="text-[11px] text-amber-800 block mt-0.5">Level small teaspoon (about 3 grams). Never excess salt.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">3. Sugar</span>
                <span className="text-lg font-black text-emerald-950">10 Level Tsps</span>
                <span className="text-[11px] text-emerald-800 block mt-0.5">Or 5 sugar cubes. Provides glucose for intestinal absorption.</span>
              </div>
            </div>
          )}

          {/* Step-by-step checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Step-by-Step Instructions
            </h4>
            <div className="space-y-2.5">
              {currentGuide.steps.map((step, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="leading-relaxed">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caution Note */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-950">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Safety Precaution:</span>
              <span>Home first aid is a temporary stabilization bridge. If symptoms do not improve rapidly or red-flag signs arise (such as unconsciousness or heavy blood loss), seek urgent clinic or hospital care immediately.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
