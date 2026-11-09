import React from 'react';
import { 
  HeartPulse, 
  AlertTriangle, 
  Building2, 
  BookOpen, 
  MapPin, 
  PhoneCall, 
  Globe,
  Share2,
  Check
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/triage';

interface HeaderProps {
  selectedState: string;
  onSelectState: (state: string) => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenEmergency: () => void;
  onOpenHospitals: () => void;
  onOpenFirstAid: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedState,
  onSelectState,
  selectedLanguage,
  onSelectLanguage,
  onOpenEmergency,
  onOpenHospitals,
  onOpenFirstAid
}) => {
  const [copied, setCopied] = React.useState(false);
  const states = Object.keys(NIGERIAN_STATES_DATA);

  const handleCopyAppUrl = () => {
    const url = window.location.href.split('?')[0];
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Subtle National Accent Line: Green-White-Green */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 h-full bg-[#008751]" />
        <div className="w-1/3 h-full bg-white" />
        <div className="w-1/3 h-full bg-[#008751]" />
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#008751] text-white shadow-xs">
            <HeartPulse className="w-5 h-5 text-emerald-100" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#008751] flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-[#008751]" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-stone-900 font-display">
                NaijaHealth <span className="text-[#008751]">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-[#008751] text-[10px] font-bold border border-emerald-200/80 tracking-wide uppercase">
                Federal Health Triage
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
              Empathetic Medical Navigation • Nigeria
            </p>
          </div>
        </div>

        {/* Global Controls & Emergency CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 transition-colors shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-[#008751] mr-1.5 shrink-0" />
            <select
              aria-label="Select Language"
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* State / Location Selector */}
          <div className="relative flex items-center bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 transition-colors shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#008751] mr-1.5 shrink-0" />
            <select
              aria-label="Select your state in Nigeria"
              value={selectedState}
              onChange={(e) => onSelectState(e.target.value)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer max-w-[95px] sm:max-w-none truncate pr-1"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st} State
                </option>
              ))}
            </select>
          </div>

          {/* Hospitals Directory */}
          <button
            onClick={onOpenHospitals}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:text-[#008751] hover:border-emerald-300 hover:bg-emerald-50/40 text-xs font-semibold transition-all"
            title="Browse verified Nigerian General and Teaching Hospitals"
          >
            <Building2 className="w-3.5 h-3.5 text-[#008751]" />
            <span>Hospitals</span>
          </button>

          {/* First-Aid Quick Guides */}
          <button
            onClick={onOpenFirstAid}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:text-[#008751] hover:border-emerald-300 hover:bg-emerald-50/40 text-xs font-semibold transition-all"
            title="Safe First Aid Protocols (ORS, Tepid Sponging)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#008751]" />
            <span>First Aid</span>
          </button>

          {/* Share App Link Button */}
          <button
            onClick={handleCopyAppUrl}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200/90 hover:border-emerald-300 hover:bg-emerald-50/50 text-stone-700 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Copy your app URL to share with others"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#008751]" />
                <span className="hidden sm:inline">Share App</span>
                <span className="sm:hidden">Share</span>
              </>
            )}
          </button>

          {/* Red-Flag Emergency Button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Emergency Red-Flag Danger Signs and 112 Hotline"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Emergency (112)</span>
            <span className="sm:hidden">112</span>
          </button>
        </div>
      </div>
    </header>
  );
};
