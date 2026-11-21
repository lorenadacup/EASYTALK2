import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  playCardSound,
  playSuccessChime,
  playEmergencyAlert,
  triggerHapticFeedback,
  speakText,
  isSystemSpeaking,
} from '../utils/audioUtils';
import { VoiceSettings, QuickMessage } from '../types';
import {
  EyeOff,
  X,
  Volume2,
  Hand,
  Layers,
  AlertOctagon,
  Mic,
  MicOff,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

interface BlindTouchPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
  onSelectMessage: (text: string, iconName?: string) => void;
  onBackToGate?: () => void;
  onTriggerSOS?: () => void;
}

interface BlindCategory {
  id: string;
  nameTl: string;
  nameEn: string;
  announcementTl: string;
  announcementEn: string;
  itemsTl: QuickMessage[];
  itemsEn: QuickMessage[];
}

export const BLIND_CATEGORIES: BlindCategory[] = [
  {
    id: 'needs',
    nameTl: '1. Pangangailangan (Needs)',
    nameEn: '1. Daily Needs',
    announcementTl: 'Kategorya: Pangunahing Pangangailangan. Tulong, Pagkain, Tubig, Pakiramdam, Pag-uwi, at Banyo.',
    announcementEn: 'Category: Daily Needs. Assistance, Food, Water, Unwell, Home, and Restroom.',
    itemsTl: [
      { id: 'bn-1', text: 'Kailangan ko ng tulong', iconName: 'assistance', category: 'core' },
      { id: 'bn-2', text: 'Gusto kong kumain', iconName: 'food', category: 'core' },
      { id: 'bn-3', text: 'Kailangan ko ng tubig', iconName: 'water', category: 'core' },
      { id: 'bn-4', text: 'Masama ang pakiramdam ko', iconName: 'unwell', category: 'medical' },
      { id: 'bn-5', text: 'Gusto ko nang umuwi', iconName: 'home', category: 'core' },
      { id: 'bn-6', text: 'Kailangan kong gumamit ng banyo', iconName: 'toilet', category: 'needs' },
    ],
    itemsEn: [
      { id: 'bn-1', text: 'I need assistance', iconName: 'assistance', category: 'core' },
      { id: 'bn-2', text: 'I want food', iconName: 'food', category: 'core' },
      { id: 'bn-3', text: 'I need water', iconName: 'water', category: 'core' },
      { id: 'bn-4', text: 'I feel unwell', iconName: 'unwell', category: 'medical' },
      { id: 'bn-5', text: 'I want to go home', iconName: 'home', category: 'core' },
      { id: 'bn-6', text: 'I need to use the restroom', iconName: 'toilet', category: 'needs' },
    ],
  },
  {
    id: 'navigation',
    nameTl: '2. Paligid at Gabay (Guiding)',
    nameEn: '2. Surroundings & Navigation',
    announcementTl: 'Kategorya: Paligid at Pag-akay. Paglalarawan ng paligid, paggabay sa labasan, pagbasa ng menu, at mga harang.',
    announcementEn: 'Category: Surroundings & Guiding. Describe surroundings, guide to exit, read menu, and check obstacles.',
    itemsTl: [
      { id: 'bg-1', text: 'Pakiusap ilarawan ang nasa paligid ko', iconName: 'listen', category: 'navigation' },
      { id: 'bg-2', text: 'Maaari mo ba akong akayin sa labasan o banyo?', iconName: 'navigation', category: 'navigation' },
      { id: 'bg-3', text: 'Pakibasa po nang malakas ang nakasulat o menu para sa akin', iconName: 'assistance', category: 'needs' },
      { id: 'bg-4', text: 'Mayroon bang hakbang, hagdan, o harang sa harap ko?', iconName: 'navigation', category: 'navigation' },
      { id: 'bg-5', text: 'Pakilagay po ang kamay ko sa hawakan ng pinto o upuan', iconName: 'needs', category: 'needs' },
      { id: 'bg-6', text: 'May tao po bang nakatayo malapit sa akin?', iconName: 'listen', category: 'navigation' },
    ],
    itemsEn: [
      { id: 'bg-1', text: 'Please describe what is around me', iconName: 'listen', category: 'navigation' },
      { id: 'bg-2', text: 'Can you guide me to the exit or restroom?', iconName: 'navigation', category: 'navigation' },
      { id: 'bg-3', text: 'Please read the text or menu aloud for me', iconName: 'assistance', category: 'needs' },
      { id: 'bg-4', text: 'Is there a step, stair, or obstacle in front of me?', iconName: 'navigation', category: 'navigation' },
      { id: 'bg-5', text: 'Please place my hand on the door handle or seat', iconName: 'needs', category: 'needs' },
      { id: 'bg-6', text: 'Is there someone standing near me?', iconName: 'listen', category: 'navigation' },
    ],
  },
  {
    id: 'companion',
    nameTl: '3. Kasama / Gabay (Companion)',
    nameEn: '3. Companion to Blind',
    announcementTl: 'Kategorya: Kasama o Gabay. Mga mensahe para akayin at gabayan ang taong may kapansanan sa paningin.',
    announcementEn: 'Category: Companion Guiding. Messages to safely assist and speak to a blind person.',
    itemsTl: [
      { id: 'bc-1', text: 'Nakatayo ako sa mismong tapat mo', iconName: 'listen', category: 'navigation' },
      { id: 'bc-2', text: 'Hawakan mo ang siko ko, aakayin kita nang ligtas', iconName: 'assistance', category: 'navigation' },
      { id: 'bc-3', text: 'May mga hakbang sa unahan, mag-ingat po sa paghakbang', iconName: 'navigation', category: 'navigation' },
      { id: 'bc-4', text: 'Ang pinto at upuan ay nasa iyong kanang bahagi', iconName: 'navigation', category: 'navigation' },
      { id: 'bc-5', text: 'Hayaan mong basahin ko nang malakas ang nakasulat para sa iyo', iconName: 'assistance', category: 'needs' },
      { id: 'bc-6', text: 'Sandali lang akong lalayo, babalik ako kaagad', iconName: 'listen', category: 'navigation' },
    ],
    itemsEn: [
      { id: 'bc-1', text: 'I am standing right in front of you', iconName: 'listen', category: 'navigation' },
      { id: 'bc-2', text: 'Take my arm, I will guide you safely', iconName: 'assistance', category: 'navigation' },
      { id: 'bc-3', text: 'There are steps ahead, please step carefully', iconName: 'navigation', category: 'navigation' },
      { id: 'bc-4', text: 'The door and seat are right on your right side', iconName: 'navigation', category: 'navigation' },
      { id: 'bc-5', text: 'Let me read this document or menu out loud for you', iconName: 'assistance', category: 'needs' },
      { id: 'bc-6', text: 'I am stepping away for a moment, I will be right back', iconName: 'listen', category: 'navigation' },
    ],
  },
];

const EMERGENCY_TRIGGER_REGEX = /\b(saklolo|saklolohan|tulungan niyo ako|tulungan mo ako|emergency|help me|call 911|tawagan ang 911)\b/i;

export const BlindTouchPadModal: React.FC<BlindTouchPadModalProps> = ({
  isOpen,
  onClose,
  voiceSettings,
  onSelectMessage,
  onBackToGate,
  onTriggerSOS,
}) => {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setIsHolding] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [lastDetectedKeyword, setLastDetectedKeyword] = useState<string | null>(null);

  const lastSpokenIndexRef = useRef<number>(-1);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningIntentRef = useRef<boolean>(false);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);
  const openedAtRef = useRef<number>(Date.now());

  // --- Shake to SOS ---
  const shakeTimestampsRef = useRef<number[]>([]);
  const lastShakeAlertRef = useRef<number>(0);

  // --- 5-Tap SOS ---
  const tapTimestampsRef = useRef<number[]>([]);

  // --- Periodic voice reminder ---
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2x voice detection guard ---
  // SOS only triggers when trigger word is heard 2+ times within 4 seconds
  const voiceTriggerTimestampsRef = useRef<number[]>([]);

  const isTl = voiceSettings.language === 'tl';
  const currentCategory = BLIND_CATEGORIES[categoryIndex];
  const activeItems = isTl ? currentCategory.itemsTl : currentCategory.itemsEn;

  // Trigger Emergency SOS with loud, reassuring feedback for the blind user (1-time guard)
  const handleTriggerEmergency = useCallback(
    (reason: string) => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      setTimeout(() => {
        hasTriggeredRef.current = false;
      }, 5000);

      triggerHapticFeedback([120, 60, 120, 60, 300]);
      playEmergencyAlert();

      // Sanitized spoken announcement: never say "saklolo" or "emergency" out loud
      // so the microphone does not re-hear and loop the trigger!
      const announcement = isTl
        ? 'Binubuksan ang pulang alarma ngayon.'
        : 'Opening urgent alarm now.';

      speakText(announcement, {
        rate: 1.05,
        pitch: 1.15,
        volume: 1.0,
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
        onEnd: () => {
          if (onTriggerSOS) {
            onTriggerSOS();
          }
        },
      });

      // Direct fallback to ensure SOS modal opens even if speech synthesis stalls
      setTimeout(() => {
        if (onTriggerSOS) {
          onTriggerSOS();
        }
      }, 1000);
    },
    [isTl, voiceSettings, onTriggerSOS]
  );

  // Announce the active phrase
  const announceItem = useCallback(
    (index: number, fullAnnouncement = false) => {
      const item = activeItems[index];
      if (!item) return;

      lastSpokenIndexRef.current = index;
      triggerHapticFeedback(45);
      playCardSound(item.iconName);

      const phraseToSpeak = fullAnnouncement ? `${index + 1}: ${item.text}` : item.text;

      speakText(phraseToSpeak, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        voiceURI: voiceSettings.voiceURI,
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
      });

      onSelectMessage(item.text, item.iconName);
    },
    [voiceSettings, activeItems, onSelectMessage]
  );

  // Switch category with clear loud audio feedback
  const switchCategory = useCallback(
    (newIndex: number) => {
      const idx = (newIndex + BLIND_CATEGORIES.length) % BLIND_CATEGORIES.length;
      setCategoryIndex(idx);
      setCurrentIndex(0);
      lastSpokenIndexRef.current = -1;

      triggerHapticFeedback([60, 60, 100]);
      playSuccessChime();

      const nextCat = BLIND_CATEGORIES[idx];
      const announcement = isTl ? nextCat.announcementTl : nextCat.announcementEn;

      speakText(announcement, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        voiceURI: voiceSettings.voiceURI,
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
      });
    },
    [isTl, voiceSettings]
  );

  // Play full spoken instructions guide
  const playVoiceGuide = useCallback(() => {
    triggerHapticFeedback([50, 50, 100]);
    playSuccessChime();

    const guide = isTl
      ? 'Gabay sa boses para sa may kapansanan sa paningin. Pindutin ang numero 1 hanggang 6 sa keyboard para sa mga mensahe. Pindutin ang 0 para magpalit ng kategorya. Pindutin ang letrang E o numerong 9 para sa pulang alarma. Para sa agarang tulong, ugayin ang telepono ng tatlong beses, o mag-tap ng limang beses kahit saan sa screen.'
      : 'Audio guide for blind users. Press keys 1 through 6 to speak phrases. Press 0 to switch categories. Press E or 9 for urgent alarm. For urgent help, shake your phone three times, or tap the screen five times quickly.';

    speakText(guide, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  }, [isTl, voiceSettings]);

  // Set up continuous SpeechRecognition for emergency wake words ("Saklolo", "Tulong", "Emergency", "Help")
  useEffect(() => {
    if (!isOpen) {
      isListeningIntentRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      setMicActive(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicActive(false);
      return;
    }

    isListeningIntentRef.current = true;

    const startListener = () => {
      if (!isListeningIntentRef.current) return;

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = isTl ? 'fil-PH' : 'en-US';

        recognition.onstart = () => {
          setMicActive(true);
        };

        recognition.onresult = (event: any) => {
          if (hasTriggeredRef.current) return;

          // Guard 1: Ignore first 2.5 seconds after modal opens (avoid startup noise)
          if (Date.now() - openedAtRef.current < 2500) return;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            // Only process final recognized phrases, not noisy interim guesses
            if (!event.results[i].isFinal) continue;

            const transcript = event.results[i][0]?.transcript?.trim().toLowerCase() || '';
            if (!transcript) continue;

            // Guard 2: Block close/exit/okay commands while TTS is speaking
            // (prevent TTS echo from triggering false closes)
            if (isSystemSpeaking()) {
              // But still allow emergency SOS trigger even during TTS!
              const isEmergencyCrying = EMERGENCY_TRIGGER_REGEX.test(transcript);
              if (isEmergencyCrying) {
                setLastDetectedKeyword('saklolo');
                handleTriggerEmergency(`voice: "${transcript}"`);
              }
              return;
            }

            // Check if user says "i'm okay" or "cancel"
            if (/\b(cancel|kansela|i'm okay|im okay|i am okay|okay lang ako|ayos na ako|ligtas na ako)\b/i.test(transcript)) {
              hasTriggeredRef.current = false;
              playSuccessChime();
              speakText(isTl ? 'Naiintindihan ko, ligtas ka.' : 'Understood, glad you are okay.', {
                language: voiceSettings.language,
                voiceGender: voiceSettings.voiceGender,
              });
              return;
            }

            // Check if user says "close" or "exit"
            if (/\b(close|exit|umalis|isara)\b/i.test(transcript)) {
              playSuccessChime();
              onClose();
              return;
            }

            // ── DOUBLE-DETECTION GUARD ──────────────────────────────────────
            // SOS only fires when trigger word is heard 2 or more times
            // within a 4-second window. This prevents a single accidental
            // mention (e.g. from TTS instructions) from firing the alarm.
            const isEmergencyCrying = EMERGENCY_TRIGGER_REGEX.test(transcript);

            if (isEmergencyCrying) {
              const now = Date.now();
              // Add this detection timestamp
              voiceTriggerTimestampsRef.current.push(now);
              // Keep only detections within last 4 seconds
              voiceTriggerTimestampsRef.current = voiceTriggerTimestampsRef.current.filter(
                (t) => now - t < 4000
              );

              const detectionCount = voiceTriggerTimestampsRef.current.length;

              if (detectionCount >= 2) {
                // Confirmed: user genuinely calling for help (said it 2+ times)
                voiceTriggerTimestampsRef.current = [];
                setLastDetectedKeyword('saklolo');
                handleTriggerEmergency(`voice-confirmed: "${transcript}"`);
              } else {
                // First detection — give audio feedback so user knows we heard them
                // but don't trigger yet. Encourage them to repeat.
                triggerHapticFeedback([50, 50]);
                speakText(
                  isTl
                    ? 'Narinig kita. Ulitin pa ng isa para kumpirmahin.'
                    : 'Heard you. Say it once more to confirm.',
                  {
                    language: voiceSettings.language,
                    voiceGender: voiceSettings.voiceGender,
                    rate: 1.1,
                  }
                );
              }
              return;
            }
          }
        };

        recognition.onerror = () => {
          // Keep intent active; will restart on end
        };

        recognition.onend = () => {
          if (isListeningIntentRef.current) {
            restartTimerRef.current = setTimeout(() => {
              startListener();
            }, 600);
          } else {
            setMicActive(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch {
        setMicActive(false);
      }
    };

    startListener();

    return () => {
      isListeningIntentRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, isTl, handleTriggerEmergency]);

  // When modal opens, welcome with clear voice instructions
  useEffect(() => {
    if (!isOpen) {
      lastSpokenIndexRef.current = -1;
      return;
    }

    openedAtRef.current = Date.now();
    triggerHapticFeedback([60, 60, 120]);
    playSuccessChime();

    const welcomeMsg = isTl
      ? 'Aktibo ang Blind Touch Pad. Pindutin ang 1 hanggang 6 para sa mga parirala, 0 para magpalit ng kategorya, o letrang E para sa pulang alarma. Para sa agarang tulong, ugayin ang telepono ng tatlong beses, o mag-tap ng limang beses kahit saan sa screen.'
      : 'Blind Touch Pad activated. Press 1 to 6 for phrases, 0 to switch category, or E for urgent alarm. For urgent help, shake your phone three times, or tap the screen five times quickly.';

    speakText(welcomeMsg, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voiceURI: voiceSettings.voiceURI,
      language: voiceSettings.language,
      voiceGender: voiceSettings.voiceGender,
    });
  }, [isOpen, voiceSettings, isTl]);

  // ── FEATURE 1: SHAKE TO SOS ──────────────────────────────────────────────
  // Shake the phone 3 times quickly (within 1.5s) to trigger emergency SOS.
  // Works even when the user can't see or navigate the screen.
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;

    const SHAKE_THRESHOLD = 18; // m/s² — strong intentional shake
    const SHAKE_WINDOW_MS = 2000; // 3 shakes within 2 seconds
    const SHAKE_COUNT_NEEDED = 3;
    const SHAKE_COOLDOWN_MS = 8000; // prevent rapid re-triggering

    let lastAcc = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      if (hasTriggeredRef.current) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.sqrt(
        Math.pow(acc.x ?? 0, 2) +
        Math.pow(acc.y ?? 0, 2) +
        Math.pow(acc.z ?? 0, 2)
      );
      const delta = Math.abs(total - lastAcc);
      lastAcc = total;

      if (delta > SHAKE_THRESHOLD) {
        const now = Date.now();
        // Cooldown guard
        if (now - lastShakeAlertRef.current < SHAKE_COOLDOWN_MS) return;

        shakeTimestampsRef.current.push(now);
        // Keep only recent shakes within the window
        shakeTimestampsRef.current = shakeTimestampsRef.current.filter(
          (t) => now - t < SHAKE_WINDOW_MS
        );

        if (shakeTimestampsRef.current.length >= SHAKE_COUNT_NEEDED) {
          shakeTimestampsRef.current = [];
          lastShakeAlertRef.current = now;
          handleTriggerEmergency('shake-gesture');
        }
      }
    };

    // Request permission on iOS 13+
    const startListening = () => {
      window.addEventListener('devicemotion', handleMotion, true);
    };

    if (
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      (DeviceMotionEvent as any)
        .requestPermission()
        .then((state: string) => {
          if (state === 'granted') startListening();
        })
        .catch(() => {});
    } else {
      startListening();
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, [isOpen, handleTriggerEmergency]);

  // ── FEATURE 2: 5-RAPID-TAP SOS ───────────────────────────────────────────
  // Tapping the screen 5 times quickly anywhere triggers SOS.
  // Useful when the blind user drops their phone but can still tap.
  const handleRapidTapSOS = useCallback(() => {
    if (hasTriggeredRef.current) return;
    const now = Date.now();
    tapTimestampsRef.current.push(now);
    // Keep taps within 3-second window
    tapTimestampsRef.current = tapTimestampsRef.current.filter(
      (t) => now - t < 3000
    );
    if (tapTimestampsRef.current.length >= 5) {
      tapTimestampsRef.current = [];
      handleTriggerEmergency('5-tap-gesture');
    }
  }, [handleTriggerEmergency]);

  // ── FEATURE 3: PERIODIC VOICE REMINDER ───────────────────────────────────
  // Every 90 seconds, remind the blind user how to call for help.
  // Sanitized: doesn't say trigger words to prevent feedback loop.
  useEffect(() => {
    if (!isOpen) {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
        reminderIntervalRef.current = null;
      }
      return;
    }

    // Start reminder after 90s, then every 90s
    reminderIntervalRef.current = setInterval(() => {
      if (hasTriggeredRef.current) return;
      const reminder = isTl
        ? 'Paalala: Para humingi ng agarang tulong, ugayin ang telepono ng tatlong beses, o mag-tap ng limang beses sa screen.'
        : 'Reminder: To call for urgent help, shake your phone three times, or tap the screen five times quickly.';
      speakText(reminder, {
        language: voiceSettings.language,
        voiceGender: voiceSettings.voiceGender,
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
      });
    }, 90000);

    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
        reminderIntervalRef.current = null;
      }
    };
  }, [isOpen, isTl, voiceSettings]);

  // Keyboard navigation when in modal: Keys 1-6, 0 for category, Space/Enter, E or 9 for SOS
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Emergency Hotkeys for Blind Users: E or 9
      if (key === 'e' || key === '9') {
        e.preventDefault();
        handleTriggerEmergency(`hotkey: ${key}`);
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onClose();
        if (onBackToGate) {
          onBackToGate();
        }
      } else if (key === 'h' || key === '?') {
        e.preventDefault();
        playVoiceGuide();
      } else if (key === '0' || key === 'c' || key === 'tab') {
        e.preventDefault();
        switchCategory(categoryIndex + 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIndex((prev) => {
          const next = (prev + 1) % activeItems.length;
          announceItem(next, true);
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIndex((prev) => {
          const next = (prev - 1 + activeItems.length) % activeItems.length;
          announceItem(next, true);
          return next;
        });
      } else if (
        e.keyCode === 32 ||
        e.code === 'Space' ||
        e.key === ' ' ||
        e.key === 'Space' ||
        e.key === 'Spacebar' ||
        e.keyCode === 13 ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter' ||
        e.key === 'Enter'
      ) {
        e.preventDefault();
        e.stopPropagation();
        announceItem(currentIndex, false);
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        setCurrentIndex(idx);
        announceItem(idx, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [
    isOpen,
    currentIndex,
    categoryIndex,
    activeItems,
    announceItem,
    switchCategory,
    playVoiceGuide,
    handleTriggerEmergency,
    onClose,
    onBackToGate,
  ]);

  // Explore by Touch: Track finger location anywhere on screen
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    // Split into 6 equal spatial zones (2 columns x 3 rows) matching phone corners
    const col = x < width / 2 ? 0 : 1;
    let row = 0;
    if (y < height / 3) {
      row = 0;
    } else if (y < (height * 2) / 3) {
      row = 1;
    } else {
      row = 2;
    }

    const calculatedIndex = row * 2 + col;

    if (
      calculatedIndex !== lastSpokenIndexRef.current &&
      calculatedIndex >= 0 &&
      calculatedIndex < 6
    ) {
      setCurrentIndex(calculatedIndex);
      announceItem(calculatedIndex, false);
    }
  };

  // Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setIsHolding(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHolding(false);

    if (!touchStartPos.current || e.changedTouches.length === 0) return;

    const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;

    // Vertical swipe switches categories
    if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0) {
        switchCategory(categoryIndex + 1);
      } else {
        switchCategory(categoryIndex - 1);
      }
    } else if (Math.abs(deltaX) > 40) {
      // Horizontal swipe switches items
      if (deltaX > 0) {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % activeItems.length;
          announceItem(next, true);
          return next;
        });
      } else {
        setCurrentIndex((prev) => {
          const next = (prev - 1 + activeItems.length) % activeItems.length;
          announceItem(next, true);
          return next;
        });
      }
    }
    touchStartPos.current = null;
  };

  if (!isOpen) return null;

  const currentItem = activeItems[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Blind Touch Pad Mode"
      onPointerMove={handlePointerMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleRapidTapSOS}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white select-none touch-none"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-full bg-amber-400 text-slate-950 shrink-0">
            <EyeOff className="w-5 h-5" />
          </span>
          <div>
            <span className="font-black text-xs sm:text-sm text-amber-300 block tracking-wide">
              {isTl ? 'BLIND TOUCH PAD' : 'BLIND TOUCH PAD'}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400">
              {isTl
                ? 'Ugayin 3x · Mag-tap 5x · Pindutin E para sa SOS'
                : 'Shake 3x · Tap 5x · Press E for SOS'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Spoken Audio Guide Button */}
          <button
            onClick={playVoiceGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 font-black text-xs shadow-sm cursor-pointer active:scale-95 transition-all"
            title="Play Audio Voice Guide (Press H)"
            aria-label="Play Spoken Audio Guide"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isTl ? 'Gabay sa Boses' : 'Audio Guide'}</span>
          </button>

          {/* Emergency SOS Button for Blind Mode */}
          <button
            onClick={() => handleTriggerEmergency('top-button')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs border border-red-400 shadow-md cursor-pointer active:scale-95 transition-all animate-pulse"
            title="Emergency SOS (Press E or Say 'Saklolo')"
            aria-label="Emergency SOS Alert"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>SOS</span>
          </button>

          {onBackToGate && (
            <button
              onClick={() => {
                onClose();
                onBackToGate();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 font-bold text-xs border border-amber-400/50 cursor-pointer transition-all"
              title="Back to Mode Selection Gate"
              aria-label="Back to Mode Selection Gate"
            >
              <span>{isTl ? '← Gate' : '← Modes'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Exit Blind Touch Pad"
            aria-label="Close Blind Touch Pad"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Voice Recognition Emergency Listener Indicator Banner */}
      <div className="px-3 py-1.5 bg-gradient-to-r from-red-950/70 via-slate-900 to-red-950/70 border-b border-red-900/50 flex items-center text-xs shrink-0">
        {micActive ? (
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <Mic className="w-3.5 h-3.5" />
            <span>
              {isTl
                ? 'Nakikinig ang Boses · Sabihin nang 2x para sa SOS'
                : 'Live Mic Active · Say it 2× to trigger SOS'}
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <MicOff className="w-3.5 h-3.5" />
            <span>
              {isTl
                ? 'Pindutin E o 9 · Ugayin 3x · Mag-tap 5x para sa SOS'
                : 'Press E or 9 · Shake 3x · Tap 5x for SOS'}
            </span>
          </span>
        )}
      </div>

      {/* Category Tabs Strip: Allows switching between Needs, Navigation, and Companion */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center gap-1.5 w-full">
          {BLIND_CATEGORIES.map((cat, idx) => {
            const isCatActive = categoryIndex === idx;
            return (
              <button
                key={cat.id}
                onClick={() => switchCategory(idx)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border-2 ${
                  isCatActive
                    ? 'bg-amber-400 text-slate-950 border-white shadow-md scale-[1.01]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400/50'
                }`}
              >
                <span>{isTl ? cat.nameTl : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Touch Canvas (6 Spatial Zones that speak when finger passes over them) */}
      <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2.5 p-3 sm:p-4">
        {activeItems.map((msg, idx) => {
          const isActive = currentIndex === idx;
          const cornerNames = [
            'Top-Left',
            'Top-Right',
            'Middle-Left',
            'Middle-Right',
            'Bottom-Left',
            'Bottom-Right',
          ];

          return (
            <div
              key={msg.id}
              onClick={() => {
                setCurrentIndex(idx);
                announceItem(idx, true);
              }}
              className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-4 text-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-white shadow-2xl scale-[1.02]'
                  : 'bg-slate-900 text-slate-100 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xl sm:text-3xl font-black ${
                    isActive ? 'text-slate-950' : 'text-amber-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <span
                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    isActive ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  [{cornerNames[idx]}]
                </span>
              </div>
              <span className="text-sm sm:text-xl md:text-2xl font-black leading-snug px-1">
                {msg.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Gesture & Action Bar */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5 text-xs text-amber-200">
          <Hand className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span className="truncate">
            {isTl ? 'Napili:' : 'Active:'}{' '}
            <strong className="text-white text-sm">
              [{currentIndex + 1}] {currentItem.text}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Quick SOS Key Reminder */}
          <button
            onClick={() => handleTriggerEmergency('bottom-sos-bar')}
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-full bg-red-700 hover:bg-red-600 text-white font-black text-xs border border-red-500 shadow-sm cursor-pointer active:scale-95 transition-all"
            title="Press E or 9"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{isTl ? 'Saklolo (E)' : 'SOS (E)'}</span>
          </button>

          {/* Category Switch Button */}
          <button
            onClick={() => switchCategory(categoryIndex + 1)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-400/40 cursor-pointer active:scale-95 transition-all"
            title="Press 0 on keyboard"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isTl ? 'Kategorya (0)' : 'Category (0)'}</span>
          </button>

          {/* Repeat Current Phrase */}
          <button
            onClick={() => announceItem(currentIndex, false)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isTl ? 'Basahin (Space)' : 'Speak (Space)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
          >
            {isTl ? 'Umalis' : 'Exit'}
          </button>
        </div>
      </div>
    </div>
  );
};
