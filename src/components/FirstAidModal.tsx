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
import { useModalBehavior } from '../lib/useModalBehavior';

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

  useModalBehavior(isOpen, onClose);

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
        return <Droplet className="w-4 h-4" style={{ color: 'var(--blue)' }} />;
      case 'tepid-sponging':
        return <Thermometer className="w-4 h-4" style={{ color: 'var(--amber)' }} />;
      case 'choking':
        return <Heart className="w-4 h-4" style={{ color: 'var(--danger)' }} />;
      case 'bleeding':
        return <Bandage className="w-4 h-4" style={{ color: 'var(--rose)' }} />;
      case 'pregnancy':
        return <Baby className="w-4 h-4" style={{ color: 'var(--rose)' }} />;
      default:
        return <ShieldCheck className="w-4 h-4" style={{ color: 'var(--brand)' }} />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 760 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-aid-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <span className="ico" aria-hidden="true">
            <BookOpen className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <h2 id="first-aid-title">{langStrings.header.firstAid}</h2>
            <p className="sub">{langStrings.visuals.guidesSubtitle}</p>
          </div>
          <button onClick={onClose} className="modal-close" aria-label="Close guides">
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="guide-tabs" role="tablist" aria-label="First-aid guides">
          {FIRST_AID_GUIDES.map((guide) => {
            const active = activeGuideId === guide.id;
            return (
              <button
                key={guide.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveGuideId(guide.id)}
                className={`guide-tab${active ? ' is-active' : ''}`}
              >
                {getGuideIcon(guide.id)}
                <span>{guide.title}</span>
              </button>
            );
          })}
        </div>

        <div className="modal-body">
          <div className="guide-overview">
            <ResilientImage
              src={currentVisual.src}
              alt={currentGuide.title}
              variant={currentVisual.key}
              className={`w-full rounded-[14px] border border-[color:var(--line)] ${currentVisual.aspectClass}`}
              imgClassName="w-full h-full object-cover object-[50%_20%]"
            />
            <div className="guide-summary">
              <h3>{currentGuide.title}</h3>
              <p>{currentGuide.summary}</p>
              <div className="guide-cap">{localizedCaption.caption}</div>
            </div>
          </div>

          {currentGuide.id === 'ors' && (
            <div className="ors-grid">
              <div className="ors-card">
                <span className="ors-lbl" style={{ color: 'var(--blue)' }}>1. Water</span>
                <span className="ors-val">1 Litre</span>
                <span className="ors-sub">Boiled &amp; cooled drinking water (or 2 sachets)</span>
              </div>
              <div className="ors-card">
                <span className="ors-lbl" style={{ color: 'var(--amber)' }}>2. Salt</span>
                <span className="ors-val">1 Level Tsp</span>
                <span className="ors-sub">About 3 grams. Never add excess salt.</span>
              </div>
              <div className="ors-card">
                <span className="ors-lbl">3. Sugar</span>
                <span className="ors-val">10 Level Tsps</span>
                <span className="ors-sub">Or 5 sugar cubes, stirred until dissolved.</span>
              </div>
            </div>
          )}

          <div>
            <h4
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.07em',
                color: 'var(--muted)',
                marginBottom: 10,
              }}
            >
              Step-by-step instructions
            </h4>
            <div className="step-list">
              {currentGuide.steps.map((step, idx) => (
                <div key={idx} className="step-item">
                  <span className="n">{idx + 1}</span>
                  <div>{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sheet is-warn" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Info className="w-4 h-4 shrink-0" style={{ color: 'var(--amber)', marginTop: 2 }} />
            <div>
              <h3>Safety precaution</h3>
              <p>
                Home first aid is a temporary stabilization bridge. If symptoms worsen or danger signs appear, seek urgent clinic or hospital care immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
