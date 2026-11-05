// One audio engine for the whole site, so only one thing plays at a time.
// A single <audio> element (which keeps pitch when the speed changes) is
// routed through a Web Audio analyser that every orb reads. The microphone,
// when the visitor turns it on, feeds its own analyser and is never
// connected to the speakers, recorded, or sent anywhere.
//
// Nothing here runs until the visitor presses a button.

export type Owner = 'picker' | 'player' | 'voices';

export type Track = {
  clipId: string;
  src: string;
  voiceId: string;
  owner: Owner;
  itemId?: string;
};

export type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';
export type MicStatus = 'off' | 'requesting' | 'on' | 'denied' | 'unsupported' | 'error';

export type EngineState = {
  track: Track | null;
  status: Status;
  rate: number;
  duration: number;
  mic: MicStatus;
  micEndsAt: number | null;
  /** The voice the orbs should wear: the current or last track's voice. */
  voiceId: string | null;
  /** Bumped on every seek, so paused views update their position. */
  seeks: number;
};

export type Levels = { level: number; low: number; mid: number; high: number };

const initial: EngineState = {
  track: null,
  status: 'idle',
  rate: 1,
  duration: 0,
  mic: 'off',
  micEndsAt: null,
  voiceId: null,
  seeks: 0
};

type AudioContextClass = typeof AudioContext;

class AudioEngine {
  state: EngineState = initial;
  private listeners = new Set<() => void>();
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private mediaAnalyser: AnalyserNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micTimer: ReturnType<typeof setTimeout> | null = null;
  private freq: Uint8Array<ArrayBuffer> | null = null;
  private wave: Float32Array<ArrayBuffer> | null = null;
  private smoothed: Levels = { level: 0, low: 0, mid: 0, high: 0 };
  private lastRead = -1;
  private micPeak = 0.04;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = () => this.state;

  private set(patch: Partial<EngineState>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  /** Seconds into the current track. */
  get currentTime() {
    return this.audio?.currentTime ?? 0;
  }

  private ensureAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    audio.preservesPitch = true;
    audio.addEventListener('playing', () => this.set({ status: 'playing' }));
    audio.addEventListener('waiting', () => {
      if (!audio.paused) this.set({ status: 'loading' });
    });
    audio.addEventListener('pause', () => {
      if (this.state.status !== 'ended') this.set({ status: 'paused' });
    });
    audio.addEventListener('ended', () => this.set({ status: 'ended' }));
    audio.addEventListener('seeked', () => this.set({ seeks: this.state.seeks + 1 }));
    audio.addEventListener('loadedmetadata', () =>
      this.set({ duration: Number.isFinite(audio.duration) ? audio.duration : 0 })
    );
    audio.addEventListener('error', () => {
      if (audio.getAttribute('src')) this.set({ status: 'error' });
    });
    this.audio = audio;
    return audio;
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctx: AudioContextClass | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext;
    if (!Ctx) return null;
    try {
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.55;
      analyser.minDecibels = -85;
      analyser.maxDecibels = -20;
      const source = ctx.createMediaElementSource(this.ensureAudio());
      source.connect(analyser);
      analyser.connect(ctx.destination);
      this.ctx = ctx;
      this.mediaAnalyser = analyser;
      this.freq = new Uint8Array(analyser.frequencyBinCount);
      this.wave = new Float32Array(analyser.fftSize);
    } catch {
      // Without Web Audio the voices still play; the orb just breathes.
      this.ctx = null;
    }
    return this.ctx;
  }

  /** Plays a track from `from` seconds, replacing whatever was playing. */
  play(track: Track, options: { from?: number; rate?: number } = {}) {
    this.stopMic();
    const audio = this.ensureAudio();
    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    const same = this.state.track?.clipId === track.clipId && audio.getAttribute('src');
    if (!same) {
      audio.src = track.src;
      this.set({ duration: 0 });
    }
    if (options.from !== undefined) audio.currentTime = options.from;
    else if (this.state.status === 'ended' && same) audio.currentTime = 0;
    const rate = options.rate ?? (track.owner === 'player' ? this.state.rate : 1);
    audio.playbackRate = rate;
    audio.defaultPlaybackRate = rate;
    this.set({ track, status: 'loading', voiceId: track.voiceId });
    audio.play().catch((error: unknown) => {
      if ((error as { name?: string })?.name === 'AbortError') return;
      this.set({ status: 'error' });
    });
  }

  /** Play if this track isn't playing; pause if it is. */
  toggle(track: Track, options: { rate?: number } = {}) {
    if (this.isPlaying(track.clipId)) this.pause();
    else this.play(track, options);
  }

  isPlaying(clipId: string) {
    return (
      this.state.track?.clipId === clipId &&
      (this.state.status === 'playing' || this.state.status === 'loading')
    );
  }

  pause() {
    this.audio?.pause();
  }

  seek(seconds: number) {
    const audio = this.audio;
    if (!audio) return;
    const max = Number.isFinite(audio.duration) ? audio.duration : seconds;
    audio.currentTime = Math.max(0, Math.min(seconds, max));
    if (this.state.status === 'ended') this.set({ status: 'paused' });
  }

  /** Changes speed for the player's tracks; other samples play at 1×. */
  setRate(rate: number) {
    this.set({ rate });
    if (this.audio && this.state.track?.owner === 'player') {
      this.audio.playbackRate = rate;
      this.audio.defaultPlaybackRate = rate;
    }
  }

  /** Fades the current track out over `ms`, then pauses (for the sleep timer). */
  fadeOut(ms = 2500) {
    const audio = this.audio;
    if (!audio || audio.paused) return;
    const start = performance.now();
    const from = audio.volume;
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / ms);
      audio.volume = from * (1 - t);
      if (t < 1) requestAnimationFrame(step);
      else {
        audio.pause();
        audio.volume = from;
      }
    };
    requestAnimationFrame(step);
  }

  async startMic(seconds: number) {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.set({ mic: 'unsupported' });
      return;
    }
    this.pause();
    const ctx = this.ensureContext();
    if (!ctx) {
      this.set({ mic: 'unsupported' });
      return;
    }
    if (ctx.state === 'suspended') void ctx.resume();
    this.set({ mic: 'requesting' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.55;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -25;
      // Analysed only: never connected to the speakers or anything else.
      source.connect(analyser);
      this.micStream = stream;
      this.micAnalyser = analyser;
      this.micPeak = 0.04;
      const endsAt = Date.now() + seconds * 1000;
      this.micTimer = setTimeout(() => this.stopMic(), seconds * 1000);
      this.set({ mic: 'on', micEndsAt: endsAt });
    } catch (error) {
      const name = (error as { name?: string })?.name;
      this.set({
        mic: name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error',
        micEndsAt: null
      });
    }
  }

  stopMic() {
    if (this.micTimer) clearTimeout(this.micTimer);
    this.micTimer = null;
    this.micStream?.getTracks().forEach((track) => track.stop());
    this.micStream = null;
    this.micAnalyser?.disconnect();
    this.micAnalyser = null;
    if (this.state.mic === 'on' || this.state.mic === 'requesting') {
      this.set({ mic: 'off', micEndsAt: null });
    }
  }

  resetMicMessage() {
    if (this.state.mic !== 'on' && this.state.mic !== 'requesting') {
      this.set({ mic: 'off' });
    }
  }

  /**
   * Smoothed loudness and three frequency bands, 0 to 1, from whichever
   * source is live. Safe to call from several orbs in the same frame.
   */
  levels(now: number): Levels {
    if (now === this.lastRead) return this.smoothed;
    this.lastRead = now;
    const target: Levels = { level: 0, low: 0, mid: 0, high: 0 };
    const mic = this.micAnalyser;
    const media =
      this.mediaAnalyser && this.audio && !this.audio.paused ? this.mediaAnalyser : null;
    const analyser = mic ?? media;
    if (analyser && this.ctx && this.freq && this.wave) {
      analyser.getFloatTimeDomainData(this.wave);
      let sum = 0;
      for (let i = 0; i < this.wave.length; i++) sum += this.wave[i] * this.wave[i];
      let rms = Math.sqrt(sum / this.wave.length);
      if (mic) {
        // Microphones vary a lot; follow the visitor's own loudest moments.
        this.micPeak = Math.max(this.micPeak * 0.997, rms);
        rms = (rms / this.micPeak) * 0.16;
      }
      target.level = 1 - Math.exp(-rms * 9);
      analyser.getByteFrequencyData(this.freq);
      const hz = this.ctx.sampleRate / analyser.fftSize;
      const band = (from: number, to: number) => {
        const a = Math.max(1, Math.floor(from / hz));
        const b = Math.min(this.freq!.length - 1, Math.ceil(to / hz));
        let total = 0;
        for (let i = a; i <= b; i++) total += this.freq![i];
        const average = total / ((b - a + 1) * 255);
        return Math.min(1, Math.max(0, (average - 0.18) / 0.55));
      };
      target.low = band(80, 320);
      target.mid = band(320, 2000);
      target.high = band(2000, 6500);
    }
    const s = this.smoothed;
    this.smoothed = {
      level: ease(s.level, target.level),
      low: ease(s.low, target.low),
      mid: ease(s.mid, target.mid),
      high: ease(s.high, target.high)
    };
    return this.smoothed;
  }
}

/** Fast attack, slow release, so the orb swells quickly and settles softly. */
function ease(from: number, to: number) {
  return from + (to - from) * (to > from ? 0.32 : 0.075);
}

const serverState = initial;
let engine: AudioEngine | null = null;

export function getEngine(): AudioEngine {
  engine ??= new AudioEngine();
  return engine;
}

export function getServerState() {
  return serverState;
}
