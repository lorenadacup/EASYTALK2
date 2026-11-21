import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Users,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Keyboard,
  Mic,
  Smartphone,
  AlertTriangle,
  Sliders,
  Globe,
  Compass,
} from 'lucide-react';
import { CONDITIONS_DATA, CONDITIONS_DATA_TL } from '../data/conditionsData';
import { DisabilityConditionId, AppLanguage } from '../types';
import { speakText } from '../utils/audioUtils';
import {
  BlindnessAvatar,
  DeafnessAvatar,
  MobilityAvatar,
  SpeechAvatar,
  AutismAvatar,
  CognitiveAvatar,
} from './ConditionAvatars';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConditionId?: DisabilityConditionId;
  language?: AppLanguage;
}

type MainTab = 'etiquette' | 'website';

export const TipsModal: React.FC<TipsModalProps> = ({
  isOpen,
  onClose,
  initialConditionId = 'deafness',
  language = 'tl',
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('etiquette');
  const [selectedConditionId, setSelectedConditionId] = useState<DisabilityConditionId>(initialConditionId);
  const [modalLang, setModalLang] = useState<AppLanguage>(language);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (initialConditionId) {
      setSelectedConditionId(initialConditionId);
    }
  }, [initialConditionId]);

  useEffect(() => {
    if (language) {
      setModalLang(language);
    }
  }, [language]);

  // Stop speaking when modal closes
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isTl = modalLang === 'tl';
  const conditionsSource = isTl ? CONDITIONS_DATA_TL : CONDITIONS_DATA;
  const currentCondition = conditionsSource[selectedConditionId] || conditionsSource.deafness;

  const conditionList: { id: DisabilityConditionId; label: string; icon: string }[] = isTl
    ? [
        { id: 'deafness', label: 'Bingi (Deaf)', icon: '🦻' },
        { id: 'mobility', label: 'Pagkilos (Mobility)', icon: '🧑‍🦽' },
        { id: 'speech', label: 'Pagsasalita (Speech)', icon: '💬' },
        { id: 'autism', label: 'Autism', icon: '🧩' },
        { id: 'cognitive', label: 'Pag-unawa (Cognitive)', icon: '🧠' },
        { id: 'blindness', label: 'Bulag (Blind)', icon: '🦯' },
      ]
    : [
        { id: 'deafness', label: 'Deaf', icon: '🦻' },
        { id: 'mobility', label: 'Mobility Impairment', icon: '🧑‍🦽' },
        { id: 'speech', label: 'Speech Impairment', icon: '💬' },
        { id: 'autism', label: 'Autism', icon: '🧩' },
        { id: 'cognitive', label: 'Cognitive Impairment', icon: '🧠' },
        { id: 'blindness', label: 'Blind', icon: '🦯' },
      ];

  const renderAvatar = (id: DisabilityConditionId) => {
    switch (id) {
      case 'blindness':
        return <BlindnessAvatar size={68} />;
      case 'deafness':
        return <DeafnessAvatar size={68} />;
      case 'mobility':
        return <MobilityAvatar size={68} />;
      case 'speech':
        return <SpeechAvatar size={68} />;
      case 'autism':
        return <AutismAvatar size={68} />;
      case 'cognitive':
        return <CognitiveAvatar size={68} />;
      default:
        return <DeafnessAvatar size={68} />;
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = '';

    if (activeTab === 'etiquette') {
      const tipsJoined = currentCondition.etiquetteTips.join('. ');
      const waysJoined = currentCondition.communicationWays.join('. ');
      textToSpeak = isTl
        ? `Gabay sa pakikipag-usap sa ${currentCondition.name}. ${currentCondition.overview}. Mga mahahalagang alituntunin: ${tipsJoined}. Mga paraan ng komunikasyon: ${waysJoined}.`
        : `Communication etiquette for ${currentCondition.name}. ${currentCondition.overview}. Key guidelines: ${tipsJoined}. Ways they express themselves: ${waysJoined}.`;
    } else {
      textToSpeak = isTl
        ? 'Gabay sa paggamit ng EasyTalk website. Gamitin ang numerong 1 hanggang 6 sa keyboard para sa mabilisang parirala. Spacebar para ulitin ang boses. Letrang B para sa Blind mode. Para sa Bingi, gamitin ang Live Voice Transcriber. Pindutin ang Show Big para sa full-screen flashcard.'
        : 'EasyTalk website guide. Press number keys 1 to 6 on your keyboard for quick phrases. Spacebar to repeat audio. Letter B for Blind mode. For Deaf users, use the Live Voice Transcriber. Click Show Big for full-screen flashcards.';
    }

    setIsSpeaking(true);
    speakText(textToSpeak, {
      language: modalLang,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isTl ? 'Gabay at Kagandahang-Asal sa Komunikasyon' : 'Communication Etiquette and Tips'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border-2 border-sky-300 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-[#0F3E76] shrink-0">
              <Users className="w-5 h-5 text-[#0F3E76]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-[#0F3E76] leading-tight truncate">
                {isTl ? 'Gabay at Kagandahang-Asal sa Komunikasyon' : 'Communication Etiquette & Platform Tips'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {isTl
                  ? 'Madaling gabay para sa tagapag-alaga, pamilya, at paggamit ng EasyTalk'
                  : 'Practical etiquette and accessibility navigation for caregivers & allies'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Read Aloud Button */}
            <button
              onClick={handleToggleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-sky-100 hover:bg-sky-200 text-[#0F3E76]'
              }`}
              title={isSpeaking ? (isTl ? 'Itigil ang boses' : 'Stop voice') : (isTl ? 'Pakinggan ang gabay' : 'Read tips aloud')}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {isSpeaking ? (isTl ? 'Itigil' : 'Stop') : (isTl ? 'Pakinggan' : 'Read Aloud')}
              </span>
            </button>

            {/* Language Switcher Pill */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setModalLang('tl')}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  isTl ? 'bg-[#0F3E76] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Filipino / Tagalog"
              >
                🇵🇭 TL
              </button>
              <button
                onClick={() => setModalLang('en')}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  !isTl ? 'bg-[#0F3E76] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English"
              >
                🇺🇸 EN
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2 Main Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-sky-50 rounded-2xl border border-sky-200">
          <button
            onClick={() => setActiveTab('etiquette')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'etiquette'
                ? 'bg-[#0F3E76] text-white shadow-md'
                : 'text-[#0F3E76] hover:bg-sky-100'
            }`}
          >
            <Heart className="w-4 h-4 fill-current text-rose-400" />
            <span>{isTl ? 'Gabay sa Pakikitungo (Etiquette)' : 'PWD Etiquette & Care'}</span>
          </button>

          <button
            onClick={() => setActiveTab('website')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'website'
                ? 'bg-[#0F3E76] text-white shadow-md'
                : 'text-[#0F3E76] hover:bg-sky-100'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>{isTl ? 'Gabay sa Website (Shortcuts & Features)' : 'How to Use EasyTalk'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'etiquette' ? (
            <>
              {/* Condition Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {conditionList.map((cond) => {
                  const isSelected = selectedConditionId === cond.id;
                  return (
                    <button
                      key={cond.id}
                      onClick={() => setSelectedConditionId(cond.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#0F3E76] text-white border-[#0F3E76] shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-sky-50 border-slate-200'
                      }`}
                    >
                      <span>{cond.icon}</span>
                      <span>{cond.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Condition Overview Hero */}
              <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-white rounded-2xl p-4 border border-sky-200 flex items-center gap-4">
                <div className="shrink-0 transition-transform hover:scale-105 duration-200">
                  {renderAvatar(currentCondition.id)}
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0F3E76] text-white text-[11px] font-bold mb-1 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{currentCondition.name}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F3E76] leading-snug">
                    {currentCondition.kicker}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {currentCondition.overview}
                  </p>
                </div>
              </div>

              {/* Key Etiquette Guidelines */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isTl
                      ? 'Mahahalagang Alituntunin at Kagandahang-Asal'
                      : 'Key Etiquette & Respectful Guidelines'}
                  </span>
                </h4>
                <div className="space-y-2">
                  {currentCondition.etiquetteTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-sky-50/50 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication Channels */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-black text-[#0F3E76] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>
                    {isTl
                      ? 'Mga Epektibong Paraan ng Pakikipag-ugnayan'
                      : 'Effective Communication Channels'}
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentCondition.communicationWays.map((way, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs font-semibold text-slate-800 flex items-start gap-2"
                    >
                      <span className="text-sky-600 font-bold shrink-0">•</span>
                      <span className="leading-snug">{way}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden Rule Callout */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center gap-3 text-xs sm:text-sm text-amber-950 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-current text-rose-500" />
                </div>
                <p className="font-semibold leading-relaxed">
                  {isTl
                    ? 'Gintong Paalala: Laging direktang kausapin ang tao nang nakaharap, bago ang kanilang kasama o caregiver. Irespeto ang kanilang kalayaan at kakayahan.'
                    : 'Golden Rule: Always speak directly to the person first facing them, not solely to their companion. Respect their autonomy and dignity.'}
                </p>
              </div>
            </>
          ) : (
            /* TAB 2: EasyTalk Platform & Accessibility Shortcuts Guide */
            <div className="space-y-3">
              {/* Intro Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 to-[#0F3E76] text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h3 className="text-sm font-extrabold">
                    {isTl ? 'Mabilisang Gabay sa Paggamit ng EasyTalk' : 'EasyTalk Feature & Shortcut Guide'}
                  </h3>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  {isTl
                    ? 'Binuo ang EasyTalk upang maging mabilis, naa-access, at maasahan gamit ang keyboard, boses, o touch screen.'
                    : 'Designed for barrier-free communication using hotkeys, live speech-to-text, touch screens, and audio synthesis.'}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Keyboard Shortcuts */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5 text-[#0F3E76]">
                    <Keyboard className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {isTl ? 'Mga Shortcut sa Keyboard' : 'Keyboard Hotkeys'}
                    </h4>
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-700">
                    <li className="flex items-center justify-between">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                        1 – 6
                      </span>
                      <span className="text-slate-600">
                        {isTl ? 'Piliin ang Parirala 1–6' : 'Select phrase 1–6'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                        Spacebar
                      </span>
                      <span className="text-slate-600">
                        {isTl ? 'Muling iparinig ang boses' : 'Repeat spoken audio'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                        B
                      </span>
                      <span className="text-slate-600">
                        {isTl ? 'Buksan ang Blind Touch Pad' : 'Open Blind Audio Gate'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                        0 / Tab
                      </span>
                      <span className="text-slate-600">
                        {isTl ? 'Palit kategorya sa Blind Pad' : 'Switch category in Blind Pad'}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                        Esc
                      </span>
                      <span className="text-slate-600">
                        {isTl ? 'Isara ang bukas na popup' : 'Close active dialog'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 2. Live Voice Transcriber (Deaf) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5 text-[#0F3E76]">
                    <Mic className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {isTl ? 'Live Transcriber (Para sa Bingi)' : 'Live Voice Transcriber'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTl
                      ? 'Pindutin ang "Pakinggan ang Kausap". Magsalita sa mic at kusang lilitaw ang mga salita sa malaking text. May input box din para makapag-type kapag maingay.'
                      : 'Click "Record & Transcribe". Speak into the microphone and real-time captions appear in large text. Includes companion typing for noisy areas.'}
                  </p>
                </div>

                {/* 3. PWD vs Caregiver Mode */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5 text-[#0F3E76]">
                    <Users className="w-4 h-4 text-sky-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {isTl ? 'PWD vs Tagapag-alaga (Role Toggle)' : 'PWD vs Caregiver Toggle'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTl
                      ? 'Lumipat sa itaas: PWD Mode para sa sariling pangangailangan ("Gusto kong kumain"), o Tagapag-alaga Mode para sa mga nag-aalalay ("Gusto mo bang kumain?").'
                      : 'Toggle at top: PWD Mode for self-expression ("I want food"), or Caregiver Mode for asking questions & assistance ("Would you like some food?").'}
                  </p>
                </div>

                {/* 4. Show Big (Full Screen Flashcard) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5 text-[#0F3E76]">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {isTl ? 'Show Big (Full-Screen Flashcard)' : 'Full-Screen Flashcards'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTl
                      ? 'Pindutin ang "Show Big" sa ilalim ng napiling mensahe upang palakihin ito sa buong screen—perpekto para ipakita sa tindero, doktor, o drayber.'
                      : 'Click "Show Big" below the selected message to blow up text to full-screen size—ideal for showing store cashiers, doctors, or drivers.'}
                  </p>
                </div>

                {/* 5. Blind Touch Pad & Audio Gate */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5 text-[#0F3E76]">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {isTl ? 'Blind Mode (Tactile Audio Pad)' : 'Blind Tactile Audio Touch Pad'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTl
                      ? 'Hiwalay na audio-first interface na may synthetic tactile feedback, voice readout, at 3 kategorya (Pangangailangan, Paligid, Kasama).'
                      : 'Dedicated audio-first modal with synthesized tactile audio clicks, loud spoken confirmation, and 3 audio categories (Needs, Navigation, Companion).'}
                  </p>
                </div>

                {/* 6. Emergency SOS & Settings */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1.5 text-[#0F3E76]">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {isTl ? 'Emergency SOS at Voice Settings' : 'Emergency SOS & Settings'}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isTl
                      ? 'Pindutin ang pulang Emergency button para sa malakas na alarma. Sa Settings (⚙️), maaaring i-adjust ang bilis, tono, at boses ng lalaki o babae.'
                      : 'Trigger instant loud emergency siren & spoken alerts. In Settings (⚙️), adjust voice pitch, speech speed rate, and select male or female voices.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-sky-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            {isTl ? 'EasyTalk para sa pantay na komunikasyon 💙' : 'EasyTalk: Empowering Dignity & Inclusion 💙'}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#0F3E76] hover:bg-[#0A2D57] text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer ml-auto active:scale-95"
          >
            {isTl ? 'Naintindihan ko' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
