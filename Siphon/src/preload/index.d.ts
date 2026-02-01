import { ElectronAPI } from '@electron-toolkit/preload'

export type MediaFormat = 'mp3' | 'mp4'

export interface VideoInfo {
  title: string
  duration: number
  thumbnail: string
  uploader: string
}

export interface DownloadResult {
  success?: boolean
  canceled?: boolean
  filePath?: string
}

export interface DownloaderAPI {
  getVideoInfo: (url: string) => Promise<VideoInfo>
  downloadMedia: (url: string, format: MediaFormat) => Promise<DownloadResult>
  onDownloadProgress: (callback: (progress: number) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DownloaderAPI
  }
}
