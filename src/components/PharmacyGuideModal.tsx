import React, { useState, useMemo } from 'react';
import {
  Pill,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Baby,
  Info,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from 'lucide-react';
import { SupportedLanguage } from '../types/triage';
import {
  NIGERIAN_OTC_MEDICINES,
  OTC_CATEGORIES,
  PHARMACY_SAFETY_GUIDELINES,
  OtcCategory,
  OtcMedicine,
} from '../data/pharmacyData';
import { ResilientImage } from './ResilientImage';
import { useModalBehavior } from '../lib/useModalBehavior';

interface PharmacyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage?: SupportedLanguage;
  initialCategory?: OtcCategory;
  initialSearch?: string;
}

export const PharmacyGuideModal: React.FC<PharmacyGuideModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage = 'pidgin',
  initialCategory = 'all',
  initialSearch = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<OtcCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'medicines' | 'verification'>('medicines');

  useModalBehavior(isOpen, onClose);

  // Sync initialCategory or initialSearch if modal reopens with specific intent
  React.useEffect(() => {
    if (isOpen) {
      if (initialCategory) setActiveCategory(initialCategory);
      if (initialSearch) setSearchQuery(initialSearch);
    }
  }, [isOpen, initialCategory, initialSearch]);

  const filteredMedicines = useMemo(() => {
    return NIGERIAN_OTC_MEDICINES.filter((med) => {
      const matchesCategory =
        activeCategory === 'all' || med.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const nameMatch = med.genericName.toLowerCase().includes(q);
      const brandMatch = med.commonBrands.some((b) => b.toLowerCase().includes(q));
      const useMatch = Object.values(med.primaryUses).some((text) =>
        text.toLowerCase().includes(q)
      );
      const categoryMatch = Object.values(med.categoryName).some((text) =>
        text.toLowerCase().includes(q)
      );

      return nameMatch || brandMatch || useMatch || categoryMatch;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const labels = {
    pidgin: {
      title: 'Chemist & Pharmacy Guide',
      subtitle: 'Genuine over-the-counter medicines, safe dosages & what to ask your Pharmacist in Nigeria',
      searchPlaceholder: 'Search medicines (e.g. Paracetamol, Panadol, malaria, purging, heartburn)...',
      tabMedicines: 'Approved OTC Medicines',
      tabVerification: 'NAFDAC & Safety Rules',
      brandsLabel: 'Common registered brands in Nigeria:',
      dosageAdult: 'Adult Dosage (with water):',
      dosageChild: 'Pediatric / Children Guidance:',
      askPharmacist: 'Crucial Questions to Ask Pharmacist:',
      safetyTitle: 'Important Safety Alerts:',
      pregnancySafe: 'Pregnancy Status:',
      nafdacLabel: 'NAFDAC Verification:',
      viewDetails: 'See full dosage & safety rules',
      hideDetails: 'Show less',
      noResults: 'No medicines match your search. Ask a registered pharmacist or search by generic name.',
      disclaimer: 'DISCLAIMER: This guide is strictly educational for non-emergency guidance. Never self-prescribe antibiotics or unverified mixtures. If symptoms are severe, visit a hospital immediately.',
      emergencyNote: 'If experiencing severe chest pain, loss of consciousness, or heavy bleeding, call 112 / 767 emergency directly.',
    },
    english: {
      title: 'Pharmacy & OTC Medicine Guide',
      subtitle: 'Standard over-the-counter pharmaceuticals, dosing instructions & questions for your pharmacist',
      searchPlaceholder: 'Search medications (e.g. Paracetamol, ORS, malaria, heartburn, antacid)...',
      tabMedicines: 'Approved OTC Medicines',
      tabVerification: 'NAFDAC & Verification',
      brandsLabel: 'Common Nigerian brands:',
      dosageAdult: 'Adult Administration:',
      dosageChild: 'Pediatric & Infant Considerations:',
      askPharmacist: 'What to Ask the Pharmacist:',
      safetyTitle: 'Crucial Safety Precautions:',
      pregnancySafe: 'Pregnancy Assessment:',
      nafdacLabel: 'NAFDAC Authentication:',
      viewDetails: 'View complete dosage & safety',
      hideDetails: 'Collapse details',
      noResults: 'No medications matched your query. Please consult a licensed community pharmacist.',
      disclaimer: 'CLINICAL NOTICE: Over-the-counter guidance does not replace diagnostic evaluation by a medical doctor. Always consult a licensed pharmacist before starting any new medication.',
      emergencyNote: 'Red-flag emergencies (unresponsiveness, chest crushing pain, respiratory distress) require 112 or immediate emergency transfer.',
    },
    hausa: {
      title: 'Jagoran Magunguna da Kantin Magani',
      subtitle: 'Maganin sauki, ingantaccen adadi da tambayoyin da za a yi wa mai kantin magani',
      searchPlaceholder: 'Nemi magani (misali Paracetamol, zazzabi, zawo, ƙunar ƙirji)...',
      tabMedicines: 'Magungunan Sauki',
      tabVerification: 'Lambar NAFDAC da Kariya',
      brandsLabel: 'Shahararrun kamfanoni a Najeriya:',
      dosageAdult: 'Yadda Manya za su sha:',
      dosageChild: 'Ga Yara da Ƙananan Yara:',
      askPharmacist: 'Tambayoyin da za a yi wa Mai Magani:',
      safetyTitle: 'Gargadi kan Kariya:',
      pregnancySafe: 'Mata Masu Juna Biyu:',
      nafdacLabel: 'Tabbatar da NAFDAC:',
      viewDetails: 'Duba cikakken bayani',
      hideDetails: 'Rage bayani',
      noResults: 'Ba a sami magani ba. Tuntubi ƙwararren mai harhaɗa magani.',
      disclaimer: 'SANARWA: Wannan jagora ne kawai don ilimantarwa. A guji shan magungunan rigakafi ba tare da izinin likita ba.',
      emergencyNote: 'Idan akwai ciwo mai tsanani, a gaggauta kiran lambar gaggawa 112 ko zuwa asibiti.',
    },
    yoruba: {
      title: 'Itọsọna Ile Oogun ati Awọn Oogun',
      subtitle: 'Awọn oogun ti o wọpọ, iwọn to tọ, ati ohun ti o yẹ ki o beere lọwọ oṣiṣẹ ile oogun',
      searchPlaceholder: 'Wa oogun (fun apẹẹrẹ Paracetamol, iba, igbẹ, oorun ọkan)...',
      tabMedicines: 'Awọn Oogun To Wọpọ',
      tabVerification: 'Ijẹrisi NAFDAC & Aabo',
      brandsLabel: 'Awọn orukọ oogun ti a mọ ni Naijiria:',
      dosageAdult: 'Iwọn fun Agbalagba:',
      dosageChild: 'Itọsọna fun Awọn Ọmọde:',
      askPharmacist: 'Ohun ti o yẹ ki o beere lọwọ Oṣiṣẹ Ile Oogun:',
      safetyTitle: 'Awọn Ikilọ Aabo Pataki:',
      pregnancySafe: 'Aabo fun Aboyun:',
      nafdacLabel: 'Ijẹrisi NAFDAC:',
      viewDetails: 'Wo gbogbo alaye',
      hideDetails: 'Pade alaye',
      noResults: 'Ko si oogun ti o ba wiwa rẹ mu. Kan si oṣiṣẹ ile oogun ti o ni iwe-aṣẹ.',
      disclaimer: 'IKILỌ: Itọsọna yii wa fun imọ gbogbogbo nikan. Maṣe lo oogun aporo (antibiotics) lai si aṣẹ dokita.',
      emergencyNote: 'Ti o ba jẹ pajawiri bii irora ọkan ti o lewu, pe 112 tabi 767 lẹsẹkẹsẹ.',
    },
    igbo: {
      title: 'Ntuziaka Ụlọ Ahịa Ọgwụ na Ọgwụ Ndị A Kwadoro',
      subtitle: 'Ọgwụ a na-enweta n\'enweghị akwụkwọ dọkịta, usoro ọgwụgwọ na ajụjụ a ga-ajụ onye na-ere ọgwụ',
      searchPlaceholder: 'Chọọ ọgwụ (dịka Paracetamol, ahụ ọkụ, afọ ọsịsa, ọkụ n\'obi)...',
      tabMedicines: 'Ọgwụ Ndị A Kwadoro',
      tabVerification: 'Nkwenye NAFDAC & Nchebe',
      brandsLabel: 'Aha ọgwụ ndị a maara na Naijiria:',
      dosageAdult: 'Usoro maka Ndị Okenye:',
      dosageChild: 'Ntuziaka maka Ụmụaka:',
      askPharmacist: 'Ihe ị ga-ajụ Onye Na-ere Ọgwụ:',
      safetyTitle: 'Ịdọ Aka na Ntị Maka Nchebe:',
      pregnancySafe: 'Ọnọdụ Ime:',
      nafdacLabel: 'Nlele NAFDAC:',
      viewDetails: 'Hụ nkọwa niile',
      hideDetails: 'Mechie nkọwa',
      noResults: 'Enweghị ọgwụ kwekọrọ n\'ihe ị na-achọ. Biko gwa onye na-ahụ maka ọgwụ.',
      disclaimer: 'NKWUKWỤ: Ntuziaka a bụ naanị maka mmụta. Ejila ọgwụ nje ma ọ bụgwụ ọdịnala gwakọta bekee n\'enweghị nyocha.',
      emergencyNote: 'Ọ bụrụ na ọ bụ oke ihe mberede dị ka mgbu obi siri ike, kpọọ 112 ozugbo.',
    },
  }[selectedLanguage] || {
    title: 'Chemist & Pharmacy Guide',
    subtitle: 'Genuine over-the-counter medicines, safe dosages & what to ask your Pharmacist in Nigeria',
    searchPlaceholder: 'Search medicines...',
    tabMedicines: 'Approved OTC Medicines',
    tabVerification: 'NAFDAC & Safety Rules',
    brandsLabel: 'Common registered brands in Nigeria:',
    dosageAdult: 'Adult Dosage (with water):',
    dosageChild: 'Pediatric / Children Guidance:',
    askPharmacist: 'Crucial Questions to Ask Pharmacist:',
    safetyTitle: 'Important Safety Alerts:',
    pregnancySafe: 'Pregnancy Status:',
    nafdacLabel: 'NAFDAC Verification:',
    viewDetails: 'See full dosage & safety rules',
    hideDetails: 'Show less',
    noResults: 'No medicines match your search.',
    disclaimer: 'DISCLAIMER: This guide is strictly educational for non-emergency guidance.',
    emergencyNote: 'If experiencing severe chest pain, call 112 / 767 directly.',
  };

  const nafdacRules =
    PHARMACY_SAFETY_GUIDELINES.nafdacTips[selectedLanguage] ||
    PHARMACY_SAFETY_GUIDELINES.nafdacTips.pidgin;
  const safetyRules =
    PHARMACY_SAFETY_GUIDELINES.generalRules[selectedLanguage] ||
    PHARMACY_SAFETY_GUIDELINES.generalRules.pidgin;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 840, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pharmacy-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
          <span
            className="ico"
            style={{
              background: 'var(--brand-soft)',
              color: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <Pill className="w-5 h-5" strokeWidth={2.2} />
          </span>
          <div style={{ flex: 1 }}>
            <h2 id="pharmacy-modal-title" style={{ fontSize: 19, letterSpacing: '-0.02em' }}>
              {labels.title}
            </h2>
            <p className="sub" style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              {labels.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
            aria-label="Close pharmacy guide"
            style={{ padding: 8 }}
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>

        {/* Tab switchers */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '12px 20px',
            background: 'var(--surface-2)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('medicines')}
            className={`btn btn-sm ${activeTab === 'medicines' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600 }}
          >
            <Pill className="w-3.5 h-3.5" strokeWidth={2} />
            {labels.tabMedicines}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`btn btn-sm ${activeTab === 'verification' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600 }}
          >
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            {labels.tabVerification}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {activeTab === 'medicines' && (
            <>
              {/* Search Bar */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search
                  className="w-4 h-4"
                  style={{
                    position: 'absolute',
                    left: 14,
                    color: 'var(--muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="input"
                  style={{
                    paddingLeft: 38,
                    paddingRight: searchQuery ? 36 : 14,
                    height: 42,
                    fontSize: 14,
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--line-strong)',
                    borderRadius: 10,
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 12,
                      padding: 4,
                      color: 'var(--muted)',
                    }}
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  paddingBottom: 10,
                  marginBottom: 16,
                  scrollbarWidth: 'none',
                }}
              >
                {OTC_CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  const label = cat.label[selectedLanguage] || cat.label.pidgin;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      style={{
                        whiteSpace: 'nowrap',
                        padding: '6px 13px',
                        fontSize: 12.5,
                        fontWeight: 600,
                        borderRadius: 20,
                        border: isSelected
                          ? '1px solid var(--brand)'
                          : '1px solid var(--line)',
                        background: isSelected ? 'var(--brand-soft)' : 'var(--surface)',
                        color: isSelected ? 'var(--brand-ink)' : 'var(--ink-2)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Medicines List */}
              {filteredMedicines.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '36px 16px',
                    background: 'var(--surface-2)',
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                  }}
                >
                  <Pill
                    className="w-8 h-8"
                    style={{ margin: '0 auto 10px', color: 'var(--muted)' }}
                  />
                  <p style={{ color: 'var(--ink-2)', fontWeight: 600, fontSize: 14 }}>
                    {labels.noResults}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {filteredMedicines.map((med) => {
                    const isExpanded = expandedMedId === med.id;
                    const primaryUse =
                      med.primaryUses[selectedLanguage] || med.primaryUses.pidgin;
                    const keyRule = med.keyRule[selectedLanguage] || med.keyRule.pidgin;
                    const adultDose =
                      med.howToTakeAdult[selectedLanguage] || med.howToTakeAdult.pidgin;
                    const childDose =
                      med.howToTakeChild[selectedLanguage] || med.howToTakeChild.pidgin;
                    const questions =
                      med.whatToAskPharmacist[selectedLanguage] ||
                      med.whatToAskPharmacist.pidgin;
                    const alerts =
                      med.safetyAlerts[selectedLanguage] || med.safetyAlerts.pidgin;
                    const preg =
                      med.pregnancyAdvisory[selectedLanguage] ||
                      med.pregnancyAdvisory.pidgin;
                    const nafdacTip =
                      med.nafdacVerification.tips[selectedLanguage] ||
                      med.nafdacVerification.tips.pidgin;
                    const redFlags =
                      med.redFlagsSeekDoctor[selectedLanguage] ||
                      med.redFlagsSeekDoctor.pidgin;

                    return (
                      <article
                        key={med.id}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--line)',
                          borderRadius: 14,
                          overflow: 'hidden',
                          boxShadow: 'var(--shadow-xs)',
                        }}
                      >
                        {/* Top Card Section: Image + Title + Primary details */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14,
                            padding: 16,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              gap: 14,
                              alignItems: 'flex-start',
                            }}
                          >
                            {/* Medicine Image */}
                            <div
                              style={{
                                width: 110,
                                height: 100,
                                flexShrink: 0,
                                borderRadius: 10,
                                overflow: 'hidden',
                                border: '1px solid var(--line)',
                                background: 'var(--surface-2)',
                              }}
                            >
                              <ResilientImage
                                src={med.imageSrc}
                                alt={med.genericName}
                                variant="pill"
                                className="w-full h-full"
                                imgClassName="w-full h-full object-cover object-center"
                              />
                            </div>

                            {/* Details Header */}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    color: 'var(--brand)',
                                  }}
                                >
                                  {med.categoryName[selectedLanguage] ||
                                    med.categoryName.pidgin}
                                </span>
                                <span style={{ color: 'var(--line-strong)' }}>·</span>
                                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                                  OTC Grade
                                </span>
                              </div>

                              <h3
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: 'var(--ink)',
                                  marginBottom: 4,
                                }}
                              >
                                {med.genericName}
                              </h3>

                              <p
                                style={{
                                  fontSize: 13,
                                  color: 'var(--ink-2)',
                                  lineHeight: 1.45,
                                  marginBottom: 6,
                                }}
                              >
                                {primaryUse}
                              </p>

                              {/* Common Brands list */}
                              <div
                                style={{
                                  fontSize: 12,
                                  color: 'var(--muted)',
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  gap: 4,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <span style={{ fontWeight: 600 }}>
                                  {labels.brandsLabel}
                                </span>
                                <span>{med.commonBrands.join(', ')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Key Rule Warning Banner */}
                          <div
                            style={{
                              background:
                                med.category === 'tested_malaria'
                                  ? 'var(--danger-soft)'
                                  : 'var(--amber-soft)',
                              border: `1px solid ${
                                med.category === 'tested_malaria'
                                  ? 'var(--danger)'
                                  : 'var(--amber)'
                              }`,
                              borderRadius: 8,
                              padding: '9px 12px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              fontSize: 12.5,
                              lineHeight: 1.45,
                              color: 'var(--ink)',
                            }}
                          >
                            <AlertTriangle
                              className="w-4 h-4 shrink-0"
                              style={{
                                color:
                                  med.category === 'tested_malaria'
                                    ? 'var(--danger)'
                                    : 'var(--amber)',
                                marginTop: 1,
                              }}
                            />
                            <div>
                              <b>Key Rule: </b>
                              {keyRule}
                            </div>
                          </div>

                          {/* Quick presentation & pregnancy pill */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 8,
                              fontSize: 12,
                              borderTop: '1px solid var(--line)',
                              paddingTop: 10,
                            }}
                          >
                            <div style={{ color: 'var(--muted)' }}>
                              <b>Presentation:</b>{' '}
                              {med.presentation[selectedLanguage] ||
                                med.presentation.pidgin}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedMedId(isExpanded ? null : med.id)
                              }
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12.5,
                                fontWeight: 650,
                                color: 'var(--brand)',
                                padding: '4px 8px',
                                borderRadius: 6,
                              }}
                            >
                              {isExpanded ? labels.hideDetails : labels.viewDetails}
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Deep Guidance */}
                        {isExpanded && (
                          <div
                            style={{
                              background: 'var(--surface-2)',
                              borderTop: '1px solid var(--line)',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 14,
                            }}
                          >
                            {/* Dosages: Adult & Child */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fit, minmax(260px, 1fr))',
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  background: 'var(--surface)',
                                  padding: 12,
                                  borderRadius: 10,
                                  border: '1px solid var(--line)',
                                }}
                              >
                                <span
                                  style={{
                                    display: 'block',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: 'var(--ink)',
                                    marginBottom: 4,
                                  }}
                                >
                                  {labels.dosageAdult}
                                </span>
                                <p
                                  style={{
                                    fontSize: 12.5,
                                    color: 'var(--ink-2)',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {adultDose}
                                </p>
                              </div>

                              <div
                                style={{
                                  background: 'var(--surface)',
                                  padding: 12,
                                  borderRadius: 10,
                                  border: '1px solid var(--line)',
                                }}
                              >
                                <span
                                  style={{
                                    display: 'block',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: 'var(--ink)',
                                    marginBottom: 4,
                                  }}
                                >
                                  {labels.dosageChild}
                                </span>
                                <p
                                  style={{
                                    fontSize: 12.5,
                                    color: 'var(--ink-2)',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {childDose}
                                </p>
                              </div>
                            </div>

                            {/* What to ask the Pharmacist checklist */}
                            <div
                              style={{
                                background: 'var(--surface)',
                                padding: 12,
                                borderRadius: 10,
                                border: '1px solid var(--line)',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  color: 'var(--brand-ink)',
                                  marginBottom: 6,
                                }}
                              >
                                <MessageSquare className="w-4 h-4 text-brand" />
                                {labels.askPharmacist}
                              </div>
                              <ul
                                style={{
                                  margin: 0,
                                  paddingLeft: 18,
                                  fontSize: 12.5,
                                  color: 'var(--ink-2)',
                                  lineHeight: 1.55,
                                }}
                              >
                                {questions.map((q, idx) => (
                                  <li key={idx} style={{ marginBottom: 4 }}>
                                    {q}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Pregnancy advisory */}
                            <div
                              style={{
                                background: preg.isAllowed
                                  ? 'var(--brand-soft)'
                                  : 'var(--rose-soft)',
                                border: `1px solid ${
                                  preg.isAllowed ? 'var(--brand)' : 'var(--rose)'
                                }`,
                                padding: 12,
                                borderRadius: 10,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                fontSize: 12.5,
                                lineHeight: 1.45,
                                color: 'var(--ink)',
                              }}
                            >
                              <Baby
                                className="w-4 h-4 shrink-0"
                                style={{
                                  color: preg.isAllowed
                                    ? 'var(--brand)'
                                    : 'var(--rose)',
                                  marginTop: 1,
                                }}
                              />
                              <div>
                                <b>{labels.pregnancySafe} </b>
                                {preg.note}
                              </div>
                            </div>

                            {/* NAFDAC Verification Tip */}
                            <div
                              style={{
                                background: 'var(--surface)',
                                padding: 12,
                                borderRadius: 10,
                                border: '1px solid var(--line)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                                fontSize: 12,
                                lineHeight: 1.45,
                                color: 'var(--ink-2)',
                              }}
                            >
                              <FileCheck2
                                className="w-4 h-4 shrink-0"
                                style={{ color: 'var(--brand)', marginTop: 2 }}
                              />
                              <div>
                                <b style={{ color: 'var(--ink)' }}>
                                  NAFDAC Pattern (
                                  {med.nafdacVerification.regPattern}):{' '}
                                </b>
                                {nafdacTip}
                              </div>
                            </div>

                            {/* Hospital Red Flags */}
                            <div
                              style={{
                                background: 'var(--danger-soft)',
                                border: '1px solid var(--danger)',
                                padding: 12,
                                borderRadius: 10,
                                fontSize: 12,
                                color: 'var(--ink)',
                              }}
                            >
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  fontWeight: 700,
                                  color: 'var(--danger)',
                                  marginBottom: 6,
                                }}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Stop OTC &amp; Go to Hospital Immediately If:
                              </span>
                              <ul
                                style={{
                                  margin: 0,
                                  paddingLeft: 18,
                                  lineHeight: 1.5,
                                }}
                              >
                                {redFlags.map((flag, idx) => (
                                  <li key={idx} style={{ marginBottom: 3 }}>
                                    {flag}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'verification' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* NAFDAC Verification Box */}
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--brand)',
                  borderRadius: 14,
                  padding: 16,
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <ShieldCheck
                    className="w-5 h-5"
                    style={{ color: 'var(--brand)' }}
                  />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                    How to Verify Genuine Medicines in Nigeria (NAFDAC Guide)
                  </h3>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    fontSize: 13,
                    color: 'var(--ink-2)',
                    lineHeight: 1.55,
                  }}
                >
                  {nafdacRules.map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        background: 'var(--surface-2)',
                        padding: '10px 12px',
                        borderRadius: 8,
                      }}
                    >
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        style={{ color: 'var(--brand)', marginTop: 2 }}
                      />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Safety & Antibiotic Warning */}
              <div
                style={{
                  background: 'var(--amber-soft)',
                  border: '1px solid var(--amber)',
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <AlertTriangle
                    className="w-5 h-5"
                    style={{ color: 'var(--amber)' }}
                  />
                  <h3
                    style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}
                  >
                    Critical Rules: Antibiotics, Herbal Agbo &amp; Pregnancy
                  </h3>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--ink)',
                    lineHeight: 1.55,
                  }}
                >
                  {safetyRules.map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--amber)',
                          minWidth: 18,
                        }}
                      >
                        {idx + 1}.
                      </span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free SMS verification spotlight */}
              <div
                style={{
                  background: 'var(--brand-soft)',
                  border: '1px solid var(--brand)',
                  borderRadius: 12,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: 'var(--surface)',
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand)',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  38353
                </div>
                <div style={{ flex: 1, fontSize: 12.5, color: 'var(--brand-ink)' }}>
                  <b>NAFDAC Free SMS Shortcode: 38353</b>
                  <p style={{ marginTop: 2 }}>
                    Scratch the silver panel on your pack and text the PIN to 38353
                    free of charge on MTN, Airtel, and Glo. You will receive an
                    instant confirmation from NAFDAC.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Medical Disclaimers */}
        <div
          style={{
            borderTop: '1px solid var(--line)',
            padding: '12px 20px',
            background: 'var(--surface-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <p
            style={{
              fontSize: 11.5,
              color: 'var(--muted)',
              lineHeight: 1.45,
            }}
          >
            {labels.disclaimer}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 650,
                color: 'var(--danger)',
              }}
            >
              {labels.emergencyNote}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 8, padding: '6px 16px' }}
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
