/**
 * EasyTalk Voice Command Engine
 * ─────────────────────────────
 * Listens continuously for spoken navigation commands and executes them.
 *
 * Supported commands (English & Tagalog):
 *
 *  NAVIGATION / OPEN
 *  ─────────────────
 *  "open emergency" / "emergency" / "SOS"           → open Emergency modal
 *  "open settings" / "settings" / "mga setting"     → open Settings modal
 *  "open tips" / "tips"                              → open Tips modal
 *  "listen mode" / "transcribe" / "makinig"          → open Listen/Transcribe modal
 *  "blind mode" / "touch pad" / "blind touch pad"   → open Blind Touch Pad
 *  "fullscreen" / "buong screen" / "show big"        → open Fullscreen message
 *  "custom message" / "sariling mensahe"             → open Custom Message modal
 *  "close" / "isara" / "exit" / "lumabas"           → close current modal
 *  "home" / "uwi" / "main"                          → go to home / main board
 *
 *  SPEAK / READ
 *  ────────────
 *  "speak" / "magsalita" / "read message"           → speak selected message
 *  "read screen" / "basahin" / "what's on screen"   → read a summary of the screen
 *  "stop" / "tigil" / "stop speaking"               → stop TTS
 *  "repeat" / "ulitin"                              → repeat last spoken text
 *
 *  MESSAGE SELECTION (1-6)
 *  ───────────────────────
 *  "number one" / "isa" / "one"                     → select/speak card 1
 *  ...
 *  "number six" / "anim" / "six"                    → select/speak card 6
 *
 *  LANGUAGE
 *  ────────
 *  "switch to english" / "english mode"             → switch language to English
 *  "switch to tagalog" / "tagalog mode" / "filipino"→ switch language to Tagalog
 *
 *  HELP
 *  ────
 *  "help" / "tulong" / "audio guide" / "gabay"     → play voice guide
 */

import { speakText, stopSpeech, isSystemSpeaking } from './audioUtils';
import { AppLanguage } from '../types';

export interface VoiceCommandContext {
  language: AppLanguage;
  voiceGender: 'female' | 'male';
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string;
  selectedMessage: string;
  onOpenEmergency: () => void;
  onOpenSettings: () => void;
  onOpenTips: () => void;
  onOpenListen: () => void;
  onOpenBlindTouchPad: () => void;
  onOpenFullscreen: () => void;
  onOpenCustomMessage: () => void;
  onCloseAll: () => void;
  onGoHome: () => void;
  onSpeakMessage: () => void;
  onStopSpeaking: () => void;
  onSelectCard: (index: number) => void;        // 0-based
  onSwitchLanguage: (lang: AppLanguage) => void;
  onPlayAudioGuide: () => void;
  onReadScreen: () => string;                   // returns a plain-text description
}

// ─── Regex command patterns ──────────────────────────────────────────────────

const PATTERNS: Array<{ re: RegExp; action: keyof VoiceCommandContext | 'selectCard'; cardIndex?: number }> = [
  // Emergency
  { re: /\b(emergency|sos|saklolo|pulang alarma|red alert)\b/i,            action: 'onOpenEmergency' },
  // Settings
  { re: /\b(settings|setting|mga setting|accessibility|accessibility settings)\b/i, action: 'onOpenSettings' },
  // Tips
  { re: /\b(tips|tip|mga tip|etiquette)\b/i,                               action: 'onOpenTips' },
  // Listen / Transcribe
  { re: /\b(listen mode|transcribe|live caption|makinig|speech to text|listen)\b/i, action: 'onOpenListen' },
  // Blind Touch Pad
  { re: /\b(blind mode|touch pad|blind touch|blind touch pad|bulag mode)\b/i, action: 'onOpenBlindTouchPad' },
  // Fullscreen
  { re: /\b(fullscreen|full screen|buong screen|show big|palakihin|malaking screen)\b/i, action: 'onOpenFullscreen' },
  // Custom message
  { re: /\b(custom message|sariling mensahe|my message|type message)\b/i,  action: 'onOpenCustomMessage' },
  // Close
  { re: /\b(close|isara|exit|lumabas|cancel|kansela)\b/i,                  action: 'onCloseAll' },
  // Home
  { re: /\b(home|main|uwi|main board|go home|bumalik sa home)\b/i,         action: 'onGoHome' },
  // Speak selected message
  { re: /\b(speak|magsalita|read message|sabihin|speak message)\b/i,       action: 'onSpeakMessage' },
  // Read screen
  { re: /\b(read screen|basahin|what('s| is) on (the )?screen|ano ang nasa screen|describe screen)\b/i, action: 'onReadScreen' },
  // Stop TTS
  { re: /\b(stop|tigil|stop speaking|tumigil|hinto)\b/i,                   action: 'onStopSpeaking' },
  // Repeat last
  { re: /\b(repeat|ulitin|again|sabihin ulit|pakiulit)\b/i,                action: 'onSpeakMessage' },
  // Audio guide / help
  { re: /\b(help|tulong|audio guide|gabay|voice guide|gabay sa boses)\b/i, action: 'onPlayAudioGuide' },
  // Switch to English
  { re: /\b(english mode|switch to english|english|ingles)\b/i,            action: 'onSwitchLanguage' },
  // Switch to Tagalog
  { re: /\b(tagalog mode|switch to tagalog|tagalog|filipino mode|filipino)\b/i, action: 'onSwitchLanguage' },

  // Card selection — English
  { re: /\b(number one|card one|one|press one|item one|una)\b/i,           action: 'selectCard', cardIndex: 0 },
  { re: /\b(number two|card two|two|press two|item two|dalawa)\b/i,        action: 'selectCard', cardIndex: 1 },
  { re: /\b(number three|card three|three|press three|item three|tatlo)\b/i, action: 'selectCard', cardIndex: 2 },
  { re: /\b(number four|card four|four|press four|item four|apat)\b/i,     action: 'selectCard', cardIndex: 3 },
  { re: /\b(number five|card five|five|press five|item five|lima)\b/i,     action: 'selectCard', cardIndex: 4 },
  { re: /\b(number six|card six|six|press six|item six|anim)\b/i,          action: 'selectCard', cardIndex: 5 },
];

// ─── Engine class ────────────────────────────────────────────────────────────

export class VoiceCommandEngine {
  private recognition: any = null;
  private intentActive = false;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private ctx: VoiceCommandContext | null = null;
  private lastSpokenText = '';

  /** Call this whenever context values change (selectedMessage, callbacks, etc.) */
  updateContext(ctx: VoiceCommandContext) {
    this.ctx = ctx;
  }

  get isActive() {
    return this.intentActive;
  }

  start(ctx: VoiceCommandContext) {
    this.ctx = ctx;
    this.intentActive = true;
    this.launchSession();
  }

  stop() {
    this.intentActive = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.abort();
      } catch { /* ignore */ }
      this.recognition = null;
    }
  }

  private launchSession() {
    if (!this.intentActive) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    // Clean up any previous session
    if (this.recognition) {
      try { this.recognition.onend = null; this.recognition.abort(); } catch { /* ignore */ }
      this.recognition = null;
    }

    const lang = this.ctx?.language ?? 'tl';

    try {
      const r = new SR();
      r.continuous = true;
      r.interimResults = false;
      r.maxAlternatives = 1;
      // Use tl-PH as primary; Chrome handles it better than fil-PH for commands
      r.lang = lang === 'tl' ? 'tl-PH' : 'en-US';

      r.onresult = (event: any) => {
        if (!this.ctx) return;
        // Don't process commands while device TTS is speaking
        if (isSystemSpeaking()) return;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (!event.results[i].isFinal) continue;
          const transcript = (event.results[i][0]?.transcript ?? '').trim();
          if (!transcript) continue;
          this.dispatch(transcript);
        }
      };

      r.onerror = () => { /* silent; onend will restart */ };

      r.onend = () => {
        if (this.intentActive) {
          this.restartTimer = setTimeout(() => {
            if (this.intentActive) this.launchSession();
          }, 300);
        }
      };

      this.recognition = r;
      r.start();
    } catch {
      // SpeechRecognition not available; fail silently
    }
  }

  private speak(text: string) {
    if (!this.ctx) return;
    this.lastSpokenText = text;

    // Pause recognition while we speak the response so the mic doesn't
    // pick up the TTS output as a new command.
    if (this.recognition) {
      try { this.recognition.onend = null; this.recognition.abort(); } catch { /* ignore */ }
      this.recognition = null;
    }

    speakText(text, {
      language: this.ctx.language,
      voiceGender: this.ctx.voiceGender,
      rate: this.ctx.rate,
      pitch: this.ctx.pitch,
      volume: this.ctx.volume,
      voiceURI: this.ctx.voiceURI,
      onEnd: () => {
        // Resume listening 1 s after TTS finishes
        if (this.intentActive) {
          this.restartTimer = setTimeout(() => {
            if (this.intentActive) this.launchSession();
          }, 1000);
        }
      },
    });
  }

  private dispatch(transcript: string) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const isTl = ctx.language === 'tl';

    // Test each pattern in order; first match wins
    for (const { re, action, cardIndex } of PATTERNS) {
      if (!re.test(transcript)) continue;

      switch (action) {
        case 'onOpenEmergency':
          ctx.onOpenEmergency();
          this.speak(isTl ? 'Binubuksan ang emergency.' : 'Opening emergency.');
          break;

        case 'onOpenSettings':
          ctx.onOpenSettings();
          this.speak(isTl ? 'Binubuksan ang mga setting.' : 'Opening settings.');
          break;

        case 'onOpenTips':
          ctx.onOpenTips();
          this.speak(isTl ? 'Binubuksan ang mga tip.' : 'Opening tips.');
          break;

        case 'onOpenListen':
          ctx.onOpenListen();
          this.speak(isTl ? 'Binubuksan ang Listen Mode.' : 'Opening Listen Mode.');
          break;

        case 'onOpenBlindTouchPad':
          ctx.onOpenBlindTouchPad();
          this.speak(isTl ? 'Binubuksan ang Blind Touch Pad.' : 'Opening Blind Touch Pad.');
          break;

        case 'onOpenFullscreen':
          ctx.onOpenFullscreen();
          this.speak(isTl ? 'Pinalaki ang mensahe.' : 'Showing fullscreen message.');
          break;

        case 'onOpenCustomMessage':
          ctx.onOpenCustomMessage();
          this.speak(isTl ? 'Binubuksan ang sariling mensahe.' : 'Opening custom message.');
          break;

        case 'onCloseAll':
          ctx.onCloseAll();
          this.speak(isTl ? 'Isinasara.' : 'Closing.');
          break;

        case 'onGoHome':
          ctx.onGoHome();
          this.speak(isTl ? 'Bumabalik sa home.' : 'Going to home.');
          break;

        case 'onSpeakMessage':
          ctx.onSpeakMessage();
          // onSpeakMessage handles its own TTS; don't double-speak
          break;

        case 'onReadScreen': {
          const description = ctx.onReadScreen();
          this.speak(description);
          break;
        }

        case 'onStopSpeaking':
          stopSpeech();
          // Brief confirmation without full TTS to avoid re-triggering
          break;

        case 'onPlayAudioGuide':
          ctx.onPlayAudioGuide();
          break;

        case 'onSwitchLanguage': {
          const toEnglish = /\b(english|ingles)\b/i.test(transcript);
          const toLang: AppLanguage = toEnglish ? 'en' : 'tl';
          ctx.onSwitchLanguage(toLang);
          // Confirmation will come from the language toggle handler in App.tsx
          break;
        }

        case 'selectCard':
          if (cardIndex !== undefined) {
            ctx.onSelectCard(cardIndex);
          }
          break;
      }

      // Only dispatch one command per utterance
      return;
    }
  }
}

// Singleton instance — shared across the app lifecycle
export const voiceEngine = new VoiceCommandEngine();
