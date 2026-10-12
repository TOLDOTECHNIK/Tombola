import { Howl } from 'howler'

interface AudioManagerOptions {
  musicUrl: string
  rollingUrl: string
  musicVolume: number
  musicEnabled: boolean
}

/**
 * Modern replacement for the deprecated buzz.js player. Wraps Howler with a
 * small API tailored to the tombola: looping background music that ducks while
 * the wheel sound plays. The music source can be swapped at runtime (custom
 * uploads) and the rolling sound is always available.
 */
export class AudioManager {
  private music: Howl | null = null
  private rolling: Howl | null = null
  private musicUrl: string
  private musicVolume: number
  private musicEnabled: boolean

  constructor(options: AudioManagerOptions) {
    this.musicUrl = options.musicUrl
    this.musicVolume = options.musicVolume
    this.musicEnabled = options.musicEnabled
    this.rolling = new Howl({ src: [options.rollingUrl], volume: 1 })
    if (this.musicEnabled) this.ensureMusic()
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled
    if (!enabled) {
      this.music?.pause()
      return
    }
    const music = this.ensureMusic()
    // Only (re)start when it is not already playing, so volume changes do not
    // restart the track.
    if (!music.playing()) music.play()
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.min(1, Math.max(0, volume))
    this.music?.volume(this.musicVolume)
  }

  /** Swap the music source (e.g. a blob URL for a user upload). */
  setMusicUrl(url: string): void {
    if (url === this.musicUrl && this.music) return
    this.musicUrl = url
    if (this.music) {
      this.music.unload()
      this.music = null
    }
    if (this.musicEnabled) this.ensureMusic().play()
  }

  /** Fade the music down, then back up after `restoreAfterMs`. */
  duck(restoreAfterMs: number): void {
    if (!this.musicEnabled || !this.music) return
    const ducked = this.musicVolume * 0.35
    this.music.fade(this.music.volume() as number, ducked, 400)
    setTimeout(() => this.music?.fade(ducked, this.musicVolume, 1000), restoreAfterMs)
  }

  playRolling(): void {
    if (!this.rolling) return
    this.rolling.stop()
    this.rolling.play()
  }

  stopAll(): void {
    this.music?.stop()
    this.rolling?.stop()
  }

  dispose(): void {
    this.music?.unload()
    this.rolling?.unload()
    this.music = null
    this.rolling = null
  }

  private ensureMusic(): Howl {
    if (!this.music) {
      this.music = new Howl({
        src: [this.musicUrl],
        volume: this.musicVolume,
        loop: true,
        html5: true
      })
    }
    return this.music
  }
}
