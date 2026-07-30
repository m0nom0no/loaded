/**
 * Web Audio API Sound Synthesizer for LOADED Big Timer
 * Zero external audio files required. Generates clean synth tones.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a clean synth beep with specified frequency and duration
 */
export function playSynthBeep(frequency = 880, durationMs = 150, volume = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    console.log('Audio playback prevented or unsupported', e);
  }
}

/**
 * Countdown warning beep (e.g. 10s remaining or 3-2-1)
 */
export function playTimerWarningBeep() {
  playSynthBeep(750, 120, 0.12);
}

/**
 * Timer completion chime: Triumphant double chord tone (C5 -> E5 -> G5)
 */
export function playTimerFinishChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Play C5 (523.25 Hz)
    playSynthBeep(523.25, 200, 0.2);
    
    // Play E5 (659.25 Hz) after 150ms
    setTimeout(() => {
      playSynthBeep(659.25, 250, 0.25);
    }, 150);

    // Play G5 (783.99 Hz) after 300ms
    setTimeout(() => {
      playSynthBeep(783.99, 450, 0.3);
    }, 300);
  } catch (e) {
    console.log('Chime playback error', e);
  }
}
