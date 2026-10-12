/// <reference types="vite/client" />

import type { TombolaSettings } from './core/types'

export interface AppInfo {
  version: string
  /** Platform name reported by the runtime (Darwin, Windows, Linux, browser). */
  platform: string
  userDataPath: string
}

export interface MusicFile {
  path: string
  name: string
  data: Uint8Array
}

export interface TombolaApi {
  loadSettings(): Promise<TombolaSettings | null>
  saveSettings(settings: TombolaSettings): Promise<void>
  setFullscreen(enabled: boolean): Promise<boolean>
  isFullscreen(): Promise<boolean>
  onFullscreenChange(callback: (enabled: boolean) => void): () => void
  getAppInfo(): Promise<AppInfo>
  savePdf(defaultName: string, data: Uint8Array): Promise<string | null>
  saveFile(
    defaultName: string,
    data: Uint8Array,
    filters?: { name: string; extensions: string[] }[]
  ): Promise<string | null>
  readBinary(filePath: string): Promise<Uint8Array | null>
  chooseMusic(): Promise<MusicFile | null>
  loadMusic(filePath: string): Promise<MusicFile | null>
  clearMusic(): Promise<boolean>
  quit(): void
}

declare global {
  interface Window {
    tombola: TombolaApi
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
