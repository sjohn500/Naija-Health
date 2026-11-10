import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  Droplet,
  Thermometer,
  Heart,
  Bandage,
  Info,
  ShieldCheck,
  Baby,
} from 'lucide-react';
import { FIRST_AID_GUIDES } from '../data/nigeriaHealthcareData';
import { SupportedLanguage } from '../types/triage';
import { TRANSLATIONS } from '../data/localization';
import { ResilientImage } from './ResilientImage';
import { getFirstAidVisual } from '../data/visualAssets';

interface FirstAidModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGuideId?: string;
  selectedLanguage?: SupportedLanguage;
}

export const FirstAidModal: React.FC<FirstAidModalProps> = ({
  isOpen,
  onClose,
  initialGuideId,
  selectedLanguage = 'pidgin',
}) => {
  const [activeGuideId, setActiveGuideId] = useState<string>(initialGuideId || FIRST_AID_GUIDES[0].id);

  useEffect(() => {
    if (isOpen && initialGuideId) {
      setActiveGuideId(initialGuideId);
    }
  }, [isOpen, initialGuideId]);

  if (!isOpen) return null;

  const currentGuide = FIRST_AID_GUIDES.find((g) => g.id === activeGuideId) || FIRST_AID_GUIDES[0];
  const currentVisual = getFirstAidVisual(currentGuide.id);
  const langStrings = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.pidgin;
  const localizedCaption = langStrings.visuals.cards[currentVisual.key];

  const getGuideIcon = (id: string) => {
    switch (id) {
      case 'ors':
        return <Droplet className="w-4 h-4 text-cyan-600" />;
      case 'tepid-sponging':
        return <Thermometer className="w-4 h-4 text-amber-600" />;
      case 'choking':
        return <Heart className="w-4 h-4 text-red-600" />;
      case 'bleeding':
        return <Bandage className="w-4 h-4 text-rose-600" />;
      case 'pregnancy':
        return <Baby className="w-4 h-4 text-pink-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[color:var(--brand)]" />;
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        style={{ maxWidth: 768 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-aid-title"
      >
        <div className="modal-head">
          <span className="ico" aria-hidden="true">
            <BookOpen className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2 id="first-aid-title">Practical first-aid guides</h2>
            <p className="sub">Evidence-based home care steps for Nigerian households.</p>
          </div>
          <button onClick={onClose} className="modal-close" aria-label="Close guides">
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-[color:var(--surface-3)] border-b border-[color:var(--line)] flex items-center gap-2 overflow-x-auto text-xs">
          {FIRST_AID_GUIDES.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setActiveGuideId(guide.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeGuideId === guide.id
                  ? 'bg-[color:var(--surface)] text-[color:var(--ink)] shadow-xs border border-[color:var(--line-strong)]'
                  : 'text-[color:var(--ink-2)] hover:text-[color:var(--ink)] hover:bg-white/60'
              }`}
            >
              {getGuideIcon(guide.id)}
              <span>{guide.title}</span>
            </button>
          ))}
        </div>

        {/* Active Guide Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Illustrated Protocol Card Split */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            <ResilientImage
              src={currentVisual.src}
              alt={currentGuide.title}
              variant={currentVisual.key}
              className={`md:col-span-5 w-full rounded-2xl border border-[color:var(--line)] shadow-2xs ${currentVisual.aspectClass}`}
              imgClassName="w-full h-full object-cover object-[50%_20%]"
            />
            <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-teal-50/80 border border-teal-200/90 text-teal-950 flex flex-col justify-center">
              <h3 className="font-extrabold text-base sm:text-lg text-teal-950 mb-1.5">
                {currentGuide.title}
              </h3>
              <p className="text-xs sm:text-sm text-teal-900/90 leading-relaxed mb-3">
                {currentGuide.summary}
              </p>
              <div className="pt-2.5 border-t border-teal-200/70 text-xs font-semibold text-[color:var(--brand)]">
                {localizedCaption.caption}
              </div>
            </div>
          </div>

          {/* Specific visual highlights for ORS */}
          {currentGuide.id === 'ors' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">1. Water</span>
                <span className="text-lg font-black text-blue-950 tabular-nums">1 Litre</span>
                <span className="text-[11px] text-blue-800 block mt-0.5">Clean boiled & cooled water (or 2 pure-water sachets)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">2. Salt</span>
                <span className="text-lg font-black text-amber-950 tabular-nums">1 Level Tsp</span>
                <span className="text-[11px] text-amber-800 block mt-0.5">Level small teaspoon (about 3 grams). Never excess salt.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[color:var(--brand-soft)] border border-emerald-200 text-center">
                <span className="text-[11px] font-bold text-[color:var(--brand)] uppercase tracking-wider block mb-1">3. Sugar</span>
                <span className="text-lg font-black text-emerald-950 tabular-nums">10 Level Tsps</span>
                <span className="text-[11px] text-[color:var(--brand-ink)] block mt-0.5">Or 5 sugar cubes. Provides glucose for intestinal absorption.</span>
              </div>
            </div>
          )}

          {/* Step-by-step checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] mb-3">
              Step-by-Step Instructions
            </h4>
            <div className="space-y-2.5">
              {currentGuide.steps.map((step, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-[color:var(--surface-2)] border border-[color:var(--line)] text-xs sm:text-sm text-[color:var(--ink)]"
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
        <div className="p-4 bg-[color:var(--surface-3)] border-t border-[color:var(--line)] flex items-center justify-end">
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
