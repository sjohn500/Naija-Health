import React from 'react';
import { 
  HeartPulse, 
  AlertTriangle, 
  Building2, 
  BookOpen, 
  MapPin, 
  PhoneCall, 
  ShieldCheck 
} from 'lucide-react';
import { NIGERIAN_STATES_DATA } from '../data/nigeriaHealthcareData';

interface HeaderProps {
  selectedState: string;
  onSelectState: (state: string) => void;
  onOpenEmergency: () => void;
  onOpenHospitals: () => void;
  onOpenFirstAid: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedState,
  onSelectState,
  onOpenEmergency,
  onOpenHospitals,
  onOpenFirstAid
}) => {
  const states = Object.keys(NIGERIAN_STATES_DATA);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top emergency hotline marquee bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-200">Nigeria Medical Triage Active</span>
          <span className="text-emerald-400/60 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-emerald-300/90">Supporting 36 States + FCT Abuja</span>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="tel:112" 
            className="flex items-center gap-1.5 font-bold text-red-300 hover:text-white bg-red-950/80 hover:bg-red-900/90 px-2.5 py-0.5 rounded-full border border-red-800/60 transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-red-400" />
            <span>National 112</span>
          </a>
          <a 
            href="tel:6232" 
            className="hidden md:flex items-center gap-1.5 font-medium text-emerald-200 hover:text-white bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-800 transition-colors"
          >
            <span>NCDC 6232</span>
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand identity with Nigerian green-white-green flag accent */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-700 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 font-display">
                NaijaHealth <span className="text-emerald-600">AI</span>
              </h1>
              <div className="flex items-center border border-emerald-300 rounded overflow-hidden h-3.5 shadow-2xs" title="Federal Republic of Nigeria">
                <div className="w-2.5 h-full bg-emerald-600"></div>
                <div className="w-2.5 h-full bg-white"></div>
                <div className="w-2.5 h-full bg-emerald-600"></div>
              </div>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">
              Empathetic Triage & Healthcare Navigation
            </p>
          </div>
        </div>

        {/* State Selector & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Location Picker */}
          <div className="relative flex items-center bg-stone-100 hover:bg-stone-200/80 transition-colors border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
            <select
              aria-label="Select your state in Nigeria"
              value={selectedState}
              onChange={(e) => onSelectState(e.target.value)}
              className="bg-transparent pr-2 font-semibold text-stone-800 focus:outline-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st} State
                </option>
              ))}
            </select>
          </div>

          {/* Quick First Aid Guide Button */}
          <button
            onClick={onOpenFirstAid}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 text-xs font-semibold transition-all"
            title="First-aid guides (ORS, Tepid Sponging, Bleeding)"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>First-Aid Guides</span>
          </button>

          {/* Hospitals Directory Button */}
          <button
            onClick={onOpenHospitals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 text-xs font-semibold transition-all"
            title="View General Hospitals and Teaching Hospitals in Nigeria"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Hospital Directory</span>
            <span className="sm:hidden">Hospitals</span>
          </button>

          {/* Emergency Alert Button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-600/30 transition-all active:scale-95"
            title="Check severe emergency red-flag symptoms"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>Red-Flag Alert</span>
          </button>
        </div>
      </div>
    </header>
  );
};
