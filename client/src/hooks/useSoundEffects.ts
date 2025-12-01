import { useCallback, useEffect, useRef } from "react";

export type SoundEffect = 
  | "battleStart"
  | "battleEnd"
  | "vote"
  | "chatMessage"
  | "notification"
  | "levelUp"
  | "coinEarn"
  | "buttonClick"
  | "success"
  | "error";

interface SoundSettings {
  enabled: boolean;
  volume: number;
  effects: Record<SoundEffect, boolean>;
}

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.5,
  effects: {
    battleStart: true,
    battleEnd: true,
    vote: true,
    chatMessage: true,
    notification: true,
    levelUp: true,
    coinEarn: true,
    buttonClick: false,
    success: true,
    error: true,
  },
};

const STORAGE_KEY = "songversus_sound_settings";

const SOUND_FREQUENCIES: Record<SoundEffect, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  battleStart: { frequencies: [200, 300, 400, 600, 800], durations: [0.08, 0.08, 0.08, 0.08, 0.2], type: "sawtooth" },
  battleEnd: { frequencies: [800, 600, 400, 300], durations: [0.1, 0.1, 0.1, 0.3], type: "triangle" },
  vote: { frequencies: [440, 550, 660], durations: [0.06, 0.06, 0.12], type: "sine" },
  chatMessage: { frequencies: [800, 1000], durations: [0.05, 0.08], type: "sine" },
  notification: { frequencies: [523, 659, 784], durations: [0.1, 0.1, 0.15], type: "sine" },
  levelUp: { frequencies: [261, 329, 392, 523, 659, 784, 1047], durations: [0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.25], type: "square" },
  coinEarn: { frequencies: [1200, 1400, 1600], durations: [0.05, 0.05, 0.1], type: "sine" },
  buttonClick: { frequencies: [600], durations: [0.03], type: "sine" },
  success: { frequencies: [523, 659, 784, 1047], durations: [0.08, 0.08, 0.08, 0.2], type: "sine" },
  error: { frequencies: [200, 150], durations: [0.15, 0.2], type: "sawtooth" },
};

export function getSoundSettings(): SoundSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed, effects: { ...DEFAULT_SETTINGS.effects, ...parsed.effects } };
    }
  } catch (e) {
    console.error("Failed to load sound settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSoundSettings(settings: SoundSettings): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save sound settings:", e);
  }
}

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const settingsRef = useRef<SoundSettings>(getSoundSettings());

  useEffect(() => {
    settingsRef.current = getSoundSettings();
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((effect: SoundEffect) => {
    const settings = getSoundSettings();
    
    if (!settings.enabled || !settings.effects[effect]) {
      return;
    }

    try {
      const ctx = getAudioContext();
      
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const soundConfig = SOUND_FREQUENCIES[effect];
      let startTime = ctx.currentTime;

      soundConfig.frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = soundConfig.type;
        oscillator.frequency.setValueAtTime(freq, startTime);

        const duration = soundConfig.durations[index];
        gainNode.gain.setValueAtTime(settings.volume * 0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);

        startTime += duration;
      });
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  }, [getAudioContext]);

  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    const current = getSoundSettings();
    const updated = { ...current, ...newSettings };
    saveSoundSettings(updated);
    settingsRef.current = updated;
  }, []);

  const updateEffectSetting = useCallback((effect: SoundEffect, enabled: boolean) => {
    const current = getSoundSettings();
    const updated = {
      ...current,
      effects: { ...current.effects, [effect]: enabled },
    };
    saveSoundSettings(updated);
    settingsRef.current = updated;
  }, []);

  const getSettings = useCallback(() => getSoundSettings(), []);

  return {
    playSound,
    updateSettings,
    updateEffectSetting,
    getSettings,
  };
}

export const SOUND_EFFECT_LABELS: Record<SoundEffect, { label: string; description: string }> = {
  battleStart: { label: "Battle Start", description: "When a battle begins" },
  battleEnd: { label: "Battle End", description: "When a battle concludes" },
  vote: { label: "Vote Cast", description: "When you cast a vote" },
  chatMessage: { label: "Chat Message", description: "When a new message arrives" },
  notification: { label: "Notification", description: "For new notifications" },
  levelUp: { label: "Level Up", description: "When you level up" },
  coinEarn: { label: "Coins Earned", description: "When you earn coins" },
  buttonClick: { label: "Button Clicks", description: "UI button interactions" },
  success: { label: "Success", description: "Successful actions" },
  error: { label: "Error", description: "Error alerts" },
};
