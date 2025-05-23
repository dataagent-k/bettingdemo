// Simple sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  private createBeep(frequency: number, duration: number, volume: number = 0.1) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playTileReveal() {
    this.createBeep(800, 0.1, 0.05);
  }

  playWin() {
    // Play a winning chord
    setTimeout(() => this.createBeep(523, 0.2, 0.1), 0);   // C
    setTimeout(() => this.createBeep(659, 0.2, 0.1), 100); // E
    setTimeout(() => this.createBeep(784, 0.2, 0.1), 200); // G
    setTimeout(() => this.createBeep(1047, 0.3, 0.1), 300); // C
  }

  playLoss() {
    // Play a losing sound
    this.createBeep(200, 0.5, 0.1);
    setTimeout(() => this.createBeep(150, 0.5, 0.1), 200);
    setTimeout(() => this.createBeep(100, 0.8, 0.1), 400);
  }

  playCashOut() {
    // Play cash out sound
    this.createBeep(1000, 0.1, 0.08);
    setTimeout(() => this.createBeep(1200, 0.1, 0.08), 100);
    setTimeout(() => this.createBeep(1400, 0.2, 0.08), 200);
  }
}

export const soundManager = new SoundManager();
